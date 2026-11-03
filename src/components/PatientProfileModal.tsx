import React, { useState } from 'react';
import { User, X, Check, Sparkles, Heart, Activity, ShieldCheck } from 'lucide-react';
import { PatientProfile } from '../types';
import { DEMO_PATIENT } from '../data/demoData';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PatientProfile;
  onSave: (updated: PatientProfile) => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<PatientProfile>(profile);
  const [conditionInput, setConditionInput] = useState('');

  if (!isOpen) return null;

  const handleAddCondition = () => {
    if (conditionInput.trim() && !formData.existingConditions.includes(conditionInput.trim())) {
      setFormData({
        ...formData,
        existingConditions: [...formData.existingConditions, conditionInput.trim()],
      });
      setConditionInput('');
    }
  };

  const handleRemoveCondition = (cond: string) => {
    setFormData({
      ...formData,
      existingConditions: formData.existingConditions.filter((c) => c !== cond),
    });
  };

  const handleFillDemo = () => {
    setFormData({ ...DEMO_PATIENT });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" id="patient-profile-modal">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-700 to-cyan-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <User className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Patient Profile & Health Context</h3>
              <p className="text-xs text-teal-100">Used strictly to contextualize laboratory reference ranges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Demo Fill Button */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/80 border border-teal-200/80">
            <div className="flex items-center gap-2 text-xs text-teal-900 font-medium">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Testing the app? Quickly populate realistic patient info.</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              Fill Demo Patient
            </button>
          </div>

          {/* Basic Demographics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Name / Alias
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan or Anonymous"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                min={1}
                max={120}
                placeholder="e.g. 42"
                value={formData.age === '' ? '' : formData.age}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    age: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Biological Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="">Select Gender (for ranges)</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Height
              </label>
              <input
                type="text"
                placeholder="e.g. 178 cm or 5'10''"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Weight
              </label>
              <input
                type="text"
                placeholder="e.g. 84 kg or 185 lbs"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Physical Activity Level
              </label>
              <select
                value={formData.lifestyle.activityLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lifestyle: { ...formData.lifestyle, activityLevel: e.target.value as any },
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="">Select Activity Level</option>
                <option value="Sedentary">Sedentary (Little or no exercise)</option>
                <option value="Lightly active">Lightly active (1-3 days/week)</option>
                <option value="Moderately active">Moderately active (3-5 days/week)</option>
                <option value="Very active">Very active (6-7 days/week)</option>
              </select>
            </div>
          </div>

          {/* Lifestyle Information */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lifestyle Habits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Smoking Status
                </label>
                <select
                  value={formData.lifestyle.smoking}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, smoking: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-teal-500 bg-white"
                >
                  <option value="">Select Smoking Status</option>
                  <option value="Never">Never smoked</option>
                  <option value="Former">Former smoker</option>
                  <option value="Current">Current smoker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Alcohol Consumption
                </label>
                <select
                  value={formData.lifestyle.alcohol}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, alcohol: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-teal-500 bg-white"
                >
                  <option value="">Select Alcohol Consumption</option>
                  <option value="None">None / Non-drinker</option>
                  <option value="Occasional">Occasional (1-2 drinks/month)</option>
                  <option value="Moderate">Moderate (1-2 drinks/week)</option>
                  <option value="Heavy">Heavy (Daily or regular high intake)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Typical Dietary Pattern
                </label>
                <input
                  type="text"
                  placeholder="e.g. Balanced, Vegetarian, Low-carb, Mediterranean, Fast food"
                  value={formData.lifestyle.dietType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, dietType: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Known Conditions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Existing Health Conditions (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Hypertension, Pre-diabetes, Asthma"
                value={conditionInput}
                onChange={(e) => setConditionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCondition();
                  }
                }}
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Add
              </button>
            </div>

            {formData.existingConditions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.existingConditions.map((cond, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    <span>{cond}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(cond)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Family History */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Family Medical History (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Father had Type 2 Diabetes, Mother had high cholesterol"
              value={formData.familyHistory}
              onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-teal-500"
            />
          </div>

          {/* Privacy Footnote */}
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Information is held in browser local state for your current session only.</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save Profile Context</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
