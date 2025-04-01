import React from "react";
import { Bell } from "lucide-react";

export function AnnouncementCard() {
  const announcements = [
    {
      id: 1,
      title: "FG Health Absolute campaign is currently running on Google Ads",
      badge: "Active"
    },
    {
      id: 2,
      title: "New brand guidelines available in Marketing Assets folder",
      badge: "New"
    }
  ];

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-200">
      <div className="p-7">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#3551F3]/8 to-[#3551F3]/12 flex items-center justify-center ring-1 ring-[#3551F3]/[0.08]">
              <Bell className="h-[22px] w-[22px] text-[#3551F3]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Company Announcements</h3>
              <p className="text-sm text-gray-500">Latest updates and announcements</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="group px-4 py-3.5 rounded-xl hover:bg-gray-50/75 transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-[15px] font-medium text-gray-800 group-hover:text-[#3551F3] transition-colors duration-200">
                    {announcement.title}
                  </h4>
                  {announcement.badge && (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full text-[#3551F3] bg-[#3551F3]/8 ring-1 ring-[#3551F3]/[0.08]">
                      {announcement.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 