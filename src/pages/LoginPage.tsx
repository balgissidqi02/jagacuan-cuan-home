import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
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
    if (!formData.email || !formData.password) {
      toast.error("Email dan password wajib diisi")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      console.log('Login data:', data)
      toast.success("Login berhasil!")
      navigate('/')
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || "Email atau password salah")
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
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--income) / 0.1))'
          }}
        >
          <div className="text-center p-12">
            <div className="text-8xl mb-8">🐷💰</div>
            <h1 className="text-4xl font-bold text-primary mb-4">
              Smart Financial Tracking
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Take control of your finances with intelligent budgeting and spending insights
            </p>
            <div className="flex justify-center space-x-4 text-6xl">
              <span>📊</span>
              <span>💸</span>
              <span>🌳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card 
            className="shadow-2xl border-0"
            style={{
              boxShadow: '0 20px 40px -12px hsl(var(--primary) / 0.15)'
            }}
          >
            <CardHeader className="text-center pb-8">
              <div className="mb-6">
                <p className="text-muted-foreground text-base mb-2">
                  Welcome back! Ready to grow your savings?
                </p>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-income bg-clip-text text-transparent">
                Sign In
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="h-12 rounded-xl border-2 border-border/50 focus:border-primary transition-colors"
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
                    className="h-12 rounded-xl border-2 border-border/50 focus:border-primary transition-colors"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-base font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))',
                    boxShadow: '0 8px 16px -4px hsl(var(--primary) / 0.3)'
                  }}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Create one here
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