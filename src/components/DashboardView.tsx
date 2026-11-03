import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  FileText,
  Clock,
  Printer,
  ChevronRight,
  HeartPulse,
  Download,
  Loader2,
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { generateHealthSummaryPdf } from '../utils/generatePdfReport';

interface DashboardViewProps {
  analysis: AnalysisResult;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ analysis, onNavigate }) => {
  const { riskAssessment, tests, riskCategories, recommendations, patientProfile } = analysis;
  const [isDownloading, setIsDownloading] = useState(false);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Low':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          indicator: 'bg-emerald-500',
          label: 'Low Health Risk',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          indicator: 'bg-amber-500',
          label: 'Moderate Health Risk',
        };
      case 'High':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          indicator: 'bg-rose-500',
          label: 'High Health Risk',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-800 border-slate-200',
          indicator: 'bg-slate-400',
          label: 'Insufficient Data',
        };
    }
  };

  const riskBadge = getRiskBadge(riskAssessment.riskLevel);
  const abnormalTests = tests.filter((t) => t.status === 'Low' || t.status === 'High');

  return (
    <div className="space-y-8 py-4 sm:py-6" id="dashboard-view-container">
      {/* Patient & Report Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-100">
              Analysis Dashboard
            </span>
            {analysis.isDemo && (
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                DEMO DATA — NOT A REAL PATIENT
              </span>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Report Date: {analysis.reportDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Health Awareness Overview for {patientProfile.name || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Derived from extracted document: <span className="font-semibold text-slate-700">{analysis.uploadedFileName}</span>
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => onNavigate('assistant')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Ask LabWise AI</span>
          </button>
          <button
            onClick={() => {
              try {
                setIsDownloading(true);
                generateHealthSummaryPdf(analysis);
              } catch (err) {
                console.error('Failed to generate PDF:', err);
                onNavigate('summary');
              } finally {
                setIsDownloading(false);
              }
            }}
            disabled={isDownloading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-75 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            id="download-health-summary-dashboard-btn"
            title="Download Health Summary (PDF)"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download Health Summary</span>
          </button>
        </div>
      </div>

      {/* Mandatory Medical Disclaimer Box */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs sm:text-sm leading-relaxed">
          <p className="font-bold text-amber-950">
            "This result is for health-risk awareness only and is not a medical diagnosis. Please consult a qualified healthcare professional for medical advice."
          </p>
          <p className="text-amber-800 text-xs">
            Abnormal lab markers reflect physiological measurements relative to standard populations; they do not diagnose specific diseases on their own.
          </p>
        </div>
      </div>

      {/* Top 4 Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Risk Card */}
        <div
          onClick={() => onNavigate('risks')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overall Health Risk</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${riskBadge.indicator} animate-pulse`} />
            <span className="text-xl font-black text-slate-900">{riskAssessment.riskLevel}</span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            {riskAssessment.summaryText || 'Evaluation based on composite biomarker distribution.'}
          </p>
        </div>

        {/* Total Analyzed */}
        <div
          onClick={() => onNavigate('analysis')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Tests Analyzed</span>
            <FileText className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <div className="text-2xl font-black text-slate-900">{riskAssessment.totalCount}</div>
          <p className="text-xs text-slate-500">Extracted from report & mapped to reference ranges</p>
        </div>

        {/* Normal Markers */}
        <div
          onClick={() => onNavigate('analysis')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Optimal / Normal</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{riskAssessment.normalCount}</div>
          <p className="text-xs text-slate-500">Comfortably within healthy standard thresholds</p>
        </div>

        {/* Abnormal Markers */}
        <div
          onClick={() => onNavigate('analysis')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Abnormal / Flags</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{riskAssessment.abnormalCount}</div>
          <p className="text-xs text-slate-500">Require lifestyle attention or doctor review</p>
        </div>
      </div>

      {/* Main 2-Column Section: Key Findings & Risk Categories Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Key Findings & Abnormal Parameters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Findings Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Important Clinical Findings</h3>
                  <p className="text-xs text-slate-500">Summary of prioritized observations in your report</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('analysis')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
              >
                <span>View All Values</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {riskAssessment.keyFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs sm:text-sm text-slate-700"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Highlight of Abnormal Values */}
          {abnormalTests.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Flagged Biomarkers ({abnormalTests.length})</h3>
                  <p className="text-xs text-slate-500">Parameters falling outside conventional laboratory references</p>
                </div>
                <button
                  onClick={() => onNavigate('analysis')}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                >
                  <span>See Explanations</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {abnormalTests.slice(0, 6).map((test) => (
                  <div
                    key={test.id}
                    onClick={() => onNavigate('analysis')}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-300 bg-slate-50/50 hover:bg-white transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{test.testName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          test.status === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {test.status}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900">{test.resultValue}</span>
                      <span className="text-xs font-medium text-slate-500">{test.unit}</span>
                      <span className="text-[11px] text-slate-400 ml-auto">
                        Ref: {test.referenceRange}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1/3): Risk Categories & Recommendations Preview */}
        <div className="space-y-6">
          {/* Health Risk Categories Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900">Supported Risk Categories</h3>
              </div>
              <button
                onClick={() => onNavigate('risks')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                View Details
              </button>
            </div>

            <div className="space-y-3">
              {riskCategories.slice(0, 4).map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => onNavigate('risks')}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{cat.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.riskLevel === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : cat.riskLevel === 'Moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {cat.riskLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{cat.shortExplanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Recommendations Quick Peek */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm text-white">Targeted Lifestyle Plan</h3>
              </div>
              <button
                onClick={() => onNavigate('recommendations')}
                className="text-xs font-semibold text-teal-300 hover:text-teal-200"
              >
                Full Plan
              </button>
            </div>

            <div className="space-y-2.5">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3 rounded-xl bg-white/10 text-xs space-y-1 border border-white/10">
                  <div className="flex items-center justify-between text-teal-300 font-bold text-[10px] uppercase tracking-wider">
                    <span>{rec.category}</span>
                    <span>{rec.priority}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed line-clamp-2">{rec.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
