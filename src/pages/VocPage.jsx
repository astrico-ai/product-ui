import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

function VocPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check if VOC app is running
    const checkVocApp = async () => {
      try {
        const response = await fetch('http://localhost:5174', {
          method: 'HEAD',
          mode: 'no-cors'
        });
        setIsLoading(false);
      } catch (error) {
        setHasError(true);
        setIsLoading(false);
      }
    };

    const timer = setTimeout(checkVocApp, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (hasError) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-50 rounded-full">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            VOC App Not Running
          </h2>
          <p className="text-gray-600 mb-4">
            The Voice of Customer application needs to be started separately.
          </p>
          <div className="bg-gray-50 rounded-md p-4 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">To start the VOC app:</p>
            <code className="text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded block">
              npm run dev:voc
            </code>
            <p className="text-sm text-gray-600 mt-3">Or run both apps together:</p>
            <code className="text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded block mt-1">
              npm run dev:all
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
      {isLoading && (
        <div className="h-full w-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Voice of Customer...</p>
          </div>
        </div>
      )}
      <iframe
        src="http://localhost:5174"
        title="Voice of Customer Dashboard"
        className="w-full h-full border-0"
        allow="fullscreen"
        onLoad={() => setIsLoading(false)}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
}

export default VocPage;
