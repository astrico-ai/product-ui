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
    month: 'Oct 2024',
    Andheri: 18.2,
    Bandra: 12.5,
    Fort: 15.8,
    Borivali: 8.7,
    Ghatkopar: 7.2
  },
  {
    month: 'Nov 2024',
    Andheri: 19.1,
    Bandra: 13.2,
    Fort: 16.4,
    Borivali: 9.3,
    Ghatkopar: 8.1
  },
  {
    month: 'Dec 2024',
    Andheri: 17.8,
    Bandra: 14.5,
    Fort: 15.9,
    Borivali: 10.2,
    Ghatkopar: 8.9
  },
  {
    month: 'Jan 2025',
    Andheri: 19.5,
    Bandra: 15.1,
    Fort: 17.2,
    Borivali: 11.4,
    Ghatkopar: 9.8
  },
  {
    month: 'Feb 2025',
    Andheri: 18.9,
    Bandra: 15.8,
    Fort: 16.8,
    Borivali: 12.1,
    Ghatkopar: 10.5
  },
  {
    month: 'Mar 2025',
    Andheri: 20.0,
    Bandra: 16.2,
    Fort: 18.1,
    Borivali: 12.8,
    Ghatkopar: 11.2
  }
];

const locationColors = {
  Andheri: '#2563EB', // Blue
  Bandra: '#7C3AED', // Purple
  Fort: '#059669', // Green
  Borivali: '#DC2626', // Red
  Ghatkopar: '#D97706' // Amber
};

export function InsuranceDataVisualization({ show = false, onFollowUpClick, onPin }) {
  const [isTableView, setIsTableView] = useState(true);

  const handlePin = () => {
    onPin?.();
  };

  if (!show) return null;

  return (
    <>
      <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Insurance Policy Conversion Rates by Location</h3>
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
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Andheri</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Bandra</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Fort</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Borivali</th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-900">Ghatkopar</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, index) => (
                  <tr 
                    key={row.month}
                    className={index !== monthlyData.length - 1 ? 'border-b border-gray-100' : ''}
                  >
                    <td className="py-3 px-6 text-sm text-gray-900">{row.month}</td>
                    <td className="py-3 px-6 text-sm text-gray-900">{row.Andheri}%</td>
                    <td className="py-3 px-6 text-sm text-gray-900">{row.Bandra}%</td>
                    <td className="py-3 px-6 text-sm text-gray-900">{row.Fort}%</td>
                    <td className="py-3 px-6 text-sm text-gray-900">{row.Borivali}%</td>
                    <td className="py-3 px-6 text-sm text-gray-900">{row.Ghatkopar}%</td>
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
                    domain={[0, 25]}
                    tick={{ fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Conversion Rate']}
                    labelStyle={{ color: '#111827' }}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  <Legend />
                  {Object.keys(locationColors).map(location => (
                    <Line
                      key={location}
                      type="monotone"
                      dataKey={location}
                      stroke={locationColors[location]}
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
            onClick={() => onFollowUpClick("Why are Borivali and Ghatkopar branches showing lower conversion rates compared to others?")}
            className="inline-block px-4 py-2 bg-[#EEF2FF] text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
          >
            <span className="font-semibold">Why are Borivali and Ghatkopar branches showing lower conversion rates compared to others?</span>
          </button>
        </div>
      </div>
    </>
  );
} 