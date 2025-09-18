import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Semua field wajib diisi")
      return false
    }
    if (formData.password.length < 6) {
      toast.error("Password minimal 6 karakter")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { username: formData.username },
          emailRedirectTo: `${window.location.origin}/`
        },
      })

      if (error) throw error

      console.log('Registration data:', data)
      toast.success("Registrasi berhasil, silakan login")
      navigate('/login')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || "Terjadi kesalahan saat registrasi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto shadow-lg rounded-xl bg-card border-border">
        <CardHeader className="text-center">
          <div className="mb-2">
            <p className="text-muted-foreground text-sm mb-4">
              Start your financial journey today 🚀💵
            </p>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            ✨ Daftar Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full border rounded p-2 mb-3"
                placeholder="Masukkan username"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded p-2 mb-3"
                placeholder="Masukkan email"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded p-2 mb-3"
                placeholder="Masukkan password (min. 6 karakter)"
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Loading... ⏳" : "Daftar 🎯"}
            </Button>
          </form>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Sudah punya akun? 💡{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login di sini 💰
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}