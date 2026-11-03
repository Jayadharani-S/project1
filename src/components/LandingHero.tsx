import React from 'react';
import {
  Activity,
  FileUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HeartPulse,
  TrendingUp,
  Bot,
  AlertCircle,
  FileCheck2,
  Stethoscope,
  ChevronRight,
  Database,
} from 'lucide-react';

interface LandingHeroProps {
  onStartAnalysis: () => void;
  onTryDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartAnalysis,
  onTryDemo,
}) => {
  return (
    <div className="space-y-12 py-6 sm:py-10" id="landing-hero-container">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-6">
            <HeartPulse className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>AI-Assisted Laboratory Report Analysis for Patients</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Understand Your Lab Reports. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-teal-100">
              Know Your Health Risks.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            LabWise AI transforms complex, medical-jargon blood tests and metabolic panels into clear, understandable health-risk awareness. Extract test values automatically, uncover potential risk categories, and receive evidence-based lifestyle insights designed specifically for patients.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              onClick={onStartAnalysis}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
              id="hero-analyze-report-btn"
            >
              <FileUp className="w-4 h-4" />
              <span>Analyze My Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTryDemo}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-teal-200 hover:text-white font-semibold text-sm sm:text-base border border-teal-500/30 transition-all backdrop-blur-sm shadow-md"
              id="hero-try-demo-btn"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Try Demo Report (Full Sample)</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Multimodal Vision Extraction</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>No Medical Jargon</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Private Local Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Medical Disclaimer Card */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-amber-900 shadow-xs flex flex-col sm:flex-row items-start gap-4">
        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm tracking-tight text-amber-950 flex items-center gap-2">
            Important Medical Notice & Patient Educational Disclaimer
          </h4>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
            "This result is for health-risk awareness only and is not a medical diagnosis. Please consult a qualified healthcare professional for medical advice."
          </p>
          <p className="text-xs text-amber-700/90 leading-relaxed">
            LabWise AI does not prescribe medications, calculate pharmaceutical dosages, or substitute for formal physician consultations. If you are experiencing acute medical symptoms, seek emergency medical attention immediately.
          </p>
        </div>
      </div>

      {/* How It Works Workflow */}
      <div className="space-y-6" id="workflow-section">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How LabWise AI Works
          </h2>
          <p className="text-sm text-slate-500">
            A seamless, patient-friendly pipeline from raw lab papers to actionable health insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Patient Profile & Context</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provide basic non-invasive details like age, gender, and lifestyle habits to contextualize reference ranges accurately.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">AI Value Extraction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload PDF or photo of your lab test. Advanced AI reads and digitizes test names, numeric results, and reference boundaries without hallucinating missing values.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Risk-Awareness & Explanations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Abnormal biomarkers are flagged with plain-language explanations of what they measure, why they may deviate, and potential health relevance.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Lifestyle Plan & Summary</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive patient-friendly dietary, physical activity, and hydration guidelines, plus a printable summary ready to discuss with your physician.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Lab Panels Supported */}
      <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Supported Diagnostic Laboratory Categories</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              LabWise AI identifies and groups biomarkers across standard clinical panels.
            </p>
          </div>
          <button
            onClick={onTryDemo}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 self-start sm:self-auto"
          >
            <span>See Demo Parameters</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { title: 'Blood Sugar', tests: 'Glucose, HbA1c', color: 'bg-amber-100 text-amber-800' },
            { title: 'Lipid Panel', tests: 'Cholesterol, LDL, HDL, Triglycerides', color: 'bg-rose-100 text-rose-800' },
            { title: 'Blood Count', tests: 'Hemoglobin, RBC, Hematocrit', color: 'bg-red-100 text-red-800' },
            { title: 'Kidney Health', tests: 'Creatinine, BUN, eGFR', color: 'bg-sky-100 text-sky-800' },
            { title: 'Liver Enzymes', tests: 'ALT, AST, Bilirubin', color: 'bg-emerald-100 text-emerald-800' },
            { title: 'Endocrine & Vits', tests: 'TSH, Vitamin D, B12', color: 'bg-purple-100 text-purple-800' },
          ].map((panel, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs space-y-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${panel.color}`}>
                {panel.title}
              </span>
              <p className="text-xs font-semibold text-slate-800 pt-1">{panel.tests}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
