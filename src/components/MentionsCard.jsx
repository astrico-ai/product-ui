import React from "react";
import { AtSign, CheckCircle2, XCircle } from "lucide-react";

export function MentionsCard() {
  const mentions = [
    {
      id: 1,
      text: "@John Doe is trying to share the CAC dashboard",
      pending: true
    }
  ];

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-200">
      <div className="p-7">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#3551F3]/8 to-[#3551F3]/12 flex items-center justify-center ring-1 ring-[#3551F3]/[0.08]">
              <AtSign className="h-[22px] w-[22px] text-[#3551F3]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Mentions</h3>
              <p className="text-sm text-gray-500">Actions requiring your attention</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {mentions.map((mention) => (
            <div
              key={mention.id}
              className="group px-4 py-3.5 rounded-xl hover:bg-gray-50/75 transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] text-gray-800">
                    <span className="font-medium text-[#3551F3]">@John Doe</span>
                    <span className="text-gray-600"> is trying to share the </span>
                    <span className="font-medium">CAC dashboard</span>
                  </p>
                </div>
                {mention.pending && (
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg text-green-600 hover:bg-green-50/75 transition-all duration-200">
                      <CheckCircle2 className="h-[18px] w-[18px]" />
                    </button>
                    <button className="p-2 rounded-lg text-red-600 hover:bg-red-50/75 transition-all duration-200">
                      <XCircle className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 