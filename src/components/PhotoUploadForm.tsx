import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Edit } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface PhotoUploadFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function PhotoUploadForm({ onSuccess, onCancel }: PhotoUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [aiProcessed, setAiProcessed] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category_id: '',
    notes: '',
    date: new Date().toISOString().slice(0, 16)
  })
  const [loading, setLoading] = useState(false)

  const categories = [
    { category_id: 'food', name: 'Makanan' },
    { category_id: 'transport', name: 'Transportasi' },
    { category_id: 'shopping', name: 'Belanja' },
    { category_id: 'entertainment', name: 'Hiburan' },
    { category_id: 'health', name: 'Kesehatan' },
    { category_id: 'other', name: 'Lainnya' }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }
  }

  const processWithAI = async () => {
    if (!file) return

    setLoading(true)
    try {
      // Simulate AI processing - in real app, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI results
      setFormData(prev => ({
        ...prev,
        name: 'Restaurant Bill',
        amount: '85000',
        category_id: 'food'
      }))
      setAiProcessed(true)
      toast.success('Receipt processed successfully!')
    } catch (error) {
      toast.error('Failed to process receipt')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.from('transactions').insert({
        type: 'spending',
        method: 'photo',
        name: formData.name,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || null,
        notes: formData.notes || null,
        date: new Date(formData.date).toISOString(),
        photo_url: previewUrl, // In real app, upload to Supabase Storage
        ai_processed: aiProcessed,
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
    <div className="space-y-4">
      {/* Photo Upload */}
      {!file ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <Label htmlFor="photo" className="cursor-pointer">
            <span className="text-sm font-medium">Upload Receipt Photo</span>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </Label>
          <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 10MB</p>
        </div>
      ) : (
        <div className="space-y-3">
          <img src={previewUrl} alt="Receipt preview" className="w-full h-48 object-cover rounded-lg" />
          
          {!aiProcessed && (
            <Button
              onClick={processWithAI}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? 'Processing...' : 'Process with AI'}
            </Button>
          )}

          {aiProcessed && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Edit className="h-4 w-4" />
              AI processed - you can edit the details below
            </div>
          )}
        </div>
      )}

      {/* Form fields - only show after photo is uploaded */}
      {file && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Spending Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Restaurant Bill"
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
      )}
    </div>
  )
}