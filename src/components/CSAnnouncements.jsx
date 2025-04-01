import React from "react";
import { Button } from "@/components/ui/button";

export function CSAnnouncements() {
  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50/50">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Company Announcements</h3>
            <p className="text-sm text-gray-500">Latest updates and announcements</p>
          </div>
          <div className="ml-auto">
            <button className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {/* New Spinny Leads */}
        <div className="group px-6 py-5 hover:bg-gray-50/50 transition-colors relative">
          <div className="flex gap-4">
            <div className="mt-1 relative">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v19l-7-5-7 5V3z"/>
                </svg>
              </div>
              <div className="absolute top-8 bottom-0 left-1/2 w-px bg-gray-200 -translate-x-1/2"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">New Leads Available</h4>
                <span className="text-xs text-gray-500">2m ago</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">New vehicle loan leads have been assigned to your queue.</p>
              <Button 
                className="h-8 px-3 text-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
              >
                View 12 new leads →
              </Button>
            </div>
          </div>
        </div>

        {/* Urgent Loan Alert */}
        <div className="group px-6 py-5 hover:bg-red-50/30 transition-colors relative">
          <div className="flex gap-4">
            <div className="mt-1 relative">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="absolute top-8 bottom-0 left-1/2 w-px bg-gray-200 -translate-x-1/2"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">Overdue Loan Alert</h4>
                  <span className="px-1.5 py-0.5 text-[11px] font-medium bg-red-100 text-red-700 rounded">Urgent</span>
                </div>
                <span className="text-xs text-gray-500">1h ago</span>
              </div>
              <div className="mt-2 p-3 bg-white rounded-lg border border-red-100 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs mb-1">Customer</div>
                  <div className="font-medium text-gray-900">Mr. Ramesh Kumar</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Loan ID</div>
                  <div className="font-medium text-gray-900">VF-2023-09876</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Outstanding</div>
                  <div className="font-medium text-red-600">₹3,20,000</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Overdue</div>
                  <div className="font-medium text-red-600">12+ months</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Last Payment</div>
                  <div className="font-medium text-gray-900">Jan 15, 2023</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">Immediate action required. Please initiate recovery process.</p>
            </div>
          </div>
        </div>

        {/* Interest Rate Update */}
        <div className="group px-6 py-5 hover:bg-green-50/30 transition-colors relative">
          <div className="flex gap-4">
            <div className="mt-1 relative">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">Interest Rate Update</h4>
                <span className="text-xs text-gray-500">2h ago</span>
              </div>
              <p className="text-sm text-gray-600">Vehicle loan interest rates have been updated for February 2025.</p>
              <div className="mt-3 inline-flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-gray-100 rounded font-medium text-gray-700">8.25%</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
                <span className="px-2 py-1 bg-green-100 rounded font-medium text-green-700">8.50%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 