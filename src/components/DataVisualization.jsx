import React, { useState } from 'react';
import { BarChart3, Table as TableIcon, ThumbsUp, ThumbsDown, Copy, Share2, Pin } from 'lucide-react';
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
import './DataVisualization.css';

const monthlyData = [
  {
    month: 'January',
    Google: 45.2,
    Facebook: 38.7,
    YouTube: 52.1,
    LinkedIn: 67.3
  },
  {
    month: 'February',
    Google: 42.8,
    Facebook: 41.2,
    YouTube: 48.9,
    LinkedIn: 63.8
  },
  {
    month: 'March',
    Google: 47.5,
    Facebook: 36.9,
    YouTube: 55.2,
    LinkedIn: 70.1
  },
  {
    month: 'April',
    Google: 43.1,
    Facebook: 39.5,
    YouTube: 50.8,
    LinkedIn: 65.4
  },
  {
    month: 'May',
    Google: 46.7,
    Facebook: 37.8,
    YouTube: 53.4,
    LinkedIn: 68.9
  },
  {
    month: 'June',
    Google: 44.9,
    Facebook: 40.3,
    YouTube: 51.6,
    LinkedIn: 66.2
  }
];

const channelColors = {
  LinkedIn: '#0077B5',
  Facebook: '#1877F2',
  YouTube: '#FF0000',
  Google: '#4285F4'
};

export function DataVisualization({ show = false, onFollowUpClick }) {
  const [isTableView, setIsTableView] = useState(true);

  const handlePin = () => {
    // Pin functionality can be implemented later if needed
  };

  if (!show) return null;

  return (
    <>
      <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Month</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Google</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Facebook</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">YouTube</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">LinkedIn</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, index) => (
                  <tr 
                    key={row.month}
                    className={index !== monthlyData.length - 1 ? 'border-b border-gray-100' : ''}
                  >
                    <td className="py-3 px-6 text-sm text-gray-900">{row.month}</td>
                    <td className="py-3 px-6 text-sm text-gray-900">${row.Google}</td>
                    <td className="py-3 px-6 text-sm text-gray-900">${row.Facebook}</td>
                    <td className="py-3 px-6 text-sm text-gray-900">${row.YouTube}</td>
                    <td className="py-3 px-6 text-sm text-gray-900">${row.LinkedIn}</td>
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
                    domain={['dataMin - 5', 'dataMax + 5']}
                    tick={{ fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'CAC']}
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

      <div className="mt-4">
        <div className="flex items-center gap-2 mb-3">
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
        
        <div className="flex gap-2">
          <button 
            onClick={() => onFollowUpClick("Explain LinkedIn CAC trends")}
            className="inline-block px-4 py-2 bg-[#EEF2FF] text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
          >
            <span className="font-semibold">Explain LinkedIn CAC trends</span>
          </button>
          <button 
            onClick={() => onFollowUpClick("Recommend optimization strategies")}
            className="inline-block px-4 py-2 bg-[#EEF2FF] text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
          >
            <span className="font-semibold">Recommend optimization strategies</span>
          </button>
        </div>
      </div>
    </>
  );
} 