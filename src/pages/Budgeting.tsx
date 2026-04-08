import { useState, useEffect } from "react"
import { Plus, Wallet, Pencil, Trash2, History, X, Save } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { formatRupiah } from "@/utils/currency"
import { toast } from "sonner"

interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  user_id: string
  notes?: string
  period?: string
}

interface BudgetHistoryItem {
  history_id: string
  amount_changed: number
  previous_spent: number
  new_spent: number
  notes: string | null
  created_at: string
}

export default function Budgeting() {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Edit modal state
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [editData, setEditData] = useState({ amount: "", notes: "" })
  const [editSaving, setEditSaving] = useState(false)

  // History modal state
  const [historyBudget, setHistoryBudget] = useState<Budget | null>(null)
  const [historyItems, setHistoryItems] = useState<BudgetHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => { getCurrentUser() }, [])

  useEffect(() => {
    if (userId) {
      fetchBudgets()
      const channel = supabase
        .channel('budgeting-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'budgeting' }, () => fetchBudgets())
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [userId])

  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) { navigate('/login'); return }
    setUserId(user.id)
  }

  const fetchBudgets = async () => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('budgeting')
        .select('*')
        .eq('user_id', userId)
        .is('delete_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      setBudgets(data || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast.error('Gagal memuat budget')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (budget: Budget) => {
    if (!confirm(`Hapus budget "${budget.category}"?`)) return
    try {
      const { error } = await supabase
        .from('budgeting')
        .update({ delete_at: new Date().toISOString() })
        .eq('id', budget.id)
      if (error) throw error
      toast.success('Budget berhasil dihapus')
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error('Gagal menghapus budget')
    }
  }

  const openEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setEditData({ amount: budget.amount.toString(), notes: budget.notes || "" })
  }

  const handleUpdate = async () => {
    if (!editingBudget) return
    setEditSaving(true)
    try {
      const { error } = await supabase
        .from('budgeting')
        .update({
          amount: parseFloat(editData.amount),
          notes: editData.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingBudget.id)
      if (error) throw error
      toast.success('Budget berhasil diperbarui')
      setEditingBudget(null)
    } catch (error) {
      console.error('Error updating budget:', error)
      toast.error('Gagal memperbarui budget')
    } finally {
      setEditSaving(false)
    }
  }

  const openHistory = async (budget: Budget) => {
    setHistoryBudget(budget)
    setHistoryLoading(true)
    try {
      const { data, error } = await supabase
        .from('budgeting_history')
        .select('*')
        .eq('budget_id', budget.id)
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

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0)
  const remaining = totalBudget - totalSpent

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budget Overview</h1>
          <p className="text-muted-foreground mt-1">Kelola kategori pengeluaranmu</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => navigate('/add-budget')}>
          <Plus className="h-4 w-4" /> Add Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-foreground">{formatRupiah(totalBudget)}</div></CardContent>
        </Card>
        <Card className="rounded-2xl shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-foreground">{formatRupiah(totalSpent)}</div></CardContent>
        </Card>
        <Card className="rounded-2xl shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatRupiah(remaining)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle></CardHeader>
          <CardContent>
            <Progress value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} className="w-full" />
            <p className="text-xs text-muted-foreground mt-2">{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% of budget used</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const progressPercentage = budget.amount > 0 ? ((budget.spent || 0) / budget.amount) * 100 : 0
          const isOverBudget = (budget.spent || 0) > budget.amount

          return (
            <Card key={budget.id} className="rounded-2xl shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{budget.category}</span>
                    {budget.notes && <span className="text-sm text-muted-foreground">({budget.notes})</span>}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-foreground'}>{formatRupiah(budget.spent || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="text-foreground">{formatRupiah(budget.amount)}</span>
                </div>
                <Progress value={Math.min(progressPercentage, 100)} className="w-full" />
                <div className="flex justify-between text-xs">
                  <span className={isOverBudget ? 'text-red-600' : 'text-muted-foreground'}>{Math.round(progressPercentage)}%</span>
                  <span className={isOverBudget ? 'text-red-600 font-medium' : 'text-green-600'}>
                    {isOverBudget ? 'Over Budget!' : formatRupiah(budget.amount - (budget.spent || 0)) + ' left'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(budget)}>
                    <Pencil className="h-3 w-3 mr-1" /> Update
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openHistory(budget)}>
                    <History className="h-3 w-3 mr-1" /> History
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(budget)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
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

      {/* Edit Modal */}
      <Dialog open={!!editingBudget} onOpenChange={(open) => !open && setEditingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Budget: {editingBudget?.category}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input type="number" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} min="0" step="0.01" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={2} className="resize-none" />
            </div>
            <Button onClick={handleUpdate} disabled={editSaving} className="w-full">
              <Save className="h-4 w-4 mr-2" /> {editSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={!!historyBudget} onOpenChange={(open) => !open && setHistoryBudget(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Riwayat: {historyBudget?.category}</DialogTitle>
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
                    <span className="font-medium text-foreground">{formatRupiah(item.amount_changed)}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatRupiah(item.previous_spent)} → {formatRupiah(item.new_spent)}
                  </p>
                  {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
