import { Check, X, Download } from "lucide-react";

interface TrainingItemProps {
  title: string;
  isCompleted?: boolean;
  isFailed?: boolean;
}

const TrainingItem = ({ title, isCompleted, isFailed }: TrainingItemProps) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-secondary/50 rounded-lg mb-2 hover:bg-secondary transition-colors">
      <span className="text-sm font-medium">{title}</span>
      <div className="flex items-center gap-2">
        {isCompleted && (
          <span className="badge-success flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>Completed</span>
          </span>
        )}
        {isFailed && (
          <span className="badge-error flex items-center gap-1">
            <X className="h-3 w-3" />
            <span>Failed</span>
          </span>
        )}
        {(isCompleted || isFailed) && (
          <button className="rounded-full p-1 hover:bg-white/80 transition-colors">
            <Download className="h-4 w-4 text-navy-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export function TrainingCard() {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold mb-2">Training Resources</h3>
      <p className="text-sm text-gray-600">Access your training materials and courses here.</p>
      <div className="mt-4">
        <TrainingItem 
          title="Customer Service Excellence" 
          isCompleted={true}
        />
        <TrainingItem 
          title="Product Knowledge" 
          isFailed={true}
        />
        <TrainingItem 
          title="Sales Techniques" 
          isCompleted={true}
        />
      </div>
    </div>
  );
}
