import { useState, useEffect, useRef } from "react"
import { GraduationCap, Wallet, PiggyBank, TrendingUp, Lightbulb, ChevronRight, BookOpen, Star, Play, Upload, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { supabase } from "@/integrations/supabase/client"

interface EducationVideo {
  id: string
  title: string
  description: string
  videoUrl: string
  category: string
  isFromDb?: boolean
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  keuangan: { label: "Pengelolaan Keuangan", icon: <Wallet className="h-5 w-5" />, color: "bg-primary/10 text-primary" },
  tabungan: { label: "Tabungan", icon: <PiggyBank className="h-5 w-5" />, color: "bg-savings/10 text-savings" },
  investasi: { label: "Investasi", icon: <TrendingUp className="h-5 w-5" />, color: "bg-income/10 text-income" },
  lainnya: { label: "Tips & Lainnya", icon: <Lightbulb className="h-5 w-5" />, color: "bg-warning/10 text-warning" },
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]{11})/)
  return match ? match[1] : null
}

function isYouTubeUrl(url: string): boolean {
  return /youtu\.?be/.test(url)
}

const defaultVideos: EducationVideo[] = [
  // Pengelolaan Keuangan
  { id: "k1", category: "keuangan", title: "Aturan 50/30/20 untuk Mengelola Gaji", videoUrl: "https://www.youtube.com/watch?v=HQzoZfc3GwQ", description: "Metode 50/30/20 membagi penghasilan menjadi 3 bagian: 50% untuk kebutuhan pokok (makan, transportasi, tagihan), 30% untuk keinginan (hiburan, belanja), dan 20% untuk tabungan & investasi." },
  { id: "k2", category: "keuangan", title: "Cara Membuat Anggaran Bulanan", videoUrl: "https://www.youtube.com/watch?v=sVKQn2I4HDM", description: "Langkah pertama adalah mencatat semua sumber pendapatan. Kemudian list semua pengeluaran tetap dan variabel. Sisihkan dana darurat minimal 10%." },
  { id: "k3", category: "keuangan", title: "Menghindari Lifestyle Inflation", videoUrl: "https://www.youtube.com/watch?v=kMiBTPoIhSg", description: "Lifestyle inflation terjadi ketika pengeluaran meningkat seiring kenaikan pendapatan. Tips: tetapkan persentase tabungan, tunggu 24 jam sebelum pembelian impulsif." },
  // Tabungan
  { id: "t1", category: "tabungan", title: "Pentingnya Dana Darurat", videoUrl: "https://www.youtube.com/watch?v=EW-XPUXHjOk", description: "Dana darurat idealnya 3-6 bulan pengeluaran. Simpan di rekening terpisah. Dana ini melindungi dari PHK, sakit, atau keadaan darurat lainnya." },
  { id: "t2", category: "tabungan", title: "Challenge Menabung 52 Minggu", videoUrl: "https://www.youtube.com/watch?v=vr4J8QLuesI", description: "Minggu pertama tabung Rp 10.000, minggu kedua Rp 20.000, dan seterusnya. Di akhir tahun, kamu akan memiliki Rp 13.780.000!" },
  { id: "t3", category: "tabungan", title: "Automasi Tabungan dengan Auto-Debit", videoUrl: "https://www.youtube.com/watch?v=yAvGBQMPVMY", description: "Atur auto-debit di hari gajian untuk langsung memindahkan sebagian ke rekening tabungan. Prinsipnya: 'Pay yourself first'." },
  // Investasi
  { id: "i1", category: "investasi", title: "Investasi untuk Pemula: Mulai dari Mana?", videoUrl: "https://www.youtube.com/watch?v=Xn7KWR9EPOS", description: "Untuk pemula, mulai dari instrumen low-risk: deposito, reksa dana pasar uang, atau SBN. Investasi minimal mulai dari Rp 100.000." },
  { id: "i2", category: "investasi", title: "Mengenal Reksa Dana", videoUrl: "https://www.youtube.com/watch?v=gOCj6bTOE3w", description: "Reksa dana mengumpulkan dana dari banyak investor yang dikelola manajer investasi. Jenis: Pasar Uang, Pendapatan Tetap, Campuran, Saham." },
  { id: "i3", category: "investasi", title: "Dollar Cost Averaging (DCA)", videoUrl: "https://www.youtube.com/watch?v=ljTfREKboUQ", description: "DCA adalah strategi investasi rutin dengan jumlah tetap. Misal: investasi Rp 500.000/bulan. Mengurangi risiko timing pasar." },
  // Tips Lainnya
  { id: "l1", category: "lainnya", title: "Cara Mengatasi Utang dengan Metode Snowball", videoUrl: "https://www.youtube.com/watch?v=dJr6PKXB7-c", description: "Bayar utang terkecil dulu sambil membayar minimum untuk utang lainnya. Setelah lunas, alihkan pembayaran ke utang berikutnya." },
  { id: "l2", category: "lainnya", title: "Financial Goals: SMART", videoUrl: "https://www.youtube.com/watch?v=i0QfCZjASX8", description: "Buat tujuan keuangan SMART: Specific, Measurable, Achievable, Relevant, Time-bound. Contoh: 'Menabung Rp 10 juta dalam 6 bulan'." },
  { id: "l3", category: "lainnya", title: "Pentingnya Asuransi Kesehatan", videoUrl: "https://www.youtube.com/watch?v=3bDiU2krJSs", description: "Asuransi kesehatan melindungi dari biaya medis tidak terduga. BPJS adalah asuransi dasar wajib. Biaya premi jauh lebih kecil dibanding biaya RS." },
]

