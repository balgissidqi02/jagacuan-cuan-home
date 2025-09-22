import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { formatRupiah } from "@/utils/currency"
import { toast } from "sonner"

interface Budget {
  id: string
  category: string
  amount: number
  spent: number
}

interface SpendingItem {
  id: string
  budget_id: string
  description: string
  amount: number
  created_at: string
  budgeting: Budget
}

export default function SpendingTracker() {
  const [spendings, setSpendings] = useState<SpendingItem[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    budget_id: "",
    description: "",
    amount: ""
  })
  const [loading, setLoading] = useState(true)

  // Get user from auth
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchData()
      
      // Setup realtime subscriptions
      const spendingChannel = supabase
        .channel('spending-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'spending_tracker' },
          () => fetchData()
        )
        .subscribe()

      const budgetChannel = supabase
        .channel('budget-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'budgeting' },
          () => fetchData()
        )
        .subscribe()

      return () => {
        supabase.removeChannel(spendingChannel)
        supabase.removeChannel(budgetChannel)
      }
    }
  }, [userId])

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      console.error('User not authenticated:', error)
      return
    }
    setUserId(user.id)
  }

  const fetchData = async () => {
    if (!userId) return
    
    try {
      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgeting')
        .select('*')
        .eq('user_id', userId)

      if (budgetsError) throw budgetsError
      setBudgets(budgetsData || [])

      // Fetch spending with budget info
      const { data: spendingsData, error: spendingsError } = await supabase
        .from('spending_tracker')
        .select(`
          *,
          budgeting (
            id,
            category,
            amount,
            spent
          )
        `)
        .in('budget_id', (budgetsData || []).map(b => b.id))
        .order('created_at', { ascending: false })

      if (spendingsError) throw spendingsError
      setSpendings(spendingsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('spending_tracker')
        .insert({
          budget_id: formData.budget_id,
          description: formData.description,
          amount: parseFloat(formData.amount)
        })

      if (error) throw error
      
      toast.success('Spending added successfully!')
      setIsModalOpen(false)
      setFormData({ budget_id: "", description: "", amount: "" })
    } catch (error) {
      console.error('Error adding spending:', error)
      toast.error('Failed to add spending')
    }
  }

  const groupedSpendings = spendings.reduce((groups, spending) => {
    const category = spending.budgeting.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(spending)
    return groups
  }, {} as Record<string, SpendingItem[]>)

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Spending Tracker</h1>
          <p className="text-muted-foreground mt-1">Track expenses by category</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={budgets.length === 0}>
              <Plus className="h-4 w-4" />
              Add Spending
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Spending</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="budget_id">Category</Label>
                <Select 
                  value={formData.budget_id} 
                  onValueChange={(value) => setFormData({...formData, budget_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgets.map((budget) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {budget.category} ({formatRupiah(budget.amount - budget.spent)} left)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What did you spend on?"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <Button type="submit" className="w-full">
                Add Spending
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {budgets.length === 0 && (
        <Card className="rounded-2xl shadow-soft p-12 text-center">
          <div className="text-muted-foreground">
            <Plus className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No budget categories</h3>
            <p className="text-sm">Create budget categories first to track spending</p>
          </div>
        </Card>
      )}

      {/* Spending by Category */}
      <div className="space-y-6">
        {Object.entries(groupedSpendings).map(([category, items]) => (
          <Card key={category} className="rounded-2xl shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((spending) => (
                  <div key={spending.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{spending.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(spending.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatRupiah(spending.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {spendings.length === 0 && budgets.length > 0 && (
        <Card className="rounded-2xl shadow-soft p-12 text-center">
          <div className="text-muted-foreground">
            <Plus className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No spending recorded</h3>
            <p className="text-sm">Start tracking your expenses by adding your first spending</p>
          </div>
        </Card>
      )}
    </div>
  )
}