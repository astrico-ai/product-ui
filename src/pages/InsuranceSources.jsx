import React from "react";
import { MainLayout } from "@/components/MainLayout";

export default function InsuranceSources() {
  const serviceSources = [
    {
      id: 1,
      name: "Freshdesk",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjhW4KYWY9rhjJS8gCKPL9zw1gjIne5YRL5A&s",
      description: "Help desk software for customer support and ticket management"
    },
    {
      id: 2,
      name: "Genesys",
      logo: "https://mms.businesswire.com/media/20241218804901/en/2284852/22/Genesys_Logo.jpg",
      description: "Cloud customer experience and contact center solution"
    },
    {
      id: 3,
      name: "Exotel",
      logo: "https://www.cioandleader.com/wp-content/uploads/2025/02/Exotel-logo-1.png",
      description: "Cloud telephony and customer engagement platform"
    },
    {
      id: 4,
      name: "Outlook",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfUvracY3ekf9w5lGrkysXP4QQloDAqo6AdQ&s",
      description: "Email and calendar management platform for business communication"
    },
    {
      id: 5,
      name: "Zoho",
      logo: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSZkW7rlj4cSdUAoc7LoM2Tb2FQJALnj35__ONKRhymVxHXu8tPvwCXee4wK_RX0Umto7depDZLXUvq37vNqZ3hLMvu4Ck4-iMo_5XqOZI",
      description: "Business and customer service software suite"
    },
    {
      id: 6,
      name: "HubSpot",
      logo: "https://fs.hubspotusercontent00.net/hubfs/53/assets/hubspot.com/web-team/WBZ/Blog%202021/Images/Logos/HubSpot%20Logo%20112X112.svg",
      description: "CRM platform with customer service and support capabilities"
    },
    {
      id: 7,
      name: "Salesforce",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC8tgeDcYtezt1igXtlWcIHvo6hRw_rKYhbQ&s",
      description: "Customer relationship and service management platform"
    },
    {
      id: 8,
      name: "SharePoint",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRof11NMtStmQJC566EfEjEn-066jwb398VrQ&s",
      description: "Document management and collaboration platform"
    },
    {
      id: 9,
      name: "Haptik",
      logo: "https://i.ibb.co/kV9vqVLx/Haptik.png",
      description: "Conversational AI and customer engagement platform"
    },
    {
      id: 10,
      name: "GreyLabs AI",
      logo: "https://i.ibb.co/v4hPPBSy/image-Photoroom.png",
      description: "AI-powered customer service and automation solution"
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Data Sources</h1>
          <p className="text-lg text-gray-600">
            Connected multiple platforms that provide data to the Astrico Knowledge Hub
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