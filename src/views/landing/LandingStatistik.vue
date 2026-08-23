<script setup lang="ts">
import {
  Baby,
  BarChart3,
  CalendarDays,
  HeartPulse,
  Sparkles,
  TrendingUp,
  Users,
} from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import Reveal from '@/components/Reveal.vue'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/supabase/client'

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
</script>

<template>
  <section v-if="!statistikError" class="flex flex-col items-center justify-center py-16 sm:py-20">
    <div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
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
</template>
