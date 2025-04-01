import React from "react";
import { MainLayout } from "@/components/MainLayout";

export default function MarketingSourcesPage() {
  const marketingSources = [
    {
      id: 1,
      name: "Google Ads",
      logo: "https://logospng.org/download/google-ads/logo-google-ads-1536.png",
      description: "Advertising platform for displaying ads on Google Search and properties"
    },
    {
      id: 2,
      name: "Meta Ads",
      logo: "https://kursusdigital.id/wp-content/uploads/2023/09/meta_ads_logo.png",
      description: "Advertising platform for Facebook, Instagram, and more"
    },
    {
      id: 3,
      name: "YouTube",
      logo: "https://www.freepnglogos.com/uploads/youtube-logo-hd-8.png",
      description: "Video content platform and advertising"
    },
    {
      id: 4,
      name: "LinkedIn",
      logo: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
      description: "Professional networking and B2B marketing platform"
    },
    {
      id: 5,
      name: "Zoho",
      logo: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSZkW7rlj4cSdUAoc7LoM2Tb2FQJALnj35__ONKRhymVxHXu8tPvwCXee4wK_RX0Umto7depDZLXUvq37vNqZ3hLMvu4Ck4-iMo_5XqOZI",
      description: "Business and marketing software suite"
    },
    {
      id: 6,
      name: "HubSpot",
      logo: "https://fs.hubspotusercontent00.net/hubfs/53/assets/hubspot.com/web-team/WBZ/Blog%202021/Images/Logos/HubSpot%20Logo%20112X112.svg",
      description: "CRM platform with marketing, sales, and service hubs"
    },
    {
      id: 7,
      name: "Salesforce",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC8tgeDcYtezt1igXtlWcIHvo6hRw_rKYhbQ&s",
      description: "CRM platform with marketing cloud capabilities"
    },
    {
      id: 8,
      name: "Mailchimp",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDPoDAxAEYpl4wnfklkezkGEENgObwqNS1sw&s",
      description: "Email marketing and automation platform"
    },
    {
      id: 9,
      name: "Google Analytics",
      logo: "https://pluspng.com/img-png/google-analytics-logo-png-google-analytics-developer-branding-guidelines-amp-policies-2388x1808.png",
      description: "Web analytics and reporting tool"
    },
    {
      id: 10,
      name: "Dentsu",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDbVfX_qpk33c9-jX--7pMpCl9f9OFZSxeKw&s",
      description: "Global media and digital marketing communications company"
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Data Sources</h1>
          <p className="text-lg text-gray-600">
            Connected marketing platforms that provide data to the Astrico Knowledge Hub
          </p>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketingSources.map((source) => (
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