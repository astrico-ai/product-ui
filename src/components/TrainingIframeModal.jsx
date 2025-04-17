import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrainingIframeModal({ isOpen, onClose, scenario }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      <div className="fixed inset-4 bg-white rounded-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 hover:bg-gray-100 text-gray-500"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 w-full h-full min-h-0">
          <iframe
            src="https://ebek.astrico.ai/agent"
            className="w-full h-full"
            frameBorder="0"
            allow="camera; microphone; display-capture; fullscreen; autoplay"
            allowFullScreen
            title="Training Scenario"
          />
        </div>
      </div>
    </div>
  );
} 