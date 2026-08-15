<script setup lang="ts">
import {
  ArrowRight,
  Baby,
  HeartPulse,
  LayoutDashboard,
  Lock,
  UserRound,
  Users,
} from '@lucide/vue'
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/supabase/useAuth'

const { isAutentikasi, user, inisialisasi } = useAuth()

onMounted(() => {
  inisialisasi()
})

interface ModulPosyandu {
  kunci: string
  nama: string
  deskripsi: string
  ikon: typeof Baby
  aktif: boolean
  href?: string
}

const MODUL: ModulPosyandu[] = [
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
    aktif: false,
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
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />

    <section class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-primary text-xs font-bold tracking-widest uppercase">Posyandu</p>
          <h1 class="font-display mt-3 text-3xl leading-tight sm:text-4xl">Dashboard</h1>
          <p class="text-muted-foreground mt-3 max-w-xl text-sm">
            Pilih layanan posyandu yang ingin dikelola. Data balita tersedia; layanan lain menyusul.
          </p>
        </div>
        <div v-if="isAutentikasi" class="text-right">
          <p class="text-muted-foreground text-xs font-bold tracking-wide uppercase">Kader</p>
          <p class="text-foreground mt-0.5 text-sm font-medium" :title="user?.email">{{ user?.email }}</p>
        </div>
        <RouterLink v-else to="/login">
          <Button variant="outline">
            <Lock class="size-4" />
            Masuk sebagai kader
          </Button>
        </RouterLink>
      </div>

      <div class="mt-10 grid gap-5 md:grid-cols-2">
        <component
          :is="m.aktif ? RouterLink : 'div'"
          v-for="m in MODUL"
          :key="m.kunci"
          :to="m.aktif ? m.href : null"
          class="block h-full"
        >
          <Card
            class="h-full transition-all"
            :class="m.aktif
              ? 'hover:border-primary/50 hover:shadow-primary/10 hover:shadow-lg'
              : 'opacity-80'"
          >
            <CardContent class="flex flex-col gap-4">
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
                <h2 class="font-display text-xl">{{ m.nama }}</h2>
                <p class="text-muted-foreground mt-1.5 text-sm leading-relaxed">{{ m.deskripsi }}</p>
              </div>
              <p
                v-if="m.aktif"
                class="text-primary inline-flex items-center gap-1.5 text-sm font-bold"
              >
                Buka layanan
                <ArrowRight class="size-4" />
              </p>
            </CardContent>
          </Card>
        </component>
      </div>

      <div class="mt-8 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <LayoutDashboard class="mt-0.5 size-5 shrink-0 text-emerald-600" />
        <p class="text-sm text-emerald-800">
          Modul Bumil, Remaja, serta Dewasa & Lansia sedang disiapkan. Rekap statistik dan laporan
          menyusul setelah seluruh layanan tersedia.
        </p>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
