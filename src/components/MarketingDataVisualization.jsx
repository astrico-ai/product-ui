import React, { useState } from 'react';
import { BarChart3, Table as TableIcon, Pin, ThumbsUp, ThumbsDown, Copy, Share2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const monthlyData = [
  {
    month: "Jun'24",
    "Google Ads": 902,
    "Facebook Ads": 1235,
    "Instagram Ads": 1070,
    "Email Campaigns": 906,
    "Organic Search": 871
  },
  {
    month: "Jul'24",
    "Google Ads": 1414,
    "Facebook Ads": 921,
    "Instagram Ads": 1266,
    "Email Campaigns": 1014,
    "Organic Search": 1130
  },
  {
    month: "Aug'24",
    "Google Ads": 887,
    "Facebook Ads": 1172,
    "Instagram Ads": 899,
    "Email Campaigns": 1463,
    "Organic Search": 930
  },
  {
    month: "Sep'24",
    "Google Ads": 1108,
    "Facebook Ads": 1143,
    "Instagram Ads": 1291,
    "Email Campaigns": 1213,
    "Organic Search": 1185
  },
  {
    month: "Oct'24",
    "Google Ads": 1076,
    "Facebook Ads": 960,
    "Instagram Ads": 1259,
    "Email Campaigns": 1113,
    "Organic Search": 821
  },
  {
    month: "Nov'24",
    "Google Ads": 1360,
    "Facebook Ads": 1274,
    "Instagram Ads": 858,
    "Email Campaigns": 1310,
    "Organic Search": 1481
  },
  {
    month: "Dec'24",
    "Google Ads": 1499,
    "Facebook Ads": 989,
    "Instagram Ads": 1486,
    "Email Campaigns": 1362,
    "Organic Search": 1366
  }
];

const channelColors = {
  "Google Ads": "#4285F4",
  "Facebook Ads": "#1877F2",
  "Instagram Ads": "#E4405F",
  "Email Campaigns": "#34A853",
  "Organic Search": "#EA4335"
};

export function MarketingDataVisualization({ show = false, onFollowUpClick, onPin }) {
  const [isTableView, setIsTableView] = useState(true);

  const handlePin = () => {
    onPin?.();
  };

  if (!show) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Customer Acquisition Cost by Channel</h3>
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1 rounded-lg flex items-center">
              <button 
                onClick={() => setIsTableView(true)}
                className={`p-2 rounded-md transition-colors ${
                  isTableView ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsTableView(false)}
                className={`p-2 rounded-md transition-colors ${
                  !isTableView ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handlePin}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Pin className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {isTableView ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-[#0000FF] text-white">
                  <th className="py-3 px-6 text-left text-sm font-semibold">Channel</th>
                  {monthlyData.map((data) => (
                    <th key={data.month} className="py-3 px-6 text-left text-sm font-semibold">
                      {data.month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(channelColors).map((channel) => (
                  <tr key={channel} className="border-b border-gray-100">
                    <td className="py-3 px-6 text-sm text-gray-900">{channel}</td>
                    {monthlyData.map((data) => (
                      <td key={`${channel}-${data.month}`} className="py-3 px-6 text-sm text-gray-900">
                        {data[channel]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tick={{ fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip 
                    formatter={(value) => [value, 'CAC']}
                    labelStyle={{ color: '#111827' }}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  <Legend />
                  {Object.keys(channelColors).map(channel => (
                    <Line
                      key={channel}
                      type="monotone"
                      dataKey={channel}
                      stroke={channelColors[channel]}
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'white', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      
      {/* Action Icons - moved outside */}
      <div className="flex items-center gap-2">
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ThumbsUp className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ThumbsDown className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <Copy className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <Share2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      {/* Follow-up Queries - moved outside */}
      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={() => onFollowUpClick?.("What caused the sharp CAC increase in Nov'24?")}
          className="inline-block px-4 py-2 bg-[#EEF2FF] text-[#3551F3] rounded-full hover:bg-blue-50 transition-colors text-sm font-medium"
        >
          What caused the sharp CAC increase in Nov'24?
        </button>
        <button 
          onClick={() => onFollowUpClick?.("Which channel had the highest ROI despite CAC variations?")}
          className="inline-block px-4 py-2 bg-[#EEF2FF] text-[#3551F3] rounded-full hover:bg-blue-50 transition-colors text-sm font-medium"
        >
          Which channel had the highest ROI despite CAC variations?
        </button>
      </div>
    </div>
  );
} 