<script setup lang="ts">
import {
  Baby,
  BarChart3,
  CalendarDays,
  HeartPulse,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from '@lucide/vue'
import { Card, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/Skeleton.vue'
import type { StatistikPublik, KartuStatistik } from '@/composables/useStatistikPublik'

defineProps<{
  statistik: StatistikPublik | null
  statistikLoading: boolean
  statistikError: boolean
  labelBulanIni: string
  sasaran: KartuStatistik[]
  kunjungan: KartuStatistik[]
}>()

const IKON_MAP: Record<string, typeof Baby> = {
  bayi: Baby,
  balita: Users,
  apras: UserRound,
  bumil: HeartPulse,
  busui: Sparkles,
  'kunj-balita': CalendarDays,
  'kunj-apras': UserRound,
  'kunj-bumil': TrendingUp,
}
</script>

<template>
  <section v-if="!statistikError" class="flex flex-col items-center justify-center py-16 sm:py-20">
    <div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <Card v-if="statistikLoading" variant="glass-strong" role="status" aria-label="Memuat…">
        <CardContent class="flex flex-col gap-6 p-6 sm:p-7">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <Skeleton class="h-4 w-44" />
            <Skeleton class="h-6 w-48 rounded-full" />
          </div>
          <div class="grid gap-6 sm:grid-cols-2">
            <div class="space-y-4">
              <Skeleton class="h-4 w-32" />
              <div v-for="i in 3" :key="i" class="flex items-start gap-3">
                <Skeleton class="size-11 rounded-xl" />
                <div class="flex-1 space-y-2">
                  <Skeleton class="h-3 w-20" />
                  <Skeleton class="h-7 w-16" />
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <Skeleton class="h-4 w-36" />
              <div v-for="i in 2" :key="i" class="flex items-start gap-3">
                <Skeleton class="size-11 rounded-xl" />
                <div class="flex-1 space-y-2">
                  <Skeleton class="h-3 w-28" />
                  <Skeleton class="h-7 w-16" />
                </div>
              </div>
            </div>
          </div>
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
          <div class="grid gap-6 sm:grid-cols-2">
            <!-- Kolom kiri: Sasaran Penduduk -->
            <div class="space-y-1">
              <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Sasaran penduduk</p>
              <div v-for="k in sasaran" :key="k.key" class="flex items-start gap-3">
                <span class="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
                  <component :is="IKON_MAP[k.key]" class="size-5" />
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
            </div>
            <!-- Kolom kanan: Kunjungan Bulan Ini -->
            <div class="space-y-1">
              <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Kunjungan bulan ini</p>
              <div v-for="k in kunjungan" :key="k.key" class="flex items-start gap-3">
                <span class="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
                  <component :is="IKON_MAP[k.key]" class="size-5" />
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
