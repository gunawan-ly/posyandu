<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { labelYaTidak, type Kunjungan } from '@/modules/balita/db'
import { kodeDariLabel } from '@/lib/status'
import { parseTanggal } from '@/lib/umur'

defineProps<{
  kunjungan: Kunjungan[]
  isAdmin: boolean
}>()

const emit = defineEmits<{ hapus: [kunjungan: Kunjungan] }>()

function formatTanggal(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="font-display text-lg font-normal">Riwayat kunjungan</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="kunjungan.length === 0" class="text-muted-foreground text-sm">
        Belum ada kunjungan tercatat.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[1400px] text-sm">
          <thead>
            <tr class="text-muted-foreground border-border/60 border-b text-left text-xs font-bold tracking-wide uppercase">
              <th class="py-2 pr-3 whitespace-nowrap">Tanggal</th>
              <th class="py-2 pr-3">Umur</th>
              <th class="py-2 pr-3">BB (kg)</th>
              <th class="py-2 pr-3">Status BB/U</th>
              <th class="py-2 pr-3">TB (cm)</th>
              <th class="py-2 pr-3">Status TB/U</th>
              <th class="py-2 pr-3">BB/TB</th>
              <th class="py-2 pr-3">LiKA (cm)</th>
              <th class="py-2 pr-3">Status LiKA</th>
              <th class="py-2 pr-3">LiLA (cm)</th>
              <th class="py-2 pr-3">Status LiLA</th>
              <th class="py-2 pr-3">BB naik</th>
              <th class="py-2 pr-3">Imunisasi</th>
              <th class="py-2 pr-3">Vit. A</th>
              <th class="py-2 pr-3">ASI</th>
              <th class="py-2 pr-3">MP-ASI</th>
              <th class="py-2 pr-3">Cacing</th>
              <th class="py-2 pr-3">Ceklis</th>
              <th class="py-2 pr-3">TBC</th>
              <th class="py-2 pr-3">Edukasi</th>
              <th class="py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="k in kunjungan" :key="k.id" class="border-border/60 border-b last:border-0">
              <td class="py-3 pr-3 font-medium whitespace-nowrap">{{ formatTanggal(k.tanggal_kunjungan) }}</td>
              <td class="py-3 pr-3 text-muted-foreground whitespace-nowrap">{{ k.umur_bulan ?? '—' }} bln</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.berat_badan ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap"><StatusBadge :kode="kodeDariLabel(k.bb_menurut_umur)" /></td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.tinggi_badan ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap"><StatusBadge :kode="kodeDariLabel(k.pbtb_menurut_umur)" /></td>
              <td class="py-3 pr-3 whitespace-nowrap"><StatusBadge :kode="kodeDariLabel(k.bb_menurut_pbtb)" /></td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.lingkar_kepala ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap"><StatusBadge :kode="kodeDariLabel(k.status_lingkar_kepala)" /></td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.lingkar_lengan ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap"><StatusBadge :kode="kodeDariLabel(k.status_lingkar_lengan)" /></td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.bb_naik_tidak ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.imunisasi) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.vitamin_a) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.asi_eksklusif) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.mp_asi) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.obat_cacing) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.ceklis_perkembangan) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.gejala_tbc) }}</td>
              <td class="text-muted-foreground py-3 pr-3 max-w-[160px] truncate whitespace-nowrap" :title="k.edukasi || ''">{{ k.edukasi || '—' }}</td>
              <td v-if="isAdmin" class="py-3 text-right">
                <button
                  type="button"
                  class="text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-lg p-2 transition-colors"
                  aria-label="Hapus kunjungan"
                  title="Hapus kunjungan"
                  @click="emit('hapus', k)"
                >
                  <Trash2 class="size-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</template>
