import React from "react";
import { MainLayout } from "@/components/MainLayout";

export default function Sources() {
  const serviceSources = [
    {
      id: 1,
      name: "Google Ads",
      logo: "https://www.gstatic.com/images/branding/product/1x/googleg_40dp.png",
      description: "Online advertising platform for campaign management and performance tracking"
    },
    {
      id: 2,
      name: "META Ads",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1200px-Meta_Platforms_Inc._logo.svg.png",
      description: "Social media advertising platform for Facebook, Instagram, and other Meta services"
    },
    {
      id: 3,
      name: "Bing Ads",
      logo: "https://www.bing.com/sa/simg/bing_p_blk.svg",
      description: "Microsoft advertising platform for search and programmatic advertising"
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Data Sources</h1>
          <p className="text-lg text-gray-600">
            Connected customer service platforms that provide data to the Astrico Knowledge Hub
          </p>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceSources.map((source) => (
            <div key={source.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md relative">
              {/* Status Indicator */}
              <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-green-500"></div>
              <div className="p-6 flex items-center space-x-4">
                {/* Logo */}
                <div className="h-16 w-16 flex-shrink-0 bg-gray-50 rounded-lg p-2 flex items-center justify-center">
                  <img 
                    src={source.logo} 
                    alt={`${source.name} logo`} 
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/60x60";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-gray-900">{source.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
} 