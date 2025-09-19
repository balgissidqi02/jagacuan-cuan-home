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

      // Also insert into users table
      if (data.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            user_id: data.user.id,
            username: formData.username,
            email: formData.email,
            password: formData.password // Note: In production, you shouldn't store plain text passwords
          })
        
        if (userError) {
          console.error('User table insert error:', userError)
        }
      }

      console.log('Registration data:', data)
      toast.success("Registrasi berhasil! Selamat datang!")
      navigate('/')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || "Terjadi kesalahan saat registrasi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--income) / 0.1), hsl(var(--primary) / 0.1))'
          }}
        >
          <div className="text-center p-12">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-income to-primary rounded-3xl flex items-center justify-center">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,6H10V4H14M15,8V16H13V10H9V16H7V8H15M16,2H8A2,2 0 0,0 6,4V20A2,2 0 0,0 8,22H16A2,2 0 0,0 18,20V4A2,2 0 0,0 16,2Z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-income mb-4">
              Grow Your Wealth
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Start your journey to financial freedom with smart budgeting and goal tracking
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card 
            className="shadow-2xl border-0"
            style={{
              boxShadow: '0 20px 40px -12px hsl(var(--income) / 0.15)'
            }}
          >
            <CardHeader className="text-center pb-8">
              <div className="mb-6">
                <p className="text-muted-foreground text-base mb-2">
                  Start your financial journey today
                </p>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-income to-primary bg-clip-text text-transparent">
                Create Account
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className="h-12 rounded-xl border-2 border-border/50 focus:border-income transition-colors"
                    placeholder="Choose a username"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-12 rounded-xl border-2 border-border/50 focus:border-income transition-colors"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-12 rounded-xl border-2 border-border/50 focus:border-income transition-colors"
                    placeholder="Create a password (min. 6 characters)"
                    disabled={loading}
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-base font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--income)), hsl(var(--income) / 0.8))',
                    boxShadow: '0 8px 16px -4px hsl(var(--income) / 0.3)'
                  }}
                >
                  {loading ? "Creating Account..." : "Get Started"}
                </Button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-income hover:text-income/80 font-semibold transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border/50 text-center">
                <p className="text-xs text-muted-foreground/80">
                  Your money, your future
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}