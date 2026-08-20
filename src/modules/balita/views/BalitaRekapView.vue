<script setup lang="ts">
import { CalendarDays, Check, Copy, FileSpreadsheet, Printer } from '@lucide/vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Skeleton from '@/components/Skeleton.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { kodeDariLabel } from '@/lib/status'
import { parseTanggal } from '@/lib/umur'
import { listBalita, listKunjunganPeriode } from '@/modules/balita/db'
import {
  BARIS_RINGKASAN,
  buatWorkbookRekap,
  labelPeriode,
  NAMA_BULAN,
  teksCsvRekap,
  unduhXlsx,
} from '@/modules/balita/ekspor'
import {
  hitungRekapBulanan,
  rekapPerBalita,
  susunBarisRekap,
  type BarisRekap,
  type PeriodeRekap,
  type RekapBulanan,
} from '@/modules/balita/rekap'

const mode = ref<'bulanan' | 'rentang'>('bulanan')

const sekarang = new Date()
const bulan = ref(String(sekarang.getMonth()))
const tahun = ref(String(sekarang.getFullYear()))
const tglDari = ref(formatISO(new Date(sekarang.getFullYear(), sekarang.getMonth(), 1)))
const tglSampai = ref(formatISO(new Date(sekarang.getFullYear(), sekarang.getMonth() + 1, 0)))

const loading = ref(false)
const error = ref('')
const rekap = ref<RekapBulanan | null>(null)
const baris = ref<BarisRekap[]>([])
const label = ref('')
const tersalin = ref(false)
let timerTersalin: ReturnType<typeof setTimeout> | undefined

const daftarTahun = computed(() => {
  const thn = new Date().getFullYear()
  const hasil: string[] = []
  for (let t = 2020; t <= thn; t += 1) hasil.push(String(t))
  return hasil
})

const pesanRentang = computed(() => {
  if (mode.value !== 'rentang') return ''
  if (!tglDari.value || !tglSampai.value) return ''
  return tglSampai.value < tglDari.value ? 'Tanggal "Sampai" tidak boleh sebelum tanggal "Dari".' : ''
})

function formatISO(tgl: Date): string {
  const mm = String(tgl.getMonth() + 1).padStart(2, '0')
  const dd = String(tgl.getDate()).padStart(2, '0')
  return `${tgl.getFullYear()}-${mm}-${dd}`
}

function awalISO(p: PeriodeRekap): string {
  if ('bulan' in p) return `${p.tahun}-${String(p.bulan + 1).padStart(2, '0')}-01`
  return p.awal
}

function akhirISO(p: PeriodeRekap): string {
  if ('bulan' in p) return formatISO(new Date(p.tahun, p.bulan + 1, 0))
  return p.akhir
}

function periodeAktif(): PeriodeRekap | null {
  if (mode.value === 'bulanan') {
    return { bulan: Number(bulan.value), tahun: Number(tahun.value) }
  }
  if (!tglDari.value || !tglSampai.value) return null
  if (tglSampai.value < tglDari.value) return null
  return { awal: tglDari.value, akhir: tglSampai.value }
}

async function muat() {
  const p = periodeAktif()
  if (!p) return
  loading.value = true
  error.value = ''
  try {
    const [semuaBalita, kunjungan] = await Promise.all([
      listBalita(),
      listKunjunganPeriode(awalISO(p), akhirISO(p)),
    ])
    const mapK = rekapPerBalita(kunjungan)
    rekap.value = hitungRekapBulanan(kunjungan, semuaBalita, p)
    baris.value = semuaBalita
      .filter((b) => mapK.has(b.id))
      .map((b) => susunBarisRekap(b, mapK.get(b.id)!))
    label.value = labelPeriode(p)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Gagal memuat rekap balita.'
    rekap.value = null
    baris.value = []
  } finally {
    loading.value = false
  }
}

watch(
  [mode, bulan, tahun, tglDari, tglSampai],
  () => {
    void muat()
  },
  { immediate: true },
)

function eksporExcel() {
  if (!rekap.value || baris.value.length === 0) return
  const wb = buatWorkbookRekap(rekap.value, baris.value, label.value)
  const slug = label.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  unduhXlsx(wb, `rekap-balita-${slug}.xlsx`)
}

