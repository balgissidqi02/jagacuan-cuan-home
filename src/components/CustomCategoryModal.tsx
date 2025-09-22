import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface CustomCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const iconOptions = [
  '🏠', '🚗', '🍔', '🛍️', '🎮', '💊', '📚', '✈️', '🎵', '💰',
  '🍕', '☕', '🎬', '💻', '👕', '🏃', '🎨', '📱', '🔧', '🌱'
]

export function CustomCategoryModal({ isOpen, onClose, onSuccess }: CustomCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('🏠')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error('Please log in to add categories')
        return
      }

      // For now, we'll add it to the budgeting table as a new budget category
      // In a real app, you might want a separate categories table
      const { error } = await supabase.from('budgeting').insert({
        category: categoryName,
        amount: 0,
        spent: 0,
        user_id: user.id,
        notes: `Custom category with icon: ${selectedIcon}`
      })

      if (error) throw error

      toast.success('Custom category added successfully!')
      setCategoryName('')
      setSelectedIcon('🏠')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error adding custom category:', error)
      toast.error('Failed to add custom category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Personal Care"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Choose Icon</Label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl transition-all ${
                    selectedIcon === icon
                      ? 'border-primary bg-primary/10 scale-110'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}