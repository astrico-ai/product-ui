import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pin } from 'lucide-react';
import Chart from 'react-apexcharts';

const CHART_COLORS = {
  pie: ['#3551F3', '#7C3AED', '#059669', '#DC2626', '#D97706']
};

const AramidContributionVisualization = ({ show = false, onPin }) => {
  const pieData = {
    series: [27.63, 23.68, 19.74, 15.79, 13.16],
    options: {
      chart: {
        type: 'pie',
        animations: { enabled: false },
        toolbar: { show: false },
        background: '#ffffff'
      },
      labels: [
        'Kavita Mehta',
        'Mohit Nair',
        'Megha Rao',
        'Ankit Sharma',
        'Puneet Sinha'
      ],
      legend: {
        position: 'bottom',
        fontSize: '14px',
        fontWeight: 500,
        labels: {
          colors: '#000000'
        }
      },
      colors: CHART_COLORS.pie,
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          return val.toFixed(2) + '%';
        },
        style: {
          fontSize: '14px',
          fontWeight: 500,
          colors: ['#000000']
        }
      },
      tooltip: {
        style: {
          fontSize: '14px'
        },
        y: {
          formatter: function(val) {
            return val.toFixed(2) + '%';
          }
        }
      }
    }
  };

  if (!show) return null;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Team Contribution - Aramid Fibre Sales</h3>
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
          <Chart
            options={pieData.options}
            series={pieData.series}
            type="pie"
            height="100%"
            width="100%"
          />
        </div>
      </Card>
    </div>
  );
};

export default AramidContributionVisualization; 