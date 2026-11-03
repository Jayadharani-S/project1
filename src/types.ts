export type HealthRiskLevel = 'Low' | 'Moderate' | 'High' | 'Insufficient data';
export type TestStatus = 'Normal' | 'Low' | 'High' | 'Unknown';

export interface PatientProfile {
  name: string;
  age: number | '';
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | '';
  height: string;
  weight: string;
  existingConditions: string[];
  lifestyle: {
    smoking: 'Never' | 'Former' | 'Current' | '';
    alcohol: 'None' | 'Occasional' | 'Moderate' | 'Heavy' | '';
    activityLevel: 'Sedentary' | 'Lightly active' | 'Moderately active' | 'Very active' | '';
    dietType: string;
  };
  familyHistory: string;
}

export interface LabTestValue {
  id: string;
  testName: string;
  category: string;
  resultValue: string;
  numericValue: number | null;
  unit: string;
  referenceRange: string;
  minRange: number | null;
  maxRange: number | null;
  status: TestStatus;
  generalExplanation: string;
  abnormalExplanation?: string;
  healthRelevance?: string;
  cautiousNote?: string;
}

export interface RiskCategory {
  id: string;
  title: string;
  categoryKey: 'blood_sugar' | 'cardiovascular' | 'kidney' | 'liver' | 'anemia' | 'thyroid' | 'other';
  riskLevel: HealthRiskLevel;
  relevantParameters: string[];
  shortExplanation: string;
  recommendedNextStep: string;
  supportedByData: boolean;
}

export interface PersonalizedRecommendation {
  id: string;
  category: 'Diet' | 'Physical Activity' | 'Sleep' | 'Hydration' | 'General Lifestyle' | 'When to Consult a Healthcare Professional';
  recommendation: string;
  priority: 'Routine' | 'Consider' | 'Important';
  rationale: string;
}

export interface OverallRiskAssessment {
  riskLevel: HealthRiskLevel;
  summaryText: string;
  keyFindings: string[];
  normalCount: number;
  abnormalCount: number;
  totalCount: number;
}

export interface AnalysisResult {
  id: string;
  reportDate: string;
  uploadedFileName: string;
  isDemo: boolean;
  patientProfile: PatientProfile;
  tests: LabTestValue[];
  riskAssessment: OverallRiskAssessment;
  riskCategories: RiskCategory[];
  recommendations: PersonalizedRecommendation[];
  aiSummary: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
}

export interface HistoricalTestRecord {
  date: string;
  value: number;
  unit: string;
  status: TestStatus;
  reportId: string;
}

export interface TestTrendItem {
  testName: string;
  unit: string;
  referenceRange: string;
  history: HistoricalTestRecord[];
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  changePercent?: number;
}
