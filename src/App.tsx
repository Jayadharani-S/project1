/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { PatientProfileModal } from './components/PatientProfileModal';
import { ReportUpload } from './components/ReportUpload';
import { DashboardView } from './components/DashboardView';
import { TestResultsTable } from './components/TestResultsTable';
import { RiskAwarenessView } from './components/RiskAwarenessView';
import { RecommendationsView } from './components/RecommendationsView';
import { TrendAnalysisView } from './components/TrendAnalysisView';
import { AiAssistantView } from './components/AiAssistantView';
import { HealthSummaryReport } from './components/HealthSummaryReport';
import { AnalysisResult, PatientProfile, TestTrendItem } from './types';
import { DEMO_ANALYSIS, DEMO_PATIENT, DEMO_TRENDS } from './data/demoData';
import { ShieldAlert, Activity, HeartPulse } from 'lucide-react';
import { formatFriendlyErrorMessage, is503OrUnavailableError } from './utils/errorUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUploadedPayload, setLastUploadedPayload] = useState<{
    fileData: string;
    mimeType: string;
    fileName: string;
    manualText?: string;
  } | null>(null);
  const [initialAssistantQuestion, setInitialAssistantQuestion] = useState('');

  // Patient Profile state
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(() => {
    try {
      const saved = localStorage.getItem('labwise_patient_profile');
      return saved
        ? JSON.parse(saved)
        : {
            name: '',
            age: '',
            gender: '',
            height: '',
            weight: '',
            existingConditions: [],
            lifestyle: {
              smoking: '',
              alcohol: '',
              activityLevel: '',
              dietType: '',
            },
            familyHistory: '',
          };
    } catch {
      return {
        name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        existingConditions: [],
        lifestyle: {
          smoking: '',
          alcohol: '',
          activityLevel: '',
          dietType: '',
        },
        familyHistory: '',
      };
    }
  });

  // Current analysis state
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(() => {
    try {
      const saved = localStorage.getItem('labwise_current_analysis');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Trends state
  const [trends, setTrends] = useState<TestTrendItem[]>(() => {
    try {
      const saved = localStorage.getItem('labwise_test_trends');
      return saved ? JSON.parse(saved) : DEMO_TRENDS;
    } catch {
      return DEMO_TRENDS;
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('labwise_patient_profile', JSON.stringify(patientProfile));
    } catch (e) {
      console.error(e);
    }
  }, [patientProfile]);

  useEffect(() => {
    try {
      if (currentAnalysis) {
        localStorage.setItem('labwise_current_analysis', JSON.stringify(currentAnalysis));
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentAnalysis]);

  useEffect(() => {
    try {
      localStorage.setItem('labwise_test_trends', JSON.stringify(trends));
    } catch (e) {
      console.error(e);
    }
  }, [trends]);

  // Load Demo Report Handler
  const handleLoadDemo = () => {
    setIsLoading(true);
    setLoadingStep('Loading clinical demonstration panel...');
    setError(null);

    setTimeout(() => {
      setPatientProfile(DEMO_PATIENT);
      setCurrentAnalysis(DEMO_ANALYSIS);
      setTrends(DEMO_TRENDS);
      setIsLoading(false);
      setLoadingStep('');
      setActiveTab('dashboard');
    }, 400);
  };

  // Start analysis flow from landing
  const handleStartAnalysis = () => {
    if (!patientProfile.name) {
      setIsProfileModalOpen(true);
    }
    setActiveTab('upload');
  };

  // Analyze uploaded report file via API with automatic retry on 503
  const handleAnalyzeFile = async (
    fileData: string,
    mimeType: string,
    fileName: string,
    manualText?: string
  ) => {
    setIsLoading(true);
    setIsRetrying(false);
    setRetryAttempt(0);
    setError(null);
    setLastUploadedPayload({ fileData, mimeType, fileName, manualText });

    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt <= MAX_RETRIES) {
      try {
        if (attempt === 0) {
          setLoadingStep('Uploading and reading laboratory document...');
        } else {
          setIsRetrying(true);
          setRetryAttempt(attempt);
          setLoadingStep(`The AI service is experiencing high demand. Retrying... (Attempt ${attempt} of ${MAX_RETRIES})`);
        }

        const response = await fetch('/api/analyze-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData,
            mimeType,
            fileName,
            patientProfile,
            manualText,
          }),
        });

        const data = await response.json().catch(() => null);

        // Check for valid analysis payload across all envelope formats
        const candidateResult =
          data?.result ||
          data?.data ||
          (data && Array.isArray(data.tests) ? data : null);

        // Validate that we have a valid report with extracted tests
        if (
          response.ok &&
          candidateResult &&
          Array.isArray(candidateResult.tests) &&
          candidateResult.tests.length > 0
        ) {
          // Successfully analyzed!
          setCurrentAnalysis(candidateResult);
          setActiveTab('dashboard');
          setIsLoading(false);
          setIsRetrying(false);
          setLoadingStep('');
          setError(null);
          return;
        }

        // Handle error responses or empty results
        const rawError =
          data?.error ||
          data?.message ||
          (response.status >= 400
            ? `Service responded with status ${response.status}`
            : 'The report analysis could not extract structured laboratory values. Please ensure the document is clear and readable, or click Try Again.');
        const is503 = response.status === 503 || data?.is503 || is503OrUnavailableError(rawError);

        if (is503 && attempt < MAX_RETRIES) {
          attempt++;
          setIsRetrying(true);
          setRetryAttempt(attempt);
          const delaySec = attempt * 2;
          setLoadingStep(`The AI service is experiencing high demand. Retrying... (Attempt ${attempt} of ${MAX_RETRIES}) in ${delaySec}s`);
          await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
          continue;
        }

        const friendly = formatFriendlyErrorMessage(rawError);
        throw new Error(friendly.message);
      } catch (err: any) {
        const is503 = is503OrUnavailableError(err);
        if (is503 && attempt < MAX_RETRIES) {
          attempt++;
          setIsRetrying(true);
          setRetryAttempt(attempt);
          const delaySec = attempt * 2;
          setLoadingStep(`The AI service is experiencing high demand. Retrying... (Attempt ${attempt} of ${MAX_RETRIES}) in ${delaySec}s`);
          await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
          continue;
        }

        console.error('Analysis error:', err);
        const friendly = formatFriendlyErrorMessage(err);
        setError(friendly.message);
        break;
      }
    }

    setIsLoading(false);
    setIsRetrying(false);
    setLoadingStep('');
  };

  const handleRetryLastAnalysis = () => {
    if (lastUploadedPayload) {
      handleAnalyzeFile(
        lastUploadedPayload.fileData,
        lastUploadedPayload.mimeType,
        lastUploadedPayload.fileName,
        lastUploadedPayload.manualText
      );
    }
  };

  // Ask AI about specific test
  const handleAskAiAboutTest = (testName: string) => {
    setInitialAssistantQuestion(
      `Can you explain my ${testName} result in patient-friendly language and how it affects my health?`
    );
    setActiveTab('assistant');
  };

  const handleAskAiGeneral = (prompt: string) => {
    setInitialAssistantQuestion(prompt);
    setActiveTab('assistant');
  };

  const handleLoadDemoTimeline = () => {
    setTrends(DEMO_TRENDS);
  };

  const handleNewReport = () => {
    setActiveTab('upload');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentAnalysis={currentAnalysis}
        patientProfile={patientProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onTryDemo={handleLoadDemo}
        onNewReport={handleNewReport}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeTab === 'landing' && (
          <LandingHero
            onStartAnalysis={handleStartAnalysis}
            onTryDemo={handleLoadDemo}
          />
        )}

        {activeTab === 'upload' && (
          <ReportUpload
            onAnalyzeFile={handleAnalyzeFile}
            onLoadDemo={handleLoadDemo}
            isLoading={isLoading}
            loadingStep={loadingStep}
            isRetrying={isRetrying}
            retryAttempt={retryAttempt}
            onRetry={handleRetryLastAnalysis}
            error={error}
            patientProfile={patientProfile}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && currentAnalysis && (
          <DashboardView
            analysis={currentAnalysis}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'analysis' && currentAnalysis && (
          <TestResultsTable
            tests={currentAnalysis.tests}
            onAskAiAboutTest={handleAskAiAboutTest}
          />
        )}

        {activeTab === 'risks' && currentAnalysis && (
          <RiskAwarenessView
            riskAssessment={currentAnalysis.riskAssessment}
            riskCategories={currentAnalysis.riskCategories}
            onAskAi={handleAskAiGeneral}
            onNavigateRecommendations={() => setActiveTab('recommendations')}
          />
        )}

        {activeTab === 'recommendations' && currentAnalysis && (
          <RecommendationsView
            recommendations={currentAnalysis.recommendations}
            onAskAi={handleAskAiGeneral}
          />
        )}

        {activeTab === 'trends' && (
          <TrendAnalysisView
            trends={trends}
            hasHistoricalData={Boolean(currentAnalysis)}
            onLoadDemoTimeline={handleLoadDemoTimeline}
            onAskAi={handleAskAiGeneral}
          />
        )}

        {activeTab === 'assistant' && (
          <AiAssistantView
            currentAnalysis={currentAnalysis}
            initialQuestion={initialAssistantQuestion}
          />
        )}

        {activeTab === 'summary' && currentAnalysis && (
          <HealthSummaryReport
            analysis={currentAnalysis}
            onBack={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Patient Profile Modal */}
      <PatientProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={patientProfile}
        onSave={(updated) => setPatientProfile(updated)}
      />

      {/* Persistent Disclaimer & Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500 print:hidden" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-sm text-slate-800">LabWise AI</span>
              <span className="text-slate-400">| Health-Risk Awareness Platform</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button
                onClick={() => setActiveTab('landing')}
                className="hover:text-teal-700 transition-colors"
              >
                Home
              </button>
              <button
                onClick={handleLoadDemo}
                className="hover:text-teal-700 transition-colors font-medium text-teal-700"
              >
                Demo Report
              </button>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="hover:text-teal-700 transition-colors"
              >
                Patient Context
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Medical & Health-Risk Awareness Disclaimer</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              "This result is for health-risk awareness only and is not a medical diagnosis. Please consult a qualified healthcare professional for medical advice."
              LabWise AI is an educational tool designed to foster informed doctor-patient discussions. It does not provide medical treatment, diagnostic certainty, or pharmacotherapy prescriptions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} LabWise AI. Health-Risk Awareness Platform</p>
            <p>Designed strictly for patient education and health risk awareness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
