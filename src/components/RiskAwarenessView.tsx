import React from 'react';
import {
  ShieldAlert,
  Activity,
  Heart,
  Droplet,
  Flame,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Stethoscope,
  Info,
} from 'lucide-react';
import { RiskCategory, OverallRiskAssessment } from '../types';

interface RiskAwarenessViewProps {
  riskAssessment: OverallRiskAssessment;
  riskCategories: RiskCategory[];
  onAskAi: (prompt: string) => void;
  onNavigateRecommendations: () => void;
}

export const RiskAwarenessView: React.FC<RiskAwarenessViewProps> = ({
  riskAssessment,
  riskCategories,
  onAskAi,
  onNavigateRecommendations,
}) => {
  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'blood_sugar':
        return Droplet;
      case 'cardiovascular':
        return Heart;
      case 'kidney':
        return Activity;
      case 'liver':
        return Flame;
      case 'anemia':
        return Droplet;
      case 'thyroid':
        return Sparkles;
      default:
        return Stethoscope;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          cardBorder: 'border-rose-200 hover:border-rose-300',
          headerBg: 'bg-rose-50/50',
          iconColor: 'text-rose-600',
        };
      case 'Moderate':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          cardBorder: 'border-amber-200 hover:border-amber-300',
          headerBg: 'bg-amber-50/50',
          iconColor: 'text-amber-600',
        };
      case 'Low':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          cardBorder: 'border-emerald-200 hover:border-emerald-300',
          headerBg: 'bg-emerald-50/50',
          iconColor: 'text-emerald-600',
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          cardBorder: 'border-slate-200 hover:border-slate-300',
          headerBg: 'bg-slate-50',
          iconColor: 'text-slate-500',
        };
    }
  };

  return (
    <div className="space-y-8 py-4" id="risk-awareness-container">
      {/* View Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600">
          <ShieldAlert className="w-4 h-4" />
          <span>Clinical Health-Risk Awareness</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Risk Awareness Evaluation
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Based exclusively on the extracted laboratory parameters, these categories highlight physiological domains where numbers warrant proactive attention. This analysis identifies risk gradients early, before formal diagnoses arise.
        </p>
      </div>

      {/* Critical Disclaimer Banner */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 sm:p-5 text-amber-900 shadow-2xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-bold text-amber-950">
            "This result is for health-risk awareness only and is not a medical diagnosis. Please consult a qualified healthcare professional for medical advice."
          </p>
          <p className="text-amber-800 text-xs">
            Risk classifications reflect statistical associations, not active clinical diseases. Normal results do not rule out all medical conditions, and borderline results often respond rapidly to lifestyle shifts.
          </p>
        </div>
      </div>

      {/* Overall Assessment Card */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              Overall Session Assessment
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-black text-white">
                {riskAssessment.riskLevel} Health Risk
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateRecommendations}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-colors self-start sm:self-auto"
          >
            <span>View Lifestyle Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4">
          {riskAssessment.summaryText}
        </p>
      </div>

      {/* Specific Supported Risk Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Physiological Risk Categories Supported by Your Data</h3>
          <span className="text-xs text-slate-500">Only showing domains with tested biomarkers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {riskCategories.map((category) => {
            const Icon = getCategoryIcon(category.categoryKey);
            const style = getRiskColor(category.riskLevel);

            return (
              <div
                key={category.id}
                className={`bg-white rounded-3xl border ${style.cardBorder} shadow-xs overflow-hidden flex flex-col transition-all hover:shadow-md`}
              >
                {/* Category Header */}
                <div className={`p-5 ${style.headerBg} border-b border-slate-100 flex items-start justify-between gap-3`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl bg-white shadow-2xs ${style.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">{category.title}</h4>
                      <p className="text-[11px] text-slate-500">Based on clinical laboratory indicators</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs whitespace-nowrap ${style.badge}`}
                  >
                    {category.riskLevel} Risk
                  </span>
                </div>

                {/* Category Body */}
                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Relevant Parameters */}
                    {category.relevantParameters.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Associated Extracted Markers:
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {category.relevantParameters.map((param, pIdx) => (
                            <span
                              key={pIdx}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
                            >
                              {param}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Short Explanation */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Risk Rationale:
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {category.shortExplanation}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Next Step Box */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-teal-950 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-teal-900">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                        <span>Recommended Next Step:</span>
                      </div>
                      <p className="leading-relaxed text-teal-800">{category.recommendedNextStep}</p>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          onAskAi(`Can you explain the risk factors associated with my ${category.title}?`)
                        }
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800"
                      >
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>Ask AI about {category.title}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