function cetak() {
  window.print()
}

async function salinCsv() {
  if (baris.value.length === 0) return
  try {
    await navigator.clipboard.writeText(teksCsvRekap(baris.value))
    tersalin.value = true
    if (timerTersalin) clearTimeout(timerTersalin)
    timerTersalin = setTimeout(() => {
      tersalin.value = false
    }, 2000)
  } catch {
    tersalin.value = false
  }
}

onBeforeUnmount(() => {
  if (timerTersalin) clearTimeout(timerTersalin)
})

function formatTanggal(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function formatZ(n: number | null): string {
  return n == null ? '—' : n.toFixed(2)
}

function labelJk(jk: string | null): string {
  return jk === 'Perempuan' ? 'Perempuan' : jk === 'Laki - Laki' ? 'Laki-laki' : '—'
}

function kodeStatus(st: string | null | undefined): string | null {
  if (!st) return null
  const kode = kodeDariLabel(st)
  return kode === '_' ? null : kode
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />

    <section class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div class="no-print">
        <p class="text-primary text-xs font-bold tracking-widest uppercase">Data posyandu</p>
        <h1 class="font-display mt-3 text-3xl leading-tight sm:text-4xl">Rekap Bulanan Balita</h1>
        <p class="text-muted-foreground mt-3 max-w-xl text-sm">
          Ringkasan kunjungan dan status gizi balita untuk laporan posyandu, lengkap dengan format
          resmi Rekap Bulanan Posyandu dan ekspor Excel/CSV.
        </p>
      </div>

      <Card class="no-print mt-8">
        <CardContent class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <Button
              size="sm"
              :variant="mode === 'bulanan' ? 'default' : 'outline'"
              @click="mode = 'bulanan'"
            >
              Bulanan
            </Button>
            <Button
              size="sm"
              :variant="mode === 'rentang' ? 'default' : 'outline'"
              @click="mode = 'rentang'"
            >
              Rentang
            </Button>
          </div>

          <div v-if="mode === 'bulanan'" class="flex flex-wrap items-end gap-4">
            <div class="flex flex-col gap-1.5">
              <Label for="rekap-bulan">Bulan</Label>
              <Select v-model="bulan">
                <SelectTrigger id="rekap-bulan" class="w-44">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="(nama, i) in NAMA_BULAN" :key="i" :value="String(i)">
                    {{ nama }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex flex-col gap-1.5">
              <Label for="rekap-tahun">Tahun</Label>
              <Select v-model="tahun">
                <SelectTrigger id="rekap-tahun" class="w-28">
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="t in daftarTahun" :key="t" :value="t">
                    {{ t }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div v-else class="flex flex-wrap items-end gap-4">
            <div class="flex flex-col gap-1.5">
              <Label for="rekap-dari">Dari</Label>
              <Input id="rekap-dari" v-model="tglDari" type="date" class="w-48" />
            </div>
            <div class="flex flex-col gap-1.5">
              <Label for="rekap-sampai">Sampai</Label>
              <Input id="rekap-sampai" v-model="tglSampai" type="date" class="w-48" />
            </div>
            <p v-if="pesanRentang" class="text-sm font-medium text-red-600" role="alert">
              {{ pesanRentang }}
            </p>
          </div>
        </CardContent>
      </Card>

      <div v-if="loading" class="mt-8" role="status" aria-label="Memuat…">
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card v-for="i in 4" :key="i">
            <CardContent class="flex flex-col gap-2 py-5">
              <Skeleton class="h-8 w-16" />
              <Skeleton class="h-3 w-32" />
            </CardContent>
          </Card>
        </div>

        <Card class="mt-6">
          <CardHeader>
            <Skeleton class="h-5 w-48" />
            <Skeleton class="h-3 w-32" />
          </CardHeader>
          <CardContent class="flex flex-col gap-2">
            <Skeleton v-for="i in 8" :key="i" class="h-6 w-full" />
          </CardContent>
        </Card>

        <Card class="mt-6">
          <CardHeader>
            <Skeleton class="h-5 w-40" />
          </CardHeader>
          <CardContent class="flex flex-col gap-2">
            <Skeleton v-for="i in 5" :key="i" class="h-6 w-full" />
          </CardContent>
        </Card>
      </div>

      <div v-else-if="error" class="mt-6">
        <p
          class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {{ error }}
        </p>
      </div>

      <div
        v-else-if="rekap && baris.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-white/50 px-8 py-14 text-center"
      >
        <CalendarDays class="text-emerald-300 size-10" />
        <p class="font-display mt-4 text-lg">Belum ada kunjungan di periode ini</p>
        <p class="text-muted-foreground mt-1 max-w-sm text-sm">
          Tidak ada kunjungan balita tercatat untuk periode {{ label }}. Ubah filter untuk melihat
          rekap lain.
        </p>
      </div>

      <div v-else-if="rekap && baris.length > 0" class="print-area mt-8">
        <div class="print-only mb-6">
          <h1 class="font-display text-xl font-bold">Posyandu Wapalo — Rekap Bulanan Balita</h1>
          <p class="text-sm">Periode {{ label }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card>
            <CardContent class="flex flex-col gap-1 py-5">
              <p class="font-display text-3xl font-bold tabular-nums">{{ rekap.sasaran_bayi }}</p>
              <p class="text-muted-foreground text-xs font-medium uppercase">Jumlah Sasaran Bayi</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="flex flex-col gap-1 py-5">
              <p class="font-display text-3xl font-bold tabular-nums">{{ rekap.sasaran_balita }}</p>
              <p class="text-muted-foreground text-xs font-medium uppercase">Jumlah Sasaran Balita</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="flex flex-col gap-1 py-5">
              <p class="font-display text-3xl font-bold tabular-nums">{{ rekap.bayi_hadir }}</p>
              <p class="text-muted-foreground text-xs font-medium uppercase">Bayi Datang (Hadir)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="flex flex-col gap-1 py-5">
              <p class="font-display text-3xl font-bold tabular-nums">{{ rekap.bayi_tidak_hadir }}</p>
              <p class="text-muted-foreground text-xs font-medium uppercase">
                Bayi Tidak Datang (Tidak Hadir)
              </p>
            </CardContent>
          </Card>
        </div>

        <Card class="mt-6">
          <CardHeader>
            <CardTitle class="font-display text-lg font-normal">Rekap Bulanan (Format Resmi)</CardTitle>
            <CardDescription>Periode {{ label }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[480px] text-sm">
                <thead>
                  <tr
                    class="text-muted-foreground border-border/60 border-b text-left text-xs font-bold tracking-wide uppercase"
                  >
                    <th class="py-2 pr-3">Keterangan</th>
                    <th class="py-2 pr-3 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="b in BARIS_RINGKASAN"
                    :key="b.label"
                    class="border-border/60 border-b last:border-0"
                  >
                    <td class="py-2.5 pr-3">{{ b.label }}</td>
                    <td class="py-2.5 pr-3 text-right font-medium tabular-nums">{{ b.ambil(rekap) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card class="mt-6">
          <CardHeader>
            <CardTitle class="font-display text-lg font-normal">Rincian Per Balita</CardTitle>
            <CardDescription>{{ baris.length }} balita hadir pada periode {{ label }}</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-4">
            <div class="no-print flex flex-wrap items-center gap-2">
              <Button size="sm" @click="eksporExcel">
                <FileSpreadsheet class="size-4" />
                Ekspor Excel
              </Button>
              <Button size="sm" variant="outline" @click="cetak">
                <Printer class="size-4" />
                Cetak / PDF
              </Button>
              <Button size="sm" variant="outline" @click="salinCsv">
                <Check v-if="tersalin" class="size-4" />
                <Copy v-else class="size-4" />
                {{ tersalin ? 'Tersalin' : 'Salin CSV' }}
              </Button>
              <span class="sr-only" role="status" aria-live="polite">{{ tersalin ? 'Tersalin' : '' }}</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[1500px] text-sm">
                <thead>
                  <tr
                    class="text-muted-foreground border-border/60 border-b text-left text-xs font-bold tracking-wide uppercase"
                  >
                    <th class="py-2 pr-3 whitespace-nowrap">No</th>
                    <th class="py-2 pr-3 whitespace-nowrap">Nama</th>
                    <th class="py-2 pr-3 whitespace-nowrap">JK</th>
                    <th class="py-2 pr-3 whitespace-nowrap">Tgl Lahir</th>
                    <th class="py-2 pr-3 whitespace-nowrap">Umur (bln)</th>
                    <th class="py-2 pr-3 whitespace-nowrap">Dusun</th>
                    <th class="py-2 pr-3 whitespace-nowrap">Posyandu</th>
                    <th class="py-2 pr-3 whitespace-nowrap">Tgl Kunjungan</th>
                    <th class="py-2 pr-3 whitespace-nowrap">BB (kg)</th>
                    <th class="py-2 pr-3 whitespace-nowrap">TB (cm)</th>
                    <th class="py-2 pr-3 whitespace-nowrap">BB/U</th>
                    <th class="py-2 pr-3 whitespace-nowrap">TB/U</th>
                    <th class="py-2 pr-3 whitespace-nowrap">BB/TB</th>
                    <th class="py-2 pr-3 whitespace-nowrap">LiKA</th>
                    <th class="py-2 pr-3 whitespace-nowrap">LiLA</th>
                    <th class="py-2 pr-3 whitespace-nowrap">z-BB/U</th>
                    <th class="py-2 pr-3 whitespace-nowrap">z-TB/U</th>
                    <th class="py-2 pr-3 whitespace-nowrap">z-BB/TB</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(b, i) in baris"
                    :key="i"
                    class="border-border/60 border-b last:border-0"
                  >
                    <td class="text-muted-foreground py-3 pr-3 whitespace-nowrap">{{ i + 1 }}</td>
                    <td class="py-3 pr-3 font-medium whitespace-nowrap">{{ b.nama }}</td>
                    <td class="py-3 pr-3 whitespace-nowrap">{{ labelJk(b.jenis_kelamin) }}</td>
                    <td class="py-3 pr-3 whitespace-nowrap">{{ formatTanggal(b.tanggal_lahir) }}</td>
                    <td class="py-3 pr-3 whitespace-nowrap">{{ b.umur_bulan ?? '—' }}</td>
                    <td class="py-3 pr-3 whitespace-nowrap">{{ b.dusun || '—' }}</td>
                    <td class="py-3 pr-3 whitespace-nowrap">{{ b.posyandu || '—' }}</td>
                    <td class="py-3 pr-3 whitespace-nowrap">{{ formatTanggal(b.tanggal_kunjungan) }}</td>
                    <td class="py-3 pr-3 whitespace-nowrap">{{ b.berat_badan ?? '—' }}</td>
                    <td class="py-3 pr-3 whitespace-nowrap">{{ b.tinggi_badan ?? '—' }}</td>
                    <td class="py-3 pr-3 whitespace-nowrap">
                      <StatusBadge v-if="kodeStatus(b.bb_menurut_umur)" :kode="kodeStatus(b.bb_menurut_umur)" />
                      <span v-else>—</span>
                    </td>
                    <td class="py-3 pr-3 whitespace-nowrap">
                      <StatusBadge v-if="kodeStatus(b.pbtb_menurut_umur)" :kode="kodeStatus(b.pbtb_menurut_umur)" />
                      <span v-else>—</span>
                    </td>
                    <td class="py-3 pr-3 whitespace-nowrap">
                      <StatusBadge v-if="kodeStatus(b.bb_menurut_pbtb)" :kode="kodeStatus(b.bb_menurut_pbtb)" />
                      <span v-else>—</span>
                    </td>
                    <td class="py-3 pr-3 whitespace-nowrap">
                      <StatusBadge v-if="kodeStatus(b.status_lingkar_kepala)" :kode="kodeStatus(b.status_lingkar_kepala)" />
                      <span v-else>—</span>
                    </td>
                    <td class="py-3 pr-3 whitespace-nowrap">
                      <StatusBadge v-if="kodeStatus(b.status_lingkar_lengan)" :kode="kodeStatus(b.status_lingkar_lengan)" />
                      <span v-else>—</span>
                    </td>
                    <td class="py-3 pr-3 whitespace-nowrap">{{ formatZ(b.z_bb_u) }}</td>
                    <td class="py-3 pr-3 whitespace-nowrap">{{ formatZ(b.z_tb_u) }}</td>
                    <td class="py-3 pr-3 whitespace-nowrap">{{ formatZ(b.z_bb_tb) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
