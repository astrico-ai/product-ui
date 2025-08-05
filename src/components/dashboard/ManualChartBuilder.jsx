import { useState, useEffect } from "react";
import { ChevronLeft, BarChart, LineChart, PieChart, Table, Brush, X as LucideX, ChevronDown, Plus, BarChart2, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalculatedFieldModal from "./CalculatedFieldModal";
import TitleEditModal from "./TitleEditModal";
import CompactDropZone from "./CompactDropZone";
import ReactECharts from 'echarts-for-react';

export default function ManualChartBuilder({ onClose, onSave }) {
  const [selectedDataset, setSelectedDataset] = useState("salesforce");
  const [chartTitle, setChartTitle] = useState("Untitled Chart");
  const [selectedFields, setSelectedFields] = useState({
    xAxis: "",
    yAxis: [], // Changed to array for multi-select
    groupBy: "",
    chartType: "bar"
  });
  const [filters, setFilters] = useState([]);
  const [calculatedFields, setCalculatedFields] = useState([]);
  const [isCalculatedFieldModalOpen, setIsCalculatedFieldModalOpen] = useState(false);
  const [isTitleEditModalOpen, setIsTitleEditModalOpen] = useState(false);
  const [formatting, setFormatting] = useState({
    valueFormat: 'auto',
    decimalPrecision: 2,
    xAxisLabel: '',
    yAxisLabel: '',
    legendPosition: 'bottom',
    showGridlines: true
  });
  const [customColors, setCustomColors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [openPanel, setOpenPanel] = useState(null); // 'chartType' | 'formatting' | null
  const [expandedSettings, setExpandedSettings] = useState({
    general: true,
    axes: true,
    legend: true,
    xAxis: true,
    yAxes: {} // Store expanded state for each y-axis measure
  });
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'table'

  const toggleSection = (section, subSection) => {
    if (subSection) {
      setExpandedSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subSection]: !prev[section]?.[subSection]
        }
      }));
    } else {
      setExpandedSettings(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    }
  };

  // Add new state for axis-specific settings
  const [axisSettings, setAxisSettings] = useState({});

  // Add new state for field settings
  const [fieldSettings, setFieldSettings] = useState({});

  // Add handler for field updates
  const handleFieldUpdate = (fieldId, updates) => {
    setFieldSettings(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        ...updates
      }
    }));
  };

  // Initialize axis settings when fields change
  useEffect(() => {
    const newSettings = {};
    
    // X-axis settings
    if (selectedFields.xAxis) {
      const field = allFields.find(f => f.id === selectedFields.xAxis);
      if (field) {
        newSettings[selectedFields.xAxis] = {
          name: field.name,
          showLabels: true,
          color: professionalColors[0],
          unit: 'Auto'
        };
      }
    }

    // Y-axis settings
    selectedFields.yAxis.forEach((fieldId, index) => {
      const field = allFields.find(f => f.id === fieldId);
      if (field) {
        newSettings[fieldId] = {
          name: field.name,
          showLabels: true,
          color: professionalColors[index + 1],
          unit: 'Auto'
        };
      }
    });

    setAxisSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, [selectedFields.xAxis, selectedFields.yAxis]);

  // Update axis setting
  const updateAxisSetting = (fieldId, key, value) => {
    setAxisSettings(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        [key]: value
      }
    }));
  };

  // Settings panel content
  const renderSettingsPanel = () => {
    return (
      <div className="w-[320px] bg-white border-l border-gray-100 flex flex-col h-full" data-panel="format">
        {/* Header with Settings title and close button */}
        <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-[16px] font-medium text-gray-900">Settings</h3>
          <button
            onClick={() => setOpenPanel(null)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-150"
          >
            <LucideX className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Settings Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* General Section */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('general')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="text-[14px] font-medium text-gray-900">General</span>
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedSettings.general ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSettings.general && (
              <div className="px-4 py-3 space-y-4 bg-gray-50">
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-1">Chart Title</label>
                  <input
                    type="text"
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    className="w-full px-3 py-2 text-[14px] bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter chart title"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showGridlines"
                    checked={formatting.showGridlines}
                    onChange={(e) => setFormatting(prev => ({ ...prev, showGridlines: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showGridlines" className="text-[14px] text-gray-700">Show Gridlines</label>
                </div>
              </div>
            )}
          </div>

          {/* Axes Section */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('axes')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-gray-900">Axes</span>
                <span className="text-[12px] text-gray-500">({selectedFields.yAxis.length} measures)</span>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedSettings.axes ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSettings.axes && (
              <div className="px-4 py-3 space-y-4 bg-gray-50">
                {/* X-axis */}
                {selectedFields.xAxis && axisSettings[selectedFields.xAxis] && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[14px] font-medium text-gray-700">X-axis</span>
                      <button
                        onClick={() => toggleSection('xAxis')}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSettings.xAxis ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {expandedSettings.xAxis && (
                      <div className="pl-3 pt-2 space-y-3">
                        <div>
                          <label className="block text-[14px] text-gray-600 mb-1">Label</label>
                          <input
                            type="text"
                            value={formatting.xAxisLabel}
                            onChange={(e) => setFormatting(prev => ({ ...prev, xAxisLabel: e.target.value }))}
                            className="w-full px-3 py-1.5 text-[14px] bg-white border border-gray-300 rounded-md"
                            placeholder="Enter axis label"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="xAxisLabels"
                            checked={axisSettings[selectedFields.xAxis].showLabels}
                            onChange={(e) => updateAxisSetting(selectedFields.xAxis, 'showLabels', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <label htmlFor="xAxisLabels" className="text-[14px] text-gray-700">Show Labels</label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Y-axes */}
                <div className="space-y-3">
                  <span className="block text-[14px] font-medium text-gray-700">Y-axis</span>
                  {selectedFields.yAxis.map((fieldId, index) => {
                    const settings = axisSettings[fieldId];
                    if (!settings) return null;

                    return (
                      <div key={fieldId} className="border border-gray-200 rounded-md overflow-hidden">
                        <button
                          onClick={() => toggleSection('yAxes', fieldId)}
                          className="w-full px-3 py-2 flex items-center justify-between bg-white hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: settings.color }}></div>
                            <span className="text-[14px] font-medium">{settings.name}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedSettings.yAxes[fieldId] ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSettings.yAxes[fieldId] && (
                          <div className="px-3 py-2 space-y-3 bg-white border-t border-gray-200">
                            <div>
                              <label className="block text-[14px] text-gray-600 mb-1">Label</label>
                              <input
                                type="text"
                                value={settings.name}
                                onChange={(e) => updateAxisSetting(fieldId, 'name', e.target.value)}
                                className="w-full px-3 py-1.5 text-[14px] bg-white border border-gray-300 rounded-md"
                                placeholder="Enter label"
                              />
                            </div>
                            <div>
                              <label className="block text-[14px] text-gray-600 mb-1">Color</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={settings.color}
                                  onChange={(e) => updateAxisSetting(fieldId, 'color', e.target.value)}
                                  className="w-8 h-8 p-0 border border-gray-300 rounded"
                                />
                                <input
                                  type="text"
                                  value={settings.color}
                                  onChange={(e) => updateAxisSetting(fieldId, 'color', e.target.value)}
                                  className="flex-1 px-3 py-1.5 text-[14px] bg-white border border-gray-300 rounded-md"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[14px] text-gray-600 mb-1">Unit</label>
                              <select
                                value={settings.unit}
                                onChange={(e) => updateAxisSetting(fieldId, 'unit', e.target.value)}
                                className="w-full px-3 py-1.5 text-[14px] bg-white border border-gray-300 rounded-md"
                              >
                                <option value="Auto">Auto</option>
                                <option value="None">None</option>
                                <option value="Thousand (K)">Thousand (K)</option>
                                <option value="Million (M)">Million (M)</option>
                                <option value="Billion (B)">Billion (B)</option>
                                <option value="Trillion (T)">Trillion (T)</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`showLabels-${fieldId}`}
                                  checked={settings.showLabels}
                                  onChange={(e) => updateAxisSetting(fieldId, 'showLabels', e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300"
                                />
                                <label htmlFor={`showLabels-${fieldId}`} className="text-[14px] text-gray-700">Show Labels</label>
                              </div>
                              <button
                                onClick={() => handleRemoveMeasure(fieldId)}
                                className="text-red-600 hover:text-red-700 text-[14px] font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Legend Section */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('legend')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="text-[14px] font-medium text-gray-900">Legend</span>
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedSettings.legend ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSettings.legend && (
              <div className="px-4 py-3 space-y-4 bg-gray-50">
                <div>
                  <label className="block text-[14px] text-gray-600 mb-1">Position</label>
                  <select
                    value={formatting.legendPosition}
                    onChange={(e) => setFormatting(prev => ({ ...prev, legendPosition: e.target.value }))}
                    className="w-full px-3 py-1.5 text-[14px] bg-white border border-gray-300 rounded-md"
                  >
                    <option value="top">Top</option>
                    <option value="right">Right</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const datasets = {
    salesforce: {
      name: "Salesforce",
      icon: "🏢",
      dimensions: [
        { id: "lead_source", name: "Lead Source", type: "text" },
        { id: "region", name: "Region", type: "text" },
        { id: "industry", name: "Industry", type: "text" },
        { id: "created_date", name: "Created Date", type: "date" },
        { id: "stage", name: "Stage", type: "text" },
        { id: "is_qualified", name: "Is Qualified", type: "boolean" }
      ],
      metrics: [
        { id: "lead_count", name: "Lead Count", type: "number" },
        { id: "conversion_rate", name: "Conversion Rate", type: "percentage" },
        { id: "deal_value", name: "Deal Value", type: "currency" },
        { id: "pipeline_value", name: "Pipeline Value", type: "currency" }
      ]
    },
    googleads: {
      name: "Google Ads",
      icon: "📊",
      dimensions: [
        { id: "campaign_name", name: "Campaign Name", type: "text" },
        { id: "ad_group", name: "Ad Group", type: "text" },
        { id: "device", name: "Device", type: "text" },
        { id: "date", name: "Date", type: "date" },
        { id: "keyword", name: "Keyword", type: "text" },
        { id: "is_mobile", name: "Is Mobile", type: "boolean" }
      ],
      metrics: [
        { id: "impressions", name: "Impressions", type: "number" },
        { id: "clicks", name: "Clicks", type: "number" },
        { id: "ctr", name: "Click-through Rate", type: "percentage" },
        { id: "cost", name: "Cost", type: "currency" },
        { id: "cpc", name: "Cost per Click", type: "currency" }
      ]
    }
  };

  const chartTypes = [
    { value: "column", label: "Column", color: "text-blue-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h4v8H3v-8zm7-6h4v14h-4V7zm7-4h4v18h-4V3z"/>
      </svg>
    )},
    { value: "stacked-column", label: "Stacked Column", color: "text-green-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h4v8H3v-8zm7-6h4v14h-4V7zm7-4h4v18h-4V3z"/>
      </svg>
    )},
    { value: "line", label: "Line", color: "text-indigo-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l5-5 5 5 8-8"/></svg>
    )},
    { value: "kpi", label: "KPI", color: "text-blue-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 19h16v2H4zm13-6h3v5h-3zm-5 0h3v5h-3zm-5 0h3v5H7z"/></svg>
    )},
    { value: "pivot", label: "Pivot Table", color: "text-purple-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4z"/></svg>
    )},
    { value: "donut", label: "Donut", color: "text-cyan-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
    )},
    { value: "bar", label: "Bar", color: "text-emerald-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h8v4h-8zm0 8h8v4h-8zM0 6h8v4H0zm0 8h8v4H0zm9-8h6v4H9zm0 8h6v4H9z"/></svg>
    )},
    { value: "stacked-bar", label: "Stacked Bar", color: "text-blue-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h8v4h-8zm0 8h8v4h-8zM0 6h8v4H0zm0 8h8v4H0zm9-8h6v4H9zm0 8h6v4H9z"/></svg>
    )},
    { value: "area", label: "Area", color: "text-teal-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13l5-5 5 5L21 5v14H3z"/></svg>
    )},
    { value: "stacked-area", label: "Stacked Area", color: "text-cyan-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13l5-5 5 5L21 5v14H3z"/></svg>
    )},
    { value: "scatter", label: "Scatter", color: "text-yellow-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="14" r="3"/><circle cx="11" cy="6" r="3"/><circle cx="16" cy="17" r="3"/></svg>
    )},
    { value: "bubble", label: "Bubble", color: "text-purple-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
    )},
    { value: "waterfall", label: "Waterfall", color: "text-indigo-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h2v-2H2v2zm2-6H2v2h2v-2zM2 8h2V6H2v2zm4 12h2v-2H6v2zm0-6h2v-2H6v2zm0-6h2V6H6v2zm4 12h2v-2h-2v2zm0-6h2v-2h-2v2zm0-6h2V6h-2v2zm4 12h2v-2h-2v2zm0-6h2v-2h-2v2zm0-6h2V6h-2v2zm4 12h2v-2h-2v2zm0-6h2v-2h-2v2zm0-6h2V6h-2v2z"/></svg>
    )},
    { value: "heatmap", label: "Heatmap", color: "text-emerald-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm12 0h6v6h-6z"/></svg>
    )},
    { value: "treemap", label: "Treemap", color: "text-blue-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3z"/><path d="M15 3v8h6V3h-6zM3 19h6v-8H3v8z" fill="white"/></svg>
    )},
    { value: "funnel", label: "Funnel", color: "text-indigo-500", icon: props => (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8l10 6 10-6-10-6zM2 15l10 6 10-6"/></svg>
    )}
  ];

  // Get all fields for the current dataset
  const currentDataset = datasets[selectedDataset];
  const allFields = [...currentDataset.dimensions, ...currentDataset.metrics, ...calculatedFields];

  // Filter fields based on search query
  const filteredFields = allFields.filter(field => 
    field.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to get field type by id
  const getFieldTypeById = (fieldId) => {
    const field = allFields.find(f => f.id === fieldId);
    return field ? field.type : 'dimension';
  };

  // Get field data for CompactDropZone
  const getFieldData = (fieldId) => {
    return allFields.find(f => f.id === fieldId);
  };

  // New: Checkbox list for dimensions and measures
  const handleDimensionCheck = (fieldId, checked) => {
    if (checked) {
      // If X-Axis is empty, assign to X-Axis, else to Filters
      if (!selectedFields.xAxis) {
        setSelectedFields(prev => ({ ...prev, xAxis: fieldId }));
      } else {
        setFilters(prev => {
          if (!prev.some(f => f.field === fieldId)) {
            return [...prev, { field: fieldId, operator: 'equals', value: '' }];
          }
          return prev;
        });
      }
    } else {
      // Remove from X-Axis or Filters
      if (selectedFields.xAxis === fieldId) {
        // If there are filters, promote the first filter to X-Axis
        if (filters.length > 0) {
          const [first, ...rest] = filters;
          setSelectedFields(prev => ({ ...prev, xAxis: first.field }));
          setFilters(rest);
        } else {
          setSelectedFields(prev => ({ ...prev, xAxis: '' }));
        }
      } else {
        setFilters(prev => prev.filter(f => f.field !== fieldId));
      }
    }
  };

  const handleMeasureCheck = (fieldId, checked) => {
    if (checked) {
      setSelectedFields(prev => ({
        ...prev,
        yAxis: prev.yAxis.includes(fieldId) ? prev.yAxis : [...prev.yAxis, fieldId]
      }));
    } else {
      setSelectedFields(prev => ({
        ...prev,
        yAxis: prev.yAxis.filter(id => id !== fieldId)
      }));
    }
  };

  const addFilter = () => {
    setFilters(prev => [...prev, { field: "", operator: "equals", value: "" }]);
  };

  const updateFilter = (index, key, value) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, [key]: value } : filter
    ));
  };

  const removeFilter = (index) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateCalculatedField = (fieldData) => {
    const newField = {
      id: `calc_${Date.now()}`,
      name: fieldData.name,
      formula: fieldData.formula,
      type: "calculated",
      isCalculated: true
    };
    setCalculatedFields(prev => [...prev, newField]);
    setIsCalculatedFieldModalOpen(false);
  };

  const handleSave = () => {
    const chartData = {
      type: selectedFields.chartType,
      title: chartTitle || "Untitled Chart",
      config: {
        dataset: selectedDataset,
        xAxis: selectedFields.xAxis,
        yAxis: selectedFields.yAxis,
        groupBy: selectedFields.groupBy,
        filters: filters
      }
    };
    onSave(chartData);
    onClose();
  };

  // Helper to determine which zone a field is in
  const getFieldZone = (fieldId) => {
    if (selectedFields.xAxis === fieldId) return 'xAxis';
    if (selectedFields.yAxis.includes(fieldId)) return 'yAxis';
    if (filters.some(f => f.field === fieldId)) return 'filters';
    return null;
  };

  // Handler for dropping a field into a zone
  const handleDropFieldToZone = (fieldId, fromZone, toZone) => {
    if (fromZone === toZone) return;
    // Remove from previous zone
    if (fromZone === 'xAxis') {
      setSelectedFields(prev => ({ ...prev, xAxis: '' }));
    } else if (fromZone === 'yAxis') {
      setSelectedFields(prev => ({ ...prev, yAxis: prev.yAxis.filter(id => id !== fieldId) }));
    } else if (fromZone === 'filters') {
      setFilters(prev => prev.filter(f => f.field !== fieldId));
    }
    // Add to new zone
    if (toZone === 'xAxis') {
      setSelectedFields(prev => ({ ...prev, xAxis: fieldId }));
    } else if (toZone === 'yAxis') {
      setSelectedFields(prev => ({
        ...prev,
        yAxis: prev.yAxis.includes(fieldId) ? prev.yAxis : [...prev.yAxis, fieldId]
      }));
    } else if (toZone === 'filters') {
      setFilters(prev => {
        if (!prev.some(f => f.field === fieldId)) {
          return [...prev, { field: fieldId, operator: 'equals', value: '' }];
        }
        return prev;
      });
    }
  };

  // Handler for field selection (toggle)
  const handleFieldSelect = (fieldId, zone) => {
    if (zone === 'yAxis') {
      setSelectedFields(prev => ({
        ...prev,
        yAxis: prev.yAxis.includes(fieldId) 
          ? prev.yAxis.filter(id => id !== fieldId)
          : [...prev.yAxis, fieldId]
      }));
    }
  };

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside the formatting panel or chart type panel
      const isFormatPanel = event.target.closest('[data-panel="format"]');
      const isChartPanel = event.target.closest('[data-panel="chart"]');
      const isOptionButton = event.target.closest('.chart-options-button');

      if (openPanel && !isFormatPanel && !isChartPanel && !isOptionButton) {
        setOpenPanel(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openPanel]);

  // Chart type support for multiple metrics
  const supportsMultipleMetrics = (chartType) => {
    return ['bar', 'line', 'table'].includes(chartType);
  };

  // New, more professional color palette
  const professionalColors = [
    '#4C6EF5', '#228BE6', '#15AABF', '#12B886', '#40C057', '#82C91E',
    '#FAB005', '#FD7E14', '#FF6B6B', '#F06595', '#CC5DE8', '#845EF7',
  ];

  // Get legend categories based on current chart configuration
  const getLegendCategories = () => {
    const categories = [];
    
    if (selectedFields.chartType === 'pie') {
      // For pie charts, categories are based on X-axis field values
      if (selectedFields.xAxis) {
        const field = allFields.find(f => f.id === selectedFields.xAxis);
        if (field) {
          switch (field.id) {
            case 'lead_source':
              categories.push('Organic Search', 'Paid Search', 'Social Media', 'Email', 'Direct');
              break;
            case 'region':
              categories.push('North America', 'Europe', 'Asia Pacific', 'Latin America');
              break;
            case 'industry':
              categories.push('Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail');
              break;
            case 'stage':
              categories.push('Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won');
              break;
            case 'campaign_name':
              categories.push('Summer Sale', 'Black Friday', 'Product Launch', 'Brand Awareness');
              break;
            case 'device':
              categories.push('Desktop', 'Mobile', 'Tablet');
              break;
            default:
              categories.push('Category A', 'Category B', 'Category C', 'Category D');
          }
        }
      }
    } else {
      // For other charts, categories are the measure names
      selectedFields.yAxis.forEach(fieldId => {
        const field = allFields.find(f => f.id === fieldId);
        if (field) {
          categories.push(field.name);
        }
      });
    }
    
    return categories;
  };

  // Get color for a category (custom or default)
  const getCategoryColor = (category, index) => {
    return customColors[category] || professionalColors[index % professionalColors.length];
  };

  // Update custom color for a category
  const updateCategoryColor = (category, color) => {
    setCustomColors(prev => ({
      ...prev,
      [category]: color
    }));
  };

  // Format value based on axis settings
  const formatValue = (value, settings) => {
    if (!settings || typeof value !== 'number' || isNaN(value)) return value;
    
    const unit = settings.unit || 'Auto';
    
    // Return raw number if unit is None
    if (unit === 'None') return value.toString();
    
    // Auto detection if unit is Auto
    if (unit === 'Auto') {
      if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
      if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
      if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
      if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
      return value.toString();
    }
    
    // Apply specific unit
    switch (unit) {
      case 'Thousand (K)':
        return `${(value / 1e3).toFixed(2)}K`;
      case 'Million (M)':
        return `${(value / 1e6).toFixed(2)}M`;
      case 'Billion (B)':
        return `${(value / 1e9).toFixed(2)}B`;
      case 'Trillion (T)':
        return `${(value / 1e12).toFixed(2)}T`;
      default:
        return value.toString();
    }
  };

  // Mock data generation function
  const generateMockData = () => {
    const categories = [];
    const seriesData = [];
    
    // Generate mock data based on selected fields
    if (selectedFields.xAxis) {
      const field = allFields.find(f => f.id === selectedFields.xAxis);
      if (field) {
        switch (field.id) {
          case 'lead_source':
            categories.push('Organic', 'Paid', 'Social', 'Email', 'Direct');
            break;
          case 'region':
            categories.push('North', 'South', 'East', 'West', 'Central');
            break;
          case 'industry':
            categories.push('Tech', 'Healthcare', 'Finance', 'Retail', 'Others');
            break;
          case 'campaign_name':
            categories.push('Campaign A', 'Campaign B', 'Campaign C', 'Campaign D', 'Campaign E');
            break;
          default:
            categories.push('Cat 1', 'Cat 2', 'Cat 3', 'Cat 4', 'Cat 5');
        }
      }
    }

    // Generate random data for each selected measure
    selectedFields.yAxis.forEach((measureId, index) => {
      const measure = allFields.find(f => f.id === measureId);
      if (measure) {
        const data = categories.map(() => {
          switch (measure.type) {
            case 'percentage':
              return Math.round(Math.random() * 100);
            case 'currency':
              return Math.round(Math.random() * 10000);
            default:
              return Math.round(Math.random() * 1000);
          }
        });
        seriesData.push({
          name: measure.name,
          type: selectedFields.chartType === 'line' ? 'line' : 'bar',
          data,
          itemStyle: {
            color: professionalColors[index]
          }
        });
      }
    });

    return { categories, seriesData };
  };

  // Chart rendering function
  const renderChart = () => {
    if (!selectedFields.xAxis || selectedFields.yAxis.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
              <BarChart className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Your Chart</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Drag fields from the left panel to the configuration areas<br/>below to start building your visualization.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const { categories, seriesData } = generateMockData();
    
    // Map the series data to include settings-based formatting
    const coloredSeriesData = seriesData.map((series) => {
      const settings = axisSettings[series.id];
      if (!settings) return series;

      return {
        ...series,
        itemStyle: {
          color: settings.color
        },
        label: {
          show: settings.showLabels,
          formatter: (params) => formatValue(params.value, settings)
        },
        // Add line style for line charts
        ...(series.type === 'line' && {
          lineStyle: {
            color: settings.color
          },
          symbolStyle: {
            color: settings.color
          }
        })
      };
    });

    const option = {
      title: {
        show: false
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params) => {
          const xValue = params[0].axisValue;
          const items = params.map(param => {
            const settings = axisSettings[param.seriesId];
            const value = formatValue(param.value, settings);
            return `${param.marker} ${param.seriesName}: ${value}`;
          });
          return `${xValue}<br/>${items.join('<br/>')}`;
        }
      },
      legend: {
        bottom: formatting.legendPosition === 'bottom' ? '10%' : 'auto',
        top: formatting.legendPosition === 'top' ? '10%' : 'auto',
        left: formatting.legendPosition === 'left' ? '10%' : 'auto',
        right: formatting.legendPosition === 'right' ? '10%' : 'auto',
        orient: ['left', 'right'].includes(formatting.legendPosition) ? 'vertical' : 'horizontal',
        padding: [15, 0]
      },
      grid: {
        left: ['left', 'right'].includes(formatting.legendPosition) ? '15%' : '5%',
        right: ['left', 'right'].includes(formatting.legendPosition) ? '5%' : '5%',
        bottom: formatting.legendPosition === 'bottom' ? '20%' : '15%',
        top: formatting.legendPosition === 'top' ? '20%' : '10%',
        containLabel: true,
        show: formatting.showGridlines
      },
      xAxis: {
        type: 'category',
        data: categories,
        name: formatting.xAxisLabel || '',
        nameLocation: 'middle',
        nameGap: 35,
        axisLabel: {
          show: axisSettings[selectedFields.xAxis]?.showLabels ?? true,
          interval: 0,
          rotate: categories.length > 5 ? 30 : 0
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: formatting.yAxisLabel || '',
        nameLocation: 'middle',
        nameGap: 50,
        nameRotate: 90,
        axisLabel: {
          formatter: (value) => {
            // Use the first Y-axis measure's format as default
            const firstMeasure = selectedFields.yAxis[0];
            const settings = axisSettings[firstMeasure];
            return formatValue(value, settings);
          }
        },
        splitLine: {
          show: formatting.showGridlines,
          lineStyle: {
            type: 'dashed',
            color: '#E5E7EB'
          }
        }
      },
      series: coloredSeriesData
    };

    return (
      <div className="h-full w-full p-4">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
          notMerge={true}
        />
      </div>
    );
  };

  // Add table view rendering function
  const renderTableView = () => {
    if (!selectedFields.xAxis || selectedFields.yAxis.length === 0) {
      return renderChart(); // Show the empty state
    }

    const { categories, seriesData } = generateMockData();
    
    return (
      <div className="h-full w-full p-4 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border border-gray-200 font-medium text-gray-700">
                {getFieldData(selectedFields.xAxis)?.name || 'Category'}
              </th>
              {selectedFields.yAxis.map((fieldId) => (
                <th key={fieldId} className="text-left p-3 border border-gray-200 font-medium text-gray-700">
                  {getFieldData(fieldId)?.name || 'Value'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category, idx) => (
              <tr key={category} className="hover:bg-gray-50">
                <td className="p-3 border border-gray-200">{category}</td>
                {seriesData.map((series) => (
                  <td key={series.name} className="p-3 border border-gray-200">
                    {formatValue(series.data[idx], axisSettings[series.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Add the missing function
  const handleRemoveMeasure = (fieldId) => {
    setSelectedFields(prev => ({
      ...prev,
      yAxis: prev.yAxis.filter(id => id !== fieldId)
    }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Chart Builder</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-[14px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!chartTitle || !selectedFields.xAxis || !selectedFields.yAxis || selectedFields.yAxis.length === 0}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Left Panel - Data Fields */}
        <div className="w-56 bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm">
          {/* Data Source Header */}
          <div className="p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-semibold text-gray-900 uppercase tracking-wide">Data Source</h2>
              <button
                onClick={() => setIsCalculatedFieldModalOpen(true)}
                className="flex items-center gap-1 px-1.5 py-1 text-[14px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-all duration-200"
              >
                <Plus className="w-3 h-3" />
                New
              </button>
            </div>
            
            {/* Dataset Selector */}
            <div className="mb-2">
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full px-2 py-1.5 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {Object.entries(datasets).map(([key, dataset]) => (
                  <option key={key} value={key}>
                    {dataset.icon} {dataset.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Search Fields */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1.5 pl-7 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              <div className="absolute left-2 top-2 text-gray-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Fields List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-3">
              {/* Dimensions */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <h3 className="text-xs font-semibold text-gray-700">Dimensions</h3>
                </div>
                <div className="space-y-1">
                  {currentDataset.dimensions
                    .filter(field => field.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((field) => (
                      <label key={field.id} className="flex items-center gap-2 cursor-pointer text-xs px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedFields.xAxis === field.id || filters.some(f => f.field === field.id)}
                          onChange={e => handleDimensionCheck(field.id, e.target.checked)}
                        />
                        <span className="bg-[#DEE8FA] text-black px-2 py-0.5 rounded-full border border-blue-100 font-medium">
                          {field.name}
                        </span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Measures */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <h3 className="text-xs font-semibold text-gray-700">Measures</h3>
                </div>
                <div className="space-y-1">
                  {currentDataset.metrics
                    .filter(field => field.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((field) => (
                      <label key={field.id} className="flex items-center gap-2 cursor-pointer text-xs px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedFields.yAxis.includes(field.id)}
                          onChange={e => handleMeasureCheck(field.id, e.target.checked)}
                        />
                        <span className="bg-[#E0F8EF] text-black px-2 py-0.5 rounded-full border border-green-100 font-medium">
                          {field.name}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Configuration Area */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4">
            <div className="p-4 space-y-4">
              {/* X-Axis */}
              <CompactDropZone
                title="X-Axis"
                fields={selectedFields.xAxis ? [selectedFields.xAxis] : []}
                onDrop={(fieldId) => setSelectedFields(prev => ({ ...prev, xAxis: fieldId }))}
                onRemove={() => setSelectedFields(prev => ({ ...prev, xAxis: "" }))}
                acceptTypes={['dimension']}
                maxFields={1}
                emptyMessage="Drop a dimension here"
                zoneName="xAxis"
                getFieldZone={getFieldZone}
                onDropField={handleDropFieldToZone}
                pillBgColor="#DEE8FA"
                allFields={allFields}
                getFieldData={getFieldData}
                onUpdateField={handleFieldUpdate}
              />

              {/* Y-Axis */}
              <CompactDropZone
                title="Y-Axis"
                fields={selectedFields.yAxis}
                onDrop={(fieldId) => handleFieldSelect(fieldId, 'yAxis')}
                onRemove={(fieldId) => handleFieldSelect(fieldId, 'yAxis')}
                acceptTypes={['measure']}
                maxFields={selectedFields.chartType === 'pie' ? 1 : 5}
                emptyMessage="Drop measures here"
                zoneName="yAxis"
                getFieldZone={getFieldZone}
                onDropField={handleDropFieldToZone}
                pillBgColor="#E0F8EF"
                allFields={allFields}
                getFieldData={getFieldData}
                onUpdateField={handleFieldUpdate}
              />

              {/* Filters */}
              <CompactDropZone
                title="Filters"
                fields={filters.map(f => f.field)}
                onDrop={(fieldId) => setFilters(prev => [...prev, { field: fieldId, operator: 'equals', value: '' }])}
                onRemove={(fieldId) => setFilters(prev => prev.filter(f => f.field !== fieldId))}
                acceptTypes={['dimension', 'measure']}
                maxFields={10}
                emptyMessage="Drop fields to filter"
                zoneName="filters"
                getFieldZone={getFieldZone}
                onDropField={handleDropFieldToZone}
                pillBgColor="#DEE8FA"
                allFields={allFields}
                getFieldData={getFieldData}
                onUpdateField={handleFieldUpdate}
              />
            </div>
          </div>

                    {/* Chart Area */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex min-h-0">
            {/* Chart Content */}
            <div className="flex-1 flex flex-col">
              {selectedFields.xAxis || selectedFields.yAxis.length > 0 ? (
                <>
                  <div className="px-6 pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setIsTitleEditModalOpen(true)}
                      className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-gray-900 rounded transition-all duration-200 group"
                    >
                      <h2 className="text-[16px] font-medium">{chartTitle}</h2>
                      <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* View Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('chart')}
                        className={`p-1.5 rounded-md transition-colors ${
                          viewMode === 'chart'
                            ? 'bg-[#3551F3] text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <BarChart2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-1.5 rounded-md transition-colors ${
                          viewMode === 'table'
                            ? 'bg-[#3551F3] text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <TableIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {viewMode === 'chart' ? renderChart() : renderTableView()}
                </>
              ) : (
                renderChart()
              )}
            </div>

            {/* Chart Type Panel */}
            {openPanel === 'chartType' && (
              <div className="w-[320px] bg-white border-l border-gray-100 flex flex-col h-full" data-panel="chart">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="text-[16px] font-medium text-gray-900">Chart Types</h3>
                  <button
                    onClick={() => setOpenPanel(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                  >
                    <LucideX className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <h4 className="text-[14px] font-medium text-gray-900 mb-3">Library</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {chartTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setSelectedFields(prev => ({ ...prev, chartType: type.value }));
                          setOpenPanel(null);
                        }}
                        className="flex flex-col items-center p-3 gap-2 rounded hover:bg-gray-50"
                      >
                        <div className={`w-8 h-8 ${type.color}`}>
                          <type.icon />
                        </div>
                        <span className="text-[14px] text-gray-600">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Panel */}
            {openPanel === 'formatting' && renderSettingsPanel()}

            {/* Chart Options Sidebar */}
            <div className="w-12 bg-white border-l border-gray-100 flex flex-col items-center py-3 gap-2">
              <button
                onClick={() => setOpenPanel(openPanel === 'chartType' ? null : 'chartType')}
                className={`chart-options-button w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  openPanel === 'chartType' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-blue-600 hover:text-white'
                }`}
                title="Chart Types"
              >
                <BarChart className="w-5 h-5" />
              </button>
              <button
                onClick={() => setOpenPanel(openPanel === 'formatting' ? null : 'formatting')}
                className={`chart-options-button w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  openPanel === 'formatting' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-blue-600 hover:text-white'
                }`}
                title="Settings"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CalculatedFieldModal
      isOpen={isCalculatedFieldModalOpen}
      onClose={() => setIsCalculatedFieldModalOpen(false)}
      onSubmit={handleCreateCalculatedField}
      availableFields={allFields}
      dataset={currentDataset}
    />
    
    <TitleEditModal
      isOpen={isTitleEditModalOpen}
      onClose={() => setIsTitleEditModalOpen(false)}
      title={chartTitle}
      onSave={setChartTitle}
    />
  </div>
);
}