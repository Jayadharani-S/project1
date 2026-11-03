import React, { useState } from 'react';
import {
  Sparkles,
  Utensils,
  Footprints,
  Moon,
  Droplets,
  HeartPulse,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { PersonalizedRecommendation } from '../types';

interface RecommendationsViewProps {
  recommendations: PersonalizedRecommendation[];
  onAskAi: (prompt: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onAskAi,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Diet',
    'Physical Activity',
    'Sleep',
    'Hydration',
    'General Lifestyle',
    'When to Consult a Healthcare Professional',
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Diet':
        return Utensils;
      case 'Physical Activity':
        return Footprints;
      case 'Sleep':
        return Moon;
      case 'Hydration':
        return Droplets;
      case 'When to Consult a Healthcare Professional':
        return Stethoscope;
      default:
        return HeartPulse;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Important':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Consider':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredRecs = recommendations.filter((r) =>
    selectedCategory === 'All' ? true : r.category === selectedCategory
  );

  return (
    <div className="space-y-8 py-4" id="recommendations-view-container">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600">
          <Sparkles className="w-4 h-4" />
          <span>Patient Lifestyle Plan</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Personalized Recommendations
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Evidence-based behavioral, dietary, and activity recommendations aligned with your specific lab findings. These habits directly modulate insulin sensitivity, lipid clearance, and cellular vitality.
        </p>

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-teal-50/90 border border-teal-200 rounded-2xl p-4 sm:p-5 text-teal-950 shadow-2xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-bold text-teal-950">Non-Pharmaceutical Safety Guarantee:</p>
          <p className="text-teal-800 text-xs leading-relaxed">
            LabWise AI strictly provides lifestyle and nutritional education. We do NOT prescribe medications, specify dosages, or alter physician-directed treatments. Always review any intended major lifestyle or supplement changes with your healthcare team.
          </p>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRecs.map((rec) => {
          const Icon = getCategoryIcon(rec.category);

          return (
            <div
              key={rec.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Top Badge Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-slate-700">{rec.category}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(
                      rec.priority
                    )}`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>

                {/* Recommendation Text */}
                <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {rec.recommendation}
                </h3>

                {/* Rationale */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Clinical Mechanism / Rationale:
                  </span>
                  <p className="leading-relaxed">{rec.rationale}</p>
                </div>
              </div>

              {/* Ask AI Contextual Button */}
              <div className="pt-2 flex justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    onAskAi(`How can I practically apply this recommendation: "${rec.recommendation}"?`)
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Ask AI for Practical Tips</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
