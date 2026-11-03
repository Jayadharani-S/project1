import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from 'lucide-react';
import { TestTrendItem } from '../types';
import { DEMO_TRENDS } from '../data/demoData';

interface TrendAnalysisViewProps {
  trends: TestTrendItem[];
  hasHistoricalData: boolean;
  onLoadDemoTimeline: () => void;
  onAskAi: (prompt: string) => void;
}

export const TrendAnalysisView: React.FC<TrendAnalysisViewProps> = ({
  trends,
  hasHistoricalData,
  onLoadDemoTimeline,
  onAskAi,
}) => {
  const [selectedTestName, setSelectedTestName] = useState<string>(
    trends[0]?.testName || DEMO_TRENDS[0].testName
  );

  const activeTrends = trends.length > 0 ? trends : DEMO_TRENDS;
  const currentTrend =
    activeTrends.find((t) => t.testName === selectedTestName) || activeTrends[0];

  // Render responsive SVG line chart
  const renderLineChart = (trend: TestTrendItem) => {
    if (!trend.history || trend.history.length < 2) return null;

    const values = trend.history.map((h) => h.value);
    const minVal = Math.min(...values) * 0.85;
    const maxVal = Math.max(...values) * 1.15;
    const range = maxVal - minVal || 1;

    const width = 600;
    const height = 220;
    const padding = { top: 25, bottom: 45, left: 55, right: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = trend.history.map((item, idx) => {
      const x = padding.left + (idx / (trend.history.length - 1)) * chartW;
      const y = padding.top + chartH - ((item.value - minVal) / range) * chartH;
      return { x, y, ...item };
    });

    const pathString = points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');

    const areaString = `${pathString} L ${points[points.length - 1].x},${
      padding.top + chartH
    } L ${points[0].x},${padding.top + chartH} Z`;

    const isIncreasing = trend.trendDirection === 'increasing';
    const isDecreasing = trend.trendDirection === 'decreasing';
    const strokeColor = isIncreasing ? '#d97706' : isDecreasing ? '#0d9488' : '#0284c7';
    const fillColor = isIncreasing ? 'rgba(217, 119, 6, 0.1)' : isDecreasing ? 'rgba(13, 148, 136, 0.1)' : 'rgba(2, 132, 199, 0.1)';

    return (
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[300px] overflow-visible"
        >
          {/* Subtle grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH / 2}
            x2={width - padding.right}
            y2={padding.top + chartH / 2}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH}
            x2={width - padding.right}
            y2={padding.top + chartH}
            stroke="#cbd5e1"
          />

          {/* Area fill */}
          <path d={areaString} fill={fillColor} />

          {/* Line stroke */}
          <path
            d={pathString}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Labels */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="6"
                fill="#ffffff"
                stroke={strokeColor}
                strokeWidth="3"
                className="drop-shadow-xs"
              />

              {/* Value Label above point */}
              <text
                x={pt.x}
                y={pt.y - 12}
                textAnchor="middle"
                className="text-[11px] font-bold fill-slate-800"
              >
                {pt.value} {pt.unit}
              </text>

              {/* Date label below axis */}
              <text
                x={pt.x}
                y={padding.top + chartH + 20}
                textAnchor="middle"
                className="text-[10px] font-semibold fill-slate-500"
              >
                {pt.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-8 py-4" id="trend-analysis-container">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600">
              <TrendingUp className="w-4 h-4" />
              <span>Biomarker Trajectory & Longitudinal Monitoring</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Health Trend Analysis
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Tracking how your markers change across multiple testing dates offers far richer clinical insight than any single snapshot in time.
            </p>
          </div>

          {/* Toggle Demo Timeline */}
          <button
            onClick={onLoadDemoTimeline}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Load 3-Period Demo Timeline</span>
          </button>
        </div>

        {/* Test Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 mr-2">Tracked Tests:</span>
          {activeTrends.map((item) => (
            <button
              key={item.testName}
              onClick={() => setSelectedTestName(item.testName)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTestName === item.testName
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {item.testName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Card */}
      {currentTrend && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{currentTrend.testName}</h3>
                <span className="text-xs text-slate-500 font-medium">({currentTrend.unit})</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard Reference Range: <strong className="text-slate-700">{currentTrend.referenceRange}</strong>
              </p>
            </div>

            {/* Trajectory Indicator */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  currentTrend.trendDirection === 'increasing'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : currentTrend.trendDirection === 'decreasing'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {currentTrend.trendDirection === 'increasing' ? (
                  <ArrowUpRight className="w-4 h-4 text-amber-600" />
                ) : currentTrend.trendDirection === 'decreasing' ? (
                  <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Minus className="w-4 h-4 text-slate-500" />
                )}
                <span>
                  {currentTrend.trendDirection === 'increasing'
                    ? `Increased (+${currentTrend.changePercent || ''}%)`
                    : currentTrend.trendDirection === 'decreasing'
                    ? `Decreased (${currentTrend.changePercent || ''}%)`
                    : 'Stable Trend'}
                </span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="p-4 sm:p-6 bg-slate-50/70 rounded-2xl border border-slate-100">
            {renderLineChart(currentTrend)}
          </div>

          {/* Historical Data Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recorded Timeline Points
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentTrend.history.map((record, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold">{record.date}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                        record.status === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : record.status === 'Low'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {record.value} <span className="text-xs font-normal text-slate-500">{record.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discussion prompt */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() =>
                onAskAi(
                  `Can you explain the trend in my ${currentTrend.testName}, which has ${
                    currentTrend.trendDirection === 'increasing'
                      ? 'increased'
                      : currentTrend.trendDirection === 'decreasing'
                      ? 'decreased'
                      : 'remained steady'
                  } over time?`
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Ask AI why this trend matters</span>
            </button>
          </div>
        </div>
      )}

      {/* Insufficient data state note */}
      {!hasHistoricalData && (
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-slate-600 text-xs sm:text-sm flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-800">Tracking Future Reports:</p>
            <p>
              "Upload another report later to view your personal health trends." When you return with your next checkup results, LabWise AI compares identical parameters to highlight clinical improvements or areas needing attention.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
