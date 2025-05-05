import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number;
  showText?: boolean;
  className?: string;
}

export default function ProgressBar({ progress, showText = true, className }: ProgressBarProps) {
  return (
    <div className={className}>
      <Progress value={progress} className="h-2" />
      {showText && (
        <div className="flex justify-between text-xs mt-1 text-dark/60">
          <span>{progress}% complete</span>
        </div>
      )}
    </div>
  );
}
