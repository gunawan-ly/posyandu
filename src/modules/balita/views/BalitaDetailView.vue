<script setup lang="ts">
import { ArrowLeft, Baby, Pencil, Plus, Scale, Trash2, TriangleAlert } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import KurvaWHO from '@/components/KurvaWHO.vue'
import Skeleton from '@/components/Skeleton.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ambilBalita,
  hapusBalita,
  hapusKunjungan,
  labelYaTidak,
  listKunjungan,
  tambahKunjungan,
  type Balita,
  type Kunjungan,
} from '@/modules/balita/db'
import { hitungZLik, hitungZLil, klasifikasiLika, klasifikasiLila } from '@/lib/kalkulator'
import { kodeDariLabel, labelStatus } from '@/lib/status'
import { hitungUmurBulan, parseTanggal, umurSaatIni } from '@/lib/umur'
import { useAuth } from '@/supabase/useAuth'

const { isAdmin } = useAuth()

const route = useRoute()
const router = useRouter()

const idBalita = computed(() => {
  const v = route.params.id
  return typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : null
})

const balita = ref<Balita | null>(null)
const kunjungan = ref<Kunjungan[]>([])
const sibuk = ref(true)
const pesanError = ref('')

const tglKunjungan = ref(new Date().toISOString().slice(0, 10))
const beratBadan = ref<string>('')
const tinggiBadan = ref<string>('')
const lingkarLengan = ref<string>('')
const lingkarKepala = ref<string>('')
const bbNaik = ref('')
const imunisasi = ref('')
const vitaminA = ref('')
const asiEksklusif = ref('')
const mpAsi = ref('')
const obatCacing = ref('')
const ceklisPerkembangan = ref('')
const gejalaTbc = ref('')
const edukasi = ref('')
const menyimpan = ref(false)
const pesanSukses = ref('')
const pesanForm = ref('')

onMounted(muat)

async function muat() {
  sibuk.value = true
  pesanError.value = ''
  try {
    if (idBalita.value == null) throw new Error('ID balita tidak valid.')
    const b = await ambilBalita(idBalita.value)
    if (!b) {
      await router.replace('/balita')
      return
    }
    balita.value = b
    kunjungan.value = await listKunjungan(b.id)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data balita.'
  } finally {
    sibuk.value = false
  }
}

const kunjunganTerbaru = computed<Kunjungan | null>(() => kunjungan.value.at(-1) ?? null)

const jkKurva = computed<'L' | 'P'>(() => (balita.value?.jenis_kelamin === 'Perempuan' ? 'P' : 'L'))

// Status LiLA/LiKA dihitung otomatis dari pengukuran (z-score WHO) saat form diisi.
const zLilaLive = computed<number | null>(() => {
  const nilai = Number(lingkarLengan.value)
  if (!lingkarLengan.value || !(nilai > 0) || !balita.value) return null
  const lahir = parseTanggal(balita.value.tanggal_lahir)
  const kunjungan = parseTanggal(tglKunjungan.value)
  if (!lahir || !kunjungan) return null
  // Umur kalender, sama dengan logika penyimpanan kunjungan (db.ts).
  const umur = hitungUmurBulan(lahir, kunjungan)
  return hitungZLil(jkKurva.value, umur, nilai)
})
const statusLilaLive = computed<string>(() =>
  zLilaLive.value != null ? labelStatus(klasifikasiLila(zLilaLive.value)) : '',
)
const zLikaLive = computed<number | null>(() => {
  const nilai = Number(lingkarKepala.value)
  if (!lingkarKepala.value || !(nilai > 0) || !balita.value) return null
  const lahir = parseTanggal(balita.value.tanggal_lahir)
  const kunjungan = parseTanggal(tglKunjungan.value)
  if (!lahir || !kunjungan) return null
  // Umur kalender, sama dengan logika penyimpanan kunjungan (db.ts).
  const umur = hitungUmurBulan(lahir, kunjungan)
  return hitungZLik(jkKurva.value, umur, nilai)
})
const statusLikaLive = computed<string>(() =>
  zLikaLive.value != null ? labelStatus(klasifikasiLika(zLikaLive.value)) : '',
)

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

function formatUmur(tanggalLahir: string): string {
  const u = umurSaatIni(tanggalLahir)
  if (u == null) return '—'
  const tahun = Math.floor(u / 12)
  const sisa = u % 12
  if (tahun === 0) return `${sisa} bulan`
  if (sisa === 0) return `${tahun} tahun`
  return `${tahun} tahun ${sisa} bulan`
}

