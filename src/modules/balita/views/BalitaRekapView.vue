<script setup lang="ts">
import { ArrowLeft, CalendarDays, Check, Copy, FileSpreadsheet, Printer } from '@lucide/vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Skeleton from '@/components/Skeleton.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { listApras, listKunjunganAprasPeriode } from '@/modules/apras/db'
import { gabungAnakApras, gabungKunjunganApras } from '@/modules/apras/rekap'
import { listBalita, listKunjunganPeriode } from '@/modules/balita/db'
import {
  buatWorkbookRekap,
  GRUP_KOLOM,
  NAMA_BULAN,
  teksCsvRekap,
  unduhXlsx,
} from '@/modules/balita/ekspor'
import {
  gabungAnakBalita,
  gabungKunjunganBalita,
  hitungRekapTahunan,
  rekapPerBalita,
  susunBarisApras,
  susunBarisRekap,
  type BarisRekap,
  type RekapBulanan,
} from '@/modules/balita/rekap'

const sekarang = new Date()
const tahun = ref(String(sekarang.getFullYear()))
const bulan = ref(String(sekarang.getMonth()))
const tampilanMode = ref<'tubuhan' | 'sebulan'>('tubuhan')

const loading = ref(false)
const error = ref('')
const rekapTahunan = ref<RekapBulanan[]>([])
const baris = ref<BarisRekap[]>([])
const tersalin = ref(false)
let timerTersalin: ReturnType<typeof setTimeout> | undefined

const daftarTahun = computed(() => {
  const thn = new Date().getFullYear()
  return ['2026', ...Array.from({ length: Math.max(0, thn - 2026) }, (_, i) => String(2027 + i))]
})

const rekapFiltered = computed<RekapBulanan[]>(() => {
  if (tampilanMode.value === 'tubuhan') return rekapTahunan.value
  const idx = Number(bulan.value)
  return rekapTahunan.value.length > 0 ? [rekapTahunan.value[idx]] : []
})

const jumlahAnak = computed(() => baris.value.length)

async function muat() {
  loading.value = true
  error.value = ''
  try {
    const tahunNum = Number(tahun.value) || new Date().getFullYear()
    const periodeAwal = `${tahunNum}-01-01`
    const periodeAkhir = `${tahunNum}-12-31`

    const [semuaBalita, kunjunganBalita, semuaApras, kunjunganApras] = await Promise.all([
      listBalita(),
      listKunjunganPeriode(periodeAwal, periodeAkhir),
      listApras(),
      listKunjunganAprasPeriode(periodeAwal, periodeAkhir),
    ])

    const anakGabungan = [
      ...semuaBalita.map(gabungAnakBalita),
      ...semuaApras.map(gabungAnakApras),
    ]
    const kunjunganGabungan = [
      ...kunjunganBalita.map(gabungKunjunganBalita),
      ...kunjunganApras.map(gabungKunjunganApras),
    ]

    rekapTahunan.value = hitungRekapTahunan(kunjunganGabungan, anakGabungan, tahunNum)

    const perBalita = rekapPerBalita(kunjunganBalita)
    const barisBalita = semuaBalita
      .filter((b) => perBalita.has(b.id))
      .map((b) => susunBarisRekap(b, perBalita.get(b.id)!))
    const perApras = new Map<number, (typeof kunjunganApras)[number]>()
    for (const k of [...kunjunganApras].sort((a, b) => {
      const ta = a.tanggal_kunjungan ?? ''
      const tb = b.tanggal_kunjungan ?? ''
      if (ta !== tb) return ta < tb ? -1 : 1
      return a.id - b.id
    })) {
      if (k.apras_id != null) perApras.set(k.apras_id, k)
    }
    const barisApras = semuaApras
      .filter((a) => perApras.has(a.id))
      .map((a) => susunBarisApras(a, perApras.get(a.id)!))

    baris.value = [...barisBalita, ...barisApras].sort((x, y) => x.nama.localeCompare(y.nama))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Gagal memuat rekap balita.'
    rekapTahunan.value = []
    baris.value = []
  } finally {
    loading.value = false
  }
}

