import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import { formatRupiah } from "@/utils/currency"
import { toast } from "sonner"
import { Utensils, Car, PiggyBank, GraduationCap, MoreHorizontal, CheckCircle, Lock } from "lucide-react"

const categories = [
  { name: "Food", icon: Utensils, color: "bg-orange-500" },
  { name: "Transport", icon: Car, color: "bg-blue-500" },
  { name: "Fun", icon: PiggyBank, color: "bg-purple-500" },
  { name: "Study", icon: GraduationCap, color: "bg-green-500" },
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
      toast.error('Budget must be greater than 0')
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
      
      toast.success('Budget berhasil ditambahkan')
      navigate('/budgeting')
    } catch (error) {
      console.error('Error adding budget:', error)
      toast.error('Failed to add budget')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-card rounded-2xl shadow-lg border-0">
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Add Budget</CardTitle>
              <p className="text-muted-foreground mt-2">Set spending limits for different categories</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <Label>Category</Label>
              <div className="grid grid-cols-5 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setSelectedCategory(category.name)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedCategory === category.name
                        ? category.name === 'Fun' 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                        <category.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-center">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Budget Amount</Label>
              <div className="relative flex items-center">
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="RP 0"
                  className="pr-16"
                  required
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-3 text-muted-foreground font-medium">
                  IDR
                </span>
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
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-medium"
              disabled={loading}
            >
              <Lock className="h-4 w-4 mr-2" />
              {loading ? 'Saving Budget...' : 'Save Budget'}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}