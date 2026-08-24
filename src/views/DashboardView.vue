<script setup lang="ts">
import {
  ArrowRight,
  Baby,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  LayoutDashboard,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Skeleton from '@/components/Skeleton.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { balitaPerluPerhatian, type KunjunganTerakhir } from '@/modules/balita/db'
import { kodeDariLabel } from '@/lib/status'
import { umurSaatIni } from '@/lib/umur'
import { supabase } from '@/supabase/client'
import { useAuth } from '@/supabase/useAuth'

const { isAutentikasi, isAdmin, user, inisialisasi } = useAuth()

onMounted(async () => {
  await inisialisasi()
  await muatStatistik()
  if (isAutentikasi.value) await muatPerluPerhatian()
})

// ---- Statistik publik (bulan berjalan) ----
interface StatistikPublik {
  balita_bayi: number
  balita_balita: number
  bumil_hamil: number
  bumil_menyusui: number
  kunjungan_balita_bulan_ini: number
  kunjungan_bumil_bulan_ini: number
  kunjungan_bulan_ini: number
  bulan_ini: string
}

const statistik = ref<StatistikPublik | null>(null)
const statistikLoading = ref(true)
const statistikError = ref(false)

const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

function labelBulan(ym: string): string {
  const [y, m] = ym.split('-')
  const idx = Number(m) - 1
  return idx >= 0 && idx < 12 ? `${NAMA_BULAN[idx]} ${y}` : ym
}

const labelBulanIni = computed(() =>
  statistik.value ? labelBulan(statistik.value.bulan_ini) : labelBulan(new Date().toISOString().slice(0, 7)),
)

const KARTU_STATISTIK = computed(() => {
  const s = statistik.value
  const totalBalita = s ? s.balita_bayi + s.balita_balita : 0
  const totalBumil = s ? s.bumil_hamil + s.bumil_menyusui : 0
  const persen = (kunjungan: number, sasaran: number): number =>
    sasaran > 0 ? Math.round((kunjungan / sasaran) * 1000) / 10 : 0
  return [
    {
      ikon: Baby,
      label: 'Bayi',
      nilai: s?.balita_bayi ?? null,
      akhiran: 'anak',
      keterangan: 'sasaran 0–11 bulan',
    },
    {
      ikon: Users,
      label: 'Balita',
      nilai: s?.balita_balita ?? null,
      akhiran: 'anak',
      keterangan: 'sasaran 12–60 bulan',
    },
    {
      ikon: HeartPulse,
      label: 'Ibu Hamil',
      nilai: s?.bumil_hamil ?? null,
      akhiran: 'ibu',
      keterangan: 'sasaran ibu hamil',
    },
    {
      ikon: Sparkles,
      label: 'Ibu Menyusui',
      nilai: s?.bumil_menyusui ?? null,
      akhiran: 'ibu',
      keterangan: 'sasaran ibu menyusui',
    },
    {
      ikon: CalendarDays,
      label: 'Kunjungan Balita',
      nilai: s ? persen(s.kunjungan_balita_bulan_ini, totalBalita) : null,
      akhiran: '%',
      keterangan: s ? `bulan ini dari ${totalBalita} sasaran` : '–',
    },
    {
      ikon: TrendingUp,
      label: 'Kunjungan Bumil/Menyusui',
      nilai: s ? persen(s.kunjungan_bumil_bulan_ini, totalBumil) : null,
      akhiran: '%',
      keterangan: s ? `bulan ini dari ${totalBumil} sasaran` : '–',
    },
  ]
})

async function muatStatistik() {
  statistikLoading.value = true
  if (!supabase) {
    statistikError.value = true
    statistikLoading.value = false
    return
  }
  try {
    const { data, error } = await supabase.rpc('statistik_publik')
    if (error) throw error
    statistik.value = data as StatistikPublik
  } catch {
    statistikError.value = true
  } finally {
    statistikLoading.value = false
  }
}


// ---- Modul layanan ----
interface ModulLayanan {
  kunci: string
  nama: string
  deskripsi: string
  ikon: typeof Baby
  aktif: boolean
  href?: string
}

const MODUL: ModulLayanan[] = [
  {
    kunci: 'balita',
    nama: 'Balita',
    deskripsi: 'Identitas, pengukuran, kurva pertumbuhan, dan riwayat kunjungan balita 0–60 bulan.',
    ikon: Baby,
    aktif: true,
    href: '/balita',
  },
  {
    kunci: 'apras',
    nama: 'Apras',
    deskripsi: 'Pencatatan anak pra sekolah (5–6 tahun).',
    ikon: UserRound,
    aktif: true,
    href: '/apras',
  },
  {
    kunci: 'bumil',
    nama: 'Bumil',
    deskripsi: 'Pemantauan ibu hamil: identitas, kunjungan, dan status kesehatan.',
    ikon: HeartPulse,
    aktif: true,
    href: '/bumil',
  },
  {
    kunci: 'lansia',
    nama: 'Dewasa & Lansia',
    deskripsi: 'Pemantauan kesehatan dewasa dan lansia di posyandu.',
    ikon: Users,
    aktif: false,
  },
]

// ---- Perlu Perhatian (kader login) ----
const perluPerhatian = ref<KunjunganTerakhir[]>([])
const muatPerhatianLoading = ref(false)
const muatPerhatianError = ref('')

async function muatPerluPerhatian() {
  muatPerhatianError.value = ''
  muatPerhatianLoading.value = true
  try {
    perluPerhatian.value = await balitaPerluPerhatian()
  } catch (e) {
    muatPerhatianError.value = e instanceof Error ? e.message : 'Gagal memuat data.'
  } finally {
    muatPerhatianLoading.value = false
  }
}

function formatUmur(tanggalLahir: string | null): string {
  if (!tanggalLahir) return '—'
  const u = umurSaatIni(tanggalLahir)
  if (u == null) return '—'
  const tahun = Math.floor(u / 12)
  const sisa = u % 12
  if (tahun === 0) return `${sisa} bulan`
  if (sisa === 0) return `${tahun} tahun`
  return `${tahun} th ${sisa} bln`
}

interface StatusKurang {
  label: string
  kode: string
}

function statusPerluPerhatian(k: KunjunganTerakhir): StatusKurang[] {
  const list: StatusKurang[] = []
  const tambah = (label: string | null) => {
    if (label == null) return
    const kode = kodeDariLabel(label)
    if (['SK', 'K', 'SP', 'P', 'GB', 'GK'].includes(kode)) list.push({ label, kode })
  }
  tambah(k.bb_menurut_umur)
  tambah(k.pbtb_menurut_umur)
  tambah(k.bb_menurut_pbtb)
  return list
}

function formatTanggal(tgl: string | null): string {
  if (!tgl) return '—'
  return new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />

    <!-- Latar gradasi lembut (blob) agar efek kartu kaca terlihat -->
    <div class="glass-backdrop" aria-hidden="true">
      <div class="glass-blob-1 anim-glass-drift" />
      <div class="glass-blob-2 anim-glass-drift" />
      <div class="glass-blob-3" />
    </div>

    <main id="konten-utama" class="w-full">
      <!-- ===== HERO / SAMBUTAN ===== -->
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 -z-10" aria-hidden="true">
          <div
            class="bg-primary/5 absolute inset-0"
            style="background-image: radial-gradient(48rem 26rem at 88% -8%, rgba(13, 148, 136, 0.16), transparent 62%)"
          />
          <div class="bg-primary/10 absolute -top-28 right-[8%] size-96 rounded-full blur-3xl" />
          <div
            class="absolute inset-0 opacity-[0.035]"
            style="background-image: radial-gradient(circle, #059669 1px, transparent 1px); background-size: 28px 28px"
          />
        </div>

        <div class="mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 sm:pt-18">
          <div v-if="!isAutentikasi" class="mx-auto max-w-3xl text-center">
            <p class="text-primary inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles class="size-3.5" />
              Dashboard posyandu
            </p>
            <h1 class="font-display mt-6 text-3xl leading-tight font-semibold text-balance sm:text-5xl">
              Satu posyandu,
              <span class="text-primary">empat sasaran kesehatan.</span>
            </h1>
            <p class="text-muted-foreground mx-auto mt-5 max-w-xl text-base leading-relaxed">
              Pantau layanan posyandu dalam satu sistem digital — dari pencatatan balita hingga
              pemantauan bumil, remaja, dewasa, dan lansia.
            </p>
            <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
              <RouterLink to="/login">
                <Button size="lg" class="gap-2 shadow-lg shadow-primary/25">
                  <Lock class="size-4" />
                  Masuk sebagai Kader
                </Button>
              </RouterLink>
              <RouterLink to="/kalkulator">
                <Button variant="outline" size="lg">
                  Coba Kalkulator
                  <ArrowRight class="size-4" />
                </Button>
              </RouterLink>
            </div>
          </div>

          <div v-else class="mx-auto max-w-3xl">
            <p class="text-primary inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-sm">
              <LayoutDashboard class="size-3.5" />
              Dashboard kader
            </p>
            <div class="mt-5 flex flex-wrap items-center gap-3">
              <h1 class="font-display text-3xl leading-tight font-semibold text-balance sm:text-4xl">
                Selamat datang kembali.
              </h1>
              <Badge v-if="isAdmin" variant="outline" class="bg-emerald-100 text-emerald-700 border-emerald-200">
                Admin
              </Badge>
            </div>
            <p class="text-muted-foreground mt-3 max-w-xl text-sm" :title="user?.email">
              Anda masuk sebagai <span class="text-foreground font-medium">{{ user?.email }}</span>.
              Pantau status gizi dan kelola data kunjungan balita.
            </p>
            <div class="mt-6 flex flex-wrap items-center gap-3">
              <RouterLink v-if="isAdmin" to="/balita/baru">
                <Button size="lg" class="gap-2 shadow-lg shadow-primary/25">
                  <Plus class="size-4" />
                  Tambah Balita
                </Button>
              </RouterLink>
              <RouterLink to="/balita">
                <Button variant="outline" size="lg">
                  Buka Data Balita
                  <ArrowRight class="size-4" />
                </Button>
              </RouterLink>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== STATISTIK BULAN INI ===== -->
      <section v-if="!statistikError" class="flex flex-col items-center justify-center py-16 sm:py-20">
        <div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Card v-if="statistikLoading" variant="glass-strong" role="status" aria-label="Memuat…">
            <CardContent class="flex flex-col gap-6 p-6 sm:p-7">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <Skeleton class="h-4 w-44" />
                <Skeleton class="h-6 w-48 rounded-full" />
              </div>
              <dl class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div v-for="i in 4" :key="i" class="flex items-start gap-3">
                  <Skeleton class="size-11 rounded-xl" />
                  <div class="flex-1 space-y-2">
                    <Skeleton class="h-3 w-20" />
                    <Skeleton class="h-7 w-16" />
                    <Skeleton class="h-3 w-28" />
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card v-else variant="glass-strong">
            <CardContent class="flex flex-col gap-6 p-6 sm:p-7">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                  Statistik posyandu · {{ labelBulanIni }}
                </p>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <CalendarDays class="size-3.5" />
                    Kunjungan bulan ini: {{ statistik?.kunjungan_bulan_ini ?? '–' }}
                  </span>
                  <span class="text-primary inline-flex items-center gap-1.5 text-xs font-bold">
                    <BarChart3 class="size-3.5" />
                    angka agregat publik
                  </span>
                </div>
              </div>
              <dl class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div v-for="k in KARTU_STATISTIK" :key="k.label" class="flex items-start gap-3">
                  <span class="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
                    <component :is="k.ikon" class="size-5" />
                  </span>
                  <div>
                    <dt class="text-muted-foreground text-xs font-bold">{{ k.label }}</dt>
                    <dd class="mt-0.5">
                      <span class="font-display text-2xl font-semibold tabular-nums">
                        {{ k.nilai ?? '–' }}
                      </span>
                      <span class="text-muted-foreground text-sm"> {{ k.akhiran }}</span>
                    </dd>
                    <dd class="text-muted-foreground mt-0.5 text-xs">{{ k.keterangan }}</dd>
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- ===== LAYANAN / MODUL ===== -->
      <section id="layanan" class="border-border/60 bg-card/60 border-y">
        <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-primary text-xs font-bold tracking-widest uppercase">Layanan terpadu</p>
              <h2 class="font-display mt-3 text-2xl leading-tight font-semibold sm:text-3xl">
                Pilih layanan posyandu.
              </h2>
            </div>
            <p class="text-muted-foreground max-w-sm text-sm">
              Data balita tersedia; layanan lain menyusul dalam satu sistem.
            </p>
          </div>

          <div class="mt-10 grid gap-5 md:grid-cols-2">
            <div v-for="m in MODUL" :key="m.kunci" class="block h-full">
              <Card
                variant="glass"
                class="h-full py-0 transition-all duration-300"
                :class="m.aktif
                  ? 'hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10'
                  : 'opacity-80'"
              >
                <CardContent class="flex flex-col gap-4 p-6 sm:p-7">
                  <div class="flex items-start justify-between gap-3">
                    <span
                      class="grid size-12 place-items-center rounded-xl"
                      :class="m.aktif ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'"
                    >
                      <component :is="m.ikon" class="size-6" />
                    </span>
                    <Badge
                      variant="outline"
                      :class="m.aktif
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-muted text-muted-foreground border-transparent'"
                    >
                      {{ m.aktif ? 'Aktif' : 'Segera' }}
                    </Badge>
                  </div>
                  <div>
                    <h3 class="font-display text-xl font-semibold">{{ m.nama }}</h3>
                    <p class="text-muted-foreground mt-1.5 text-sm leading-relaxed">{{ m.deskripsi }}</p>
                  </div>
                  <div v-if="m.aktif" class="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <RouterLink :to="m.href ?? '/'" class="text-primary inline-flex items-center gap-1.5 text-sm font-bold">
                      Buka layanan
                      <ArrowRight class="size-4" />
                    </RouterLink>
                    <RouterLink
                      v-if="m.kunci === 'balita' && isAutentikasi"
                      to="/balita/rekap"
                      class="text-muted-foreground hover:text-primary inline-flex items-center text-sm font-medium underline-offset-4 hover:underline"
                    >
                      Rekap
                    </RouterLink>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== PERLU PERHATIAN (kader login) ===== -->
      <section v-if="isAutentikasi" class="scroll-mt-20">
        <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-primary text-xs font-bold tracking-widest uppercase">Pemantauan</p>
              <h2 class="font-display mt-3 text-2xl leading-tight font-semibold sm:text-3xl">
                Balita yang perlu perhatian.
              </h2>
              <p class="text-muted-foreground mt-3 max-w-xl text-sm">
                Daftar balita dengan status kunjungan terakhir di bawah normal (kurang, pendek,
                gizi buruk, atau gizi kurang). Prioritaskan untuk ditindaklanjuti.
              </p>
            </div>
            <RouterLink to="/balita">
              <Button variant="outline" size="sm">
                Lihat Semua Balita
                <ArrowRight class="size-4" />
              </Button>
            </RouterLink>
          </div>

          <div v-if="muatPerhatianLoading" class="mt-8 grid gap-4 md:grid-cols-2" role="status" aria-label="Memuat…">
            <Card v-for="i in 4" :key="i" variant="glass-strong" class="h-full">
              <CardContent class="flex flex-col gap-4 p-6">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <Skeleton class="size-10 rounded-lg" />
                    <div class="flex-1 space-y-2">
                      <Skeleton class="h-4 w-40" />
                      <Skeleton class="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton class="mt-1 size-5 rounded" />
                </div>
                <div class="flex flex-wrap gap-2 border-t border-border/60 pt-4">
                  <Skeleton class="h-6 w-20 rounded-full" />
                  <Skeleton class="h-6 w-24 rounded-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          <p v-else-if="muatPerhatianError" class="mt-6 text-sm font-medium text-red-600" role="alert">
            {{ muatPerhatianError }}
          </p>

          <div v-else-if="perluPerhatian.length === 0" class="mt-10">
            <div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-white/50 px-8 py-14 text-center">
              <CheckCircle2 class="text-emerald-500 size-10" />
              <p class="font-display mt-4 text-lg">Tidak ada balita yang perlu perhatian khusus.</p>
              <p class="text-muted-foreground mt-1 max-w-sm text-sm">
                Semua status kunjungan terakhir balita dalam kategori normal.
              </p>
            </div>
          </div>

          <div v-else class="mt-8 grid gap-4 md:grid-cols-2">
            <Card v-for="k in perluPerhatian" :key="k.balita_id" variant="glass-strong" class="h-full">
              <CardContent class="flex flex-col gap-4 p-6">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <span class="bg-red-50 text-red-600 grid size-10 shrink-0 place-items-center rounded-lg">
                      <UserRound class="size-5" />
                    </span>
                    <div class="min-w-0">
                      <RouterLink
                        :to="`/balita/${k.balita_id}`"
                        class="font-display hover:text-primary block truncate text-base font-bold"
                      >
                        {{ k.nama }}
                      </RouterLink>
                      <p class="text-muted-foreground mt-0.5 text-xs">
                        {{ formatUmur(k.tanggal_lahir) }} · kunjungan {{ formatTanggal(k.tanggal_kunjungan) }}
                      </p>
                    </div>
                  </div>
                  <TrendingUp class="text-red-400 mt-1 size-5 shrink-0" />
                </div>
                <div class="border-border/60 flex flex-wrap gap-2 border-t pt-4">
                  <div v-for="s in statusPerluPerhatian(k)" :key="s.label" class="inline-flex flex-col gap-1">
                    <span class="text-muted-foreground text-[10px] font-bold uppercase">Status</span>
                    <StatusBadge :kode="s.kode" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <!-- ===== INFO / PRIVASI ===== -->
      <section class="border-border/60 bg-card/60 border-t">
        <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div class="glass-strong flex items-start gap-4 p-6">
            <span class="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
              <ShieldCheck class="size-5" />
            </span>
            <div>
              <h2 class="font-display text-lg font-semibold">Data anak Anda aman.</h2>
              <p class="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                Pencatatan dan pemantauan data balita hanya dapat dilakukan kader yang sudah masuk.
                Setiap data pribadi anak dilindungi autentikasi dan aturan akses ketat — pengunjung
                umum hanya melihat angka agregat, bukan data perorangan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>