import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface QuickAccessCardProps {
  title: string
  icon: LucideIcon
  bgColor: string
  iconColor: string
  onClick?: () => void
}

export function QuickAccessCard({
  title,
  icon: Icon,
  bgColor,
  iconColor,
  onClick,
}: QuickAccessCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:scale-105 transition-transform duration-200 border-0 shadow-card",
        bgColor
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", `bg-white/20`)}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <h3 className={cn("font-medium text-sm", iconColor)}>{title}</h3>
      </CardContent>
    </Card>
  )
}