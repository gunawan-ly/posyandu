<script setup lang="ts">
import {
  ArrowRight,
  Baby,
  HeartPulse,
  UserRound,
  Users,
} from '@lucide/vue'
import { RouterLink } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/supabase/useAuth'

const { isAutentikasi } = useAuth()

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
    kunci: 'bumil',
    nama: 'Bumil',
    deskripsi: 'Pemantauan ibu hamil: identitas, kunjungan, dan status kesehatan.',
    ikon: HeartPulse,
    aktif: true,
    href: '/bumil',
  },
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
    kunci: 'remaja',
    nama: 'Remaja',
    deskripsi: 'Pencatatan tumbuh kembang dan kesehatan remaja.',
    ikon: UserRound,
    aktif: true,
    href: '/remaja',
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
          Data ibu hamil, balita, apras, dan remaja sudah aktif; dewasa & lansia menyusul.
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
                  Rekapitulasi
                </RouterLink>
                <RouterLink
                  v-if="m.kunci === 'bumil' && isAutentikasi"
                  to="/bumil/rekap"
                  class="text-muted-foreground hover:text-primary inline-flex items-center text-sm font-medium underline-offset-4 hover:underline"
                >
                  Rekapitulasi
                </RouterLink>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </section>
</template>
