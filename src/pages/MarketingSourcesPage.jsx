import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export default function MarketingSourcesPage() {
  const [connectedSources, setConnectedSources] = useState(() => {
    const stored = localStorage.getItem('connectedSources');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('connectedSources', JSON.stringify(connectedSources));
  }, [connectedSources]);

  const handleConnect = (sourceId) => {
    if (sourceId === 1) { // Google Ads
      // Immediately mark Google Ads as connected
      setConnectedSources(prev => {
        if (!prev.includes(1)) {
          return [...prev, 1];
        }
        return prev;
      });

      // Open OAuth URL in new tab
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const oauthUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
        "client_id=916350483395-kkm9u444j84gcn5mc86gusrdi1kv5oe4.apps.googleusercontent.com&" +
        "redirect_uri=https://www.astrico.ai/oauth2/callback&" +
        "response_type=code&" +
        "scope=https://www.googleapis.com/auth/adwords&" +
        "access_type=offline&" +
        "prompt=consent";

      window.open(
        oauthUrl,
        'Google Ads OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    }
  };

  // Listen for OAuth callback message
  useEffect(() => {
    const handleOAuthCallback = (event) => {
      // Verify the origin of the message
      if (event.origin !== "https://www.astrico.ai") return;

      try {
        const data = event.data;
        if (data.type === 'oauth_callback' && data.source === 'google_ads' && data.code) {
          // Add Google Ads to connected sources
          setConnectedSources(prev => {
            if (!prev.includes(1)) { // 1 is Google Ads ID
              return [...prev, 1];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
      }
    };

    window.addEventListener('message', handleOAuthCallback);
    return () => window.removeEventListener('message', handleOAuthCallback);
  }, []);

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
            <div
              key={source.id}
              className="bg-white rounded-xl border border-gray-100 p-6 hover:border-primary/20 hover:shadow-md transition-all relative group"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-white border border-gray-100 p-2 flex items-center justify-center flex-shrink-0">
                  <img src={source.logo} alt={source.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-gray-900">{source.name}</h3>
                    {connectedSources.includes(source.id) ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                </div>
              </div>

              {/* Connect Button - Only show for unconnected sources */}
              {!connectedSources.includes(source.id) && (
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => handleConnect(source.id)}
                    className="w-full bg-primary text-white hover:bg-primary/90"
                  >
                    Connect
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
} 