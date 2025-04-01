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
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium",
                  isActive && "border-2 border-primary",
                  isCompleted && "bg-primary text-primary-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <h3 className="text-sm font-medium">{step.title}</h3>
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