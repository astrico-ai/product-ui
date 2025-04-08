import React from "react";
import { MainLayout } from "@/components/MainLayout";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { MentionsCard } from "@/components/MentionsCard";
import { SearchInput } from "@/components/SearchInput";
import { useNavigate } from "react-router-dom";

export default function InsurancePage() {
  const navigate = useNavigate();

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate('/chat/insurance', { state: { initialMessage: query } });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Hero Section with Gradient Background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="w-full">
            <h1 className="text-3xl font-bold text-white mb-3">Astrico Knowledge Hub</h1>
            <p className="text-blue-100 text-lg mb-6">Get information of all your insurance queries here</p>
            
            {/* Search Bar with full width */}
            <div className="bg-white/10 p-1 rounded-xl backdrop-blur-sm w-full">
              <SearchInput onSearch={handleSearch} />
            </div>
          </div>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-2 gap-6">
          {/* Announcements with enhanced styling */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Company Announcements</h2>
                  <p className="text-sm text-gray-500">Latest updates and announcements</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900">New Branch Performance Dashboard launched for Mumbai Region</p>
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Active</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900">Real-time Policy Conversion Rate tracking now available for all branches</p>
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">New</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mentions with enhanced styling */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Mentions</h2>
                  <p className="text-sm text-gray-500">Actions requiring your attention</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-medium">@John Doe</span>
                  <span className="text-gray-700">is trying to share the</span>
                  <span className="font-medium text-gray-900">Branch Performance dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 