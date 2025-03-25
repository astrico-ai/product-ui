import { useEffect, useState } from "react";
import { Check, FileText, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  text: string;
  duration: number;
}

const steps: Step[] = [
  { text: "Understanding your query...", duration: 1500 },
  { text: "Scanning SOP documents for key insights...", duration: 2000 },
  { text: "Analyzing video content for relevant context...", duration: 2500 },
  { text: "Compiling structured recommendations...", duration: 2000 },
  { text: "Generating response and next best actions...", duration: 2000 }
];

interface LoadingStepsProps {
  onComplete?: () => void;
}

export function LoadingSteps({ onComplete }: LoadingStepsProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let timeoutIds: NodeJS.Timeout[] = [];
    let progressInterval: NodeJS.Timeout;

    // Progress bar animation
    const startTime = Date.now();
    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= totalDuration) {
        clearInterval(progressInterval);
      }
    }, 50);

    // Step progression
    let currentDelay = 0;
    steps.forEach((step, index) => {
      // Start the step
      const startTimeout = setTimeout(() => {
        setCurrentStepIndex(index);
      }, currentDelay);
      timeoutIds.push(startTimeout);

      // Complete the step
      const completeTimeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, index]);
      }, currentDelay + step.duration);
      timeoutIds.push(completeTimeout);

      currentDelay += step.duration;
    });

    // Final state
    const finalTimeout = setTimeout(() => {
      setProgress(100);
      setCompletedSteps([...Array(steps.length)].map((_, i) => i));
      setIsComplete(true);
      onComplete?.();
    }, totalDuration);
    timeoutIds.push(finalTimeout);

    return () => {
      if (!isComplete) {
        timeoutIds.forEach(id => clearTimeout(id));
        clearInterval(progressInterval);
      }
    };
  }, [onComplete]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Sources Section */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Sources being used:</div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-[#EEF0FF] text-[#3551F3] px-3 py-1.5 rounded-md text-sm">
              <FileText className="h-4 w-4" />
              SOP Documents
            </div>
            <div className="flex items-center gap-2 bg-[#EEF0FF] text-[#3551F3] px-3 py-1.5 rounded-md text-sm">
              <Video className="h-4 w-4" />
              RBL Video Files
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Processing your request</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-[#EEF0FF] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#3551F3] transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = currentStepIndex === index;
            const isCompleted = completedSteps.includes(index);
            const isUpcoming = index > currentStepIndex;

            return (
              <div
                key={index}
                className="flex items-center gap-3"
              >
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center transition-colors duration-200",
                  isCompleted && "bg-[#3551F3]",
                  isActive && "bg-[#3551F3]",
                  isUpcoming && "bg-gray-200"
                )}>
                  {isCompleted ? (
                    <Check className="h-3 w-3 text-white" />
                  ) : isActive ? (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </div>
                <span className={cn(
                  "text-sm transition-colors duration-200",
                  isCompleted && "text-muted-foreground",
                  isActive && "text-foreground",
                  isUpcoming && "text-muted-foreground/60"
                )}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 