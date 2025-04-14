import React from "react";
import { MainLayout } from "@/components/MainLayout";

export default function MiningSources() {
  const miningSources = [
    {
      id: 1,
      name: "Salesforce",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC8tgeDcYtezt1igXtlWcIHvo6hRw_rKYhbQ&s",
      description: "Customer relationship and service management platform"
    },
    {
      id: 2,
      name: "SharePoint",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRof11NMtStmQJC566EfEjEn-066jwb398VrQ&s",
      description: "Document management and collaboration platform"
    },
    {
      id: 3,
      name: "London Metal Exchange",
      logo: "https://i.ibb.co/tTtbWbP4/Screenshot-2025-03-04-161345.png",
      description: "World's largest market for industrial metals trading"
    },
    {
      id: 4,
      name: "Reuters",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Reuters_Logo.svg/768px-Reuters_Logo.svg.png",
      description: "Global news and financial information provider"
    },
    {
      id: 5,
      name: "Financial Times",
      logo: "https://images.seeklogo.com/logo-png/46/2/financial-times-corporate-logo-png_seeklogo-466128.png",
      description: "Leading global business publication and market analysis"
    },
    {
      id: 6,
      name: "Bloomberg",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/New_Bloomberg_Logo.svg/768px-New_Bloomberg_Logo.svg.png",
      description: "Financial and market data, news, and analytics platform"
    },
    {
      id: 7,
      name: "S&P Global",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/S%26P_Global_logo.svg/206px-S%26P_Global_logo.svg.png",
      description: "Market intelligence and commodity pricing information"
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Mining Data Sources</h1>
          <p className="text-lg text-gray-600">
            Connected platforms and services that provide mining-related data to the Astrico Knowledge Hub
          </p>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {miningSources.map((source) => (
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