import React from 'react';
import { Activity, FileText, BarChart3, Bot, ShieldAlert, Sparkles, User, RefreshCw, Printer } from 'lucide-react';
import { AnalysisResult, PatientProfile } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentAnalysis: AnalysisResult | null;
  patientProfile: PatientProfile;
  onOpenProfile: () => void;
  onTryDemo: () => void;
  onNewReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentAnalysis,
  patientProfile,
  onOpenProfile,
  onTryDemo,
  onNewReport,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, requiresReport: true },
    { id: 'upload', label: 'Upload Report', icon: FileText, requiresReport: false },
    { id: 'analysis', label: 'Lab Values', icon: Activity, requiresReport: true },
    { id: 'risks', label: 'Risk Awareness', icon: ShieldAlert, requiresReport: true },
    { id: 'recommendations', label: 'Lifestyle Plan', icon: Sparkles, requiresReport: true },
    { id: 'trends', label: 'Trends', icon: BarChart3, requiresReport: true },
    { id: 'assistant', label: 'Ask LabWise AI', icon: Bot, requiresReport: true },
    { id: 'summary', label: 'Health Summary', icon: Printer, requiresReport: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs" id="app-header">
      {/* Top Medical Disclaimer Announcement */}
      <div className="bg-teal-700 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-teal-200 shrink-0" />
        <span>
          <strong>Health Awareness Prototype:</strong> This application is for educational and risk awareness only. It is not a medical diagnosis. Always consult a qualified healthcare professional.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab(currentAnalysis ? 'dashboard' : 'landing')}
            id="logo-brand-button"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">LabWise <span className="text-teal-600">AI</span></span>
                {currentAnalysis?.isDemo && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                    DEMO DATA
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Understand Your Lab Reports. Know Your Health Risks.</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!currentAnalysis ? (
              <button
                onClick={onTryDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors shadow-2xs"
                id="header-try-demo-btn"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Try Demo Report</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onNewReport}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="Upload or analyze another report"
                  id="header-new-report-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden md:inline">New Analysis</span>
                </button>

                <button
                  onClick={onOpenProfile}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  id="header-patient-profile-btn"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline font-semibold text-slate-800">
                    {patientProfile.name ? patientProfile.name.split(' ')[0] : 'Patient Profile'}
                  </span>
                  {patientProfile.age && <span className="text-slate-500">({patientProfile.age}y)</span>}
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-xs shadow-teal-600/20 transition-colors"
              id="header-analyze-cta-btn"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{currentAnalysis ? 'Upload New' : 'Analyze Report'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar (When report is loaded or user navigates) */}
        {currentAnalysis && (
          <nav className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto scrollbar-none border-t border-slate-100" id="main-navigation-tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  id={`nav-tab-${item.id}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'analysis' && currentAnalysis.riskAssessment.abnormalCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                      {currentAnalysis.riskAssessment.abnormalCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
