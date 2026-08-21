<script setup lang="ts">
import { Baby, Check, Copy, Ruler, Scale, Sparkles, TriangleAlert } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import KurvaWHO from '@/components/KurvaWHO.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { hitungSemuaStatus } from '@/lib/kalkulator'
import { hitungUmurBulan, parseTanggal } from '@/lib/umur'
import { infoStatus } from '@/lib/status'

const jk = ref<'L' | 'P'>('L')
const tanggalLahir = ref('')
const tanggalPengukuran = ref(new Date().toISOString().slice(0, 10))
const beratBadan = ref<number | null>(null)
const panjangBadan = ref<number | null>(null)

// Status "sudah disentuh" tiap field → tampilkan error setelah blur (validasi on-blur).
const sentuh = reactive({ lahir: false, ukur: false, bb: false, pb: false })

const tabKurva = ref<'bbu' | 'tbu' | 'bbtb'>('bbu')
const tersalin = ref(false)
const pesanError = ref('')

const umurBulan = computed(() => {
  const lahir = parseTanggal(tanggalLahir.value)
  const kunjungan = parseTanggal(tanggalPengukuran.value)
  if (!lahir || !kunjungan) return null
  if (kunjungan.getTime() < lahir.getTime()) return null
  return hitungUmurBulan(lahir, kunjungan)
})

const umurLabel = computed(() => {
  const u = umurBulan.value
  if (u == null) return null
  const tahun = Math.floor(u / 12)
  const sisa = u % 12
  if (tahun === 0) return `${sisa} bulan`
  if (sisa === 0) return `${tahun} tahun`
  return `${tahun} tahun ${sisa} bulan`
})

// ---- Validasi per field (ditampilkan setelah field disentuh/blur) ----
const errLahir = computed(() => {
  if (!sentuh.lahir) return ''
  if (!tanggalLahir.value) return 'Tanggal lahir wajib diisi.'
  const lahir = parseTanggal(tanggalLahir.value)
  if (!lahir) return 'Format tanggal lahir salah (YYYY-MM-DD).'
  if (lahir.getTime() > Date.now()) return 'Tanggal lahir tidak boleh di masa depan.'
  return ''
})

const errUkur = computed(() => {
  if (!sentuh.ukur) return ''
  if (!tanggalPengukuran.value) return 'Tanggal pengukuran wajib diisi.'
  const kunjungan = parseTanggal(tanggalPengukuran.value)
  if (!kunjungan) return 'Format tanggal pengukuran salah (YYYY-MM-DD).'
  const lahir = parseTanggal(tanggalLahir.value)
  if (lahir && kunjungan.getTime() < lahir.getTime()) {
    return 'Tanggal pengukuran tidak boleh sebelum tanggal lahir.'
  }
  const u = lahir ? hitungUmurBulan(lahir, kunjungan) : null
  if (u != null && u > 60) return 'Cakupan kalkulator hingga 60 bulan.'
  return ''
})

const errBb = computed(() => {
  if (!sentuh.bb) return ''
  if (beratBadan.value == null || beratBadan.value <= 0) return 'Berat badan wajib diisi (kg).'
  return ''
})

const errPb = computed(() => {
  if (!sentuh.pb) return ''
  if (panjangBadan.value == null || panjangBadan.value <= 0) return 'Panjang/tinggi badan wajib diisi (cm).'
  return ''
})

// Kelengkapan & kewajaran input (bebas dari status "sentuh" agar hasil bisa live).
const inputValid = computed(() => {
  const lahir = parseTanggal(tanggalLahir.value)
  const kunjungan = parseTanggal(tanggalPengukuran.value)
  if (!lahir || !kunjungan) return false
  if (kunjungan.getTime() < lahir.getTime()) return false
  if (hitungUmurBulan(lahir, kunjungan) > 60) return false
  if (beratBadan.value == null || beratBadan.value <= 0) return false
  if (panjangBadan.value == null || panjangBadan.value <= 0) return false
  return true
})

const hasil = computed(() => {
  if (!inputValid.value) return null
  return hitungSemuaStatus(jk.value, umurBulan.value!, beratBadan.value!, panjangBadan.value!)
})

