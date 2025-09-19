import { useState } from "react"
import { ArrowLeft, Check, ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface AddSpendingFormProps {
  onSuccess: () => void
  onBack: () => void
}

type TransactionType = 'spending' | 'income'

interface Category {
  id: string
  name: string
  icon: string
}

const categories: Category[] = [
  { id: 'food', name: 'Food', icon: '🍴' },
  { id: 'transport', name: 'Transport', icon: '🚆' },
  { id: 'fun', name: 'Fun', icon: '🎮' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
]

const paymentMethods = [
  'Cash',
  'Transfer',
  'e-Wallet',
  'Credit Card',
  'Debit Card'
]

export function AddSpendingForm({ onSuccess, onBack }: AddSpendingFormProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>('spending')
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    paymentMethod: '',
  })
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.from('transactions').insert({
        type: transactionType,
        method: 'manual',
        name: formData.description,
        amount: parseFloat(formData.amount),
        category_id: formData.category || null,
        notes: `Payment: ${formData.paymentMethod}`,
        date: date.toISOString(),
        user_id: (await supabase.auth.getUser()).data.user?.id
      })

      if (error) throw error

      toast.success(`${transactionType === 'spending' ? 'Spending' : 'Income'} added successfully!`)
      onSuccess()
    } catch (error) {
      console.error('Error adding transaction:', error)
      toast.error('Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Add Spending</h1>
        <Button 
          type="submit" 
          form="spending-form"
          variant="ghost" 
          size="sm"
          disabled={loading}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Toggle */}
        <div className="flex rounded-lg border p-1 bg-muted">
          <button
            type="button"
            onClick={() => setTransactionType('spending')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              transactionType === 'spending' 
                ? "bg-expense text-expense-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowDown className="h-4 w-4" />
            Spending
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('income')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              transactionType === 'income' 
                ? "bg-income text-income-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowUp className="h-4 w-4" />
            Income
          </button>
        </div>

        <form id="spending-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                RP
              </span>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0"
                className="pl-12 h-12 text-lg"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border transition-colors",
                    formData.category === category.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Lunch at Canteen"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Save Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90"
          >
            {loading ? 'Saving...' : 'Save Transaction'}
          </Button>
        </form>
      </div>
    </div>
  )
}