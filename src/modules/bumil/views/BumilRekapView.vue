<script setup lang="ts">
import { ArrowLeft, Check, Copy, FileSpreadsheet, Printer, TriangleAlert } from '@lucide/vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Skeleton from '@/components/Skeleton.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { listBumil, listKunjunganPeriode } from '@/modules/bumil/db'
import {
  GRUP_KOLOM,
  NAMA_BULAN,
  teksCsvRekap,
  unduhXlsx,
} from '@/modules/bumil/ekspor'
import { hitungRekapTahunan, totalKolom, type BarisRekapBumil } from '@/modules/bumil/rekap'

const sekarang = new Date()
const tahun = ref(String(sekarang.getFullYear()))

const loading = ref(false)
const error = ref('')
const baris = ref<BarisRekapBumil[]>([])
const tersalin = ref(false)
let timerTersalin: ReturnType<typeof setTimeout> | undefined

const daftarTahun = computed(() => {
  const thn = new Date().getFullYear()
  const hasil: string[] = []
  for (let t = 2020; t <= thn; t += 1) hasil.push(String(t))
  return hasil
})

// Rentang tanggal satu tahun untuk pengambilan kunjungan.
function rentangTahun(t: number): [string, string] {
  return [`${t}-01-01`, `${t}-12-31`]
}

async function muat() {
  const t = Number(tahun.value)
  if (!Number.isInteger(t)) return
  loading.value = true
  error.value = ''
  try {
    const [identitas, kunjungan] = await Promise.all([listBumil(), listKunjunganPeriode(...rentangTahun(t))])
    baris.value = hitungRekapTahunan(identitas, kunjungan, t)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Gagal memuat rekap bumil.'
    baris.value = []
  } finally {
    loading.value = false
  }
}

watch(tahun, () => void muat(), { immediate: true })

async function eksporExcel() {
  if (baris.value.length === 0) return
  try {
    const [identitas, kunjungan] = await Promise.all([
      listBumil(),
      listKunjunganPeriode(...rentangTahun(Number(tahun.value))),
    ])
    await unduhXlsx(identitas, kunjungan, Number(tahun.value))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Gagal mengekspor Excel.'
  }
}

async function salinCsv() {
  if (baris.value.length === 0) return
  try {
    const [identitas, kunjungan] = await Promise.all([
      listBumil(),
      listKunjunganPeriode(...rentangTahun(Number(tahun.value))),
    ])
    await navigator.clipboard.writeText(await teksCsvRekap(identitas, kunjungan, Number(tahun.value)))
    tersalin.value = true
    if (timerTersalin) clearTimeout(timerTersalin)
    timerTersalin = setTimeout(() => {
      tersalin.value = false
    }, 2000)
  } catch {
    tersalin.value = false
  }
}

function cetak() {
  window.print()
}

onBeforeUnmount(() => {
  if (timerTersalin) clearTimeout(timerTersalin)
})

const klsInput =
  'border-input bg-background h-12 md:h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
  <div class="flex flex-col print-area">
    <AppNavbar />

    <section class="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div class="no-print flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="font-display text-2xl font-normal sm:text-3xl">Rekap Tahunan Bumil &amp; Busui</h1>
          <p class="text-muted-foreground mt-1 text-sm">
            Format resmi posyandu — baris per bulan, kolom per indikator.
          </p>
        </div>
        <RouterLink to="/bumil" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft class="size-4" />
          Kembali ke daftar
        </RouterLink>
      </div>

      <p v-if="error" class="mt-4 flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
        <TriangleAlert class="mt-0.5 size-4 shrink-0" />
        {{ error }}
      </p>

      <!-- Filter & aksi -->
      <Card v-if="!loading" class="no-print mt-6">
        <CardContent class="flex flex-wrap items-end gap-3 px-6 py-4">
          <div class="w-36">
            <label for="rk-tahun" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tahun</label>
            <Select v-model="tahun">
              <SelectTrigger id="rk-tahun" :class="klsInput">
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="t in daftarTahun" :key="t" :value="t">{{ t }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex flex-wrap gap-2 sm:ml-auto">
            <Button variant="outline" :disabled="baris.length === 0" @click="salinCsv">
              <Check v-if="tersalin" class="size-4 text-emerald-600" />
              <Copy v-else class="size-4" />
              {{ tersalin ? 'Tersalin!' : 'Salin CSV' }}
            </Button>
            <Button variant="outline" :disabled="baris.length === 0" @click="cetak">
              <Printer class="size-4" />
              Cetak/PDF
            </Button>
            <Button :disabled="baris.length === 0" @click="eksporExcel">
              <FileSpreadsheet class="size-4" />
              Ekspor Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <template v-if="loading">
        <div role="status" aria-label="Memuat…" class="mt-6 space-y-3">
          <Skeleton class="h-10 w-full" />
          <Skeleton v-for="i in 8" :key="i" class="h-7 w-full" />
        </div>
      </template>

      <!-- Tabel rekap resmi -->
      <Card v-else-if="baris.length > 0" class="mt-6">
        <CardHeader>
          <CardTitle class="font-display text-lg font-normal">
            Rekap Tahunan Posyandu — Bumil (Ibu Hamil) &amp; Busui (Ibu Menyusui) · {{ tahun }}
          </CardTitle>
          <CardDescription>Angka agregat bulanan sepanjang tahun terpilih.</CardDescription>
        </CardHeader>
        <CardContent class="px-0 pb-0 sm:px-0">
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
                      class="border-border/60 border-l px-3 py-1.5 whitespace-nowrap"
                    >
                      {{ k.label }}
                    </th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="b in baris"
                  :key="b.bulan"
                  class="border-border/60 hover:bg-emerald-50/30 border-b transition-colors last:border-0"
                >
                  <td class="sticky left-0 bg-background z-10 px-3 py-2 font-medium whitespace-nowrap">{{ NAMA_BULAN[b.bulan] }}</td>
                  <td
                    v-for="k in GRUP_KOLOM.flatMap((g) => g.kolom)"
                    :key="k.label"
                    class="tabular-nums px-3 py-2 text-center"
                  >
                    {{ k.ambil(b) === 0 ? '—' : k.ambil(b) }}
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
                    {{ totalKolom(baris, k.ambil) || '—' }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p class="text-muted-foreground px-6 pt-3 pb-6 text-xs leading-relaxed">
            Berat Badan/Tekanan Darah: hijau = sesuai kurva KIA / normal, merah = tidak sesuai / tinggi.
            Konsumsi TTD &amp; PMT "Setiap Hari" dipetakan dari pencatatan "Ya". Bergejala TBC = memenuhi
            minimal 2 dari 3 gejala skrining.
          </p>
        </CardContent>
      </Card>

      <div v-else-if="!error" class="text-muted-foreground mt-10 text-sm">
        Belum ada data kunjungan pada tahun {{ tahun }}.
      </div>
    </section>

    <AppFooter />
  </div>
</template>
