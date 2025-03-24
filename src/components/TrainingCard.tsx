
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
    <div className="rounded-xl border bg-card shadow-subtle overflow-hidden animate-fade-in">
      <div className="p-5 border-b">
        <h3 className="text-lg font-semibold">AI Training Module</h3>
        <p className="text-muted-foreground text-sm mt-1">Enhance your skill with these essential training topics</p>
      </div>
      <div className="p-4">
        <TrainingItem title="Negotiating Two-Wheeler Interest Rates" isCompleted />
        <TrainingItem title="Handling Angry Customers for Tractor Loans" isFailed />
        <TrainingItem title="Building Trust with Rural Customers" isCompleted />
        <TrainingItem title="Effective Loan Recovery Strategies" isCompleted />
      </div>
    </div>
  );
}
