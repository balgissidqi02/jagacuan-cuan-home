import { useState, useEffect } from "react"
import { Plus, Wallet } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabaseClient"
import { formatRupiah } from "@/utils/currency"
import { toast } from "sonner"

interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  user_id: string
  notes?: string
}

const categoryColors = {
  "Food & Drinks": "bg-orange-500",
  "Transportation": "bg-blue-500", 
  "Shopping": "bg-pink-500",
  "Health & Fitness": "bg-green-500",
  "Entertainment": "bg-purple-500",
  "Bills": "bg-yellow-500",
  "Other": "bg-gray-500"
}

export default function Budgeting() {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  // Get user from auth
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchBudgets()
      
      // Setup realtime subscription
      const channel = supabase
        .channel('budgeting-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'budgeting' },
          () => fetchBudgets()
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [userId])

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      navigate('/login')
      return
    }
    setUserId(user.id)
  }

  const fetchBudgets = async () => {
    if (!userId) return
    
    try {
      const { data, error } = await supabase
        .from('budgeting')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBudgets(data || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }


  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const remaining = totalBudget - totalSpent

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budget Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your spending categories</p>
        </div>
        
        <Button 
          className="flex items-center gap-2"
          onClick={() => navigate('/add-budget')}
        >
          <Plus className="h-4 w-4" />
          Add Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatRupiah(totalBudget)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatRupiah(totalSpent)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatRupiah(remaining)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} className="w-full" />
            <p className="text-xs text-muted-foreground mt-2">
              {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% of budget used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const progressPercentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
          const isOverBudget = budget.spent > budget.amount
          const colorClass = categoryColors[budget.category as keyof typeof categoryColors] || categoryColors.Other

          return (
            <Card key={budget.id} className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{budget.category}</span>
                    {budget.notes && (
                      <span className="text-sm text-muted-foreground">({budget.notes})</span>
                    )}
                  </div>
                  <div className={`w-4 h-4 rounded-full ${colorClass}`}></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-foreground'}>
                    {formatRupiah(budget.spent)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="text-foreground">{formatRupiah(budget.amount)}</span>
                </div>
                <Progress 
                  value={Math.min(progressPercentage, 100)} 
                  className="w-full"
                />
                <div className="flex justify-between text-xs">
                  <span className={`${isOverBudget ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {Math.round(progressPercentage)}%
                  </span>
                  <span className={`${isOverBudget ? 'text-red-600 font-medium' : 'text-green-600'}`}>
                    {isOverBudget ? 'Over Budget!' : formatRupiah(budget.amount - budget.spent) + ' left'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <Card className="rounded-2xl shadow-soft p-12 text-center">
          <div className="text-muted-foreground">
            <Wallet className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Belum ada budget</h3>
            <p className="text-sm">Tambahkan budget pertama untuk mulai melacak pengeluaran Anda</p>
          </div>
        </Card>
      )}
    </div>
  )
}