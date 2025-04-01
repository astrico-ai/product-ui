import React from "react";
import { MainLayout } from "@/components/MainLayout";
import { TrendingUp, Download } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";
import { TrainingCard } from "@/components/TrainingCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { SearchInput } from "@/components/SearchInput";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate('/chat', { state: { initialMessage: query } });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header Section */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enterprise Knowledge Hub</h1>
            <p className="text-gray-500">Find and access all your company information in one place</p>
          </div>

          {/* Search Bar */}
          <SearchInput onSearch={handleSearch} />

          {/* Content Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-7">
              <div className="space-y-8">
                {/* Featured Video */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <iframe
                      src="https://www.youtube.com/embed/Mfn6KnnO_co"
                      title="New HL Interest Rates"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">New HL Interest Rates</h3>
                    <p className="text-gray-500 leading-relaxed">
                      <span className="text-[#3551F3] font-medium">@Team</span> please make sure to watch this video about change in the HL interest rates. Connect with <span className="text-gray-900 font-medium">John Doe</span> if any doubts
                    </p>
                  </div>
                </div>

                {/* Announcements */}
                <AnnouncementCard />
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-5 space-y-8">
              {/* Training Resources */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  Training Resources
                </h3>
                <p className="text-gray-500 mb-6 leading-relaxed">Access your training materials and courses here.</p>
                
                <div className="space-y-3">
                  <TrainingItem 
                    title="Negotiating Two-Wheeler Interest Rates" 
                    status="completed"
                  />
                  <TrainingItem 
                    title="Handling Angry Customers for Tractor Loans" 
                    status="failed"
                  />
                  <TrainingItem 
                    title="Building Trust with Rural Customers" 
                    status="completed"
                  />
                  <TrainingItem 
                    title="Effective Loan Recovery Strategies" 
                    status="failed"
                  />
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Leaderboard - Apr'25</h3>
                </div>
                <LeaderboardCard sortOrder="desc" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function TrainingItem({ title, status }) {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-600 border border-green-200';
      case 'failed':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 group transition-all">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-gray-900 group-hover:text-[#3551F3] transition-colors truncate">{title}</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyles(status)}`}>
          {status}
        </span>
      </div>
      <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#3551F3] hover:bg-[#3551F3]/5 transition-all">
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
} 