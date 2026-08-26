<script setup lang="ts">
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  UserRound,
} from '@lucide/vue'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/Skeleton.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { type KunjunganTerakhir } from '@/modules/balita/db'
import { kodeDariLabel } from '@/lib/status'
import { formatUmur, formatTanggal } from '@/lib/label'

defineProps<{
  daftar: KunjunganTerakhir[]
  loading: boolean
  error: string
}>()

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
</script>

<template>
  <section class="scroll-mt-20">
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

      <div v-if="loading" class="mt-8 grid gap-4 md:grid-cols-2" role="status" aria-label="Memuat…">
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

      <p v-else-if="error" class="mt-6 text-sm font-medium text-red-600" role="alert">
        {{ error }}
      </p>

      <div v-else-if="daftar.length === 0" class="mt-10">
        <div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-white/50 px-8 py-14 text-center">
          <CheckCircle2 class="text-emerald-500 size-10" />
          <p class="font-display mt-4 text-lg">Tidak ada balita yang perlu perhatian khusus.</p>
          <p class="text-muted-foreground mt-1 max-w-sm text-sm">
            Semua status kunjungan terakhir balita dalam kategori normal.
          </p>
        </div>
      </div>

      <div v-else class="mt-8 grid gap-4 md:grid-cols-2">
        <Card v-for="k in daftar" :key="k.balita_id" variant="glass-strong" class="h-full">
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
</template>
