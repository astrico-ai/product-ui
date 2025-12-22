import React, { useEffect } from 'react';
import { CheckCircle, Zap, TrendingUp } from 'lucide-react';

// Simple confetti animation using CSS
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: '8px',
            height: '8px',
            background: ['#3551F3', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 4)],
            borderRadius: '50%',
            animation: `fall ${2 + Math.random() * 1}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export function SuccessCelebration() {
  useEffect(() => {
    // Play a subtle success sound (optional)
    // new Audio('/success.mp3').play();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <Confetti />

      {/* Success Icon */}
      <div className="mb-6 animate-in zoom-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
          <CheckCircle className="w-20 h-20 text-green-500 relative" />
        </div>
      </div>

      {/* Success Title */}
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Connector Setup Complete!
      </h2>
      <p className="text-gray-600 mb-8 max-w-sm">
        Your connector is now active and ready to sync data
      </p>

      {/* Next Steps */}
      <div className="space-y-4 mb-8 w-full">
        {/* First Sync */}
        <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="p-2 bg-blue-500 rounded-lg text-white flex-shrink-0 mt-1">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-medium text-blue-900">First Sync Starting</p>
            <p className="text-sm text-blue-700 mt-1">
              Your initial data sync will begin immediately and complete in ~15 minutes
            </p>
          </div>
        </div>

        {/* Real-time Updates */}
        <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-100 rounded-lg">
          <div className="p-2 bg-green-500 rounded-lg text-white flex-shrink-0 mt-1">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-medium text-green-900">Live Syncing</p>
            <p className="text-sm text-green-700 mt-1">
              Data will sync automatically every hour. You can adjust frequency in settings
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 w-full">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">5</p>
          <p className="text-xs text-gray-600 mt-1">Tables</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">125K</p>
          <p className="text-xs text-gray-600 mt-1">Rows/Sync</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">15min</p>
          <p className="text-xs text-gray-600 mt-1">Est. Time</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg w-full mb-4">
        <p className="text-xs text-gray-600">
          💡 You can monitor the sync progress, view history, and adjust settings from your
          connector dashboard
        </p>
      </div>

      {/* Actions will be in the wizard footer */}
      <div className="text-sm text-gray-500">
        Click "Go to Dashboard" below to view your connected connector
      </div>
    </div>
  );
}