// Peringatan nilai di luar kewajaran (ambang WHO: |z| > 5). Non-blocking.
const indikatorImplausibel = computed<string[]>(() => {
  const h = hasil.value
  if (!h) return []
  const cek = [
    { nama: 'BB/U', z: h.z_bb_u },
    { nama: 'TB/U', z: h.z_tb_u },
    { nama: 'BB/TB', z: h.z_bb_tb },
  ]
  return cek.filter((c) => c.z != null && Math.abs(c.z) > 5).map((c) => c.nama)
})

const INDIKATOR_TAMPIL = computed(() => {
  const h = hasil.value
  if (!h) return []
  return [
    { ikon: Scale, nama: 'BB/U', judul: 'Berat Badan / Umur', z: h.z_bb_u, status: h.status_bb_u },
    { ikon: Ruler, nama: 'TB/U', judul: 'Tinggi Badan / Umur', z: h.z_tb_u, status: h.status_tb_u },
    { ikon: Baby, nama: 'BB/TB', judul: 'Berat Badan / Tinggi', z: h.z_bb_tb, status: h.status_bb_tb },
  ]
})

type TabKurva = 'bbu' | 'tbu' | 'bbtb'
const TAB_KURVA: { kunci: TabKurva; label: string }[] = [
  { kunci: 'bbu', label: 'BB/U' },
  { kunci: 'tbu', label: 'TB/U' },
  { kunci: 'bbtb', label: 'BB/TB' },
]

const kurvaProps = computed(() => {
  const h = hasil.value
  const u = umurBulan.value ?? 0
  if (!h) return null
  if (tabKurva.value === 'bbu') return { indikator: 'bbu' as const, umurBulan: u, nilai: 0, z: h.z_bb_u }
  if (tabKurva.value === 'tbu') return { indikator: 'tbu' as const, umurBulan: u, nilai: 0, z: h.z_tb_u }
  return { indikator: 'bbtb' as const, umurBulan: u, nilai: panjangBadan.value ?? 0, z: h.z_bb_tb }
})

const keteranganKurva = computed(() => {
  const h = hasil.value
  if (!h) return ''
  if (tabKurva.value === 'bbu') return `Skor-z BB/U ${h.z_bb_u != null ? h.z_bb_u.toFixed(2) : '—'}`
  if (tabKurva.value === 'tbu') return `Skor-z TB/U ${h.z_tb_u != null ? h.z_tb_u.toFixed(2) : '—'}`
  return `Panjang ${panjangBadan.value ?? '—'} cm · skor-z BB/TB ${h.z_bb_tb != null ? h.z_bb_tb.toFixed(2) : '—'}`
})

const ringkasanTeks = computed(() => {
  const h = hasil.value
  if (!h) return ''
  const s = (z: number | null) => (z != null ? z.toFixed(2) : '—')
  return [
    `Status Gizi Anak — Posyandu Wapalo`,
    `${jk.value === 'L' ? 'Laki-laki' : 'Perempuan'} · umur ${umurLabel.value ?? '—'}`,
    `BB/U: ${infoStatus(h.status_bb_u).label} (z = ${s(h.z_bb_u)})`,
    `TB/U: ${infoStatus(h.status_tb_u).label} (z = ${s(h.z_tb_u)})`,
    `BB/TB: ${infoStatus(h.status_bb_tb).label} (z = ${s(h.z_bb_tb)})`,
  ].join('\n')
})

async function salin() {
  pesanError.value = ''
  if (!ringkasanTeks.value) return
  try {
    await navigator.clipboard.writeText(ringkasanTeks.value)
    tersalin.value = true
    setTimeout(() => (tersalin.value = false), 2000)
  } catch {
    pesanError.value = 'Gagal menyalin. Salin manual dari teks ringkasan di bawah.'
  }
}

const pesanAria = computed(() =>
  hasil.value ? `Status gizi telah dihitung untuk umur ${umurLabel.value ?? '—'}.` : '',
)

const klsInput =
  'border-input bg-background h-12 md:h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'

