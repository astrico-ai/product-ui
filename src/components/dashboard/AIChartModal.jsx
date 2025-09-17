import { useState, useEffect } from "react";
import { Filter, Download, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FaWandMagicSparkles } from "react-icons/fa6";

export default function AIChartModal({ 
  isOpen, 
  onClose, 
  searchQuery, 
  onAddToDashboard 
}) {
  const [loading, setLoading] = useState(false);
  const [chartGenerated, setChartGenerated] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen && searchQuery) {
      setLoading(true);
      setChartGenerated(false);
      setCurrentStep(0);
      
      // Sequential step animation
      const stepTimers = [];
      
      // Step 1: Processing query (after 800ms)
      stepTimers.push(setTimeout(() => setCurrentStep(1), 800));
      
      // Step 2: Analyzing data (after 1600ms)
      stepTimers.push(setTimeout(() => setCurrentStep(2), 1600));
      
      // Step 3: Creating visualization (after 2400ms)
      stepTimers.push(setTimeout(() => setCurrentStep(3), 2400));
      
      // Complete loading (after 3200ms)
      stepTimers.push(setTimeout(() => {
        setLoading(false);
        setChartGenerated(true);
        setCurrentStep(0);
      }, 3200));

      return () => {
        stepTimers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [isOpen, searchQuery]);

  const handleClose = () => {
    setLoading(false);
    setChartGenerated(false);
    setCurrentStep(0);
    onClose();
  };

  const handleAddToDashboard = () => {
    onAddToDashboard();
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl p-0 bg-white rounded-2xl shadow-2xl border-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500">"{searchQuery}"</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                {/* Modern Loader */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#3551F3] border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <FaWandMagicSparkles className="w-6 h-6 text-[#3551F3] animate-pulse" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating your chart...</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Our AI is analyzing your data and creating the perfect visualization for your query.
                </p>
                
                {/* Progress Steps */}
                <div className="mt-8 space-y-3 h-24">
                  {/* Step 1: Processing query - Always visible when loading starts */}
                  <div className={`flex items-center gap-3 transition-all duration-500 ${
                    currentStep > 0 ? 'transform -translate-y-2 opacity-30 scale-95' : ''
                  }`}>
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentStep > 0 ? 'bg-[#1E3A8A]' : 'bg-[#3551F3] animate-pulse'
                    }`}></div>
                    <span className={`text-sm transition-all duration-300 ${
                      currentStep > 0 ? 'text-[#1E3A8A] font-medium' : 'text-gray-600'
                    }`}>Processing your query</span>
                  </div>
                  
                  {/* Step 2: Analyzing data - Only appears when step 1 is active */}
                  {currentStep >= 1 && (
                    <div className={`flex items-center gap-3 transition-all duration-500 animate-in slide-in-from-bottom-2 fade-in ${
                      currentStep > 1 ? 'transform -translate-y-2 opacity-30 scale-95' : ''
                    }`}>
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentStep > 1 ? 'bg-[#1E3A8A]' : currentStep === 1 ? 'bg-[#3551F3] animate-pulse' : 'bg-gray-300'
                      }`}></div>
                      <span className={`text-sm transition-all duration-300 ${
                        currentStep > 1 ? 'text-[#1E3A8A] font-medium' : currentStep === 1 ? 'text-gray-600' : 'text-gray-400'
                      }`}>Analyzing data patterns</span>
                    </div>
                  )}
                  
                  {/* Step 3: Creating visualization - Only appears when step 2 is active */}
                  {currentStep >= 2 && (
                    <div className={`flex items-center gap-3 transition-all duration-500 animate-in slide-in-from-bottom-2 fade-in ${
                      currentStep > 2 ? 'transform -translate-y-2 opacity-30 scale-95' : ''
                    }`}>
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentStep > 2 ? 'bg-[#1E3A8A]' : currentStep === 2 ? 'bg-[#3551F3] animate-pulse' : 'bg-gray-300'
                      }`}></div>
                      <span className={`text-sm transition-all duration-300 ${
                        currentStep > 2 ? 'text-[#1E3A8A] font-medium' : currentStep === 2 ? 'text-gray-600' : 'text-gray-400'
                      }`}>Creating visualization</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {chartGenerated && !loading && (
              <div className="space-y-4">
                {/* Chart Preview */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-gray-900">Campaign Cost Analysis</h3>
                        <p className="text-sm text-gray-500">Total marketing spend across different channels</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          className="bg-[#3551F3] hover:bg-[#2B41D9] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
                          onClick={handleAddToDashboard}
                        >
                          Add to Dashboard
                        </Button>
                      </div>
                    </div>
                    
                    {/* Chart Controls */}
                    <div className="flex items-center justify-end border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-50 rounded-lg group relative">
                          <Filter className="w-5 h-5 text-gray-600" />
                          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Filter Data
                          </div>
                        </button>
                        <button className="p-2 hover:bg-gray-50 rounded-lg group relative">
                          <Settings2 className="w-5 h-5 text-gray-600" />
                          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Chart Settings
                          </div>
                        </button>
                        <button className="p-2 hover:bg-gray-50 rounded-lg group relative">
                          <Download className="w-5 h-5 text-gray-600" />
                          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Download Chart
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Modern Chart */}
                  <div className="space-y-6">
                    <div className="w-full h-56 flex items-end gap-6 px-4">
                      {[
                        { name: 'Search', value: 45000, color: '#3551F3', growth: '+12%' },
                        { name: 'Display', value: 32000, color: '#60A5FA', growth: '+8%' },
                        { name: 'Social', value: 28000, color: '#93C5FD', growth: '+15%' },
                        { name: 'Video', value: 38000, color: '#C7D2FE', growth: '+20%' },
                        { name: 'Email', value: 22000, color: '#DDD6FE', growth: '+5%' }
                      ].map((item, index) => (
                        <div key={item.name} className="flex flex-col items-center flex-1 group relative">
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            ₹{item.value.toLocaleString()}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                              <div className="border-8 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                          <div
                            className="w-full rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 relative overflow-hidden"
                            style={{ 
                              height: `${(item.value / 45000) * 180}px`,
                              backgroundColor: item.color
                            }}
                          >
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                          </div>
                          <div className="mt-4 text-center">
                            <span className="block text-gray-800 font-medium">{item.name}</span>
                            <span className="text-sm font-medium text-green-600">{item.growth}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Insights Section */}
                    <div className="border-t border-gray-100 pt-4 mt-6">
                      <div className="space-y-3">
                        <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          <FaWandMagicSparkles className="w-4 h-4 text-[#3551F3]" />
                          Key Insights
                        </h4>
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3551F3] mt-1.5"></span>
                            Search campaigns show the highest ROI with ₹45,000 spend
                          </li>
                          <li className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] mt-1.5"></span>
                            Video campaigns are trending up with 20% growth
                          </li>
                          <li className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#93C5FD] mt-1.5"></span>
                            Email shows potential for scaling with lowest cost
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
