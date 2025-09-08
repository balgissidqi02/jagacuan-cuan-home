import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface SpendingFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface Category {
  category_id: string
  name: string
}

export function SpendingForm({ onSuccess, onCancel }: SpendingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category_id: '',
    notes: '',
    date: new Date().toISOString().slice(0, 16)
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('category_id, name')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Add default categories if none exist
      setCategories([
        { category_id: 'food', name: 'Makanan' },
        { category_id: 'transport', name: 'Transportasi' },
        { category_id: 'shopping', name: 'Belanja' },
        { category_id: 'entertainment', name: 'Hiburan' },
        { category_id: 'health', name: 'Kesehatan' },
        { category_id: 'other', name: 'Lainnya' }
      ])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.from('transactions').insert({
        type: 'spending',
        method: 'manual',
        name: formData.name,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || null,
        notes: formData.notes || null,
        date: new Date(formData.date).toISOString(),
        user_id: (await supabase.auth.getUser()).data.user?.id
      })

      if (error) throw error

      toast.success('Spending added successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error adding spending:', error)
      toast.error('Failed to add spending')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Spending Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Lunch, Gas, Shopping"
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
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.category_id} value={category.category_id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Button type="submit" disabled={loading} className="flex-1 bg-expense hover:bg-expense/90">
          {loading ? 'Adding...' : 'Add Spending'}
        </Button>
      </div>
    </form>
  )
}