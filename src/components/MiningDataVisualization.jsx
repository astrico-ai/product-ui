import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Pin } from 'lucide-react';

const MiningDataVisualization = ({ show = false, onPin }) => {
  // Copper price data
  const data = [
    { date: "March", price: 9363.5 },
    { date: "March", price: 9415.5 },
    { date: "March", price: 9504 },
    { date: "March", price: 9463 },
    { date: "March", price: 9490 },
    { date: "March", price: 9494 },
    { date: "March", price: 9514.5 },
    { date: "March", price: 9433 },
    { date: "March", price: 9295 },
    { date: "March", price: 9291 },
    { date: "March", price: 9812 },
    { date: "March", price: 9362 },
    { date: "March", price: 9277.5 },
    { date: "March", price: 9245 },
    { date: "March", price: 9287.5 },
    { date: "March", price: 9288 },
    { date: "March", price: 9165 },
    { date: "March", price: 9025 },
    { date: "March", price: 8993 },
    { date: "March", price: 8866.5 },
    { date: "February", price: 8949.5 },
    { date: "February", price: 8975 },
    { date: "February", price: 8881 },
    { date: "February", price: 8890.5 },
    { date: "February", price: 9051 },
    { date: "February", price: 9218 },
    { date: "February", price: 9056 },
    { date: "February", price: 9123 },
    { date: "February", price: 9067 },
    { date: "February", price: 9132 },
    { date: "February", price: 9135 },
    { date: "February", price: 9020 },
    { date: "February", price: 9016 },
    { date: "February", price: 8980 },
    { date: "February", price: 8995.5 },
    { date: "February", price: 8960.5 },
    { date: "February", price: 8847 },
    { date: "February", price: 8886 },
    { date: "February", price: 8893.5 },
    { date: "February", price: 8701 },
    { date: "February", price: 8685.5 },
    { date: "January", price: 8949.5 },
    { date: "January", price: 8975 },
    { date: "January", price: 8881 },
    { date: "January", price: 8890.5 },
    { date: "January", price: 9051 },
    { date: "January", price: 9218 },
    { date: "January", price: 9056 },
    { date: "January", price: 9123 },
    { date: "January", price: 9067 },
    { date: "January", price: 9132 },
    { date: "January", price: 9135 },
    { date: "January", price: 9020 },
    { date: "January", price: 9016 },
    { date: "January", price: 8980 },
    { date: "January", price: 8995.5 },
    { date: "January", price: 8960.5 },
    { date: "January", price: 8847 },
    { date: "January", price: 8886 },
    { date: "January", price: 8893.5 },
    { date: "January", price: 8701 },
    { date: "January", price: 8685.5 }
  ].reverse(); // Reverse to show chronological order

  const formatYAxis = (value) => {
    return `$${value}`;
  };

  if (!show) return null;

  // Add index to each data point for better x-axis display
  const dataWithIndex = data.map((item, index) => ({
    ...item,
    index: index + 1
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Copper Price Trend (US$ Per Tonne)</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPin}
            className="text-gray-500 hover:text-[#3551F3] hover:bg-[#EEF2FF]"
          >
            <Pin className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dataWithIndex}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="index"
                type="number"
                domain={['dataMin', 'dataMax']}
                ticks={[1, Math.floor(data.length / 2), data.length]}
                tickFormatter={(value) => {
                  if (value === 1) return "January";
                  if (value === Math.floor(data.length / 2)) return "February";
                  if (value === data.length) return "March";
                  return "";
                }}
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                domain={['dataMin - 100', 'dataMax + 100']}
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Price']}
                labelFormatter={(label) => {
                  const dataPoint = dataWithIndex[label - 1];
                  return `${dataPoint.date} 2024/25`;
                }}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3551F3" 
                strokeWidth={2}
                name="Copper Price"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default MiningDataVisualization; 