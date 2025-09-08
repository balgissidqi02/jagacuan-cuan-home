import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  color?: string
}

export function ProgressBar({ value, max, className, color = "bg-savings" }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className={cn("w-full bg-muted rounded-full h-3", className)}>
      <div
        className={cn("h-3 rounded-full transition-all duration-300", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}