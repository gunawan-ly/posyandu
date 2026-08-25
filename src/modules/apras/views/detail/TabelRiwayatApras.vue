<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { KunjunganApras } from '@/modules/apras/db'
import { parseTanggal } from '@/lib/umur'

defineProps<{
  kunjungan: KunjunganApras[]
  isAdmin: boolean
}>()

const emit = defineEmits<{ hapus: [kunjungan: KunjunganApras]; lihat: [kunjungan: KunjunganApras] }>()

function formatTanggal(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function yaTidak(nilai: string | null): string {
  return nilai || '—'
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
        <table class="w-full min-w-[820px] text-sm">
          <thead>
            <tr class="text-muted-foreground border-border/60 border-b text-left text-xs font-bold tracking-wide uppercase">
              <th class="py-2 pr-3 whitespace-nowrap">Tanggal</th>
              <th class="py-2 pr-3">Umur</th>
              <th class="py-2 pr-3">BB (kg)</th>
              <th class="py-2 pr-3">TB (cm)</th>
              <th class="py-2 pr-3">LiKA (cm)</th>
              <th class="py-2 pr-3">LiLA (cm)</th>
              <th class="py-2 pr-3">Cacing</th>
              <th class="py-2 pr-3">TBC</th>
              <th class="py-2 pr-3">Rujuk</th>
              <th class="py-2 pr-3">Edukasi / Catatan</th>
              <th v-if="isAdmin" class="py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="k in kunjungan"
              :key="k.id"
              class="hover:bg-emerald-50/40 cursor-pointer border-border/60 border-b last:border-0"
              @click="emit('lihat', k)"
            >
              <td class="py-3 pr-3 font-medium whitespace-nowrap">{{ formatTanggal(k.tanggal_kunjungan) }}</td>
              <td class="text-muted-foreground py-3 pr-3 whitespace-nowrap">{{ k.umur_bulan ?? '—' }} bln</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.berat_badan ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.tinggi_badan ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.lingkar_kepala ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.lingkar_lengan ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ yaTidak(k.obat_cacing) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ yaTidak(k.gejala_tbc) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ yaTidak(k.dirujuk) }}</td>
              <td class="text-muted-foreground max-w-[180px] truncate py-3 pr-3 whitespace-nowrap" :title="[k.edukasi, k.catatan].filter(Boolean).join(' | ') || ''">
                {{ [k.edukasi, k.catatan].filter(Boolean).join(' | ') || '—' }}
              </td>
              <td v-if="isAdmin" class="py-3 text-right">
                <button
                  type="button"
                  class="text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-lg p-2 transition-colors"
                  aria-label="Hapus kunjungan"
                  title="Hapus kunjungan"
                  @click.stop="emit('hapus', k)"
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
