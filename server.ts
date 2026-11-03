import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import type {
  AnalysisResult,
  LabTestValue,
  RiskCategory,
  PersonalizedRecommendation,
  HealthRiskLevel,
  TestStatus,
} from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for scanned report images and PDFs
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper to detect temporary 503 / high-demand / rate-limit errors
function is503OrUnavailableError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.statusCode || error.code || error.response?.status;
  if (status === 503 || status === 429) return true;

  const msg = (
    typeof error === 'string' ? error : (error.message || JSON.stringify(error))
  ).toLowerCase();

  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('high demand') ||
    msg.includes('resource_exhausted') ||
    msg.includes('resource has been exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('try again later') ||
    msg.includes('service unavailable')
  );
}

// Convert raw JSON error responses into clean, reassuring messages
function formatFriendlyErrorMessage(rawError: any): { is503: boolean; message: string } {
  const is503 = is503OrUnavailableError(rawError);
  let message =
    typeof rawError === 'string'
      ? rawError
      : (rawError?.message || 'An unexpected error occurred while processing the report.');

  // If the message contains a raw JSON object string, parse it cleanly
  try {
    const jsonMatch = message.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error?.message) {
        message = parsed.error.message;
      } else if (parsed.message) {
        message = parsed.message;
      }
    }
  } catch {
    // Keep message as is
  }

  // Remove common tech prefixes like "[GoogleGenerativeAI Error]: [503 Service Unavailable] "
  message = message.replace(/^\[?GoogleGenerativeAI Error\]?:\s*/i, '');
  message = message.replace(/^\[?\d{3}\s*([A-Za-z_ ]+)?\]?:\s*/i, '');

  if (
    message.toLowerCase().includes('status 200') ||
    message.toLowerCase().includes('failed with status 200')
  ) {
    message = 'The report analysis could not extract structured laboratory values. Please ensure the document is clear and readable, or click Try Again.';
  }

  if (is503) {
    return {
      is503: true,
      message:
        'The AI analysis service is temporarily experiencing high demand (503 Service Unavailable). Please try again in a moment or explore our Demo Report.',
    };
  }

  return { is503: false, message: message || 'Failed to process report. Please try again.' };
}

// Normalize MIME types for Gemini multimodal input
function normalizeMimeType(mimeType: string, fileName: string): string {
  const lowerMime = (mimeType || '').toLowerCase().trim();
  const lowerName = (fileName || '').toLowerCase().trim();

  if (lowerMime === 'image/jpeg' || lowerMime === 'image/jpg') return 'image/jpeg';
  if (lowerMime === 'image/png') return 'image/png';
  if (lowerMime === 'image/webp') return 'image/webp';
  if (lowerMime === 'application/pdf') return 'application/pdf';

  if (lowerName.endsWith('.png')) return 'image/png';
  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) return 'image/jpeg';
  if (lowerName.endsWith('.webp')) return 'image/webp';
  if (lowerName.endsWith('.pdf')) return 'application/pdf';

  return lowerMime || 'application/pdf';
}

// Extract JSON safely handling markdown code fences (```json ... ```) or preamble text
function extractAndSanitizeJson(rawText: string): any {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('No content returned from AI analysis.');
  }

  const trimmed = rawText.trim();

  // Attempt 1: Direct JSON parse
  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue to advanced extractors
  }

  // Attempt 2: Extract from markdown code fences ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue
    }
  }

  // Attempt 3: Find outermost curly braces { ... }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1).trim();
    try {
      return JSON.parse(candidate);
    } catch {
      // Continue
    }
  }

  // Attempt 4: Find outermost square brackets [ ... ]
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const candidate = trimmed.substring(firstBracket, lastBracket + 1).trim();
    try {
      return JSON.parse(candidate);
    } catch {
      // Continue
    }
  }

  throw new Error('Failed to parse structured JSON from AI model output.');
}

