import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Pin } from 'lucide-react';

const MonthlySalesVisualization = ({ show = false, onPin, chatQuery }) => {
  // Check if the query is related to monthly sales split
  const shouldShowVisualization = () => {
    if (!chatQuery) return false;
    const query = chatQuery.toLowerCase();
    return query.includes('monthly sales split') || 
           (query.includes('monthly') && query.includes('sales') && query.includes('product'));
  };

  const data = [
        { month: 'Apr', 'Carbon Fibre': 2.8, 'Aramid Fibre': 1.9, 'Glass Fibre': 2.1, 'Hybrid Fibre': 0.95 },
        { month: 'May', 'Carbon Fibre': 2.95, 'Aramid Fibre': 2.0, 'Glass Fibre': 2.0, 'Hybrid Fibre': 0.9 },
        { month: 'Jun', 'Carbon Fibre': 3.0, 'Aramid Fibre': 2.05, 'Glass Fibre': 1.95, 'Hybrid Fibre': 0.88 },
        { month: 'Jul', 'Carbon Fibre': 3.2, 'Aramid Fibre': 2.2, 'Glass Fibre': 1.93, 'Hybrid Fibre': 0.86 },
        { month: 'Aug', 'Carbon Fibre': 3.3, 'Aramid Fibre': 2.25, 'Glass Fibre': 1.96, 'Hybrid Fibre': 0.87 },
        { month: 'Sept', 'Carbon Fibre': 3.5, 'Aramid Fibre': 2.5, 'Glass Fibre': 1.9, 'Hybrid Fibre': 0.85 }
      
  ];

  const formatYAxis = (value) => {
    return `₹${value.toFixed(2)} Cr`;
  };

  if (!show || !shouldShowVisualization()) return null;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Sales Split by Product</h3>
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
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="month"
                tick={{ fill: '#000000', fontSize: '12px' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                domain={['auto', 'auto']}
                tick={{ fill: '#000000', fontSize: '12px' }}
                axisLine={{ stroke: '#E5E7EB' }}
                label={{ 
                  value: 'Sales (₹ Cr)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#000000' }
                }}
              />
              <Tooltip 
                formatter={(value, name) => [`₹${value.toFixed(2)} Cr`, name]}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              />
              <Legend 
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  paddingTop: '20px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="Carbon Fibre" 
                stroke="#3551F3" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Aramid Fibre" 
                stroke="#7C3AED" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Glass Fibre" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Hybrid Fibre" 
                stroke="#DC2626" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default MonthlySalesVisualization; 