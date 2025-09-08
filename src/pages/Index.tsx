import { useState } from "react"
import { DashboardCard } from "@/components/DashboardCard"
import { QuickAccessCard } from "@/components/QuickAccessCard"
import { ExpenseChart } from "@/components/ExpenseChart"
import { ProgressBar } from "@/components/ProgressBar"
import { Button } from "@/components/ui/button"
import { formatRupiah, formatRupiahShort } from "@/utils/currency"
import { 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  DollarSign, 
  Target, 
  Trophy, 
  GraduationCap 
} from "lucide-react"

const Index = () => {
  const [userName] = useState("Alex")
  
  // Sample data
  const monthlyExpenses = 12500000 // Rp 12.5M
  const expenseChange = -15 // -15% from last month
  const currentSavings = 14000000 // Rp 14M
  const savingsGoal = 20000000 // Rp 20M
  const savingsProgress = (currentSavings / savingsGoal) * 100

  const quickAccessItems = [
    {
      title: "Budgeting",
      icon: DollarSign,
      bgColor: "bg-budgeting-bg",
      iconColor: "text-budgeting-color",
      url: "/budgeting"
    },
    {
      title: "Spending",
      icon: TrendingDown,
      bgColor: "bg-spending-bg", 
      iconColor: "text-spending-color",
      url: "/spending"
    },
    {
      title: "Goals",
      icon: Target,
      bgColor: "bg-goals-bg",
      iconColor: "text-goals-color", 
      url: "/goals"
    },
    {
      title: "Education",
      icon: GraduationCap,
      bgColor: "bg-education-bg",
      iconColor: "text-education-color",
      url: "/education"
    },
    {
      title: "Challenges",
      icon: Trophy,
      bgColor: "bg-challenges-bg",
      iconColor: "text-challenges-color",
      url: "/challenges"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Good Morning, {userName}! 🤑
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to take control of your finances today?
            </p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Expenses */}
          <DashboardCard
            title="Monthly Expenses"
            value={formatRupiahShort(monthlyExpenses)}
            subtitle={`${expenseChange}% from last month`}
            icon={
              <div className="w-10 h-10 bg-expense/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-expense" />
              </div>
            }
          >
            <div className="mt-4">
              <ExpenseChart />
            </div>
          </DashboardCard>

          {/* Savings Goal */}
          <DashboardCard
            title="Savings Goal"
            value={`${formatRupiahShort(currentSavings)} saved`}
            subtitle={`of ${formatRupiahShort(savingsGoal)} goal`}
            icon={
              <div className="w-10 h-10 bg-savings/10 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-savings" />
              </div>
            }
          >
            <div className="mt-4 space-y-2">
              <ProgressBar 
                value={currentSavings} 
                max={savingsGoal} 
                color="bg-savings"
              />
              <div className="flex justify-between text-xs">
                <span className="text-savings font-medium">
                  {Math.round(savingsProgress)}% Complete
                </span>
                <span className="text-muted-foreground">
                  Almost there! 🎯
                </span>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          <Button variant="outline" className="border-income text-income hover:bg-income/10">
            <TrendingUp className="h-4 w-4 mr-2" />
            Add Income
          </Button>
        </div>

        {/* Quick Access */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {quickAccessItems.map((item) => (
              <QuickAccessCard
                key={item.title}
                title={item.title}
                icon={item.icon}
                bgColor={item.bgColor}
                iconColor={item.iconColor}
                onClick={() => {
                  // Navigation would go here
                  console.log(`Navigate to ${item.url}`)
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
};

export default Index;