// Validate, normalize, and populate default fallbacks for AnalysisResult
function normalizeAnalysisResult(parsedData: any, fileName: string, patientProfile: any): AnalysisResult {
  let root = parsedData;
  if (root && typeof root === 'object') {
    if (root.result && typeof root.result === 'object' && (root.result.tests || root.result.aiSummary)) {
      root = root.result;
    } else if (root.data && typeof root.data === 'object' && (root.data.tests || root.data.aiSummary)) {
      root = root.data;
    }
  }

  // Extract raw tests array
  let rawTests: any[] = [];
  if (Array.isArray(root?.tests)) {
    rawTests = root.tests;
  } else if (Array.isArray(root?.labResults)) {
    rawTests = root.labResults;
  } else if (Array.isArray(root?.testResults)) {
    rawTests = root.testResults;
  } else if (Array.isArray(root)) {
    rawTests = root;
  }

  // Normalize each test item
  const validatedTests: LabTestValue[] = rawTests.map((t: any, index: number) => {
    let status: TestStatus = 'Normal';
    const rawStatus = (t.status || '').toString().toLowerCase();
    if (rawStatus.includes('high') || rawStatus.includes('elevated')) {
      status = 'High';
    } else if (rawStatus.includes('low') || rawStatus.includes('decreased')) {
      status = 'Low';
    } else if (rawStatus.includes('normal') || rawStatus.includes('in range')) {
      status = 'Normal';
    } else {
      status = 'Unknown';
    }

    const numericVal =
      typeof t.numericValue === 'number' && !isNaN(t.numericValue)
        ? t.numericValue
        : parseFloat(String(t.resultValue || '').replace(/[^\d.-]/g, '')) || null;

    return {
      id: t.id || `test-${index + 1}`,
      testName: String(t.testName || t.name || `Lab Marker ${index + 1}`),
      category: String(t.category || 'General Laboratory Panel'),
      resultValue: String(t.resultValue ?? t.value ?? 'Recorded'),
      numericValue: numericVal,
      unit: String(t.unit || ''),
      referenceRange: String(t.referenceRange || t.range || 'Not provided'),
      minRange: typeof t.minRange === 'number' ? t.minRange : null,
      maxRange: typeof t.maxRange === 'number' ? t.maxRange : null,
      status,
      generalExplanation: String(
        t.generalExplanation ||
        t.explanation ||
        'Standard clinical biomarker reflecting cellular or metabolic activity.'
      ),
      abnormalExplanation: t.abnormalExplanation ? String(t.abnormalExplanation) : undefined,
      healthRelevance: t.healthRelevance ? String(t.healthRelevance) : undefined,
      cautiousNote: t.cautiousNote ? String(t.cautiousNote) : undefined,
    };
  });

  const totalCount = validatedTests.length;
  const normalCount = validatedTests.filter((t) => t.status === 'Normal').length;
  const abnormalCount = validatedTests.filter((t) => t.status === 'Low' || t.status === 'High').length;

  // Determine overall risk level
  let rawRiskLevel = String(
    root?.overallRisk?.riskLevel || root?.riskAssessment?.riskLevel || ''
  ).toLowerCase();
  let validRiskLevel: HealthRiskLevel = 'Moderate';
  if (rawRiskLevel.includes('low')) validRiskLevel = 'Low';
  else if (rawRiskLevel.includes('high')) validRiskLevel = 'High';
  else if (rawRiskLevel.includes('insufficient')) validRiskLevel = 'Insufficient data';
  else if (abnormalCount >= 3) validRiskLevel = 'High';
  else if (abnormalCount > 0) validRiskLevel = 'Moderate';
  else if (totalCount > 0) validRiskLevel = 'Low';

  const summaryText = String(
    root?.overallRisk?.summaryText ||
    root?.riskAssessment?.summaryText ||
    `Analysis of ${totalCount} laboratory marker(s) indicates ${normalCount} within standard reference parameters and ${abnormalCount} flagged for non-diagnostic medical review.`
  );

  let keyFindings: string[] = [];
  if (Array.isArray(root?.overallRisk?.keyFindings) && root.overallRisk.keyFindings.length > 0) {
    keyFindings = root.overallRisk.keyFindings.map(String);
  } else if (Array.isArray(root?.riskAssessment?.keyFindings) && root.riskAssessment.keyFindings.length > 0) {
    keyFindings = root.riskAssessment.keyFindings.map(String);
  } else {
    keyFindings = validatedTests
      .filter((t) => t.status === 'High' || t.status === 'Low')
      .map((t) => `${t.status} ${t.testName} (${t.resultValue} ${t.unit}, reference: ${t.referenceRange})`);
    if (keyFindings.length === 0 && totalCount > 0) {
      keyFindings.push('All evaluated laboratory markers are within standard reference ranges.');
    }
  }

  // Risk Categories
  const rawCategories = Array.isArray(root?.riskCategories) ? root.riskCategories : [];
  const validatedRiskCategories: RiskCategory[] = rawCategories.map((c: any, idx: number) => {
    let catRisk: HealthRiskLevel = 'Low';
    const r = String(c.riskLevel || '').toLowerCase();
    if (r.includes('high')) catRisk = 'High';
    else if (r.includes('moderate')) catRisk = 'Moderate';
    else if (r.includes('insufficient')) catRisk = 'Insufficient data';

    return {
      id: c.id || `risk-cat-${idx + 1}`,
      title: String(c.title || 'Health Risk Category'),
      categoryKey: c.categoryKey || 'other',
      riskLevel: catRisk,
      relevantParameters: Array.isArray(c.relevantParameters) ? c.relevantParameters.map(String) : [],
      shortExplanation: String(c.shortExplanation || 'Biomarkers evaluated in accordance with clinical reference values.'),
      recommendedNextStep: String(c.recommendedNextStep || 'Discuss these findings with your primary healthcare provider.'),
      supportedByData: Boolean(c.supportedByData ?? true),
    };
  });

  // Recommendations
  const rawRecs = Array.isArray(root?.recommendations) ? root.recommendations : [];
  const validatedRecommendations: PersonalizedRecommendation[] = rawRecs.map((rec: any, idx: number) => {
    let priority: 'Routine' | 'Consider' | 'Important' = 'Routine';
    const p = String(rec.priority || '').toLowerCase();
    if (p.includes('important') || p.includes('high')) priority = 'Important';
    else if (p.includes('consider') || p.includes('moderate')) priority = 'Consider';

    return {
      id: rec.id || `rec-${idx + 1}`,
      category: rec.category || 'General Lifestyle',
      recommendation: String(rec.recommendation || 'Maintain balanced nutrition, adequate hydration, and restorative sleep.'),
      priority,
      rationale: String(rec.rationale || 'Supports ongoing cellular recovery and biomarker homeostasis.'),
    };
  });

  // Safe AI Summary
  const aiSummary = String(
    root?.aiSummary ||
    `This report presents ${totalCount} laboratory findings. Overall health-risk awareness is evaluated as ${validRiskLevel}. Please review these educational observations with a qualified physician.`
  );

  return {
    id: `report-${Date.now()}`,
    reportDate: new Date().toISOString().split('T')[0],
    uploadedFileName: fileName || 'Uploaded_Lab_Report.pdf',
    isDemo: false,
    patientProfile: patientProfile || {},
    aiSummary,
    riskAssessment: {
      riskLevel: validRiskLevel,
      summaryText,
      keyFindings,
      normalCount,
      abnormalCount,
      totalCount,
    },
    tests: validatedTests,
    riskCategories: validatedRiskCategories,
    recommendations: validatedRecommendations,
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Main Lab Report Analysis Endpoint
app.post('/api/analyze-report', async (req, res) => {
  try {
    const {
      fileData, // base64 string
      mimeType = 'application/pdf',
      fileName = 'LabReport.pdf',
      patientProfile,
      isDemo = false,
      manualText = '',
    } = req.body;

    const ai = getGenAI();

    // If Gemini API is available and not pure offline simulation
    if (ai && (fileData || manualText)) {
      const parts: any[] = [];

      // Multimodal document upload (PDF, PNG, JPG, etc.)
      if (fileData) {
        // Strip data URL prefix if provided and remove any stray whitespace
        const cleanBase64 = (fileData.includes(',') ? fileData.split(',')[1] : fileData).replace(/\s+/g, '');
        const validMimeType = normalizeMimeType(mimeType, fileName);

        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: validMimeType,
          },
        });
      }

      const patientContextPrompt = patientProfile
        ? `Patient Context:
- Name: ${patientProfile.name || 'Anonymous'}
- Age: ${patientProfile.age || 'Not specified'}
- Gender: ${patientProfile.gender || 'Not specified'}
- Height: ${patientProfile.height || 'Not specified'}
- Weight: ${patientProfile.weight || 'Not specified'}
- Existing Conditions: ${(patientProfile.existingConditions || []).join(', ') || 'None reported'}
- Lifestyle: Smoking (${patientProfile.lifestyle?.smoking || 'N/A'}), Alcohol (${patientProfile.lifestyle?.alcohol || 'N/A'}), Activity (${patientProfile.lifestyle?.activityLevel || 'N/A'}), Diet (${patientProfile.lifestyle?.dietType || 'N/A'})
- Family History: ${patientProfile.familyHistory || 'None noted'}
`
        : 'No specific patient context provided.';

      const systemInstruction = `You are LabWise AI, an expert laboratory medicine report analyzer and health-risk awareness assistant designed SOLELY for patients.

CRITICAL DIRECTIVES:
1. This application is for HEALTH-RISK AWARENESS AND EDUCATIONAL PURPOSES ONLY.
2. It must NOT claim to diagnose diseases or replace a doctor.
3. Use cautious, patient-reassuring phrasing such as:
   - "may be associated with"
   - "can sometimes be seen with"
   - "should be discussed with a healthcare professional"
   - "does not automatically indicate an active pathology"
4. NEVER invent laboratory values or reference ranges. If a reference range is missing in the document, label referenceRange as "Not provided" and set minRange / maxRange to null.
5. Accurately extract all test parameters visible in the report, their exact measured value, unit, reference range, and determine status: "Normal", "Low", "High", or "Unknown".
6. Classify overall health-risk awareness strictly as one of: "Low", "Moderate", "High", or "Insufficient data".
7. Group potential health risk categories (only if supported by the extracted laboratory data):
   - Blood sugar / diabetes-related risk
   - Cardiovascular risk
   - Kidney-related risk
   - Liver-related risk
   - Anemia-related risk
   - Thyroid-related risk
8. Formulate personalized lifestyle recommendations across:
   - Diet
   - Physical Activity
   - Sleep
   - Hydration
   - General Lifestyle
   - When to Consult a Healthcare Professional
   NEVER prescribe medications, dosages, or pharmaceutical treatments.
9. Return output strictly in valid JSON matching the requested schema.`;

      const promptText = `Please analyze this laboratory report.
${patientContextPrompt}
${manualText ? `Additional report notes or test entries:\n${manualText}\n` : ''}

Extract every single laboratory test value, determine status compared to provided reference ranges (or standard clinical conventions if missing), provide simple patient-friendly explanations for each, especially abnormal results. Formulate risk awareness categories supported by the lab findings and give actionable lifestyle recommendations.`;

      parts.push({ text: promptText });

      // Execute Gemini model call with automatic retry and model fallback on 503/high-demand
      const MAX_SERVER_RETRIES = 3;
      let response: any = null;
      let lastError: any = null;
      // Candidate flash models: if gemini-3.8-flash is experiencing a 503 spike, seamlessly fallback to gemini-3.1-flash-lite
      const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

      for (let attempt = 0; attempt <= MAX_SERVER_RETRIES; attempt++) {
        // Pick model: attempt 0 tries 3.8-flash, attempt 1+ switches to 3.1-flash-lite if 3.8-flash had 503
        const modelName = candidateModels[Math.min(attempt, candidateModels.length - 1)];

        try {
          if (attempt > 0) {
            console.log(`[LabWise AI] Retrying Gemini report analysis using ${modelName} (attempt ${attempt} of ${MAX_SERVER_RETRIES})...`);
          }

          response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  aiSummary: {
                    type: Type.STRING,
                    description: 'A 2-3 paragraph patient-friendly overview of the report findings.',
                  },
                  overallRisk: {
                    type: Type.OBJECT,
                    properties: {
                      riskLevel: {
                        type: Type.STRING,
                        description: 'Must be one of: "Low", "Moderate", "High", "Insufficient data"',
                      },
                      summaryText: { type: Type.STRING },
                      keyFindings: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['riskLevel', 'summaryText', 'keyFindings'],
                  },
                  tests: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        testName: { type: Type.STRING },
                        category: { type: Type.STRING },
                        resultValue: { type: Type.STRING },
                        numericValue: { type: Type.NUMBER, description: 'Numeric representation if applicable, or null' },
                        unit: { type: Type.STRING },
                        referenceRange: { type: Type.STRING, description: 'e.g. "70 - 99", "< 200", or "Not provided"' },
                        minRange: { type: Type.NUMBER, description: 'Lower bound numeric or null' },
                        maxRange: { type: Type.NUMBER, description: 'Upper bound numeric or null' },
                        status: {
                          type: Type.STRING,
                          description: 'Must be one of: "Normal", "Low", "High", "Unknown"',
                        },
                        generalExplanation: { type: Type.STRING, description: 'What this test measures in simple words.' },
                        abnormalExplanation: { type: Type.STRING, description: 'Why this may be outside range if abnormal.' },
                        healthRelevance: { type: Type.STRING, description: 'Health relevance in cautious language.' },
                        cautiousNote: { type: Type.STRING, description: 'Cautious disclaimer note for this test.' },
                      },
                      required: ['testName', 'resultValue', 'unit', 'referenceRange', 'status', 'generalExplanation'],
                    },
                  },
                  riskCategories: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        categoryKey: { type: Type.STRING },
                        riskLevel: {
                          type: Type.STRING,
                          description: 'Must be "Low", "Moderate", "High", or "Insufficient data"',
                        },
                        relevantParameters: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        shortExplanation: { type: Type.STRING },
                        recommendedNextStep: { type: Type.STRING },
                        supportedByData: { type: Type.BOOLEAN },
                      },
                      required: ['id', 'title', 'categoryKey', 'riskLevel', 'relevantParameters', 'shortExplanation', 'recommendedNextStep', 'supportedByData'],
                    },
                  },
                  recommendations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        category: {
                          type: Type.STRING,
                          description: 'Must be one of: "Diet", "Physical Activity", "Sleep", "Hydration", "General Lifestyle", "When to Consult a Healthcare Professional"',
                        },
                        recommendation: { type: Type.STRING },
                        priority: {
                          type: Type.STRING,
                          description: 'Must be "Routine", "Consider", or "Important"',
                        },
                        rationale: { type: Type.STRING },
                      },
                      required: ['id', 'category', 'recommendation', 'priority', 'rationale'],
                    },
                  },
                },
                required: ['aiSummary', 'overallRisk', 'tests', 'riskCategories', 'recommendations'],
              },
            },
          });

          // Succeeded without error
          break;
        } catch (err: any) {
          lastError = err;
          const is503 = is503OrUnavailableError(err);
          console.warn(`[LabWise AI] Analysis attempt ${attempt + 1} failed (is503=${is503}):`, err?.message || err);

          if (is503 && attempt < MAX_SERVER_RETRIES) {
            // Short backoff delay: 1.5s, 3.0s, 4.5s
            const delayMs = (attempt + 1) * 1500;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }

          // If not temporary or max retries reached, throw to outer catch
          throw err;
        }
      }

      const responseText = response?.text;
      if (!responseText) {
        throw new Error('No content returned from Gemini analysis');
      }

      // Safely extract and parse JSON even if surrounded by markdown code fences or conversational text
      const parsedData = extractAndSanitizeJson(responseText);

      // Validate schema and normalize data structure with robust fallbacks
      const formattedResult = normalizeAnalysisResult(parsedData, fileName, patientProfile);

      return res.status(200).json({ success: true, result: formattedResult });
    }

    // Fallback or explicit demo requested without API key
    return res.status(400).json({
      success: false,
      message: 'GEMINI_API_KEY is not configured or no file content provided. Please use Demo mode or configure your API key in Settings.',
    });
  } catch (error: any) {
    console.error('Error analyzing lab report:', error);
    const { is503, message } = formatFriendlyErrorMessage(error);
    res.status(is503 ? 503 : 500).json({
      success: false,
      is503,
      error: message,
    });
  }
});

