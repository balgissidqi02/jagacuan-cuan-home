import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { formatRupiah } from "@/utils/currency"
import { toast } from "sonner"
import { Utensils, Car, Gamepad2, GraduationCap, MoreHorizontal } from "lucide-react"

const categories = [
  { name: "Food & Drinks", icon: Utensils, color: "bg-orange-500" },
  { name: "Transportation", icon: Car, color: "bg-blue-500" },
  { name: "Entertainment", icon: Gamepad2, color: "bg-purple-500" },
  { name: "Education", icon: GraduationCap, color: "bg-green-500" },
  { name: "Other", icon: MoreHorizontal, color: "bg-gray-500" }
]

export default function AddBudget() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState("")
  const [formData, setFormData] = useState({
    amount: "",
    period: "Monthly",
    notes: ""
  })
  const [loading, setLoading] = useState(false)

  // Mock user ID for demo - in real app this would come from auth
  const userId = "123e4567-e89b-12d3-a456-426614174000"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCategory) {
      toast.error('Please select a category')
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid budget amount')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('budgeting')
        .insert({
          category: selectedCategory,
          amount: parseFloat(formData.amount),
          period: formData.period,
          notes: formData.notes || null,
          user_id: userId
        })

      if (error) throw error
      
      toast.success('Budget added successfully!')
      navigate('/budgeting')
    } catch (error) {
      console.error('Error adding budget:', error)
      toast.error('Failed to add budget')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Add Budget</h1>
        <p className="text-muted-foreground mt-1">Set spending limits for different categories</p>
      </div>

      <Card className="rounded-2xl shadow-soft">
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <Label>Category</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setSelectedCategory(category.name)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedCategory === category.name
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                        <category.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-center">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Budget Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0"
                  className="pl-8"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              {formData.amount && (
                <p className="text-sm text-muted-foreground">
                  {formatRupiah(parseFloat(formData.amount) || 0)}
                </p>
              )}
            </div>

            {/* Period */}
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={formData.period} onValueChange={(value) => setFormData({...formData, period: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Add any additional notes about this budget..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? 'Saving Budget...' : 'Save Budget'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}