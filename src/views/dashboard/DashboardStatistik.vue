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
import type { StatistikPublik } from '@/composables/useStatistikPublik'

defineProps<{
  statistik: StatistikPublik | null
  statistikLoading: boolean
  statistikError: boolean
  labelBulanIni: string
  kartuStatistik: {
    label: string
    nilai: number | null
    akhiran: string
    keterangan: string
    key: string
  }[]
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
            <div v-for="k in kartuStatistik" :key="k.label" class="flex items-start gap-3">
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
          </dl>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
