import { Button } from "@/components/ui/button"
import { Edit3, Camera } from "lucide-react"

interface SpendingMethodSelectorProps {
  onMethodSelect: (method: 'manual' | 'photo') => void
}

export function SpendingMethodSelector({ onMethodSelect }: SpendingMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Choose how you want to add your spending:</p>
      
      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={() => onMethodSelect('manual')}
          variant="outline"
          className="h-16 flex flex-col gap-2 hover:bg-expense/10 hover:border-expense"
        >
          <Edit3 className="h-6 w-6" />
          <span>Manual Entry</span>
        </Button>

        <Button
          onClick={() => onMethodSelect('photo')}
          variant="outline"
          className="h-16 flex flex-col gap-2 hover:bg-expense/10 hover:border-expense"
        >
          <Camera className="h-6 w-6" />
          <span>Upload Receipt Photo</span>
        </Button>
      </div>
    </div>
  )
}