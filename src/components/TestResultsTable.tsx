import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { LabTestValue, TestStatus } from '../types';

interface TestResultsTableProps {
  tests: LabTestValue[];
  onAskAiAboutTest?: (testName: string) => void;
}

export const TestResultsTable: React.FC<TestResultsTableProps> = ({ tests, onAskAiAboutTest }) => {
  const [filter, setFilter] = useState<'All' | 'Normal' | 'High' | 'Low'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesFilter =
        filter === 'All'
          ? true
          : filter === 'Normal'
          ? test.status === 'Normal'
          : filter === 'High'
          ? test.status === 'High'
          : test.status === 'Low';

      const matchesSearch =
        test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [tests, filter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedTestId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case 'Normal':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Normal',
          icon: CheckCircle2,
        };
      case 'High':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'High',
          icon: AlertTriangle,
        };
      case 'Low':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          label: 'Low',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: 'Unknown',
          icon: Info,
        };
    }
  };

  // Visual position gauge calculation
  const renderRangeGauge = (test: LabTestValue) => {
    if (test.minRange === null || test.maxRange === null || test.numericValue === null) {
      return (
        <span className="text-[11px] text-slate-400 italic">Reference range baseline</span>
      );
    }

    const min = test.minRange;
    const max = test.maxRange;
    const val = test.numericValue;

    // Expand bounds by 25% on each side for visualization
    const span = Math.max(max - min, 1);
    const lowerBound = min - span * 0.25;
    const upperBound = max + span * 0.25;
    const totalSpan = upperBound - lowerBound;

    const normalStartPercent = Math.max(0, Math.min(100, ((min - lowerBound) / totalSpan) * 100));
    const normalEndPercent = Math.max(0, Math.min(100, ((max - lowerBound) / totalSpan) * 100));
    const normalWidth = Math.max(10, normalEndPercent - normalStartPercent);

    const valPercent = Math.max(2, Math.min(98, ((val - lowerBound) / totalSpan) * 100));

    const isHigh = test.status === 'High';
    const isLow = test.status === 'Low';

    return (
      <div className="w-36 sm:w-48 space-y-1">
        <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          {/* Target green normal zone */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-300"
            style={{
              left: `${normalStartPercent}%`,
              width: `${normalWidth}%`,
            }}
          />
          {/* Patient Value Marker */}
          <div
            className={`absolute top-0 bottom-0 w-2.5 -ml-1 rounded-full shadow-xs ${
              isHigh
                ? 'bg-amber-600 ring-2 ring-amber-300'
                : isLow
                ? 'bg-indigo-600 ring-2 ring-indigo-300'
                : 'bg-emerald-600 ring-2 ring-emerald-300'
            }`}
            style={{ left: `${valPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
          <span>{min}</span>
          <span className="text-slate-600 font-semibold">{val}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 py-4" id="test-results-table-container">
      {/* Header & Filter Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Extracted Laboratory Test Results
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Review every biomarker, reference boundaries, and clinical explanations.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by test name or panel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" />
            Filter Status:
          </span>
          {(['All', 'Normal', 'High', 'Low'] as const).map((opt) => {
            const count =
              opt === 'All'
                ? tests.length
                : opt === 'Normal'
                ? tests.filter((t) => t.status === 'Normal').length
                : opt === 'High'
                ? tests.filter((t) => t.status === 'High').length
                : tests.filter((t) => t.status === 'Low').length;

            return (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === opt
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{opt}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filter === opt ? 'bg-teal-700 text-white' : 'bg-white text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="extracted-tests-table">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Test Name & Category</th>
                <th className="py-3.5 px-4">Result Value</th>
                <th className="py-3.5 px-4">Reference Range</th>
                <th className="py-3.5 px-4">Visual Gauge</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 space-y-2">
                    <Info className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-600">No laboratory test values found matching your criteria.</p>
                    <p className="text-xs text-slate-400">Try changing your search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => {
                  const badge = getStatusBadge(test.status);
                  const isExpanded = expandedTestId === test.id;
                  const isAbnormal = test.status === 'High' || test.status === 'Low';

                  return (
                    <React.Fragment key={test.id}>
                      <tr
                        onClick={() => toggleExpand(test.id)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isAbnormal ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* Test Name & Category */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-slate-900">{test.testName}</div>
                          <div className="text-[11px] text-slate-500">{test.category}</div>
                        </td>

                        {/* Result Value */}
                        <td className="py-4 px-4 font-mono font-bold text-slate-900">
                          <span className="text-base">{test.resultValue}</span>{' '}
                          <span className="text-xs font-normal text-slate-500">{test.unit}</span>
                        </td>

                        {/* Reference Range */}
                        <td className="py-4 px-4 text-slate-600">
                          {test.referenceRange || 'Not provided'}
                        </td>

                        {/* Visual Range Gauge */}
                        <td className="py-4 px-4">
                          {renderRangeGauge(test)}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                          >
                            <badge.icon className="w-3 h-3 shrink-0" />
                            <span>{badge.label}</span>
                          </span>
                        </td>

                        {/* Action / Expand Arrow */}
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Explanation Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={6} className="p-4 sm:p-6 border-t border-slate-200/60">
                            <div className="space-y-4 max-w-4xl animate-in fade-in duration-150">
                              {/* What it measures */}
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                                  <Info className="w-3.5 h-3.5 text-teal-600" />
                                  <span>What this test measures:</span>
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                  {test.generalExplanation}
                                </p>
                              </div>

                              {/* Why it may be outside reference range */}
                              {isAbnormal && test.abnormalExplanation && (
                                <div className="space-y-1 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Why this value may be outside the reference range:</span>
                                  </h4>
                                  <p className="text-xs sm:text-sm leading-relaxed">
                                    {test.abnormalExplanation}
                                  </p>
                                </div>
                              )}

                              {/* Possible Health Relevance */}
                              {test.healthRelevance && (
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                    Health Relevance & Patient Insights:
                                  </h4>
                                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                    {test.healthRelevance}
                                  </p>
                                </div>
                              )}

                              {/* Cautious Note */}
                              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                                <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                                <p className="leading-relaxed">
                                  {test.cautiousNote ||
                                    'An isolated abnormal result can be influenced by diet, recent exercise, sleep, or stress. It should always be evaluated in context by your physician.'}
                                </p>
                              </div>

                              {/* Ask AI button */}
                              {onAskAiAboutTest && (
                                <div className="pt-1 flex items-center justify-end">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAskAiAboutTest(test.testName);
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Ask AI about {test.testName}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
