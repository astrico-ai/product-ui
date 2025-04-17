import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pin } from 'lucide-react';

const LostCustomersVisualization = ({ show = false, onPin }) => {
  const lostCustomersData = [
    { 
      clientName: "Tata Composites",
      fibreType: "Glass Fibre",
      lySales: 1.39,
      lyVolume: 18.4
    },
    { 
      clientName: "Reliance Fibres",
      fibreType: "Glass Fibre",
      lySales: 1.09,
      lyVolume: 13.0
    },
    { 
      clientName: "Bharat Textiles",
      fibreType: "Glass Fibre",
      lySales: 1.04,
      lyVolume: 8.8
    },
    { 
      clientName: "Aditya Polymers",
      fibreType: "Hybrid Fibre",
      lySales: 0.99,
      lyVolume: 15.8
    },
    { 
      clientName: "Larsen Composites",
      fibreType: "Glass Fibre",
      lySales: 1.39,
      lyVolume: 14.5
    }
  ];

  if (!show) return null;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Lost Customers - Glass & Hybrid Fibre</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPin}
            className="text-gray-500 hover:text-[#3551F3] hover:bg-[#EEF2FF]"
          >
            <Pin className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="overflow-x-auto h-[350px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLIENT NAME</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIBRE TYPE</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LY SALES</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LY VOLUME</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lostCustomersData.map((customer, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      customer.fibreType === 'Glass Fibre' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.fibreType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₹{customer.lySales.toFixed(2)} Cr</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{customer.lyVolume.toFixed(1)}T</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  ₹{lostCustomersData.reduce((sum, customer) => sum + customer.lySales, 0).toFixed(2)} Cr
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {lostCustomersData.reduce((sum, customer) => sum + customer.lyVolume, 0).toFixed(1)}T
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default LostCustomersVisualization; 