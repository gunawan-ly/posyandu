<script setup lang="ts">
import { Pencil, Trash2 } from '@lucide/vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { labelYaTidak, type KunjunganBumil } from '@/modules/bumil/db'
import { parseTanggal } from '@/lib/umur'

defineProps<{
  kunjungan: KunjunganBumil[]
  isAdmin: boolean
}>()

const emit = defineEmits<{
  hapus: [kunjungan: KunjunganBumil]
  ubah: [kunjungan: KunjunganBumil]
  lihat: [kunjungan: KunjunganBumil]
}>()

function formatTanggal(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatAngka(n: number | null | undefined): string {
  if (n == null) return '—'
  return String(n)
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="font-display text-lg font-normal">Riwayat kunjungan</CardTitle>
    </CardHeader>
    <CardContent>
      <p v-if="kunjungan.length === 0" class="text-muted-foreground text-sm">
        Belum ada kunjungan tercatat.
      </p>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[1300px] text-sm">
          <thead>
            <tr class="text-muted-foreground border-border/60 border-b text-left text-xs font-bold tracking-wide uppercase">
              <th class="py-2 pr-3 whitespace-nowrap">Tanggal</th>
              <th class="py-2 pr-3">Kategori</th>
              <th class="py-2 pr-3">Usia kehamilan</th>
              <th class="py-2 pr-3">BB (kg)</th>
              <th class="py-2 pr-3">BB sesuai kurva KIA</th>
              <th class="py-2 pr-3">LiLA (cm)</th>
              <th class="py-2 pr-3">LiLA status</th>
              <th class="py-2 pr-3">TD (mmHg)</th>
              <th class="py-2 pr-3">TD sesuai KIA</th>
              <th class="py-2 pr-3">Batuk</th>
              <th class="py-2 pr-3">Demam</th>
              <th class="py-2 pr-3">BB turun</th>
              <th class="py-2 pr-3">Kontak TBC</th>
              <th class="py-2 pr-3">TTD</th>
              <th class="py-2 pr-3">Konsumsi TTD</th>
              <th class="py-2 pr-3">MT KEK</th>
              <th class="py-2 pr-3">Konsumsi MT</th>
              <th class="py-2 pr-3">Kelas bumil</th>
              <th class="py-2 pr-3">Edukasi</th>
              <th class="py-2 pr-3">Rujuk</th>
              <th class="py-2"></th>
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
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.kategori ?? '—' }}</td>
              <td class="py-3 pr-3 text-muted-foreground whitespace-nowrap">{{ formatAngka(k.usia_kehamilan_minggu) }} minggu</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ formatAngka(k.berat_badan) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.bb_sesuai_kurva_kia ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ formatAngka(k.lingkaran_lengan_atas) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">
                <span
                  v-if="k.lila_hijau_merah === 'Hijau'"
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700"
                >
                  <span class="size-1.5 rounded-full bg-emerald-600"></span> Hijau
                </span>
                <span
                  v-else-if="k.lila_hijau_merah === 'Merah'"
                  class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700"
                >
                  <span class="size-1.5 rounded-full bg-red-600"></span> Merah
                </span>
                <span v-else>—</span>
              </td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.tekanan_darah ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ k.td_sesuai_kurva_kia ?? '—' }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.batuk_terus_menerus) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.demam_lebih_dua_minggu) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.bb_tidak_naik_dua_bulan) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.kontak_tbc) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.dapat_tablet_ttd) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.konsumsi_ttd) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.mt_kek_diberikan) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.konsumsi_mt_kek) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.kelas_bumil) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.dapat_edukasi) }}</td>
              <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.dirujuk) }}</td>
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
      </div>
    </CardContent>
  </Card>
</template>
