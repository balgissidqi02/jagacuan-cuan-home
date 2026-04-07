import { useState, useEffect } from "react"
import { GraduationCap, Wallet, PiggyBank, TrendingUp, Lightbulb, ChevronRight, BookOpen, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"

interface EducationArticle {
  id: string
  title: string
  content: string
  category: string
  icon: React.ReactNode
  isFromDb?: boolean
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  keuangan: { label: "Pengelolaan Keuangan", icon: <Wallet className="h-5 w-5" />, color: "bg-primary/10 text-primary" },
  tabungan: { label: "Tabungan", icon: <PiggyBank className="h-5 w-5" />, color: "bg-savings/10 text-savings" },
  investasi: { label: "Investasi", icon: <TrendingUp className="h-5 w-5" />, color: "bg-income/10 text-income" },
  lainnya: { label: "Tips & Lainnya", icon: <Lightbulb className="h-5 w-5" />, color: "bg-warning/10 text-warning" },
}

const defaultArticles: EducationArticle[] = [
  // Pengelolaan Keuangan
  {
    id: "k1", category: "keuangan", icon: <Wallet className="h-5 w-5" />,
    title: "Aturan 50/30/20 untuk Mengelola Gaji",
    content: "Metode 50/30/20 membagi penghasilan menjadi 3 bagian: 50% untuk kebutuhan pokok (makan, transportasi, tagihan), 30% untuk keinginan (hiburan, belanja), dan 20% untuk tabungan & investasi. Mulai terapkan dari gaji bulan ini!"
  },
  {
    id: "k2", category: "keuangan", icon: <Wallet className="h-5 w-5" />,
    title: "Cara Membuat Anggaran Bulanan",
    content: "Langkah pertama adalah mencatat semua sumber pendapatan. Kemudian list semua pengeluaran tetap (sewa, listrik, dll) dan variabel (makan, transport). Sisihkan dana darurat minimal 10%. Gunakan fitur Budgeting di JagaCuan untuk tracking otomatis!"
  },
  {
    id: "k3", category: "keuangan", icon: <Wallet className="h-5 w-5" />,
    title: "Menghindari Lifestyle Inflation",
    content: "Lifestyle inflation terjadi ketika pengeluaran meningkat seiring kenaikan pendapatan. Tips mengatasinya: tetapkan persentase tabungan sebelum menghabiskan, tunggu 24 jam sebelum pembelian impulsif, dan selalu evaluasi kebutuhan vs keinginan."
  },
  // Tabungan
  {
    id: "t1", category: "tabungan", icon: <PiggyBank className="h-5 w-5" />,
    title: "Pentingnya Dana Darurat",
    content: "Dana darurat idealnya 3-6 bulan pengeluaran. Simpan di rekening terpisah yang mudah diakses tapi tidak terlalu mudah digunakan. Dana ini melindungi dari PHK, sakit, atau keadaan darurat lainnya. Mulai dari Rp 100.000/bulan!"
  },
  {
    id: "t2", category: "tabungan", icon: <PiggyBank className="h-5 w-5" />,
    title: "Challenge Menabung 52 Minggu",
    content: "Minggu pertama tabung Rp 10.000, minggu kedua Rp 20.000, dan seterusnya. Di akhir tahun, kamu akan memiliki Rp 13.780.000! Alternatif: mulai dari minggu ke-52 (Rp 520.000) dan turun, sehingga lebih mudah di akhir tahun."
  },
  {
    id: "t3", category: "tabungan", icon: <PiggyBank className="h-5 w-5" />,
    title: "Automasi Tabungan dengan Auto-Debit",
    content: "Atur auto-debit di hari gajian untuk langsung memindahkan sebagian ke rekening tabungan. Prinsipnya: 'Pay yourself first' - bayar dirimu (tabungan) sebelum membayar yang lain. Ini cara paling efektif untuk konsisten menabung."
  },
  // Investasi
  {
    id: "i1", category: "investasi", icon: <TrendingUp className="h-5 w-5" />,
    title: "Investasi untuk Pemula: Mulai dari Mana?",
    content: "Untuk pemula, mulai dari instrumen low-risk: deposito, reksa dana pasar uang, atau SBN (Surat Berharga Negara). Investasi minimal mulai dari Rp 100.000. Pahami profil risiko kamu dulu sebelum memilih instrumen."
  },
  {
    id: "i2", category: "investasi", icon: <TrendingUp className="h-5 w-5" />,
    title: "Mengenal Reksa Dana",
    content: "Reksa dana adalah wadah untuk mengumpulkan dana dari banyak investor yang kemudian dikelola manajer investasi. Jenis: Pasar Uang (low risk), Pendapatan Tetap (medium), Campuran (medium-high), Saham (high). Cocok untuk pemula karena dikelola profesional."
  },
  {
    id: "i3", category: "investasi", icon: <TrendingUp className="h-5 w-5" />,
    title: "Dollar Cost Averaging (DCA)",
    content: "DCA adalah strategi investasi rutin dengan jumlah tetap, tanpa memperhatikan harga pasar. Misal: investasi Rp 500.000/bulan di reksa dana. Strategi ini mengurangi risiko timing pasar dan cocok untuk investor jangka panjang."
  },
  // Tips Lainnya
  {
    id: "l1", category: "lainnya", icon: <Lightbulb className="h-5 w-5" />,
    title: "Cara Mengatasi Utang dengan Metode Snowball",
    content: "Bayar utang terkecil dulu sambil membayar minimum untuk utang lainnya. Setelah utang terkecil lunas, alihkan pembayaran ke utang terkecil berikutnya. Metode ini memberikan motivasi karena kamu melihat progres lebih cepat."
  },
  {
    id: "l2", category: "lainnya", icon: <Lightbulb className="h-5 w-5" />,
    title: "Financial Goals: SMART",
    content: "Buat tujuan keuangan yang SMART: Specific (spesifik), Measurable (terukur), Achievable (tercapai), Relevant (relevan), Time-bound (ada tenggat). Contoh: 'Menabung Rp 10 juta untuk liburan dalam 6 bulan' lebih baik dari 'Ingin menabung'."
  },
  {
    id: "l3", category: "lainnya", icon: <Lightbulb className="h-5 w-5" />,
    title: "Pentingnya Asuransi Kesehatan",
    content: "Asuransi kesehatan melindungi dari biaya medis yang tidak terduga. BPJS Kesehatan adalah asuransi dasar wajib. Pertimbangkan asuransi tambahan jika mampu. Biaya premi jauh lebih kecil dibanding biaya rumah sakit tanpa asuransi."
  },
]

export default function Education() {
  const [activeCategory, setActiveCategory] = useState("semua")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dbArticles, setDbArticles] = useState<EducationArticle[]>([])

  useEffect(() => {
    fetchDbArticles()
  }, [])

  const fetchDbArticles = async () => {
    const { data } = await supabase
      .from("education")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    if (data) {
      setDbArticles(
        data.map((item) => ({
          id: item.education_id,
          title: item.title,
          content: item.content,
          category: guessCategory(item.title, item.content),
          icon: <BookOpen className="h-5 w-5" />,
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

  const allArticles = [...dbArticles, ...defaultArticles]
  const filteredArticles = activeCategory === "semua"
    ? allArticles
    : allArticles.filter((a) => a.category === activeCategory)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Financial Education
          </h1>
          <p className="text-muted-foreground mt-1">Pelajari tips keuangan untuk masa depan yang lebih baik</p>
        </div>
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
          {filteredArticles.length === 0 ? (
            <Card className="rounded-2xl shadow-soft p-12 text-center">
              <div className="text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada artikel di kategori ini.</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article) => {
                const cfg = categoryConfig[article.category] || categoryConfig.lainnya
                const isExpanded = expandedId === article.id
                return (
                  <Card
                    key={article.id}
                    className="rounded-2xl shadow-soft cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => setExpandedId(isExpanded ? null : article.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl ${cfg.color} shrink-0`}>
                            {article.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold leading-tight">
                              {article.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="secondary" className="text-[10px] px-2">
                                {cfg.label}
                              </Badge>
                              {article.isFromDb && (
                                <Badge variant="outline" className="text-[10px] px-2">
                                  Terbaru
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {article.content}
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
