import React, { useState, useRef } from "react";
import { MainLayout } from "@/components/MainLayout";
import { TrendingUp, Download, X } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";
import { TrainingCard } from "@/components/TrainingCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { CSAnnouncements } from "@/components/CSAnnouncements";
import { SearchInput } from "@/components/SearchInput";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const handleSearch = (query, files) => {
    if (query.trim() || files?.length > 0) {
      navigate('/chat', { state: { initialMessage: query, attachments: files } });
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    e.target.value = null;
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(file => file.id !== id));
  };

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Hero Section with Gradient Background */}
        <div className="bg-gradient-to-r from-[#3551F3] to-[#4B6AF5] rounded-2xl p-8 mb-8 shadow-lg">
          <div className="w-full">
            <h1 className="text-3xl font-bold text-white mb-2">Astrico Knowledge Hub</h1>
            <p className="text-blue-100 text-lg mb-6">Get information of all your marketing queries here</p>
            
            {/* Search Bar */}
            <div className="relative bg-white/10 p-1 rounded-xl backdrop-blur-sm">
              <div className="relative flex items-center bg-white rounded-lg w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <div className="flex-1 flex items-center pl-12 h-12 overflow-x-auto hide-scrollbar">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {attachments.map(file => (
                      <div key={file.id} className="flex items-center bg-blue-50 rounded-full px-3 py-1 text-xs text-blue-700">
                        <span className="max-w-[150px] truncate">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeAttachment(file.id)}
                          className="ml-1.5 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (query.trim() || attachments.length > 0)) {
                        handleSearch(query, attachments);
                      }
                    }}
                    placeholder="Search for information, documents, people, and more..."
                    className="border-0 focus:ring-0 outline-none focus:outline-none placeholder:text-gray-400 bg-transparent h-full w-full flex-grow pr-24"
                  />
                </div>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  <button 
                    type="button"
                    onClick={handleAttachmentClick}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSearch(query, attachments)}
                    className="p-2 bg-[#3551F3] rounded-lg hover:bg-[#2B41D9] transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="space-y-8">
          {/* Top Row: Video, Training, and Leaderboard */}
          <div className="grid grid-cols-12 gap-6">
            {/* Featured Video */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow h-full">
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
            </div>

            {/* Training Resources */}
            <div className="col-span-12 lg:col-span-4">
              <TrainingCard />
            </div>

            {/* Leaderboard */}
            <div className="col-span-12 lg:col-span-4">
              <LeaderboardCard sortOrder="desc" />
            </div>
          </div>

          {/* Bottom Row: Announcements */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <CSAnnouncements />
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

<style jsx>{`
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style> 