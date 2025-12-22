import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, ExternalLink, CheckCircle } from 'lucide-react';

export default function ConnectCardModal({ isOpen, onClose, connectCardUrl, connectorName }) {
  const handleContinueSetup = () => {
    // Redirect to Fivetran Connect Card in a new tab/window or same window
    if (connectCardUrl) {
      window.location.href = connectCardUrl;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-white">
        <DialogHeader className="border-b px-6 py-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle className="text-2xl font-bold">Connect {connectorName}</DialogTitle>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#3551F3]" />
            </div>
          </div>

          {/* Text */}
          <h2 className="text-xl font-semibold text-center mb-3">
            You're almost there!
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Complete the {connectorName} setup to start syncing your data into Astrico.
            You'll be redirected to {connectorName}'s authentication page.
          </p>

          {/* Steps */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-[#3551F3] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Authorize access</p>
                <p className="text-sm text-gray-600">Grant Astrico permission to access your data</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-[#3551F3] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Configure sync settings</p>
                <p className="text-sm text-gray-600">Set up your data sync frequency and tables</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-[#3551F3] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Return to Astrico</p>
                <p className="text-sm text-gray-600">You'll be redirected back to your dashboard</p>
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleContinueSetup}
            className="w-full py-3 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium flex items-center justify-center gap-2"
          >
            Continue to Setup
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Info text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            You'll be securely redirected to {connectorName}'s authentication page
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
