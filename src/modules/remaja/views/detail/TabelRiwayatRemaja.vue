<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { KunjunganRemaja } from '@/modules/remaja/db'
import { parseTanggal } from '@/lib/umur'

// Struktur kolom bertingkat ala tabel rekapitulasi: grup induk membungkus
// beberapa kolom anak (colspan/rowspan). Tanggal & Umur adalah kolom tunggal
// (rowspan 2), sisanya terkelompok.
const GRUP = [
  {
    grup: 'Hasil Penimbangan / Pengukuran',
    kolom: ['Berat badan', 'Tinggi badan', 'IMT'],
  },
  {
    grup: 'Pemeriksaan',
    kolom: ['Lingkar perut', 'TD (mmHg)', 'TD (status)', 'Gula darah', 'Gula (status)', 'Hb', 'Anemia'],
  },
  {
    grup: 'Skrining TBC',
    kolom: ['Batuk', 'Demam', 'BB tidak naik', 'Kontak erat'],
  },
  {
    grup: 'Layanan',
    kolom: ['Rujuk', 'Edukasi / Catatan'],
  },
] as const

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

const yaTidak = (nilai: string | null): string => nilai || '—'

function tekanan(nilai: number | null, satuan: string | null): string {
  if (nilai == null) return '—'
  return `${nilai}/${satuan ?? '?'}`
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
        <table class="text-sm w-full min-w-[1100px] border-collapse">
          <thead>
            <tr class="text-muted-foreground border-border/60 border-b bg-muted/40 text-xs font-bold tracking-wide uppercase">
              <th rowspan="2" class="border-border/60 align-bottom sticky left-0 z-10 bg-background px-3 py-2 text-center whitespace-nowrap">Tanggal</th>
              <th rowspan="2" class="border-border/60 align-bottom border-l px-3 py-2 text-center whitespace-nowrap">Umur</th>
              <template v-for="g in GRUP" :key="g.grup">
                <th
                  v-if="g.kolom.length > 1"
                  :colspan="g.kolom.length"
                  class="border-border/60 border-l px-3 py-2 text-center"
                >
                  {{ g.grup }}
                </th>
                <th
                  v-else
                  rowspan="2"
                  class="border-border/60 align-bottom border-l px-3 py-2 text-center"
                >
                  {{ g.grup }}
                </th>
              </template>
              <th v-if="isAdmin" rowspan="2" class="border-border/60 border-l px-3 py-2"></th>
            </tr>
            <tr class="text-muted-foreground border-border/60 border-b bg-muted/40 text-xs font-bold uppercase">
              <template v-for="g in GRUP" :key="'sub-' + g.grup">
                <th
                  v-for="k in g.kolom.length > 1 ? g.kolom : []"
                  :key="g.grup + k"
                  class="border-border/60 border-l px-3 py-1.5 text-center whitespace-nowrap"
                >
                  {{ k }}
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="k in kunjungan"
              :key="k.id"
              class="hover:bg-emerald-50/40 cursor-pointer border-border/60 border-b transition-colors last:border-0"
              @click="emit('lihat', k)"
            >
              <td class="bg-background font-medium sticky left-0 z-10 px-3 py-3 text-center whitespace-nowrap">{{ formatTanggal(k.tanggal_kunjungan) }}</td>
              <td class="text-muted-foreground px-3 py-3 text-center whitespace-nowrap">{{ tahun(k.umur_tahun) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ angka(k.berat_badan) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ angka(k.tinggi_badan) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ yaTidak(k.imt) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ angka(k.lingkar_perut) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ tekanan(k.td_sistole, k.td_diastole != null ? String(k.td_diastole) : null) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ yaTidak(k.td_kategori) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ angka(k.gula_darah) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ yaTidak(k.gula_kategori) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ angka(k.hb) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ yaTidak(k.anemia) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ yaTidak(k.batuk_terus_menerus) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ yaTidak(k.demam_lebih_dua_minggu) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ yaTidak(k.bb_tidak_naik_dua_bulan) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ yaTidak(k.kontak_erat_tbc) }}</td>
              <td class="px-3 py-3 text-center whitespace-nowrap">{{ yaTidak(k.rujuk) }}</td>
              <td class="text-muted-foreground max-w-[160px] truncate px-3 py-3 text-center whitespace-nowrap" :title="teksGabung(k.edukasi, k.catatan)">
                {{ teksGabung(k.edukasi, k.catatan) }}
              </td>
              <td v-if="isAdmin" class="px-3 py-3 text-right">
                <button
                  type="button"
                  class="hover:text-emerald-700 text-muted-foreground hover:bg-emerald-50 rounded-lg p-2 transition-colors"
                  aria-label="Ubah kunjungan"
                  title="Ubah kunjungan"
                  @click.stop="emit('ubah', k)"
                >
                  <Pencil class="size-4" />
                </button>
                <button
                  type="button"
                  class="hover:text-red-600 text-muted-foreground hover:bg-red-50 rounded-lg p-2 transition-colors"
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