function formatTanggal(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function simpanKunjungan() {
  pesanForm.value = ''
  pesanSukses.value = ''
  if (!balita.value) return

  const bb = Number(beratBadan.value)
  const tb = Number(tinggiBadan.value)
  if (!beratBadan.value || !(bb > 0)) {
    pesanForm.value = 'Berat badan wajib diisi (kg).'
    return
  }
  if (!tinggiBadan.value || !(tb > 0)) {
    pesanForm.value = 'Panjang/tinggi badan wajib diisi (cm).'
    return
  }

  menyimpan.value = true
  try {
    await tambahKunjungan(balita.value, {
      tanggal_kunjungan: tglKunjungan.value,
      berat_badan: bb,
      tinggi_badan: tb,
      lingkar_lengan: lingkarLengan.value ? Number(lingkarLengan.value) : null,
      lingkar_kepala: lingkarKepala.value ? Number(lingkarKepala.value) : null,
      bb_naik_tidak: bbNaik.value || null,
      imunisasi: imunisasi.value || null,
      vitamin_a: vitaminA.value || null,
      asi_eksklusif: asiEksklusif.value || null,
      mp_asi: mpAsi.value || null,
      obat_cacing: obatCacing.value || null,
      ceklis_perkembangan: ceklisPerkembangan.value || null,
      gejala_tbc: gejalaTbc.value || null,
      edukasi: edukasi.value || null,
    })
    kunjungan.value = await listKunjungan(balita.value.id)
    beratBadan.value = ''
    tinggiBadan.value = ''
    lingkarLengan.value = ''
    lingkarKepala.value = ''
    bbNaik.value = ''
    imunisasi.value = ''
    vitaminA.value = ''
    asiEksklusif.value = ''
    mpAsi.value = ''
    obatCacing.value = ''
    ceklisPerkembangan.value = ''
    gejalaTbc.value = ''
    edukasi.value = ''
    pesanSukses.value = 'Kunjungan berhasil dicatat.'
  } catch (e) {
    pesanForm.value = e instanceof Error ? e.message : 'Gagal menyimpan kunjungan.'
  } finally {
    menyimpan.value = false
  }
}

async function hapusKunj(balitaId: number, k: Kunjungan) {
  if (!window.confirm(`Hapus kunjungan ${formatTanggal(k.tanggal_kunjungan)}?`)) return
  try {
    await hapusKunjungan(k.id)
    kunjungan.value = await listKunjungan(balitaId)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus kunjungan.'
  }
}

async function hapusBal() {
  if (!balita.value) return
  if (!window.confirm(`Hapus ${balita.value.nama} beserta seluruh kunjungannya?`)) return
  try {
    await hapusBalita(balita.value.id)
    await router.replace('/balita')
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus data.'
  }
}

const OPSI_YA_TIDAK = ['Ya', 'Tidak']
const OPSI_NAIK = ['Naik', 'Tidak Naik']
const OPSI_CEKLIS = ['L', 'TL']

const klsInput =
  'border-input bg-background h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />

    <section class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div v-if="sibuk" role="status" aria-label="Memuat…">
        <div class="flex items-center gap-3">
          <Skeleton class="size-12 rounded-xl" />
          <div class="space-y-2">
            <Skeleton class="h-6 w-56" />
            <Skeleton class="h-4 w-80 max-w-full" />
          </div>
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-3">
          <div class="min-w-0 space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton class="h-5 w-40" />
              </CardHeader>
              <CardContent class="flex flex-col gap-3">
                <Skeleton class="h-56 w-full" />
                <Skeleton class="h-3 w-72 max-w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton class="h-5 w-44" />
              </CardHeader>
              <CardContent class="flex flex-col gap-2">
                <Skeleton v-for="i in 5" :key="i" class="h-8 w-full" />
              </CardContent>
            </Card>
          </div>

          <div class="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton class="h-5 w-24" />
              </CardHeader>
              <CardContent class="flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Skeleton v-for="i in 4" :key="i" class="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <template v-else-if="balita">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="bg-primary/10 text-primary grid size-12 place-items-center rounded-xl">
              <Baby class="size-6" />
            </span>
            <div>
              <h1 class="font-display text-2xl leading-tight sm:text-3xl">{{ balita.nama }}</h1>
              <p class="text-muted-foreground mt-1 text-sm">
                {{ balita.jenis_kelamin === 'Perempuan' ? 'Perempuan' : 'Laki-laki' }} ·
                {{ formatUmur(balita.tanggal_lahir) }} ·
                lahir {{ formatTanggal(balita.tanggal_lahir) }}
              </p>
            </div>
          </div>
          <div v-if="isAdmin" class="flex items-center gap-2">
            <RouterLink :to="`/balita/${balita.id}/edit`">
              <Button variant="outline">
                <Pencil class="size-4" />
                Ubah
              </Button>
            </RouterLink>
            <Button variant="outline" class="text-red-600" @click="hapusBal">
              <Trash2 class="size-4" />
              Hapus
            </Button>
          </div>
        </div>

        <p v-if="pesanError" class="mt-4 flex items-center gap-2 text-sm font-medium text-red-600" role="alert">
          <TriangleAlert class="size-4 shrink-0" />
          {{ pesanError }}
        </p>

        <div class="mt-8 grid gap-6 lg:grid-cols-3">
          <!-- Kiri: kurva + riwayat -->
          <div class="min-w-0 space-y-6 lg:col-span-2">
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
                            @click="hapusKunj(balita.id, k)"
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
          </div>

          <!-- Kanan: identitas + form kunjungan -->
          <div class="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle class="font-display text-lg font-normal">Identitas</CardTitle>
              </CardHeader>
              <CardContent class="flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Nama</p>
                    <p class="mt-0.5">{{ balita.nama || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Jenis kelamin</p>
                    <p class="mt-0.5">{{ balita.jenis_kelamin === 'Perempuan' ? 'Perempuan' : 'Laki-laki' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">NIK</p>
                    <p class="mt-0.5 break-all">{{ balita.nik || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tempat lahir</p>
                    <p class="mt-0.5">{{ balita.tempat_lahir || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tanggal lahir</p>
                    <p class="mt-0.5">{{ formatTanggal(balita.tanggal_lahir) }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Anak ke</p>
                    <p class="mt-0.5">{{ balita.anak_ke || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Nama orang tua</p>
                    <p class="mt-0.5">{{ balita.nama_orang_tua || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">NIK orang tua</p>
                    <p class="mt-0.5 break-all">{{ balita.nik_orang_tua || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">No. KK</p>
                    <p class="mt-0.5 break-all">{{ balita.nomor_kk || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Dusun</p>
                    <p class="mt-0.5">{{ balita.dusun || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Posyandu</p>
                    <p class="mt-0.5">{{ balita.posyandu || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">BB lahir</p>
                    <p class="mt-0.5">{{ balita.bb_lahir ?? '—' }} kg</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">PB lahir</p>
                    <p class="mt-0.5">{{ balita.pb_lahir ?? '—' }} cm</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-muted-foreground text-xs font-bold uppercase">Alamat</p>
                    <p class="mt-0.5">{{ balita.alamat || '—' }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card v-if="isAdmin">
              <CardHeader>
                <CardTitle class="font-display text-lg font-normal">Catat kunjungan</CardTitle>
              </CardHeader>
              <CardContent class="flex flex-col gap-4">
                <form class="space-y-4" @submit.prevent="simpanKunjungan">
                  <div>
                    <label for="tgl-kunjungan" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tanggal kunjungan</label>
                    <input id="tgl-kunjungan" v-model="tglKunjungan" type="date" class="w-full [color-scheme:light]" :class="klsInput" />
                  </div>
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label for="bb" class="text-muted-foreground mb-1.5 block text-xs font-bold">Berat badan (kg)</label>
                      <input id="bb" v-model="beratBadan" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 9,6" class="w-full" :class="klsInput" />
                    </div>
                    <div>
                      <label for="pb" class="text-muted-foreground mb-1.5 block text-xs font-bold">Panjang/tinggi (cm)</label>
                      <input id="pb" v-model="tinggiBadan" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 75" class="w-full" :class="klsInput" />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label for="lila" class="text-muted-foreground mb-1.5 block text-xs font-bold">LiLA (cm)</label>
                      <input id="lila" v-model="lingkarLengan" type="number" inputmode="decimal" step="0.1" min="0" class="w-full" :class="klsInput" />
                    </div>
                    <div>
                      <label for="lika" class="text-muted-foreground mb-1.5 block text-xs font-bold">LiKA (cm)</label>
                      <input id="lika" v-model="lingkarKepala" type="number" inputmode="decimal" step="0.1" min="0" class="w-full" :class="klsInput" />
                    </div>
                  </div>

                  <div v-if="statusLilaLive || statusLikaLive" class="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm">
                    <span v-if="statusLilaLive">
                      Status LiLA: <span class="font-bold">{{ statusLilaLive }}</span>
                      <span v-if="zLilaLive != null" class="text-muted-foreground"> (z {{ zLilaLive.toFixed(2) }})</span>
                    </span>
                    <span v-if="statusLilaLive && statusLikaLive" class="mx-2 text-emerald-300">·</span>
                    <span v-if="statusLikaLive">
                      Status LiKA: <span class="font-bold">{{ statusLikaLive }}</span>
                      <span v-if="zLikaLive != null" class="text-muted-foreground"> (z {{ zLikaLive.toFixed(2) }})</span>
                    </span>
                  </div>

                  <div class="border-border/60 border-t pt-4">
                    <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Gizi & kesehatan</p>
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label for="bb-naik" class="text-muted-foreground mb-1.5 block text-xs font-bold">BB naik</label>
                        <select id="bb-naik" v-model="bbNaik" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_NAIK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="ceklis-perkembangan" class="text-muted-foreground mb-1.5 block text-xs font-bold">Ceklis perkembangan</label>
                        <select id="ceklis-perkembangan" v-model="ceklisPerkembangan" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_CEKLIS" :key="s" :value="s">{{ s === 'L' ? 'L (Lengkap)' : 'TL (Tidak Lengkap)' }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="imunisasi" class="text-muted-foreground mb-1.5 block text-xs font-bold">Imunisasi</label>
                        <select id="imunisasi" v-model="imunisasi" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="vitamin-a" class="text-muted-foreground mb-1.5 block text-xs font-bold">Vitamin A</label>
                        <select id="vitamin-a" v-model="vitaminA" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="asi-eksklusif" class="text-muted-foreground mb-1.5 block text-xs font-bold">ASI eksklusif</label>
                        <select id="asi-eksklusif" v-model="asiEksklusif" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="mp-asi" class="text-muted-foreground mb-1.5 block text-xs font-bold">MP-ASI</label>
                        <select id="mp-asi" v-model="mpAsi" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="obat-cacing" class="text-muted-foreground mb-1.5 block text-xs font-bold">Obat cacing</label>
                        <select id="obat-cacing" v-model="obatCacing" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="gejala-tbc" class="text-muted-foreground mb-1.5 block text-xs font-bold">Gejala TBC</label>
                        <select id="gejala-tbc" v-model="gejalaTbc" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="mt-3">
                      <label for="edukasi" class="text-muted-foreground mb-1.5 block text-xs font-bold">Edukasi (opsional)</label>
                      <textarea
                        id="edukasi"
                        v-model="edukasi"
                        rows="2"
                        class="w-full resize-none"
                        :class="klsInput"
                        placeholder="Catatan edukasi gizi/kesehatan…"
                      ></textarea>
                    </div>
                  </div>

                  <p v-if="pesanForm" class="flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
                    <TriangleAlert class="mt-0.5 size-4 shrink-0" />
                    {{ pesanForm }}
                  </p>
                  <p v-if="pesanSukses" class="text-sm font-medium text-emerald-700" role="status">
                    {{ pesanSukses }}
                  </p>

                  <Button size="lg" class="w-full" type="submit" :disabled="menyimpan">
                    <Plus class="size-4" />
                    {{ menyimpan ? 'Menyimpan…' : 'Simpan Kunjungan' }}
                  </Button>
                </form>

                <p class="text-muted-foreground border-border/60 border-t pt-3 text-xs leading-relaxed">
                  Status BB/U, TB/U, dan BB/TB dihitung otomatis dari pengukuran memakai standar WHO.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <RouterLink to="/balita" class="text-muted-foreground hover:text-foreground mt-8 inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft class="size-4" />
          Kembali ke daftar
        </RouterLink>
      </template>

      <p
        v-else-if="pesanError"
        class="mt-4 flex items-center gap-2 text-sm font-medium text-red-600"
        role="alert"
      >
        <TriangleAlert class="size-4 shrink-0" />
        {{ pesanError }}
      </p>
    </section>

    <AppFooter />
  </div>
</template>