watch([tahun, tampilanMode, bulan], () => { void muat() }, { immediate: true })

async function eksporExcel() {
  if (baris.value.length === 0) return
  const tahunNum = Number(tahun.value) || new Date().getFullYear()
  const wb = await buatWorkbookRekap([], [], tahunNum, baris.value)
          unduhXlsx(wb, `rekapitulasi-balita-${tahunNum}.xlsx`)
}

function cetak() {
  window.print()
}

async function salinCsv() {
  if (baris.value.length === 0) return
  try {
    await navigator.clipboard.writeText(await teksCsvRekap(baris.value))
    tersalin.value = true
    if (timerTersalin) clearTimeout(timerTersalin)
    timerTersalin = setTimeout(() => { tersalin.value = false }, 2000)
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

function nilaiTabel(baris: RekapBulanan, ambil: (b: RekapBulanan) => number): string {
  const v = ambil(baris)
  return v === 0 ? '—' : String(v)
}

function jumlahGrup(): RekapBulanan {
  const acc = {} as RekapBulanan
  const a = acc as unknown as Record<string, number>
  for (const b of rekapFiltered.value) {
    for (const key of Object.keys(b)) {
      a[key] = (a[key] ?? 0) + ((b as unknown as Record<string, number>)[key] ?? 0)
    }
  }
  return acc
}

const judulRekap = computed(() => {
  if (tampilanMode.value === 'tubuhan') return `Rekapitulasi Tahunan Balita ${tahun.value}`
  return `Rekapitulasi Bulanan Balita — ${NAMA_BULAN[Number(bulan.value)]} ${tahun.value}`
})
</script>

<template>
  <div class="flex flex-col">
    <AppNavbar />

    <section class="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div class="no-print flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-primary text-xs font-bold tracking-widest uppercase">Data posyandu</p>
          <h1 class="font-display mt-3 text-3xl leading-tight sm:text-4xl">{{ judulRekap }}</h1>
          <p class="text-muted-foreground mt-3 max-w-xl text-sm">
            Ringkasan kunjungan dan status gizi balita untuk laporan posyandu, lengkap dengan format
            resmi Rekapitulasi Bulanan Posyandu dan ekspor Excel/CSV.
          </p>
        </div>
        <RouterLink to="/balita" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft class="size-4" />
          Kembali ke daftar
        </RouterLink>
      </div>

      <Card class="no-print mt-8">
        <CardContent class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <Button
              size="sm"
              :variant="tampilanMode === 'tubuhan' ? 'default' : 'outline'"
              @click="tampilanMode = 'tubuhan'"
            >
              Rekapitulasi Tahunan
            </Button>
            <Button
              size="sm"
              :variant="tampilanMode === 'sebulan' ? 'default' : 'outline'"
              @click="tampilanMode = 'sebulan'"
            >
              Rekapitulasi Bulanan
            </Button>
          </div>

          <div class="flex flex-wrap items-end gap-4">
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
            <div v-if="tampilanMode === 'sebulan'" class="flex flex-col gap-1.5">
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
          </div>
        </CardContent>
      </Card>

      <div v-if="loading" class="mt-8" role="status" aria-label="Memuat…">
        <Card class="mt-6">
          <CardHeader>
            <Skeleton class="h-5 w-48" />
          </CardHeader>
          <CardContent class="flex flex-col gap-2">
            <Skeleton v-for="i in 12" :key="i" class="h-6 w-full" />
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
        v-else-if="baris.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-white/50 px-8 py-14 text-center"
      >
        <CalendarDays class="text-emerald-300 size-10" />
        <p class="font-display mt-4 text-lg">Belum ada kunjungan di periode ini</p>
        <p class="text-muted-foreground mt-1 max-w-sm text-sm">
          Tidak ada kunjungan balita tercatat untuk tahun {{ tahun }}. Ubah filter untuk melihat
          rekapitulasi lain.
        </p>
      </div>

      <div v-else class="print-area mt-8">
        <div class="print-only mb-6">
          <h1 class="font-display text-xl font-bold">Posyandu Wapalo — {{ judulRekap }}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle class="font-display text-lg font-normal">Format Resmi Rekapitulasi Bulanan Posyandu</CardTitle>
            <CardDescription>
              {{ tampilanMode === 'tubuhan' ? `Seluruh tahun ${tahun}` : `${NAMA_BULAN[Number(bulan)]} ${tahun}` }}
              — {{ jumlahAnak }} anak tercatat
            </CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-4 no-print">
            <div class="flex flex-wrap items-center gap-2">
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
          </CardContent>
          <CardContent>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[1700px] border-collapse text-sm">
                <thead>
                  <tr class="border-border/60 bg-muted/40 border-b text-left text-xs font-bold tracking-wide uppercase">
                    <th rowspan="2" class="border-border/60 px-3 py-2 align-bottom sticky left-0 bg-background z-10">Bulan</th>
                    <template v-for="(g, gi) in GRUP_KOLOM" :key="g.grup">
                      <th
                        v-if="g.kolom.length > 1"
                        :colspan="g.kolom.length"
                        :class="['border-border/60 border-l px-3 py-2 text-center', gi % 2 ? 'bg-muted/20' : '']"
                      >
                        {{ g.grup }}
                      </th>
                      <th
                        v-else
                        rowspan="2"
                        :class="['border-border/60 border-l px-3 py-2 align-bottom', gi % 2 ? 'bg-muted/20' : '']"
                      >
                        {{ g.grup }}<span class="text-muted-foreground block normal-case">{{ g.kolom[0].label }}</span>
                      </th>
                    </template>
                  </tr>
                  <tr class="border-border/60 bg-muted/40 border-b text-left text-xs uppercase">
                    <template v-for="g in GRUP_KOLOM" :key="'sub-' + g.grup">
                      <th
                        v-for="k in g.kolom.length > 1 ? g.kolom : []"
                        :key="g.grup + k.label"
                        class="border-border/60 border-l px-3 py-1.5 whitespace-nowrap text-center"
                      >
                        {{ k.label }}
                      </th>
                    </template>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, ri) in rekapFiltered"
                    :key="ri"
                    class="border-border/60 hover:bg-emerald-50/30 border-b transition-colors last:border-0"
                  >
                    <td class="sticky left-0 bg-background z-10 px-3 py-2 font-medium whitespace-nowrap">{{ NAMA_BULAN[rekapTahunan.indexOf(row)] }}</td>
                    <td
                      v-for="k in GRUP_KOLOM.flatMap((g) => g.kolom)"
                      :key="k.label"
                      class="tabular-nums px-3 py-2 text-center"
                    >
                      {{ nilaiTabel(row, k.ambil) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-primary/10 border-border/60 border-t font-bold">
                    <td class="sticky left-0 bg-background z-10 px-3 py-2">JUMLAH</td>
                    <td
                      v-for="k in GRUP_KOLOM.flatMap((g) => g.kolom)"
                      :key="'jml-' + k.label"
                      class="tabular-nums px-3 py-2 text-center"
                    >
                      {{ k.ambil(jumlahGrup()) || '—' }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card class="mt-6">
          <CardHeader>
            <CardTitle class="font-display text-lg font-normal">Rincian Per Anak</CardTitle>
            <CardDescription>{{ jumlahAnak }} anak hadir pada tahun {{ tahun }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[1500px] text-sm">
                <thead>
                  <tr
                    class="text-muted-foreground border-border/60 border-b text-left text-xs font-bold tracking-wide uppercase"
                  >
                    <th class="py-2 pr-3 whitespace-nowrap">No</th>
                    <th class="py-2 pr-3 whitespace-nowrap">Nama</th>
                    <th class="py-2 pr-3 whitespace-nowrap">Modul</th>
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
                    <td class="py-3 pr-3 whitespace-nowrap">
                      <span
                        :class="b.modul === 'Apras'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-emerald-100 text-emerald-700'"
                        class="rounded-full px-2 py-0.5 text-xs font-bold"
                      >
                        {{ b.modul }}
                      </span>
                    </td>
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
