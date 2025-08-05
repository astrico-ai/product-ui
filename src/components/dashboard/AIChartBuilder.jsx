import { useState, useRef } from "react";
import { X, ArrowRight, ChevronDown, ThumbsUp, ThumbsDown, BarChart, LineChart, PieChart, Table } from "lucide-react";
import React from "react";

export default function AIChartBuilder({ onClose, onEditManually, onAddToDashboard }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const [showChartTypeMenu, setShowChartTypeMenu] = useState(false);
  const inputRef = useRef(null);

  const examplePrompts = [
    "Show sales by region for last quarter",
    "Compare leads across campaigns",
    "Trend of cost per click over time"
  ];

  const chartTypes = [
    { value: "bar", label: "Bar Chart", icon: BarChart },
    { value: "line", label: "Line Chart", icon: LineChart },
    { value: "pie", label: "Pie Chart", icon: PieChart },
    { value: "table", label: "Table", icon: Table }
  ];

  // Mock chart data
  const chartData = [
    { type: "Search", cpc: 2.15 },
    { type: "Display", cpc: 1.32 },
    { type: "Social", cpc: 1.98 },
    { type: "Video", cpc: 2.45 }
  ];

  const handleExample = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setLoading(true);
    setShowChart(false);
    setTimeout(() => {
      setLoading(false);
      setShowChart(true);
    }, 2000);
  };

  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    setShowChartTypeMenu(false);
  };

  const handleFeedback = (type) => {
    console.log(`User ${type === 'like' ? 'liked' : 'disliked'} chart`);
  };

  const formatValue = (value) => {
    return `₹${value.toFixed(2)}`;
  };

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <div className="w-full h-48 flex items-end gap-4 px-4 pb-4">
            {chartData.map((d) => (
              <div key={d.type} className="flex flex-col items-center flex-1">
                <div
                  className="w-8 rounded-t-lg bg-gradient-to-t from-[#3551F3] to-[#A5B4FC] shadow-sm transition-all"
                  style={{ height: `${d.cpc * 35 + 25}px` }}
                ></div>
                <span className="mt-2 text-gray-700 text-xs font-medium">{d.type}</span>
                <span className="text-xs text-gray-400">{formatValue(d.cpc)}</span>
              </div>
            ))}
          </div>
        );
      
      case "line":
        return (
          <div className="w-full h-48 flex items-center justify-center relative px-4">
            <svg width="100%" height="100%" viewBox="0 0 300 150">
              <polyline
                points="50,120 100,85 150,95 200,70 250,60"
                fill="none"
                stroke="#3551F3"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {chartData.map((d, i) => (
                <circle
                  key={d.type}
                  cx={50 + i * 50}
                  cy={120 - d.cpc * 25}
                  r="4"
                  fill="#3551F3"
                />
              ))}
            </svg>
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-500">
              {chartData.map((d) => (
                <span key={d.type}>{d.type}</span>
              ))}
            </div>
          </div>
        );
      
      case "pie":
        return (
          <div className="w-full h-48 flex items-center justify-center">
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="#3551F3" />
                <circle cx="60" cy="60" r="50" fill="#A5B4FC" strokeDasharray="78.5 314" strokeDashoffset="0" stroke="#60A5FA" strokeWidth="50" fillOpacity="0" />
                <circle cx="60" cy="60" r="50" fill="#60A5FA" strokeDasharray="47.1 314" strokeDashoffset="-78.5" stroke="#93C5FD" strokeWidth="50" fillOpacity="0" />
                <circle cx="60" cy="60" r="50" fill="#93C5FD" strokeDasharray="62.8 314" strokeDashoffset="-125.6" stroke="#DBEAFE" strokeWidth="50" fillOpacity="0" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-gray-600 font-medium">CPC Data</span>
              </div>
            </div>
          </div>
        );
      
      case "table":
        return (
          <div className="w-full h-48 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Campaign Type</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">CPC</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((d) => (
                  <tr key={d.type} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-900">{d.type}</td>
                    <td className="px-3 py-2 text-right text-gray-900">{formatValue(d.cpc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Create with AI</h2>
          <p className="text-sm text-gray-500 mt-1">Describe what you want to visualize and let AI do the rest.</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <form onSubmit={handleGenerate} className="space-y-4">
          <textarea
            ref={inputRef}
            className="w-full min-h-[60px] max-h-32 p-4 rounded-xl border border-gray-200 bg-white shadow-sm text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            placeholder="What would you like to visualize?"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          
          {/* Example Prompts */}
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((ex) => (
              <button
                type="button"
                key={ex}
                className="px-3 py-2 rounded-full bg-gray-100 hover:bg-primary/10 text-gray-700 text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                onClick={() => handleExample(ex)}
                disabled={loading}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#3551F3] hover:bg-[#2B41D9] text-white text-base font-semibold shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                Generating…
              </span>
            ) : (
              "Generate Chart"
            )}
          </button>
        </form>

        {/* Chart Preview */}
        {showChart && !loading && (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative">
              {/* Chart Type Switcher */}
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <button
                    onClick={() => setShowChartTypeMenu(!showChartTypeMenu)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-600 transition-colors"
                  >
                    {React.createElement(chartTypes.find(t => t.value === chartType)?.icon, { className: "w-3 h-3" })}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showChartTypeMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                      {chartTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleChartTypeChange(type.value)}
                          className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 ${
                            chartType === type.value ? 'bg-primary/5 text-primary' : 'text-gray-700'
                          }`}
                        >
                          {React.createElement(type.icon, { className: "w-3 h-3" })}
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4 pr-16">
                <h3 className="text-lg font-semibold text-gray-900">Cost per Click by Campaign Type</h3>
                <p className="text-gray-500 text-sm">{chartTypes.find(t => t.value === chartType)?.label} preview (mocked)</p>
              </div>
              
              {/* Chart Content */}
              {renderChart()}
              
              {/* Axes labels - only show for bar and line charts */}
              {(chartType === "bar" || chartType === "line") && (
                <div className="flex justify-between mt-2 px-4">
                  <span className="text-xs text-gray-500">Campaign Type</span>
                  <span className="text-xs text-gray-500">CPC</span>
                </div>
              )}

              {/* Feedback Buttons */}
              <div className="flex justify-start gap-3 mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleFeedback('like')}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-green-50 border border-gray-200 hover:border-green-200 text-xs font-medium text-gray-600 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleFeedback('dislike')}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-xs font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                onClick={onEditManually}
                type="button"
              >
                Edit Manually
              </button>
              <button
                className="flex-1 py-2 px-4 rounded-xl bg-[#3551F3] hover:bg-[#2B41D9] text-white font-semibold shadow-md transition-all"
                onClick={onAddToDashboard}
                type="button"
              >
                Add to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3551F3]"></span>
          </div>
        )}
      </div>
    </div>
  );
} 