const klsInputError = `${klsInput} border-red-300 focus-visible:border-red-400 focus-visible:ring-red-400/40`
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />

    <section class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header class="max-w-2xl">
        <p class="text-primary text-xs font-bold tracking-widest uppercase">Kalkulator status gizi</p>
        <h1 class="font-display mt-3 text-3xl leading-tight sm:text-4xl">Hitung status gizi anak Anda.</h1>
        <p class="text-muted-foreground mt-4">
          Isi pengukuran dari Buku KMS atau hasil penimbangan posyandu. Hasil muncul otomatis saat data lengkap — seluruh perhitungan berjalan di perangkat Anda.
        </p>
      </header>

      <div class="mt-10 grid gap-6 lg:grid-cols-5">
        <!-- FORM -->
        <Card class="h-fit self-start lg:col-span-2 lg:sticky lg:top-24">
          <CardContent class="flex flex-col gap-5">
            <div>
              <p class="mb-2 text-sm font-bold">Jenis kelamin</p>
              <div
                class="inline-flex w-full rounded-lg border border-emerald-200 bg-emerald-50 p-1"
                role="group"
                aria-label="Jenis kelamin"
              >
                <button
                  v-for="(label, k) in { L: 'Laki-laki', P: 'Perempuan' }"
                  :key="k"
                  type="button"
                  :class="jk === k
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'"
                  class="flex-1 cursor-pointer rounded-md px-3 py-2 text-sm font-bold transition-colors"
                  @click="jk = k"
                >
                  {{ label }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="tgl-lahir" class="text-muted-foreground mb-1.5 block text-xs font-bold">
                  Tanggal lahir
                </label>
                <input
                  id="tgl-lahir"
                  v-model="tanggalLahir"
                  type="date"
                  class="[color-scheme:light]"
                  :class="errLahir ? klsInputError : klsInput"
                  :aria-invalid="errLahir ? 'true' : undefined"
                  :aria-describedby="errLahir ? 'err-tgl-lahir' : undefined"
                  @blur="sentuh.lahir = true"
                />
                <p
                  v-if="errLahir"
                  id="err-tgl-lahir"
                  class="mt-1.5 text-xs font-medium text-red-600"
                  role="alert"
                >
                  {{ errLahir }}
                </p>
              </div>
              <div>
                <label for="tgl-ukur" class="text-muted-foreground mb-1.5 block text-xs font-bold">
                  Tanggal pengukuran
                </label>
                <input
                  id="tgl-ukur"
                  v-model="tanggalPengukuran"
                  type="date"
                  class="[color-scheme:light]"
                  :class="errUkur ? klsInputError : klsInput"
                  :aria-invalid="errUkur ? 'true' : undefined"
                  :aria-describedby="errUkur ? 'err-tgl-ukur' : undefined"
                  @blur="sentuh.ukur = true"
                />
                <p
                  v-if="errUkur"
                  id="err-tgl-ukur"
                  class="mt-1.5 text-xs font-medium text-red-600"
                  role="alert"
                >
                  {{ errUkur }}
                </p>
              </div>
            </div>

            <div class="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm">
              Umur saat pengukuran:
              <span class="font-bold">{{ umurLabel ?? '—' }}</span>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="bb" class="text-muted-foreground mb-1.5 block text-xs font-bold">
                  Berat badan (kg)
                </label>
                <input
                  id="bb"
                  v-model.number="beratBadan"
                  type="number"
                  inputmode="decimal"
                  min="0.1"
                  step="0.1"
                  placeholder="cth: 9,6"
                  class="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  :class="errBb ? klsInputError : klsInput"
                  :aria-invalid="errBb ? 'true' : undefined"
                  :aria-describedby="errBb ? 'err-bb' : undefined"
                  @blur="sentuh.bb = true"
                />
                <p
                  v-if="errBb"
                  id="err-bb"
                  class="mt-1.5 text-xs font-medium text-red-600"
                  role="alert"
                >
                  {{ errBb }}
                </p>
              </div>
              <div>
                <label for="pb" class="text-muted-foreground mb-1.5 block text-xs font-bold">
                  Panjang/tinggi (cm)
                </label>
                <input
                  id="pb"
                  v-model.number="panjangBadan"
                  type="number"
                  inputmode="decimal"
                  min="0.1"
                  step="0.1"
                  placeholder="cth: 75"
                  class="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  :class="errPb ? klsInputError : klsInput"
                  :aria-invalid="errPb ? 'true' : undefined"
                  :aria-describedby="errPb ? 'err-pb' : undefined"
                  @blur="sentuh.pb = true"
                />
                <p
                  v-if="errPb"
                  id="err-pb"
                  class="mt-1.5 text-xs font-medium text-red-600"
                  role="alert"
                >
                  {{ errPb }}
                </p>
              </div>
            </div>

            <p v-if="pesanError" class="flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
              <TriangleAlert class="mt-0.5 size-4 shrink-0" />
              {{ pesanError }}
            </p>

            <p class="text-muted-foreground text-xs leading-relaxed">
              Hasil dihitung otomatis saat data lengkap. Menghitung BB/U, TB/U, dan BB/TB memakai standar WHO. Batas umur 0–60 bulan.
            </p>
          </CardContent>
        </Card>

        <!-- HASIL -->
        <div class="lg:col-span-3">
          <span class="sr-only" role="status" aria-live="polite">{{ pesanAria }}</span>

          <div
            v-if="!hasil"
            class="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-white/50 p-8 text-center"
          >
            <Scale class="text-emerald-300 size-10" />
            <p class="font-display mt-4 text-lg">Hasil muncul di sini</p>
            <p class="text-muted-foreground mt-1 max-w-xs text-sm">
              Isi jenis kelamin, tanggal, dan pengukuran — hasil status gizi beserta kurva pertumbuhan muncul otomatis.
            </p>
          </div>

          <div v-else class="space-y-5">
            <!-- Ringkasan + salin -->
            <Card>
              <CardContent class="flex flex-col gap-3">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <p class="font-display text-lg">
                    {{ jk === 'L' ? 'Laki-laki' : 'Perempuan' }} · {{ umurLabel }}
                  </p>
                  <p class="text-muted-foreground rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold">
                    Umur {{ umurBulan }} bulan
                  </p>
                </div>
                <div class="border-border/60 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                  <p class="text-muted-foreground text-xs leading-relaxed">
                    Skor-z menyatakan jarak dari median dalam satuan standar deviasi (SD).
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    class="cursor-pointer gap-1.5"
                    :aria-label="tersalin ? 'Ringkasan tersalin' : 'Salin ringkasan hasil'"
                    @click="salin"
                  >
                    <Check v-if="tersalin" class="size-4 text-emerald-600" />
                    <Copy v-else class="size-4" />
                    {{ tersalin ? 'Tersalin' : 'Salin ringkasan' }}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <!-- Kurva 3 indikator -->
            <Card>
              <CardContent class="flex flex-col gap-3">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <p class="font-display text-base">Kurva pertumbuhan</p>
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
                </div>
                <KurvaWHO
                  v-if="kurvaProps"
                  :jk="jk"
                  v-bind="kurvaProps"
                />
                <p class="text-muted-foreground text-xs">{{ keteranganKurva }}</p>
              </CardContent>
            </Card>

            <!-- Peringatan implausibel -->
            <p
              v-if="indikatorImplausibel.length > 0"
              class="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm font-medium text-amber-800"
              role="alert"
            >
              <Sparkles class="mt-0.5 size-4 shrink-0" />
              Nilai pada {{ indikatorImplausibel.join(', ') }} berada jauh di luar rentang kewajaran (skor-z &gt; ±5). Periksa kembali pengukurannya — hasil tetap ditampilkan sebagai referensi.
            </p>

            <div class="grid gap-4 md:grid-cols-3">
              <Card v-for="ind in INDIKATOR_TAMPIL" :key="ind.nama" class="h-full">
                <CardContent class="flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <span class="bg-primary/10 text-primary grid size-10 place-items-center rounded-lg">
                      <component :is="ind.ikon" class="size-5" />
                    </span>
                    <span class="text-muted-foreground text-xs font-bold tracking-wide uppercase">{{ ind.nama }}</span>
                  </div>
                  <div>
                    <p class="font-display text-base">{{ ind.judul }}</p>
                    <p class="text-muted-foreground mt-1 text-sm">Skor-z: {{ ind.z?.toFixed(2) }}</p>
                  </div>
                  <StatusBadge :kode="ind.status" />
                  <p class="text-muted-foreground text-xs leading-relaxed">
                    {{ infoStatus(ind.status).deskripsi }}
                  </p>
                </CardContent>
              </Card>
            </div>

            <p v-if="hasil.error" class="text-sm text-red-600">
              Catatan: {{ hasil.error }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>