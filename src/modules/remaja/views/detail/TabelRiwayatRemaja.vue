<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { KunjunganRemaja } from '@/modules/remaja/db'
import { parseTanggal } from '@/lib/umur'

defineProps<{
  kunjungan: KunjunganRemaja[]
  isAdmin: boolean
}>()

const emit = defineEmits<{
  hapus: [kunjungan: KunjunganRemaja]
  ubah: [kunjungan: KunjunganRemaja]
  lihat: [kunjungan: KunjunganRemaja]
}>()

function formatTanggal(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function angka(nilai: number | null): string {
  return nilai != null ? String(nilai) : '—'
}

function tahun(umur: number | null): string {
  if (umur == null) return '—'
  return `${Math.floor(umur)} th`
}

function teksGabung(edukasi: string | null, catatan: string | null): string {
  return [edukasi, catatan].filter(Boolean).join(' | ') || '—'
}

function gabung(tekanan: string | null, nama: string | null): string {
  if (!tekanan) return '—'
  return `${tekanan}${nama ? ` (${nama})` : ''}`
}

const yaTidak = (nilai: string | null): string => nilai || '—'
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
        <table class="text-sm w-full min-w-[980px]">
          <thead>
            <tr class="text-muted-foreground text-left border-border/60 border-b text-xs font-bold tracking-wide uppercase">
              <th class="py-2 pr-3 whitespace-nowrap">Tanggal</th>
              <th class="py-2 pr-3">Umur</th>
              <th class="py-2 pr-3">BB (kg)</th>
              <th class="py-2 pr-3">TB (cm)</th>
              <th class="py-2 pr-3">IMT</th>
              <th class="py-2 pr-3">Status gizi</th>
              <th class="py-2 pr-3">Lingkar perut</th>
              <th class="py-2 pr-3">Tekanan darah</th>
              <th class="py-2 pr-3">Gula darah</th>
              <th class="py-2 pr-3">Hb</th>
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
              class="border-border/60 border-b last:border-0 cursor-pointer hover:bg-emerald-50/40 transition-colors"
              @click="emit('lihat', k)"
            >
              <td class="py-3 pr-3 font-medium whitespace-nowrap">{{ formatTanggal(k.tanggal_kunjungan) }}</td>
              <td class="text-muted-foreground py-3 pr-3 whitespace-nowrap">{{ tahun(k.umur_tahun) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ angka(k.berat_badan) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ angka(k.tinggi_badan) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ angka(k.imt) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ yaTidak(k.status_gizi) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ angka(k.lingkar_perut) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ gabung(k.td_sistole != null ? `${k.td_sistole}/${k.td_diastole ?? '?'}` : '', k.td_kategori) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ gabung(k.gula_darah != null ? String(k.gula_darah) : '', k.gula_kategori) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ angka(k.hb) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.kontak_erat_tbc === 'Ya' ? `${yaTidak(k.kontak_erat_tbc)}*` : '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ yaTidak(k.rujuk) }}</td>
              <td class="text-muted-foreground max-w-[180px] truncate py-3 pr-3 whitespace-nowrap" :title="teksGabung(k.edukasi, k.catatan)">
                {{ teksGabung(k.edukasi, k.catatan) }}
              </td>
              <td v-if="isAdmin" class="py-3 text-right">
                <button
                  type="button"
                  class="text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 rounded-lg p-2 transition-colors"
                  aria-label="Ubah kunjungan"
                  title="Ubah kunjungan"
                  @click.stop="emit('ubah', k)"
                >
                  <Pencil class="size-4" />
                </button>
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
        <p class="text-muted-foreground mt-2 text-xs">* kontak erat dengan pasien TBC (tidak dihitung sebagai gejala skrining).</p>
      </div>
    </CardContent>
  </Card>
</template>
