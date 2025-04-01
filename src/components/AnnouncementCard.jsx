import React from "react";
import { Bell, ChevronRight, AlertTriangle, ExternalLink } from "lucide-react";

const announcements = [
  {
    id: 1,
    title: "📢 New Spinny leads assigned!",
    badge: "New",
    time: "Just now",
    description: "Exciting news! New vehicle loan leads have been assigned to you.",
    cta: {
      label: "View Assigned Leads",
      link: "/leads"
    }
  },
  {
    id: 2,
    title: "🚨 Urgent: Long Overdue Loan Alert!",
    badge: "Urgent",
    time: "2 hours ago",
    description: `Name: Mr. Ramesh Kumar\nVehicle Loan ID: VF-2023-09876\nOverdue Since: 12+ months\nTotal Outstanding: ₹3,20,000\nLast Payment Date: Jan 15, 2023\n\nPlease contact them immediately and initiate the recovery process as per bank policy.`,
    priority: "high"
  },
  {
    id: 3,
    title: "💰 Interest Rate Update - February 2025",
    time: "1 day ago",
    description: "New vehicle loan interest rates are updated from 8.25% to 8.5%"
  }
];

export function AnnouncementCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3551F3]/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-[#3551F3]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Company Announcements</h3>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {announcements.map((announcement) => (
          <div 
            key={announcement.id} 
            className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer group ${
              announcement.priority === 'high' ? 'bg-red-50/50 hover:bg-red-50' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-medium text-gray-900 group-hover:text-[#3551F3] transition-colors">
                  {announcement.title}
                </h4>
                {announcement.badge && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                    announcement.badge === 'Urgent' 
                      ? 'text-red-600 bg-red-50 border-red-200'
                      : 'text-[#3551F3] bg-[#3551F3]/10 border-[#3551F3]/20'
                  }`}>
                    {announcement.badge}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500 tabular-nums">{announcement.time}</span>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{announcement.description}</p>
              {announcement.cta && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#3551F3] hover:bg-[#3551F3]/5 rounded-lg transition-colors mt-2">
                  {announcement.cta.label}
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
              {announcement.priority === 'high' && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Immediate action required</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 