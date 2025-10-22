import React, { useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import { Pin } from 'lucide-react';

const MiningDataVisualization = ({ show = false, onPin, chartConfig }) => {
  const chartRef = useRef(null);
  
  console.log('🔍 Debug - MiningDataVisualization props:', { show, chartConfig: !!chartConfig });
  if (!show || !chartConfig) {
    console.log('🔍 Debug - MiningDataVisualization returning null:', { show, hasChartConfig: !!chartConfig });
    return null;
  }

  useEffect(() => {
    // Force chart to redraw after component mounts
    if (chartRef.current) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }, [chartConfig]);

  // Determine the title based on the data
  const getTitle = () => {
    // Check if it's the copper chart by looking at the chart type
    if (chartConfig.options.chart.type === 'line') {
      return "Copper Price Trend";
    }
    // Check if it's the billing percentage chart by looking at the data format
    if (chartConfig.series[0].data.some(val => val > 100)) {
      return "Average Drop Size Per Order";
    }
    return "% of Outlets Billed by Channel";
  };

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">{getTitle()}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onPin}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Pin className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-6 w-full">
        <div className="w-full" style={{ minWidth: '100%' }} ref={chartRef}>
          <Chart
            options={chartConfig.options}
            series={chartConfig.series}
            type={chartConfig.options.chart.type}
            height={400}
          />
        </div>
      </div>
    </div>
  );
};

export default MiningDataVisualization; 