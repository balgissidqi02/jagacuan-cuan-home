import { useState, useEffect } from "react"
import { Plus, Target, Edit, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/integrations/supabase/client"
import { formatRupiah } from "@/utils/currency"
import { toast } from "sonner"
import { CustomCategoryModal } from "@/components/CustomCategoryModal"

interface SavingGoal {
  goal_id: string
  goal_name: string
  current_amount: number
  target_amount: number
  deadline?: string
  user_id: string
}

export default function GoalsWithCustomCategories() {
  const navigate = useNavigate()
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCustomCategoryModalOpen, setIsCustomCategoryModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    deadline: ''
  })
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchSavingGoals()
      
      // Setup realtime subscription
      const channel = supabase
        .channel('saving-goals-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'saving_goals' },
          () => fetchSavingGoals()
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

  const fetchSavingGoals = async () => {
    if (!userId) return
    
    try {
      const { data, error } = await supabase
        .from('saving_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavingGoals(data || [])
    } catch (error) {
      console.error('Error fetching saving goals:', error)
      toast.error('Failed to load saving goals')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) return

    try {
      const { error } = await supabase
        .from('saving_goals')
        .insert({
          goal_name: formData.goal_name,
          target_amount: parseFloat(formData.target_amount),
          deadline: formData.deadline || null,
          current_amount: 0,
          user_id: userId
        })

      if (error) throw error
      
      toast.success('Saving goal added successfully!')
      setIsModalOpen(false)
      setFormData({ goal_name: '', target_amount: '', deadline: '' })
    } catch (error) {
      console.error('Error adding saving goal:', error)
      toast.error('Failed to add saving goal')
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">Set and track your financial objectives</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsCustomCategoryModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Custom Category
          </Button>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Saving Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="goal_name">Goal Name</Label>
                  <Input
                    id="goal_name"
                    value={formData.goal_name}
                    onChange={(e) => setFormData({...formData, goal_name: e.target.value})}
                    placeholder="e.g., Emergency Fund"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                    placeholder="0"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Goal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Saving Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingGoals.map((goal) => {
          const progressPercentage = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
          const remaining = goal.target_amount - goal.current_amount

          return (
            <Card key={goal.goal_id} className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{goal.goal_name}</span>
                  <Target className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saved</span>
                  <span className="text-foreground font-medium">
                    {formatRupiah(goal.current_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="text-foreground">{formatRupiah(goal.target_amount)}</span>
                </div>
                <Progress 
                  value={Math.min(progressPercentage, 100)} 
                  className="w-full"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {Math.round(progressPercentage)}%
                  </span>
                  <span className="text-primary font-medium">
                    {remaining > 0 ? formatRupiah(remaining) + ' to go' : 'Goal Achieved! 🎉'}
                  </span>
                </div>
                {goal.deadline && (
                  <div className="text-xs text-muted-foreground">
                    Deadline: {new Date(goal.deadline).toLocaleDateString('id-ID')}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {savingGoals.length === 0 && (
        <Card className="rounded-2xl shadow-soft p-12 text-center">
          <div className="text-muted-foreground">
            <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Saving Goals Yet</h3>
            <p className="text-sm">Create your first saving goal to start tracking your financial progress</p>
          </div>
        </Card>
      )}

      <CustomCategoryModal
        isOpen={isCustomCategoryModalOpen}
        onClose={() => setIsCustomCategoryModalOpen(false)}
        onSuccess={() => {
          // Optionally refresh data or navigate somewhere
        }}
      />
    </div>
  )
}