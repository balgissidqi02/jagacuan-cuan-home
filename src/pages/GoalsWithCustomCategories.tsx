import { useState, useEffect } from "react"
import { Plus, Target, History, Pencil, CheckCircle } from "lucide-react"
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

interface GoalHistoryItem {
  history_id: string
  amount_added: number
  previous_amount: number
  new_amount: number
  notes: string | null
  created_at: string
}

export default function GoalsWithCustomCategories() {
  const navigate = useNavigate()
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCustomCategoryModalOpen, setIsCustomCategoryModalOpen] = useState(false)
  const [formData, setFormData] = useState({ goal_name: '', target_amount: '', deadline: '' })
  const [userId, setUserId] = useState<string | null>(null)

  // Update modal
  const [updatingGoal, setUpdatingGoal] = useState<SavingGoal | null>(null)
  const [updateAmount, setUpdateAmount] = useState("")
  const [updateNotes, setUpdateNotes] = useState("")
  const [updateSaving, setUpdateSaving] = useState(false)

  // History modal
  const [historyGoal, setHistoryGoal] = useState<SavingGoal | null>(null)
  const [historyItems, setHistoryItems] = useState<GoalHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => { getCurrentUser() }, [])

  useEffect(() => {
    if (userId) {
      fetchSavingGoals()
      const channel = supabase
        .channel('saving-goals-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'saving_goals' }, () => fetchSavingGoals())
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [userId])

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) { navigate('/login'); return }
    setUserId(user.id)
  }

  const fetchSavingGoals = async () => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('saving_goals')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      setSavingGoals(data || [])
    } catch (error) {
      console.error('Error fetching saving goals:', error)
      toast.error('Gagal memuat saving goals')
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
      toast.success('Goal berhasil ditambahkan!')
      setIsModalOpen(false)
      setFormData({ goal_name: '', target_amount: '', deadline: '' })
    } catch (error) {
      console.error('Error adding saving goal:', error)
      toast.error('Gagal menambahkan goal')
    }
  }

  const handleUpdate = async () => {
    if (!updatingGoal || !userId) return
    const amountToAdd = parseFloat(updateAmount)
    if (!amountToAdd || amountToAdd <= 0) {
      toast.error('Masukkan jumlah yang valid')
      return
    }
    setUpdateSaving(true)
    try {
      const newAmount = updatingGoal.current_amount + amountToAdd

      // Insert history
      const { error: histError } = await supabase
        .from('saving_goals_history')
        .insert({
          goal_id: updatingGoal.goal_id,
          user_id: userId,
          amount_added: amountToAdd,
          previous_amount: updatingGoal.current_amount,
          new_amount: newAmount,
          notes: updateNotes || null
        })
      if (histError) throw histError

      // Update goal
      const { error } = await supabase
        .from('saving_goals')
        .update({ current_amount: newAmount, updated_at: new Date().toISOString() })
        .eq('goal_id', updatingGoal.goal_id)
      if (error) throw error

      toast.success('Tabungan berhasil diperbarui!')
      setUpdatingGoal(null)
      setUpdateAmount("")
      setUpdateNotes("")
    } catch (error) {
      console.error('Error updating goal:', error)
      toast.error('Gagal memperbarui tabungan')
    } finally {
      setUpdateSaving(false)
    }
  }

  const openHistory = async (goal: SavingGoal) => {
    setHistoryGoal(goal)
    setHistoryLoading(true)
    try {
      const { data, error } = await supabase
        .from('saving_goals_history')
        .select('*')
        .eq('goal_id', goal.goal_id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setHistoryItems(data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error('Gagal memuat riwayat')
    } finally {
      setHistoryLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">Atur dan lacak tujuan keuanganmu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCustomCategoryModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Custom Category
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Goal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Saving Goal</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Goal Name</Label>
                  <Input value={formData.goal_name} onChange={(e) => setFormData({...formData, goal_name: e.target.value})} placeholder="e.g., Emergency Fund" required />
                </div>
                <div>
                  <Label>Target Amount</Label>
                  <Input type="number" value={formData.target_amount} onChange={(e) => setFormData({...formData, target_amount: e.target.value})} placeholder="0" required min="0" step="0.01" />
                </div>
                <div>
                  <Label>Deadline (Optional)</Label>
                  <Input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                </div>
                <Button type="submit" className="w-full">Add Goal</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Saving Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingGoals.map((goal) => {
          const progressPercentage = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
          const isAchieved = goal.current_amount >= goal.target_amount
          const remaining = goal.target_amount - goal.current_amount

          return (
            <Card
              key={goal.goal_id}
              className={`rounded-2xl shadow-soft transition-all ${isAchieved ? 'opacity-60 bg-muted' : ''}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{goal.goal_name}</span>
                  {isAchieved ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Target className="h-5 w-5 text-primary" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saved</span>
                  <span className="text-foreground font-medium">{formatRupiah(goal.current_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="text-foreground">{formatRupiah(goal.target_amount)}</span>
                </div>
                <Progress value={Math.min(progressPercentage, 100)} className="w-full" />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{Math.round(progressPercentage)}%</span>
                  <span className={`font-medium ${isAchieved ? 'text-green-600' : 'text-primary'}`}>
                    {isAchieved ? 'Goal Achieved! 🎉' : formatRupiah(remaining) + ' to go'}
                  </span>
                </div>
                {goal.deadline && (
                  <div className="text-xs text-muted-foreground">
                    Deadline: {new Date(goal.deadline).toLocaleDateString('id-ID')}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isAchieved}
                    onClick={() => {
                      setUpdatingGoal(goal)
                      setUpdateAmount("")
                      setUpdateNotes("")
                    }}
                  >
                    <Pencil className="h-3 w-3 mr-1" /> Update
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openHistory(goal)}>
                    <History className="h-3 w-3 mr-1" /> History
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {savingGoals.length === 0 && (
        <Card className="rounded-2xl shadow-soft p-12 text-center">
          <div className="text-muted-foreground">
            <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Belum Ada Saving Goal</h3>
            <p className="text-sm">Buat saving goal pertamamu untuk mulai melacak progres keuanganmu</p>
          </div>
        </Card>
      )}

      {/* Update Modal */}
      <Dialog open={!!updatingGoal} onOpenChange={(open) => !open && setUpdatingGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tabungan: {updatingGoal?.goal_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Saldo saat ini: {formatRupiah(updatingGoal?.current_amount || 0)} / {formatRupiah(updatingGoal?.target_amount || 0)}
            </div>
            <div>
              <Label>Jumlah yang ditambahkan</Label>
              <Input type="number" value={updateAmount} onChange={(e) => setUpdateAmount(e.target.value)} placeholder="0" min="0" step="0.01" />
            </div>
            <div>
              <Label>Catatan (opsional)</Label>
              <Input value={updateNotes} onChange={(e) => setUpdateNotes(e.target.value)} placeholder="e.g., Dari gaji bulan ini" />
            </div>
            <Button onClick={handleUpdate} disabled={updateSaving} className="w-full">
              {updateSaving ? 'Menyimpan...' : 'Tambah Tabungan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={!!historyGoal} onOpenChange={(open) => !open && setHistoryGoal(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Riwayat: {historyGoal?.goal_name}</DialogTitle>
          </DialogHeader>
          {historyLoading ? (
            <p className="text-center text-muted-foreground py-4">Loading...</p>
          ) : historyItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Belum ada riwayat</p>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div key={item.history_id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-green-600">+{formatRupiah(item.amount_added)}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatRupiah(item.previous_amount)} → {formatRupiah(item.new_amount)}
                  </p>
                  {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CustomCategoryModal
        isOpen={isCustomCategoryModalOpen}
        onClose={() => setIsCustomCategoryModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  )
}
