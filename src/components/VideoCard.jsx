import React from "react";
import { Card } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";

export function VideoCard({ title, description, teamLabel, actionLabel }) {
  return (
    <Card className="overflow-hidden bg-white">
      <div className="relative aspect-video bg-[#EEF2FF] flex items-center justify-center group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <PlayCircle className="w-16 h-16 text-[#3551F3] group-hover:scale-110 transition-transform" />
      </div>
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-[#3551F3] text-sm font-medium">{teamLabel}</span>
          <button className="text-[#3551F3] text-sm font-medium hover:text-[#2B41D9] transition-colors">
            {actionLabel}
          </button>
        </div>
      </div>
    </Card>
  );
} 