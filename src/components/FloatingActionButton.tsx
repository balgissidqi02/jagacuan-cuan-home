import { useState } from "react"
import { Plus, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  onAddIncome: () => void
  onAddSpending: () => void
}

export function FloatingActionButton({ onAddIncome, onAddSpending }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleIncome = () => {
    onAddIncome()
    setIsOpen(false)
  }

  const handleSpending = () => {
    onAddSpending()
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Menu Options */}
      <div className={cn(
        "flex flex-col gap-3 mb-4 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {/* Add Income */}
        <Button
          onClick={handleIncome}
          className="bg-income hover:bg-income/90 text-white shadow-lg h-12 px-6 rounded-full"
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          Add Income
        </Button>

        {/* Add Spending */}
        <Button
          onClick={handleSpending}
          className="bg-expense hover:bg-expense/90 text-white shadow-lg h-12 px-6 rounded-full"
        >
          <TrendingDown className="h-5 w-5 mr-2" />
          Add Spending
        </Button>
      </div>

      {/* Main FAB */}
      <Button
        onClick={toggleMenu}
        className={cn(
          "w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform duration-300",
          isOpen && "rotate-45"
        )}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}