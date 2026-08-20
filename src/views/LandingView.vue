<script setup lang="ts">
import {
  Activity,
  ArrowRight,
  Baby,
  BarChart3,
  CalendarDays,
  HeartPulse,
  LayoutDashboard,
  Lock,
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
import KurvaWHO from '@/components/KurvaWHO.vue'
import Reveal from '@/components/Reveal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { hitungSemuaStatus } from '@/lib/kalkulator'
import { supabase } from '@/supabase/client'

// ============================================================
// LAPISAN KAMPANYE HUT KE-81 RI (2026)
// ------------------------------------------------------------
// Seluruh elemen perayaan (badge HUT, angka 81, pita merah,
// aksen CTA, copy kampanye) dibungkus satu flag di bawah ini.
// Ubah ke `false` setelah periode perayaan → halaman kembali ke
// identitas hijau klinis tanpa perlu mendesain ulang apa pun.
// ============================================================
const KAMPANYE_HUT = true

const TEX_KAMPANYE = {
  badge: 'HUT Ke-81 RI · Merdeka Melayani',
  garis: '81 Tahun Indonesia Merdeka — saatnya posyandu melangkah lebih digital.',
  cta: 'HUT Ke-81 RI · Merdeka Melayani, Merdeka Berkembang',
}

const jk = ref<'L' | 'P'>('L')
const umur = ref(24)
const berat = ref(12.2)
const panjang = ref(87)

const hasil = computed(() =>
  hitungSemuaStatus(jk.value, umur.value, berat.value, panjang.value),
)

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

onMounted(async () => {
  if (!supabase) {
    statistikError.value = true
    return
  }
  try {
    const { data, error } = await supabase.rpc('statistik_publik')
    if (error) throw error
    statistik.value = data as StatistikPublik
  } catch {
    statistikError.value = true
  }
})

// ---- Layanan posyandu ----
interface ModulLayanan {
  kunci: string
  nama: string
  deskripsi: string
  ikon: typeof Baby
  aktif: boolean
  href?: string
}

const LAYANAN: ModulLayanan[] = [
  {
    kunci: 'balita',
    nama: 'Balita',
    deskripsi: 'Identitas, pengukuran, kurva pertumbuhan, dan riwayat kunjungan balita 0–60 bulan.',
    ikon: Baby,
    aktif: true,
    href: '/balita',
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
    kunci: 'remaja',
    nama: 'Remaja',
    deskripsi: 'Pencatatan tumbuh kembang dan kesehatan remaja.',
    ikon: UserRound,
    aktif: false,
  },
  {
    kunci: 'lansia',
    nama: 'Dewasa & Lansia',
    deskripsi: 'Pemantauan kesehatan dewasa dan lansia di posyandu.',
    ikon: Users,
    aktif: false,
  },
]

// ---- Cara pakai ----
const MANFAAT = [
  {
    ikon: BarChart3,
    judul: 'Pencatatan digital',
    teks: 'Data balita dan kunjungan tersimpan rapi di satu tempat — pengganti Buku KMS manual yang mudah hilang.',
  },
  {
    ikon: TrendingUp,
    judul: 'Status gizi otomatis',
    teks: 'Setiap pengukuran langsung dihitung memakai kurva pertumbuhan WHO dan tersimpan sebagai riwayat.',
  },
  {
    ikon: Lock,
    judul: 'Privasi terjaga',
    teks: 'Data anak dilindungi autentikasi dan aturan akses ketat. Hanya kader terdaftar yang dapat mengelolanya.',
  },
]

const LANGKAH = [
  {
    nomor: '1',
    judul: 'Catat pengukuran',
    teks: 'Berat, tinggi, dan lingkar tubuh dicatat langsung dari hasil penimbangan posyandu.',
  },
  {
    nomor: '2',
    judul: 'Status dihitung otomatis',
    teks: 'Sistem membandingkan dengan kurva WHO dan menyimpan status serta riwayat pertumbuhan anak.',
  },
  {
    nomor: '3',
    judul: 'Pantau & tindak lanjuti',
    teks: 'Kader dan orang tua melihat riwayat; bila tidak normal, segera konsultasikan ke tenaga kesehatan.',
  },
]
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
      <!-- ===== HERO ===== -->
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 -z-10" aria-hidden="true">
          <div
            class="bg-primary/5 absolute inset-0"
            style="background-image: radial-gradient(48rem 26rem at 88% -8%, rgba(13, 148, 136, 0.16), transparent 62%)"
          />
          <div class="bg-primary/10 absolute -top-28 right-[8%] size-96 rounded-full blur-3xl" />
          <div class="bg-accent/10 absolute -bottom-32 -left-24 size-80 rounded-full blur-3xl" />
          <!-- Cahaya merah halus (lapisan kampanye) -->
          <div
            v-if="KAMPANYE_HUT"
            class="anim-melayang bg-red-500/10 absolute -top-24 right-[14%] size-72 rounded-full blur-3xl"
          />
          <div
            class="absolute inset-0 opacity-[0.035]"
            style="background-image: radial-gradient(circle, #059669 1px, transparent 1px); background-size: 28px 28px"
          />
        </div>

        <!-- Angka 81 sebagai watermark elegan (lapisan kampanye, desktop) -->
        <div
          v-if="KAMPANYE_HUT"
          aria-hidden="true"
          class="pointer-events-none absolute -top-8 right-[-3%] -z-10 hidden select-none lg:block"
        >
          <span class="font-display anim-melayang text-red-600/[0.10] text-[22rem] leading-none font-bold">
            81
          </span>
        </div>

        <svg
          class="pointer-events-none absolute inset-x-0 -bottom-2 -z-10 h-36 w-full sm:h-48 lg:h-56"
          viewBox="0 0 1280 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -40 244 C 160 200, 300 84, 520 60 C 700 42, 900 30, 1080 20 C 1180 15, 1240 12, 1320 9"
            fill="none"
            stroke="#0d9488"
            stroke-width="2"
            stroke-dasharray="7 9"
            stroke-opacity="0.3"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
          />
          <path
            d="M -40 280 C 160 236, 300 120, 520 96 C 700 78, 900 66, 1080 56 C 1180 51, 1240 48, 1320 44"
            fill="none"
            stroke="#059669"
            stroke-width="5"
            stroke-opacity="0.45"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
          />
          <circle cx="520" cy="96" r="6" fill="#059669" opacity="0.55" />
          <circle cx="1080" cy="56" r="6" fill="#059669" opacity="0.55" />
        </svg>

        <div
          class="mx-auto max-w-6xl px-4 pt-16 pb-16 sm:px-6 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24"
        >
          <Reveal>
            <div class="mx-auto max-w-3xl text-center">
              <!-- Badge kampanye HUT ke-81 RI -->
              <div v-if="KAMPANYE_HUT" class="mb-4 flex justify-center">
                <span class="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3.5 py-1.5 text-xs font-bold tracking-wide text-red-700 shadow-sm">
                  <svg class="size-3.5 shrink-0" viewBox="0 0 16 10" aria-hidden="true">
                    <rect width="16" height="3.4" rx="0.6" fill="#dc2626" />
                    <rect y="6.6" width="16" height="3.4" rx="0.6" fill="#ffffff" stroke="#dc2626" stroke-width="0.6" />
                  </svg>
                  {{ TEX_KAMPANYE.badge }}
                </span>
              </div>

              <p class="text-primary inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-sm">
                <Sparkles class="size-3.5" />
                PosyanduGizi — Platform digital untuk posyandu
              </p>

              <h1 class="font-display mt-6 text-[2.6rem] leading-[1.1] font-semibold text-balance sm:text-5xl lg:text-[3.6rem]">
                Satu catatan digital untuk tumbuh kembang
                <span
                  :class="KAMPANYE_HUT ? 'text-red-600' : 'text-primary'"
                  class="relative inline-block"
                >
                  seluruh warga.
                  <svg
                    :stroke="KAMPANYE_HUT ? '#dc2626' : '#0d9488'"
                    class="absolute -bottom-2 left-0 w-full sm:-bottom-3"
                    viewBox="0 0 220 12"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M 4 9 C 60 3, 160 3, 216 8"
                      stroke-width="4"
                      stroke-linecap="round"
                      vector-effect="non-scaling-stroke"
                    />
                  </svg>
                </span>
              </h1>

              <!-- Pesan kampanye: kemerdekaan ↔ pelayanan -->
              <p v-if="KAMPANYE_HUT" class="mx-auto mt-6 max-w-xl text-base font-medium text-red-700">
                {{ TEX_KAMPANYE.garis }}
              </p>

              <p class="text-muted-foreground mx-auto mt-4 max-w-xl text-lg leading-relaxed">
                Posyandu Wapalo membantu kader mencatat pengukuran, memantau status gizi, dan menjaga
                riwayat tumbuh kembang — dari balita, ibu hamil, hingga dewasa dan lansia.
              </p>

              <div class="mt-9 flex flex-wrap items-center justify-center gap-3">
                <RouterLink to="/dashboard">
                  <Button
                    size="lg"
                    :variant="KAMPANYE_HUT ? 'destructive' : 'default'"
                    class="gap-2 shadow-lg"
                    :class="KAMPANYE_HUT ? 'shadow-red-600/25' : 'shadow-primary/25'"
                  >
                    <LayoutDashboard class="size-4" />
                    Mulai Sekarang
                  </Button>
                </RouterLink>
                <RouterLink to="/kalkulator">
                  <Button variant="outline" size="lg">
                    Coba Kalkulator Status Gizi
                    <ArrowRight class="size-4" />
                  </Button>
                </RouterLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <!-- ===== STATISTIK BULAN INI ===== -->
      <section v-if="!statistikError" class="relative -mt-6 pb-16 sm:pb-20">
        <div class="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <Card variant="glass-strong">
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
          </Reveal>
        </div>
      </section>

      <!-- ===== LAYANAN POSYANDU ===== -->
      <section id="layanan" class="border-border/60 bg-card/60 scroll-mt-20 border-y">
        <div class="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <!-- Pola garis diagonal halus (motif Indonesia, lapisan kampanye) -->
          <div
            v-if="KAMPANYE_HUT"
            class="pointer-events-none absolute inset-0 opacity-[0.03]"
            aria-hidden="true"
            style="background-image: repeating-linear-gradient(45deg, #dc2626 0, #dc2626 1px, transparent 1px, transparent 16px)"
          />

          <Reveal>
            <p class="text-primary text-xs font-bold tracking-widest uppercase">Layanan terpadu</p>
            <h2 class="font-display mt-4 max-w-xl text-3xl leading-tight font-semibold text-balance sm:text-4xl">
              Satu posyandu, empat sasaran kesehatan.
            </h2>
            <p class="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed">
              Setiap kelompok warga memiliki pencatatan dan pemantauan sendiri dalam satu sistem.
              Balita & bumil sudah berjalan; layanan lainnya menyusul.
            </p>
          </Reveal>

          <div class="mt-12 grid gap-5 md:grid-cols-2">
            <Reveal v-for="(m, i) in LAYANAN" :key="m.kunci" :delay="i * 80">
              <component :is="m.aktif ? RouterLink : 'div'" :to="m.aktif ? m.href : null" class="block h-full">
                <Card
                  variant="glass"
                  class="relative h-full overflow-hidden py-0 transition-all duration-300"
                  :class="m.aktif
                    ? 'hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10'
                    : 'opacity-80'"
                >
                  <!-- Pita merah tipis di puncak kartu layanan aktif (lapisan kampanye) -->
                  <span
                    v-if="m.aktif && KAMPANYE_HUT"
                    aria-hidden="true"
                    class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600"
                  />
                  <CardContent class="flex flex-col gap-4 p-6 sm:p-7">
                    <div class="flex items-start justify-between gap-3">
                      <span
                        class="grid size-12 place-items-center rounded-xl"
                        :class="m.aktif ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'"
                      >
                        <component :is="m.ikon" class="size-6" />
                      </span>
                      <span
                        v-if="m.aktif"
                        class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700"
                      >
                        Aktif
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center gap-1 rounded-full border border-transparent bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground"
                      >
                        Segera
                      </span>
                    </div>
                    <div>
                      <h3 class="font-display text-xl font-semibold">{{ m.nama }}</h3>
                      <p class="text-muted-foreground mt-1.5 text-sm leading-relaxed">{{ m.deskripsi }}</p>
                    </div>
                    <p
                      v-if="m.aktif"
                      class="inline-flex items-center gap-1.5 text-sm font-bold"
                      :class="KAMPANYE_HUT ? 'text-red-600' : 'text-primary'"
                    >
                      Buka layanan
                      <ArrowRight class="size-4" />
                    </p>
                  </CardContent>
                </Card>
              </component>
            </Reveal>
          </div>
        </div>
      </section>

      <!-- ===== KALKULATOR KILAT ===== -->
      <section id="kalkulator" class="scroll-mt-20">
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div class="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal>
              <p class="text-primary text-xs font-bold tracking-widest uppercase">Coba sekarang</p>
              <h2 class="font-display mt-4 max-w-md text-3xl leading-tight font-semibold text-balance sm:text-4xl">
                Cek status gizi anak, gratis tanpa daftar.
              </h2>
              <p class="text-muted-foreground mt-6 max-w-md text-sm leading-relaxed">
                Masukkan jenis kelamin, umur, berat, dan tinggi badan. Hasil status gizi dan kurva
                pertumbuhan WHO muncul seketika di perangkat Anda — cukup dari Buku KMS atau hasil
                penimbangan posyandu.
              </p>
              <ul class="mt-8 space-y-4">
                <li v-for="(m, i) in MANFAAT" :key="m.judul" class="flex gap-3" :style="{ transitionDelay: `${i * 60}ms` }">
                  <span class="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                    <component :is="m.ikon" class="size-5" />
                  </span>
                  <p class="text-sm leading-relaxed"><span class="font-bold">{{ m.judul }}.</span> {{ m.teks }}</p>
                </li>
              </ul>
              <RouterLink to="/kalkulator" class="mt-9 inline-block">
                <Button size="lg" class="gap-2 shadow-lg shadow-primary/25">
                  Buka Kalkulator Lengkap
                  <ArrowRight class="size-4" />
                </Button>
              </RouterLink>
            </Reveal>

            <Reveal :delay="140">
              <div class="relative">
                <div
                  class="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/25 to-accent/20 blur-xl"
                  aria-hidden="true"
                />
                <Card
                  variant="glass-strong"
                  class="rounded-3xl py-0"
                >
                  <CardContent class="gap-0 p-6 sm:p-7">
                    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
                      <p class="font-display flex items-center gap-2 text-lg font-semibold">
                        <HeartPulse class="text-primary size-5" />
                        Kalkulator kilat
                      </p>
                      <div
                        class="inline-flex rounded-xl border border-emerald-200 bg-emerald-50 p-1"
                        role="group"
                        aria-label="Jenis kelamin"
                      >
                        <button
                          v-for="(label, k) in { L: 'Laki-laki', P: 'Perempuan' }"
                          :key="k"
                          type="button"
                          :class="jk === k
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'"
                          class="rounded-lg px-3 py-1.5 text-sm font-bold transition-colors"
                          @click="jk = k"
                        >
                          {{ label }}
                        </button>
                      </div>
                    </div>

                    <div class="rounded-2xl border border-border bg-white p-3 sm:p-4">
                      <KurvaWHO :jk="jk" :umur-bulan="umur" :z="hasil?.z_bb_u ?? null" />
                    </div>

                    <div class="mt-7 grid gap-5 sm:grid-cols-3">
                      <div>
                        <label for="mini-umur" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                          <span>Umur</span><span class="text-foreground tabular-nums">{{ umur }} bln</span>
                        </label>
                        <input id="mini-umur" v-model.number="umur" type="range" min="0" max="60" step="1" class="accent-primary w-full" />
                      </div>
                      <div>
                        <label for="mini-berat" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                          <span>Berat</span><span class="text-foreground tabular-nums">{{ berat }} kg</span>
                        </label>
                        <input id="mini-berat" v-model.number="berat" type="range" min="2" max="25" step="0.1" class="accent-primary w-full" />
                      </div>
                      <div>
                        <label for="mini-panjang" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                          <span>Panjang</span><span class="text-foreground tabular-nums">{{ panjang }} cm</span>
                        </label>
                        <input id="mini-panjang" v-model.number="panjang" type="range" min="45" max="120" step="0.5" class="accent-primary w-full" />
                      </div>
                    </div>

                    <div v-if="hasil" class="mt-6 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:grid-cols-3">
                      <div>
                        <p class="text-muted-foreground text-xs font-bold">BB/U</p>
                        <StatusBadge class="mt-1" :kode="hasil.status_bb_u" />
                        <p class="text-muted-foreground mt-1.5 text-xs tabular-nums">z = {{ hasil.z_bb_u?.toFixed(2) }}</p>
                      </div>
                      <div>
                        <p class="text-muted-foreground text-xs font-bold">TB/U</p>
                        <StatusBadge class="mt-1" :kode="hasil.status_tb_u" />
                        <p class="text-muted-foreground mt-1.5 text-xs tabular-nums">z = {{ hasil.z_tb_u?.toFixed(2) }}</p>
                      </div>
                      <div>
                        <p class="text-muted-foreground text-xs font-bold">BB/TB</p>
                        <StatusBadge class="mt-1" :kode="hasil.status_bb_tb" />
                        <p class="text-muted-foreground mt-1.5 text-xs tabular-nums">z = {{ hasil.z_bb_tb?.toFixed(2) }}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <!-- ===== CARA PAKAI ===== -->
      <section id="cara-pakai" class="border-border/60 bg-card/60 scroll-mt-20 border-y">
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <p class="text-primary text-xs font-bold tracking-widest uppercase">Langkah sederhana</p>
            <h2 class="font-display mt-4 max-w-xl text-3xl leading-tight font-semibold text-balance sm:text-4xl">
              Dari penimbangan hingga riwayat lengkap.
            </h2>
          </Reveal>

          <div class="relative mt-14 grid gap-14 md:grid-cols-3 md:gap-8">
            <span
              aria-hidden="true"
              class="absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dashed border-emerald-200 md:block"
            />
            <Reveal v-for="(l, i) in LANGKAH" :key="l.nomor" :delay="i * 100">
              <div class="relative flex flex-col items-center text-center">
                <span class="font-display bg-primary text-primary-foreground relative z-10 grid size-14 place-items-center rounded-full text-xl font-semibold shadow-lg shadow-primary/25 ring-8 ring-background">
                  {{ l.nomor }}
                </span>
                <h3 class="font-display mt-6 text-xl font-semibold">{{ l.judul }}</h3>
                <p class="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">{{ l.teks }}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <!-- ===== TENTANG ===== -->
      <section id="tentang" class="scroll-mt-20">
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div class="grid items-start gap-12 md:grid-cols-2 lg:gap-16">
            <Reveal>
              <div class="flex items-center gap-3">
                <svg class="size-10 shrink-0" viewBox="0 0 56 32" fill="none" aria-hidden="true">
                  <path
                    d="M2 26 C 14 20, 22 10, 32 8 C 40 6, 48 6, 54 4"
                    stroke="#0d9488"
                    stroke-width="2"
                    stroke-dasharray="4 4"
                    stroke-linecap="round"
                  />
                  <path
                    d="M2 30 C 16 24, 24 14, 34 12 C 42 10, 50 10, 54 8"
                    stroke="#059669"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                  <circle cx="34" cy="12" r="3" fill="#059669" />
                </svg>
                <p class="text-primary text-xs font-bold tracking-widest uppercase">Tentang standar</p>
              </div>
              <h2 class="font-display mt-4 text-3xl leading-tight font-semibold text-balance sm:text-4xl">
                Berbasis kurva pertumbuhan WHO.
              </h2>
              <p class="text-muted-foreground mt-6 leading-relaxed">
                WHO Child Growth Standards (2006) menjadi rujukan global untuk menilai tumbuh kembang anak. Metode LMS memodelkan distribusi berat dan tinggi pada setiap bulan usia, lalu mengubah pengukuran menjadi skor-z.
              </p>
              <p class="text-muted-foreground mt-4 leading-relaxed">
                Dari skor-z itulah status gizi disimpulkan: berat badan per umur, tinggi badan per umur, dan berat badan per tinggi.
              </p>
              <div class="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <ShieldCheck class="mt-0.5 size-5 shrink-0 text-amber-600" />
                <p class="text-sm leading-relaxed text-amber-800">
                  Kalkulator ini alat bantu awal, bukan diagnosis medis. Bila hasil di luar kategori normal, segera konsultasikan ke tenaga kesehatan atau kunjungi posyandu.
                </p>
              </div>
            </Reveal>
            <Reveal :delay="120">
              <Card variant="glass" class="py-0">
                <CardContent class="gap-0 p-6 sm:p-7">
                  <p class="font-display mb-6 text-lg font-semibold">Mengapa skor-z?</p>
                  <ul class="space-y-5">
                    <li class="flex gap-3">
                      <span class="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                        <CalendarDays class="size-5" />
                      </span>
                      <p class="text-sm leading-relaxed"><span class="font-bold">Umur-presisi.</span> Tiap bulan usia punya kurva sendiri — bukan sekadar kategori kasar, hasilnya peka terhadap perubahan kecil.</p>
                    </li>
                    <li class="flex gap-3">
                      <span class="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                        <Baby class="size-5" />
                      </span>
                      <p class="text-sm leading-relaxed"><span class="font-bold">Jenis kelamin dibedakan.</span> Kurva laki-laki dan perempuan terpisah sesuai standar internasional.</p>
                    </li>
                    <li class="flex gap-3">
                      <span class="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                        <Activity class="size-5" />
                      </span>
                      <p class="text-sm leading-relaxed"><span class="font-bold">Ambang baku.</span> Batas −2 dan −3 SD dipakai secara konsisten untuk kategori kurus, pendek, dan gizi kurang.</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      <!-- ===== CTA ===== -->
      <section class="border-border/60 bg-card/60 border-t">
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div class="from-primary to-accent relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-10 text-center shadow-2xl shadow-primary/25 sm:p-16">
              <!-- Pita merah tipis di puncak CTA (lapisan kampanye) -->
              <span
                v-if="KAMPANYE_HUT"
                aria-hidden="true"
                class="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 via-red-400 to-red-600"
              />
              <div class="absolute inset-0 opacity-10" aria-hidden="true" style="background-image: radial-gradient(24rem 12rem at 50% 0%, rgba(255,255,255,.9), transparent 70%)" />
              <svg
                class="pointer-events-none absolute inset-x-0 -bottom-6 h-36 w-full opacity-[0.09]"
                viewBox="0 0 1280 300"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M -40 244 C 160 200, 300 84, 520 60 C 700 42, 900 30, 1080 20"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="3"
                  stroke-dasharray="8 10"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                />
                <path
                  d="M -40 280 C 160 236, 300 120, 520 96 C 700 78, 900 66, 1080 56"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="6"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
              <div class="relative">
                <p v-if="KAMPANYE_HUT" class="text-xs font-bold tracking-widest text-white/80 uppercase">
                  {{ TEX_KAMPANYE.cta }}
                </p>
                <p class="mt-3 text-xs font-bold tracking-widest text-white/70 uppercase">Sehat &amp; mandiri untuk semua</p>
                <h2 class="font-display mx-auto mt-4 max-w-2xl text-3xl leading-tight font-semibold text-white text-balance sm:text-4xl">
                  Mulai kelola data posyandu secara digital.
                </h2>
                <p class="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/80">
                  Kader dapat masuk untuk mencatat dan memantau kunjungan. Pengunjung lain bebas mencoba kalkulator status gizi tanpa daftar.
                </p>
                <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
                  <RouterLink to="/dashboard">
                    <Button size="lg" variant="secondary" class="gap-2 bg-white text-emerald-700 shadow-lg hover:bg-emerald-50">
                      Jelajahi Layanan
                      <ArrowRight class="size-4" />
                    </Button>
                  </RouterLink>
                  <RouterLink to="/login">
                    <Button size="lg" variant="outline" class="border-white/40 bg-transparent text-white shadow-lg hover:bg-white/10">
                      <Lock class="size-4" />
                      Masuk sebagai Kader
                    </Button>
                  </RouterLink>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
/* Animasi halus lapisan kampanye — tetap hormati prefers-reduced-motion */
@keyframes melayang-hut {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.anim-melayang {
  animation: melayang-hut 7s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .anim-melayang {
    animation: none;
  }
}
</style>