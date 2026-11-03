import React, { useState } from 'react';
import {
  Printer,
  Download,
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Sparkles,
  Heart,
  Stethoscope,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { generateHealthSummaryPdf } from '../utils/generatePdfReport';

interface HealthSummaryReportProps {
  analysis: AnalysisResult;
  onBack: () => void;
}

export const HealthSummaryReport: React.FC<HealthSummaryReportProps> = ({
  analysis,
  onBack,
}) => {
  const { patientProfile, riskAssessment, tests, riskCategories, recommendations } = analysis;
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = () => {
    try {
      setIsGenerating(true);
      generateHealthSummaryPdf(analysis);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4" id="health-summary-report-page">
      {/* Action Bar (Hidden in Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Printable Health Summary</h2>
            <p className="text-xs text-slate-500">Ready to print or save as a PDF for your physician appointment</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            id="print-summary-btn"
            title="Open browser print dialog"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white font-bold text-xs sm:text-sm shadow-md transition-all shadow-teal-600/20 cursor-pointer"
            id="download-health-summary-btn"
            title="Generate and download vector PDF report"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download Health Summary (PDF)</span>
          </button>
        </div>
      </div>

      {/* Official Report Document Container */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg print:border-none print:shadow-none print:p-0 print:m-0 space-y-8 print:space-y-6">
        {/* Report Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                LabWise AI — Laboratory Health Awareness Report
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Automated Multimodal Laboratory Analysis & Educational Health-Risk Assessment
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5">
            <div>
              <span className="text-slate-400">Analysis Date: </span>
              <span className="font-bold text-slate-800">{analysis.reportDate}</span>
            </div>
            <div>
              <span className="text-slate-400">Document Source: </span>
              <span className="font-mono text-slate-700">{analysis.uploadedFileName}</span>
            </div>
            {analysis.isDemo && (
              <span className="inline-block mt-1 font-bold text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                DEMO DATA — NOT A REAL PATIENT
              </span>
            )}
          </div>
        </div>

        {/* Prominent Medical Disclaimer Banner */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-amber-950 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>MANDATORY MEDICAL ADVICE DISCLAIMER</span>
          </div>
          <p className="font-semibold leading-relaxed">
            "This result is for health-risk awareness only and is not a medical diagnosis. Please consult a qualified healthcare professional for medical advice."
          </p>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            This document is generated by an educational AI assistant for patient empowerment and conversation facilitation. It does not replace clinical consultation, diagnostic testing, or physician oversight.
          </p>
        </div>

        {/* Patient Demographics & Profile Grid */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-600" />
            <span>Patient Context & Baseline Information</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-400 block text-[11px]">Patient Name</span>
              <span className="font-bold text-slate-900">{patientProfile.name || 'Anonymous'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Age / Gender</span>
              <span className="font-bold text-slate-900">
                {patientProfile.age || '—'} yrs • {patientProfile.gender || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Height / Weight</span>
              <span className="font-bold text-slate-900">
                {patientProfile.height || '—'} • {patientProfile.weight || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Activity Level</span>
              <span className="font-bold text-slate-900">
                {patientProfile.lifestyle?.activityLevel || 'Standard'}
              </span>
            </div>
          </div>

          {(patientProfile.existingConditions?.length > 0 || patientProfile.familyHistory) && (
            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
              {patientProfile.existingConditions?.length > 0 && (
                <div>
                  <span className="text-slate-400 block">Reported Existing Conditions:</span>
                  <span className="text-slate-800 font-medium">
                    {patientProfile.existingConditions.join(', ')}
                  </span>
                </div>
              )}
              {patientProfile.familyHistory && (
                <div>
                  <span className="text-slate-400 block">Family Medical History:</span>
                  <span className="text-slate-800 font-medium">{patientProfile.familyHistory}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Overall Health Risk Assessment */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-200 pb-2">
            1. Overall Health-Risk Assessment
          </h3>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700">Classification:</span>
              <span className="font-extrabold text-sm px-3 py-0.5 rounded-full bg-slate-900 text-white">
                {riskAssessment.riskLevel} Health Risk
              </span>
              <span className="text-xs text-slate-500 ml-auto">
                {riskAssessment.totalCount} tests analyzed ({riskAssessment.normalCount} normal,{' '}
                {riskAssessment.abnormalCount} flagged)
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">{riskAssessment.summaryText}</p>
          </div>
        </div>

        {/* Key Findings */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Important Clinical Findings:
          </h4>
          <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700">
            {riskAssessment.keyFindings.map((kf, idx) => (
              <li key={idx} className="leading-relaxed">
                {kf}
              </li>
            ))}
          </ul>
        </div>

        {/* Complete Extracted Lab Test Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-200 pb-2">
            2. Extracted Laboratory Parameters
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-2.5">Test Name</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Result</th>
                  <th className="p-2.5">Reference Range</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tests.map((test) => (
                  <tr
                    key={test.id}
                    className={
                      test.status === 'High' || test.status === 'Low'
                        ? 'bg-amber-50/40 font-semibold'
                        : ''
                    }
                  >
                    <td className="p-2.5 text-slate-900">{test.testName}</td>
                    <td className="p-2.5 text-slate-500 text-[11px]">{test.category}</td>
                    <td className="p-2.5 font-mono text-slate-900">
                      {test.resultValue} {test.unit}
                    </td>
                    <td className="p-2.5 text-slate-600">{test.referenceRange || 'Not provided'}</td>
                    <td className="p-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                          test.status === 'Normal'
                            ? 'text-emerald-800 bg-emerald-100'
                            : test.status === 'High'
                            ? 'text-amber-800 bg-amber-100'
                            : 'text-indigo-800 bg-indigo-100'
                        }`}
                      >
                        {test.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Categories */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-200 pb-2">
            3. Risk Categories Supported by Laboratory Data
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {riskCategories.map((rc) => (
              <div key={rc.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rc.title}</span>
                  <span className="font-bold text-[10px] px-2 py-0.2 rounded-full bg-white border border-slate-300">
                    {rc.riskLevel} Risk
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{rc.shortExplanation}</p>
                <div className="pt-1 text-[11px] font-medium text-teal-800">
                  <strong>Recommended Step:</strong> {rc.recommendedNextStep}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-200 pb-2">
            4. Personalized Lifestyle Recommendations
          </h3>
          <div className="space-y-2 text-xs">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-white border border-slate-200 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span>{rec.category}</span>
                  <span className="text-teal-700">{rec.priority} Priority</span>
                </div>
                <p className="font-semibold text-slate-900 text-xs">{rec.recommendation}</p>
                <p className="text-slate-500 text-[11px] leading-relaxed">{rec.rationale}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Consultation Checklist */}
        <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-950 text-xs space-y-2">
          <h4 className="font-bold text-sm text-teal-900 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-teal-700" />
            <span>Suggested Questions to Ask Your Doctor</span>
          </h4>
          <ul className="space-y-1 list-disc list-inside text-teal-900/90 leading-relaxed text-[11px]">
            <li>"Given my elevated blood glucose and HbA1c, would you recommend a follow-up test in 3 months?"</li>
            <li>"What are your specific targets for my LDL cholesterol and triglycerides?"</li>
            <li>"Should we evaluate my serum ferritin and iron saturation regarding my lower hemoglobin?"</li>
            <li>"Are there specific dietary shifts or physical activity guidelines you advise for my profile?"</li>
          </ul>
        </div>

        {/* Official Report Sign-off & Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
          <div>
            LabWise AI • Medical Educational System
          </div>
          <div>Page 1 of 1 • For Patient Awareness</div>
        </div>
      </div>
    </div>
  );
};
