import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface IncomeFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function IncomeForm({ onSuccess, onCancel }: IncomeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    notes: '',
    date: new Date().toISOString().slice(0, 16) // Format for datetime-local input
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.from('transactions').insert({
        type: 'income',
        method: 'manual',
        name: formData.name,
        amount: parseFloat(formData.amount),
        notes: formData.notes || null,
        date: new Date(formData.date).toISOString(),
        user_id: (await supabase.auth.getUser()).data.user?.id
      })

      if (error) throw error

      toast.success('Income added successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error adding income:', error)
      toast.error('Failed to add income')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Income Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Salary, Freelance"
          required
        />
      </div>

      <div>
        <Label htmlFor="amount">Amount (Rp)</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="0"
          required
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <Label htmlFor="date">Date & Time</Label>
        <Input
          id="date"
          type="datetime-local"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1 bg-income hover:bg-income/90">
          {loading ? 'Adding...' : 'Add Income'}
        </Button>
      </div>
    </form>
  )
}