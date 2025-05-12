import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, YAxis as RechartsYAxis, ComposedChart
} from 'recharts';
import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  Timer,
  BarChart as RechartsBarChart
} from 'lucide-react';
import { format, subDays, startOfToday, isWithinInterval } from 'date-fns';

const BRAND_COLORS = {
  primary: '#3551F3',
  purple: '#7C3AED',
  green: '#059669',
  red: '#DC2626',
  amber: '#D97706',
  gray: '#8884D8',
};

const FILTERS = ['Today', 'Last 7 days', 'Last 30 days', 'Custom'];

// Helper function to get comparison text based on filter
const getComparisonText = (filter) => {
  switch (filter) {
    case 'Today':
      return 'vs Yesterday';
    case 'Last 7 days':
      return 'vs Prior 7 days';
    case 'Last 30 days':
      return 'vs Prior 30 days';
    default:
      return 'vs Previous Period';
  }
};

// Generate data for different time periods
const generateDailyData = (days = 7) => {
  const today = startOfToday();
  return Array.from({ length: days }).map((_, index) => {
    const date = subDays(today, days - 1 - index);
    return {
      date,
      total: 1200 + Math.floor(Math.random() * 400),
      answered: 1000 + Math.floor(Math.random() * 300),
      unanswered: 100 + Math.floor(Math.random() * 100)
    };
  });
};

const generateWeeklyData = () => {
  const today = startOfToday();
  return Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(today, (7 - 1 - index) * 7);
    return {
      date,
      total: 8400 + Math.floor(Math.random() * 2000),
      answered: 7000 + Math.floor(Math.random() * 1500),
      unanswered: 700 + Math.floor(Math.random() * 500)
    };
  });
};

const generateMonthlyData = () => {
  const today = startOfToday();
  return Array.from({ length: 6 }).map((_, index) => {
    const date = subDays(today, (6 - 1 - index) * 30);
    return {
      date,
      total: 36000 + Math.floor(Math.random() * 8000),
      answered: 30000 + Math.floor(Math.random() * 6000),
      unanswered: 3000 + Math.floor(Math.random() * 2000)
    };
  });
};

const mockTopMetrics = [
  {
    label: 'Queries Asked',
    value: 12487,
    change: 12.5,
    trend: [10000, 11000, 11500, 12000, 12200, 12400, 12487],
    color: BRAND_COLORS.primary,
    icon: MessageSquare
  },
  {
    label: 'Queries Answered',
    value: 8249,
    change: 8.2,
    trend: [7000, 7200, 7600, 7900, 8000, 8200, 8249],
    color: BRAND_COLORS.green,
    icon: CheckCircle2
  },
  {
    label: 'Queries Unanswered',
    value: 350,
    change: -1.8,
    trend: [400, 390, 380, 370, 360, 355, 350],
    color: BRAND_COLORS.red,
    icon: XCircle
  },
  {
    label: 'Users',
    value: 2895,
    change: 15.3,
    trend: [2000, 2200, 2400, 2500, 2600, 2700, 2895],
    color: BRAND_COLORS.purple,
    icon: Users
  },
];

const messageAnalyticsData = [
  { date: new Date('2024-03-01'), total: 1250, answered: 1050, unanswered: 200 },
  { date: new Date('2024-03-02'), total: 1380, answered: 1180, unanswered: 200 },
  { date: new Date('2024-03-03'), total: 1580, answered: 1320, unanswered: 260 },
  { date: new Date('2024-03-04'), total: 1420, answered: 1220, unanswered: 200 },
  { date: new Date('2024-03-05'), total: 1290, answered: 1090, unanswered: 200 },
  { date: new Date('2024-03-06'), total: 1520, answered: 1280, unanswered: 240 },
  { date: new Date('2024-03-07'), total: 1680, answered: 1380, unanswered: 300 },
  { date: new Date('2024-03-08'), total: 1580, answered: 1280, unanswered: 300 },
  { date: new Date('2024-03-09'), total: 1420, answered: 1170, unanswered: 250 },
  { date: new Date('2024-03-10'), total: 1620, answered: 1320, unanswered: 300 },
];

const sessionFeedback = {
  liked: 1200,
  disliked: 80,
  avgSessionDuration: '5m 30s',
  avgResponseTime: '1.2s',
  avgMessagesPerSession: 14.2,
};

const usersData = [
  { date: '6 days ago', users: 200 },
  { date: '5 days ago', users: 300 },
  { date: '4 days ago', users: 400 },
  { date: '3 days ago', users: 500 },
  { date: '2 days ago', users: 600 },
  { date: 'Yesterday', users: 700 },
  { date: 'Today', users: 800 },
];

