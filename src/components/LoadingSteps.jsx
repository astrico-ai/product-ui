import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

function LoadingSteps({ steps, currentStep }) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;

        return (
          <div key={step.title} className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-all",
                  isCompleted && "bg-[#4F46E5] text-white",
                  isActive && "bg-white border-2 border-[#4F46E5] text-[#4F46E5]",
                  !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <h3 className="text-[15px] font-normal text-gray-900">{step.title}</h3>
            </div>
            {step.description && (
              <p className="text-sm text-muted-foreground pl-8">
                {step.description}
              </p>
            )}
            {isActive && step.content && (
              <div className="pl-8 pt-2">{step.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { LoadingSteps }; 