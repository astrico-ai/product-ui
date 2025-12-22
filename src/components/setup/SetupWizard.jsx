import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { useSetupWizardStore } from '@/stores/useSetupWizardStore';
import { useConnectorStore } from '@/stores/useConnectorStore';
import { StepIndicator } from './StepIndicator';
import { OAuthConnection } from './OAuthConnection';
import { SchemaConfiguration } from './SchemaConfiguration';
import { SyncSettings } from './SyncSettings';
import { ReviewAndConfirm } from './ReviewAndConfirm';
import { SuccessCelebration } from './SuccessCelebration';

const stepComponents = {
  oauth: OAuthConnection,
  schema: SchemaConfiguration,
  sync: SyncSettings,
  review: ReviewAndConfirm,
  success: SuccessCelebration,
};

export function SetupWizard({ connectorTypeId, onClose }) {
  const navigate = useNavigate();
  const { currentStep, initialize, nextStep, previousStep, getFormData, reset } =
    useSetupWizardStore();
  const { createConnector } = useConnectorStore();

  useEffect(() => {
    if (connectorTypeId) {
      initialize(connectorTypeId);
    }

    return () => {
      reset();
    };
  }, [connectorTypeId]);

  const handleClose = () => {
    reset();
    onClose?.();
    navigate('/connectors');
  };

  const handleFinish = async () => {
    try {
      const formData = getFormData();
      await createConnector(formData);
      navigate('/connectors/dashboard');
    } catch (error) {
      console.error('Failed to create connector:', error);
    }
  };

  const StepComponent = stepComponents[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Setup Connector</h1>
            <p className="text-sm text-gray-600 mt-1">
              Follow the steps to connect your data source
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="border-b border-gray-200 px-6 py-4">
          <StepIndicator />
        </div>

        {/* Step Content */}
        <div className="p-6 min-h-[400px]">
          {StepComponent && (
            <StepComponent onNext={nextStep} onPrev={previousStep} />
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between">
          <button
            onClick={previousStep}
            disabled={currentStep === 'oauth'}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {currentStep === 'success' ? (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-[#3551F3] text-white rounded-lg hover:bg-[#2B41D9] transition-colors font-medium"
            >
              {currentStep === 'review' ? 'Confirm' : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