// Interactive "Ask LabWise AI" Explainer Endpoint
app.post('/api/chat-explainer', async (req, res) => {
  try {
    const { question, currentAnalysis, chatHistory = [] } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'A question is required' });
    }

    const ai = getGenAI();

    if (!ai) {
      // Friendly fallback if API key is not yet set
      return res.json({
        answer: `I am currently operating in demo mode because the GEMINI_API_KEY has not been configured. In full mode, I use Gemini 3.8 Flash to interpret questions regarding your tests (e.g. ${currentAnalysis?.tests?.[0]?.testName || 'cholesterol, glucose, hemoglobin'}) with patient-friendly context.

Regarding your question ("${question}"):
Always consult your physician for individualized medical advice. Generally, abnormal laboratory markers point to physiological variations that warrant lifestyle discussions or targeted follow-up testing rather than immediate alarm.`,
        suggestedFollowUps: [
          'What questions should I ask my doctor about my results?',
          'What does reference range mean on a lab report?',
          'How can lifestyle changes impact these parameters?',
        ],
      });
    }

    const reportContext = currentAnalysis
      ? `Patient Profile:
- Name: ${currentAnalysis.patientProfile?.name || 'Patient'}
- Age: ${currentAnalysis.patientProfile?.age || 'Unspecified'}
- Gender: ${currentAnalysis.patientProfile?.gender || 'Unspecified'}

Summary of Laboratory Findings:
${(currentAnalysis.tests || [])
  .map((t: any) => `- ${t.testName}: ${t.resultValue} ${t.unit} (Ref: ${t.referenceRange}) [Status: ${t.status}]`)
  .join('\n')}

Overall Risk Classification: ${currentAnalysis.riskAssessment?.riskLevel || 'Moderate'}
Key Findings: ${(currentAnalysis.riskAssessment?.keyFindings || []).join('; ')}`
      : 'No laboratory report currently loaded in session.';

    const systemInstruction = `You are the LabWise AI Health Explainer, a compassionate, articulate healthcare educator for patients.
You explain laboratory tests, biomarkers, and health-risk concepts in straightforward, accessible terms.

CRITICAL RULES:
1. You are strictly for HEALTH-RISK AWARENESS AND EDUCATIONAL PURPOSES.
2. DO NOT DIAGNOSE ANY DISEASE OR ILLNESS.
3. DO NOT PRESCRIBE MEDICATIONS, SUPPLEMENT DOSAGES, OR TREATMENTS.
4. Always contextualize explanations using the patient's lab report when provided.
5. Use cautious phrasing: "may be associated with", "can sometimes reflect", "routine follow-up with your doctor is advised".
6. Always end with or include: "This result is for health-risk awareness only and is not a medical diagnosis. Please consult a qualified healthcare professional for medical advice."
7. Provide 2-3 short, relevant follow-up questions the patient might want to ask next.`;

    const recentHistory = (chatHistory || [])
      .slice(-4)
      .map((m: any) => `${m.sender === 'user' ? 'Patient' : 'LabWise AI'}: ${m.text}`)
      .join('\n');

    const prompt = `Report Context:
${reportContext}

${recentHistory ? `Previous Conversation:\n${recentHistory}\n` : ''}
Patient Question: "${question}"

Please provide a clear, patient-friendly, reassuring explanation.`;

    let response: any = null;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
    } catch (chatErr: any) {
      if (is503OrUnavailableError(chatErr)) {
        console.log('[LabWise AI Explainer] 503 on gemini-3.8-flash, falling back to gemini-3.1-flash-lite...');
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      } else {
        throw chatErr;
      }
    }

    const answer =
      response.text ||
      'I was unable to formulate an explanation at this time. Please ask another question or consult your healthcare provider.';

    // Generate dynamic suggested follow-ups
    const suggestedFollowUps = [
      'What questions should I bring to my doctor?',
      'Which daily habits have the biggest effect on these values?',
      'Why can lab values vary between different tests?',
    ];

    return res.json({
      answer,
      suggestedFollowUps,
    });
  } catch (error: any) {
    console.error('Error in chat explainer:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate explanation.',
      answer:
        'We encountered a temporary issue connecting to the AI explainer service. Please try again in a moment, or bring your question directly to your medical provider.',
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LabWise AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
