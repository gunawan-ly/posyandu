<script setup lang="ts">
import { Scale } from '@lucide/vue'
import { computed, ref } from 'vue'
import KurvaWHO from '@/components/KurvaWHO.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hitungZLik, hitungZLil } from '@/lib/kalkulator'
import { parseTanggal } from '@/lib/umur'
import type { Balita, Kunjungan } from '@/modules/balita/db'

const props = defineProps<{
  balita: Balita
  kunjungan: Kunjungan[]
}>()

const kunjunganTerbaru = computed<Kunjungan | null>(() => props.kunjungan.at(-1) ?? null)

const jkKurva = computed<'L' | 'P'>(() => (props.balita.jenis_kelamin === 'Perempuan' ? 'P' : 'L'))

type TabKurva = 'bbu' | 'tbu' | 'bbtb' | 'lika' | 'lila'
const TAB_KURVA: { kunci: TabKurva; label: string }[] = [
  { kunci: 'bbu', label: 'BB/U' },
  { kunci: 'tbu', label: 'TB/U' },
  { kunci: 'bbtb', label: 'BB/TB' },
  { kunci: 'lika', label: 'LiKA' },
  { kunci: 'lila', label: 'LiLA' },
]
const tabKurva = ref<TabKurva>('bbu')

const kurvaProps = computed(() => {
  const k = kunjunganTerbaru.value
  const umur = k?.umur_bulan ?? 0
  if (tabKurva.value === 'bbu') return { indikator: 'bbu' as const, umurBulan: umur, nilai: 0, z: k?.z_bb_u ?? null }
  if (tabKurva.value === 'tbu') return { indikator: 'tbu' as const, umurBulan: umur, nilai: 0, z: k?.z_tb_u ?? null }
  if (tabKurva.value === 'lika') {
    const z = k?.lingkar_kepala != null ? hitungZLik(jkKurva.value, umur, k.lingkar_kepala) : null
    return { indikator: 'lika' as const, umurBulan: umur, nilai: 0, z }
  }
  if (tabKurva.value === 'lila') {
    const z = k?.lingkar_lengan != null ? hitungZLil(jkKurva.value, umur, k.lingkar_lengan) : null
    return { indikator: 'lila' as const, umurBulan: umur, nilai: 0, z }
  }
  return { indikator: 'bbtb' as const, umurBulan: umur, nilai: k?.tinggi_badan ?? 0, z: k?.z_bb_tb ?? null }
})

const keteranganKurva = computed(() => {
  const k = kunjunganTerbaru.value
  if (!k) return ''
  if (tabKurva.value === 'bbu') return `z-score BB/U ${k.z_bb_u != null ? k.z_bb_u.toFixed(2) : '—'}`
  if (tabKurva.value === 'tbu') return `z-score TB/U ${k.z_tb_u != null ? k.z_tb_u.toFixed(2) : '—'}`
  if (tabKurva.value === 'lika') {
    const z = k.lingkar_kepala != null ? hitungZLik(jkKurva.value, k.umur_bulan ?? 0, k.lingkar_kepala) : null
    return `lingkar kepala ${k.lingkar_kepala ?? '—'} cm · z-score ${z != null ? z.toFixed(2) : '—'}`
  }
  if (tabKurva.value === 'lila') {
    const z = k.lingkar_lengan != null ? hitungZLil(jkKurva.value, k.umur_bulan ?? 0, k.lingkar_lengan) : null
    return `lingkar lengan ${k.lingkar_lengan ?? '—'} cm · z-score ${z != null ? z.toFixed(2) : '—'}`
  }
  return `panjang ${k.tinggi_badan ?? '—'} cm · z-score BB/TB ${k.z_bb_tb != null ? k.z_bb_tb.toFixed(2) : '—'}`
})

function formatTanggal(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <Card>
    <CardHeader class="flex flex-wrap items-center justify-between gap-3 sm:flex-row">
      <CardTitle class="font-display text-lg font-normal">Kurva pertumbuhan</CardTitle>
      <div
        class="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 p-1"
        role="group"
        aria-label="Pilih indikator kurva"
      >
        <button
          v-for="t in TAB_KURVA"
          :key="t.kunci"
          type="button"
          :class="tabKurva === t.kunci
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'"
          class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-bold transition-colors"
          @click="tabKurva = t.kunci"
        >
          {{ t.label }}
        </button>
      </div>
    </CardHeader>
    <CardContent>
      <template v-if="kunjunganTerbaru">
        <KurvaWHO :jk="jkKurva" v-bind="kurvaProps" />
        <p class="text-muted-foreground mt-2 text-xs">
          Kunjungan {{ formatTanggal(kunjunganTerbaru.tanggal_kunjungan) }},
          umur {{ kunjunganTerbaru.umur_bulan ?? '—' }} bulan ·
          {{ keteranganKurva }}.
        </p>
      </template>
      <div
        v-else
        class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-white/50 px-6 py-10 text-center"
      >
        <Scale class="text-emerald-300 size-8" />
        <p class="font-display mt-3">Belum ada pengukuran</p>
        <p class="text-muted-foreground mt-1 text-sm">Catat kunjungan pertama untuk melihat kurva pertumbuhan.</p>
      </div>
    </CardContent>
  </Card>
</template>
