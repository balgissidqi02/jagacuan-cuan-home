import { useState, useEffect } from "react"
import { User, Mail, Calendar, Edit, Save, X, Camera } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

interface ProfileData {
  id: string
  name: string | null
  bio: string | null
  photo_url: string | null
  created_at: string
}

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState({ name: "", bio: "" })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        navigate('/login')
        return
      }
      setEmail(user.email || "")

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setProfile(data)
        setEditData({ name: data.name || "", bio: data.bio || "" })
      } else {
        setProfile({ id: user.id, name: null, bio: null, photo_url: null, created_at: user.created_at || "" })
        setEditData({ name: "", bio: "" })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Gagal memuat profil')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editData.name || null,
          bio: editData.bio || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error
      
      setProfile({ ...profile, name: editData.name, bio: editData.bio })
      setEditing(false)
      toast.success('Profil berhasil diperbarui')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Gagal memperbarui profil')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !profile) return
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const filePath = `${profile.id}/avatar.${fileExt}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setProfile({ ...profile, photo_url: publicUrl })
      toast.success('Foto profil berhasil diperbarui')
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Gagal mengunggah foto')
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  const initials = (profile?.name || email || "U").slice(0, 2).toUpperCase()

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Profil Saya</h1>

      <Card className="rounded-2xl shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.photo_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">{profile?.name || "Belum diatur"}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Ceritakan tentang dirimu..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nama</p>
                  <p className="text-sm font-medium text-foreground">{profile?.name || "Belum diatur"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{email}</p>
                </div>
              </div>
              {profile?.bio && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm text-foreground">{profile.bio}</p>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Bergabung sejak</p>
                  <p className="text-sm font-medium text-foreground">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>
              <Button onClick={() => setEditing(true)} className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
