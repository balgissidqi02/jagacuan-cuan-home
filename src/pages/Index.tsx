import { useState, useEffect } from "react"
import { DashboardCard } from "@/components/DashboardCard"
import { QuickAccessCard } from "@/components/QuickAccessCard"
import { ExpenseChart } from "@/components/ExpenseChart"
import { ProgressBar } from "@/components/ProgressBar"
import { Button } from "@/components/ui/button"
import { formatRupiah, formatRupiahShort } from "@/utils/currency"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
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
  const navigate = useNavigate()
  const [userName, setUserName] = useState("User")
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [currentSavings, setCurrentSavings] = useState(0)
  const [savingsGoal, setSavingsGoal] = useState(0)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchUserData()
    
    // Setup realtime subscriptions
    const budgetChannel = supabase
      .channel('dashboard-budget-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'budgeting' },
        () => fetchUserData()
      )
      .subscribe()

    const transactionChannel = supabase
      .channel('dashboard-transaction-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        () => fetchUserData()
      )
      .subscribe()

    const savingGoalsChannel = supabase
      .channel('dashboard-saving-goals-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'saving_goals' },
        () => fetchUserData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(budgetChannel)
      supabase.removeChannel(transactionChannel)
      supabase.removeChannel(savingGoalsChannel)
    }
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('User not authenticated:', userError)
        navigate('/login')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

      if (profile?.name) {
        setUserName(profile.name)
      }

      // Get budget data
      const { data: budgets } = await supabase
        .from('budgeting')
        .select('amount, spent')
        .eq('user_id', user.id)

      if (budgets) {
        const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0)
        const totalSpentAmount = budgets.reduce((sum, budget) => sum + budget.spent, 0)
        setTotalBudget(totalBudgetAmount)
        setTotalSpent(totalSpentAmount)
        setMonthlyExpenses(totalSpentAmount)
      }

      // Get saving goals
      const { data: savingGoals } = await supabase
        .from('saving_goals')
        .select('current_amount, target_amount')
        .eq('user_id', user.id)

      if (savingGoals && savingGoals.length > 0) {
        const totalCurrentSavings = savingGoals.reduce((sum, goal) => sum + goal.current_amount, 0)
        const totalTargetSavings = savingGoals.reduce((sum, goal) => sum + goal.target_amount, 0)
        setCurrentSavings(totalCurrentSavings)
        setSavingsGoal(totalTargetSavings)
      }

    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const savingsProgress = savingsGoal > 0 ? (currentSavings / savingsGoal) * 100 : 0

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
              Welcome, {userName}! 🤑
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
            subtitle={`Current spending total`}
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
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => navigate('/spending')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          <Button 
            variant="outline" 
            className="border-income text-income hover:bg-income/10"
            onClick={() => navigate('/spending')}
          >
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
                url={item.url}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
};

export default Index;
