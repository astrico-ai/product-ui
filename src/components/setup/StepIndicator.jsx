import React from 'react';
import { Check } from 'lucide-react';
import { useSetupWizardStore } from '@/stores/useSetupWizardStore';
import { cn } from '@/lib/utils';

export function StepIndicator() {
  const { getSteps, currentStep, isStepCompleted } = useSetupWizardStore();
  const steps = getSteps();

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          {/* Step Circle */}
          <div className="flex flex-col items-center flex-1">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                isStepCompleted(step.id)
                  ? 'bg-green-500 text-white'
                  : step.id === currentStep
                    ? 'bg-[#3551F3] text-white ring-2 ring-blue-300'
                    : 'bg-gray-200 text-gray-600'
              )}
            >
              {isStepCompleted(step.id) ? (
                <Check className="w-5 h-5" />
              ) : (
                step.order + 1
              )}
            </div>
            <p
              className={cn(
                'text-xs font-medium mt-2',
                step.id === currentStep
                  ? 'text-[#3551F3]'
                  : 'text-gray-600'
              )}
            >
              {step.label}
            </p>
          </div>

          {/* Connector Line */}
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'h-1 mx-2 mb-6 transition-all',
                isStepCompleted(step.id)
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              )}
              style={{ flex: '1', marginBottom: '24px' }}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