function VideoPlayer({ url }: { url: string }) {
  const ytId = getYouTubeId(url)

  if (ytId) {
    return (
      <AspectRatio ratio={16 / 9}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-xl"
        />
      </AspectRatio>
    )
  }

  // Uploaded video (Supabase storage or direct URL)
  return (
    <AspectRatio ratio={16 / 9}>
      <video
        src={url}
        controls
        className="w-full h-full rounded-xl object-cover bg-black"
      />
    </AspectRatio>
  )
}

export default function Education() {
  const [activeCategory, setActiveCategory] = useState("semua")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dbVideos, setDbVideos] = useState<EducationVideo[]>([])

  useEffect(() => {
    fetchDbVideos()
  }, [])

  const fetchDbVideos = async () => {
    const { data } = await supabase
      .from("education")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    if (data) {
      setDbVideos(
        data
          .filter((item: any) => item.video_url)
          .map((item: any) => ({
            id: item.education_id,
            title: item.title,
            description: item.content,
            videoUrl: item.video_url,
            category: guessCategory(item.title, item.content),
            isFromDb: true,
          }))
      )
    }
  }

  const guessCategory = (title: string, content: string): string => {
    const text = (title + " " + content).toLowerCase()
    if (text.includes("investasi") || text.includes("saham") || text.includes("reksa")) return "investasi"
    if (text.includes("tabung") || text.includes("saving") || text.includes("menabung")) return "tabungan"
    if (text.includes("keuangan") || text.includes("budget") || text.includes("anggaran")) return "keuangan"
    return "lainnya"
  }

  const allVideos = [...dbVideos, ...defaultVideos]
  const filteredVideos = activeCategory === "semua"
    ? allVideos
    : allVideos.filter((v) => v.category === activeCategory)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          Financial Education
        </h1>
        <p className="text-muted-foreground mt-1">Pelajari tips keuangan melalui video edukatif</p>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="semua" className="text-xs py-2">
            <Star className="h-4 w-4 mr-1" /> Semua
          </TabsTrigger>
          {Object.entries(categoryConfig).map(([key, cfg]) => (
            <TabsTrigger key={key} value={key} className="text-xs py-2">
              {cfg.icon}
              <span className="ml-1 hidden sm:inline">{cfg.label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          {filteredVideos.length === 0 ? (
            <Card className="rounded-2xl shadow-soft p-12 text-center">
              <div className="text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada video di kategori ini.</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredVideos.map((video) => {
                const cfg = categoryConfig[video.category] || categoryConfig.lainnya
                const isExpanded = expandedId === video.id
                return (
                  <Card
                    key={video.id}
                    className="rounded-2xl shadow-soft overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    {/* Video */}
                    <VideoPlayer url={video.videoUrl} />

                    {/* Info */}
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : video.id)}
                    >
                      <CardHeader className="pb-2 pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-semibold leading-tight">
                              {video.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="secondary" className="text-[10px] px-2">
                                {cfg.label}
                              </Badge>
                              {video.isFromDb && (
                                <Badge variant="outline" className="text-[10px] px-2">
                                  Terbaru
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-1 ${isExpanded ? "rotate-90" : ""}`} />
                        </div>
                      </CardHeader>
                    </div>
                    {isExpanded && (
                      <CardContent className="pt-0 pb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {video.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
