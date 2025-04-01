import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";

export function TrainingCard() {
  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-6 pb-4 bg-gradient-to-r from-purple-50 to-pink-50/50">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Training Resources</h3>
            <p className="text-sm text-gray-500">Access your training materials and courses</p>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4">
        <div className="space-y-4">
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
    </div>
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
    </div>
  );
} 