const sourcePieData = [
  { name: 'Documents', value: 65, color: '#6366F1' },
  { name: 'Website', value: 35, color: '#06B6D4' },
];

function Sparkline({ data, color }) {
  // Determine if trend is increasing by comparing first and last values
  const isIncreasing = data[data.length - 1] >= data[0];
  const trendColor = isIncreasing ? BRAND_COLORS.green : BRAND_COLORS.red;
  const gradientId = `sparkline-gradient-${trendColor.replace('#', '')}`;

  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data.map((y, x) => ({ x, y }))} margin={{ top: 8, bottom: 0, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trendColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="y"
          stroke={trendColor}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          fillOpacity={1}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function TopMetricCard({ label, value, change, trend, color, icon: Icon, selectedFilter }) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  const changeBg = isPositive ? 'bg-green-50' : 'bg-red-50';
  
  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 min-w-[220px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <span className="text-sm font-medium text-gray-500">{label}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${changeBg} ${changeColor}`}>
          {isPositive ? `+${change}%` : `${change}%`}
        </span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
        <div className="w-20 h-8 flex items-center ml-4">
          <Sparkline data={trend} color={color} />
        </div>
      </div>
    </div>
  );
}

// Message Analytics Chart Component
function MessageAnalyticsChart({ selectedFilter }) {
  const [timeFilter, setTimeFilter] = useState('daily');
  const [chartData, setChartData] = useState([]);
  const [visible, setVisible] = useState({ total: true, answered: true, unanswered: true });

  useEffect(() => {
    // Always generate last 7 days of data
    if (selectedFilter === 'Last 30 days') {
      setChartData(generateDailyData(30));
    } else {
      setChartData(generateDailyData(7));
    }
  }, [selectedFilter]);

  const getDateFormat = () => {
    switch (timeFilter) {
      case 'daily':
        return 'MMM dd';
      case 'weekly':
        return "'Week' w";
      case 'monthly':
        return 'MMM yyyy';
      default:
        return 'MMM dd';
    }
  };

  const handleLegendClick = (e) => {
    setVisible((prev) => ({ ...prev, [e.dataKey]: !prev[e.dataKey] }));
  };

  return (
    <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold text-lg text-gray-800">Message Analytics</div>
          {chartData.length > 0 && (
            <div className="text-sm text-gray-500 mt-0.5 mb-2">
              {`${format(new Date(chartData[0].date), 'MMM dd, yyyy')} - ${format(new Date(chartData[chartData.length - 1].date), 'MMM dd, yyyy')}`}
            </div>
          )}
        </div>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart
          data={chartData}
          margin={{ top: 32, right: 24, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={date => format(new Date(date), getDateFormat())}
            interval={0}
            padding={{ left: 10, right: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            domain={[0, 'dataMax']}
            padding={{ top: 10, bottom: 10 }}
          />
          <Tooltip content={<MessageAnalyticsTooltip selectedFilter={selectedFilter} timeFilter={timeFilter} />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 20, marginBottom: -10 }}
            onClick={handleLegendClick}
          />
          {visible.total && (
            <Line
              type="natural"
              dataKey="total"
              name="Total Queries"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 0, stroke: '#3b82f6', fill: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: '#3b82f6', fill: '#fff', strokeWidth: 2 }}
            />
          )}
          {visible.answered && (
            <Line
              type="natural"
              dataKey="answered"
              name="Answered"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 0, stroke: '#10b981', fill: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: '#10b981', fill: '#fff', strokeWidth: 2 }}
            />
          )}
          {visible.unanswered && (
            <Line
              type="natural"
              dataKey="unanswered"
              name="Unanswered"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 0, stroke: '#ef4444', fill: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: '#ef4444', fill: '#fff', strokeWidth: 2 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Update the tooltip component to handle different time periods
function MessageAnalyticsTooltip({ active, payload, label, selectedFilter, timeFilter }) {
  if (!active || !payload || !payload.length) return null;
  
  const colors = {
    total: '#3b82f6',
    answered: '#10b981',
    unanswered: '#ef4444',
  };

  const getTooltipDateFormat = () => {
    switch (timeFilter) {
      case 'daily':
        return 'MMM dd, yyyy';
      case 'weekly':
        return "'Week' w, yyyy";
      case 'monthly':
        return 'MMMM yyyy';
      default:
        return 'MMM dd, yyyy';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100">
      <div className="text-sm font-semibold text-gray-700 mb-2">
        {format(new Date(label), getTooltipDateFormat())}
      </div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm py-0.5">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: colors[entry.dataKey] }}
          />
          <span style={{ color: colors[entry.dataKey] }} className="font-medium">
            {entry.value.toLocaleString()}
          </span>
          <span className="text-gray-500">
            {entry.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function SessionFeedbackCard({ data, dateRange }) {
  // Calculate percentage of liked queries
  const totalFeedback = data.liked + data.disliked;
  const percentLiked = totalFeedback > 0 ? ((data.liked / totalFeedback) * 100).toFixed(1) : '0.0';

  const metrics = [
    {
      label: 'Liked Queries',
      value: data.liked,
      icon: ThumbsUp,
      bgColor: 'bg-emerald-50',
      valueColor: 'text-emerald-600',
      iconColor: 'text-emerald-500'
    },
    {
      label: 'Percentage of Liked Queries',
      value: `${percentLiked}%`,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      valueColor: 'text-green-600',
      iconColor: 'text-green-500'
    },
    {
      label: 'Response Time',
      value: data.avgResponseTime,
      icon: Timer,
      bgColor: 'bg-blue-50',
      valueColor: 'text-blue-600',
      iconColor: 'text-blue-500'
    },
    {
      label: 'Avg. Queries per User',
      value: data.avgMessagesPerSession,
      icon: RechartsBarChart,
      bgColor: 'bg-amber-50',
      valueColor: 'text-amber-600',
      iconColor: 'text-amber-500'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow h-full p-6 flex flex-col justify-center">
      <div>
        <h3 className="font-semibold text-lg text-gray-800">Usage Summary</h3>
      </div>
      <div className="flex flex-col justify-center flex-1">
        <div className="grid grid-cols-1 gap-6">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className="flex items-center gap-4"
            >
              <div className={`${metric.bgColor} rounded-lg p-3`}>
                <metric.icon size={20} className={metric.iconColor} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">
                  {metric.label}
                </p>
                <p className={`text-xl font-semibold ${metric.valueColor} mt-1`}>
                  {metric.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper to generate user analytics data
const generateUserAnalyticsData = (type = 'daily', count = 7) => {
  const today = startOfToday();
  if (type === 'daily') {
    return Array.from({ length: count }).map((_, i) => {
      const date = subDays(today, count - 1 - i);
      return {
        date,
        users: 200 + Math.floor(Math.random() * 800),
        avgQueries: 10 + Math.random() * 10
      };
    });
  } else if (type === 'weekly') {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(today, (7 - 1 - i) * 7);
      return {
        date,
        users: 1200 + Math.floor(Math.random() * 2000),
        avgQueries: 12 + Math.random() * 8
      };
    });
  } else if (type === 'monthly') {
    return Array.from({ length: 6 }).map((_, i) => {
      const date = subDays(today, (6 - 1 - i) * 30);
      return {
        date,
        users: 5000 + Math.floor(Math.random() * 4000),
        avgQueries: 13 + Math.random() * 7
      };
    });
  }
  return [];
};

function UserAnalyticsChart({ selectedFilter }) {
  const [timeFilter, setTimeFilter] = useState('daily');
  const [chartData, setChartData] = useState([]);
  const [visible, setVisible] = useState({ users: true, avgQueries: true });

  useEffect(() => {
    let count = selectedFilter === 'Last 30 days' ? 30 : 7;
    setChartData(generateUserAnalyticsData(timeFilter, count));
  }, [timeFilter, selectedFilter]);

  const getDateFormat = () => {
    switch (timeFilter) {
      case 'daily':
        return 'MMM dd';
      case 'weekly':
        return "'Week' w";
      case 'monthly':
        return 'MMM yyyy';
      default:
        return 'MMM dd';
    }
  };

  const handleLegendClick = (e) => {
    setVisible((prev) => ({ ...prev, [e.dataKey]: !prev[e.dataKey] }));
  };

  const dateRange = chartData.length > 0
    ? `${format(new Date(chartData[0].date), 'MMM dd, yyyy')} - ${format(new Date(chartData[chartData.length - 1].date), 'MMM dd, yyyy')}`
    : '';

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold text-lg text-gray-800">User Analytics</div>
          {dateRange && (
            <div className="text-sm text-gray-500 mt-0.5 mb-2">{dateRange}</div>
          )}
        </div>
        <select
          value={timeFilter}
          onChange={e => setTimeFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart
          data={chartData}
          margin={{ top: 32, right: 24, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={date => format(new Date(date), getDateFormat())}
            interval={0}
            padding={{ left: 10, right: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            yAxisId={0}
            tick={{ fontSize: 12, fill: '#4F81BD' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            domain={[0, 'dataMax']}
            padding={{ top: 10, bottom: 10 }}
            label={{ value: 'Users', angle: -90, position: 'insideLeft', fill: '#4F81BD', fontSize: 12 }}
          />
          <YAxis
            yAxisId={1}
            orientation="right"
            tick={{ fontSize: 12, fill: '#E67E22' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            domain={[0, 'dataMax']}
            padding={{ top: 10, bottom: 10 }}
            label={{ value: 'Avg Queries', angle: 90, position: 'insideRight', fill: '#E67E22', fontSize: 12 }}
          />
          <Tooltip content={<UserAnalyticsTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 20, marginBottom: -10 }}
            onClick={handleLegendClick}
          />
          {visible.avgQueries && (
            <Line
              yAxisId={1}
              type="monotone"
              dataKey="avgQueries"
              name="Avg Queries/User"
              stroke="#E67E22"
              strokeWidth={4}
              dot={{ r: 0, fill: 'white', stroke: '#E67E22', strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          )}
          {visible.users && (
            <Bar
              yAxisId={0}
              dataKey="users"
              name="Users"
              fill="#4F81BD"
              barSize={28}
              radius={[6, 6, 0, 0]}
              stroke="#0E7490"
              strokeWidth={2}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function UserAnalyticsTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100">
      <div className="text-sm font-semibold text-gray-700 mb-2">
        {format(new Date(label), 'MMM dd, yyyy')}
      </div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.dataKey === 'users' ? BRAND_COLORS.purple : BRAND_COLORS.amber }} />
          <span style={{ color: entry.dataKey === 'users' ? BRAND_COLORS.purple : BRAND_COLORS.amber }} className="font-medium">
            {entry.dataKey === 'users' ? entry.value.toLocaleString() : entry.value.toFixed(2)}
          </span>
          <span className="text-gray-500">
            {entry.dataKey === 'users' ? 'Users' : 'Avg Queries/User'}
          </span>
        </div>
      ))}
    </div>
  );
}

function QuerySourceDoughnut() {
  const total = sourcePieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center relative">
      <div className="text-lg font-semibold text-gray-800 mb-2">Query Source</div>
      <div className="relative flex items-center justify-center w-full" style={{ minHeight: 220 }}>
        <ResponsiveContainer width={180} height={180} className="!outline-none">
          <PieChart>
            <Pie
              data={sourcePieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              labelLine={false}
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              stroke="none"
            >
              {sourcePieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                name
              ]}
              contentStyle={{ borderRadius: 12, boxShadow: '0 2px 8px #0001', fontSize: 14 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center justify-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-500 font-medium">Total Queries</div>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-6 w-full">
        {sourcePieData.map((entry, idx) => (
          <div key={entry.name} className="flex items-center gap-2 w-full">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-medium text-gray-700 flex-1">{entry.name}</span>
            <span className="text-sm font-semibold text-gray-900">{entry.value}</span>
            <span className="text-xs text-gray-500">{((entry.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    let data;
    if (selectedFilter === 'Last 30 days') {
      data = generateDailyData(30);
    } else {
      data = generateDailyData(7);
    }
    setChartData(data);
    if (data.length > 0) {
      setDateRange(`${format(new Date(data[0].date), 'MMM dd, yyyy')} - ${format(new Date(data[data.length - 1].date), 'MMM dd, yyyy')}`);
    }
  }, [selectedFilter]);

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
          
          {/* Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${selectedFilter === filter 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            {selectedFilter === 'Custom' && (
              <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <input
                  type="date"
                  className="px-3 py-2 rounded-md text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  placeholder="Start date"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  className="px-3 py-2 rounded-md text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  placeholder="End date"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {mockTopMetrics.map((metric) => (
          <TopMetricCard 
            key={metric.label} 
            {...metric} 
            selectedFilter={selectedFilter}
          />
        ))}
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MessageAnalyticsChart selectedFilter={selectedFilter} />
        <SessionFeedbackCard data={sessionFeedback} dateRange={dateRange} />
      </div>

      {/* Users and Source Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Analytics Graph */}
        <div className="md:col-span-2">
          <UserAnalyticsChart selectedFilter={selectedFilter} />
        </div>
        {/* Source Pie Chart */}
        <QuerySourceDoughnut />
      </div>
    </div>
  );
} 