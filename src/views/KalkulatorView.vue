<script setup lang="ts">
import { Baby, Ruler, Scale, TriangleAlert } from '@lucide/vue'
import { computed, ref } from 'vue'
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
const dihitung = ref(false)
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

const hasil = computed(() => {
  if (!dihitung.value || umurBulan.value == null || beratBadan.value == null || panjangBadan.value == null) {
    return null
  }
  return hitungSemuaStatus(jk.value, umurBulan.value, beratBadan.value, panjangBadan.value)
})

function hitung() {
  pesanError.value = ''
  dihitung.value = false

  const lahir = parseTanggal(tanggalLahir.value)
  const kunjungan = parseTanggal(tanggalPengukuran.value)
  if (!lahir) {
    pesanError.value = 'Tanggal lahir belum diisi dengan benar (YYYY-MM-DD).'
    return
  }
  if (!kunjungan) {
    pesanError.value = 'Tanggal pengukuran belum diisi dengan benar (YYYY-MM-DD).'
    return
  }
  if (kunjungan.getTime() < lahir.getTime()) {
    pesanError.value = 'Tanggal pengukuran tidak boleh sebelum tanggal lahir.'
    return
  }
  const u = hitungUmurBulan(lahir, kunjungan)
  if (u > 60) {
    pesanError.value = 'Cakupan kalkulator hingga 60 bulan. Pengukuran di luar itu tidak bisa dihitung.'
    return
  }
  if (beratBadan.value == null || beratBadan.value <= 0) {
    pesanError.value = 'Berat badan belum diisi atau tidak valid.'
    return
  }
  if (panjangBadan.value == null || panjangBadan.value <= 0) {
    pesanError.value = 'Panjang/tinggi badan belum diisi atau tidak valid.'
    return
  }
  dihitung.value = true
}

const INDIKATOR_TAMPIL = computed(() => {
  const h = hasil.value
  if (!h) return []
  return [
    { ikon: Scale, nama: 'BB/U', judul: 'Berat Badan / Umur', z: h.z_bb_u, status: h.status_bb_u },
    { ikon: Ruler, nama: 'TB/U', judul: 'Tinggi Badan / Umur', z: h.z_tb_u, status: h.status_tb_u },
    { ikon: Baby, nama: 'BB/TB', judul: 'Berat Badan / Tinggi', z: h.z_bb_tb, status: h.status_bb_tb },
  ]
})

const klsInput =
  'border-input bg-background h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />

    <section class="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header class="max-w-2xl">
        <p class="text-primary text-xs font-bold tracking-widest uppercase">Kalkulator status gizi</p>
        <h1 class="font-display mt-3 text-3xl leading-tight sm:text-4xl">Hitung status gizi anak Anda.</h1>
        <p class="text-muted-foreground mt-4">
          Isi pengukuran dari Buku KMS atau hasil penimbangan posyandu. Seluruh perhitungan berjalan di perangkat Anda, tanpa mengirim data.
        </p>
      </header>

      <div class="mt-10 grid gap-6 lg:grid-cols-5">
        <!-- FORM -->
        <Card class="h-fit self-start lg:col-span-2 lg:sticky lg:top-24">
          <CardContent class="gap-5">
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
                  class="flex-1 rounded-md px-3 py-2 text-sm font-bold transition-colors"
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
                  :class="klsInput"
                />
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
                  :class="klsInput"
                />
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
                  :class="klsInput"
                />
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
                  :class="klsInput"
                />
              </div>
            </div>

            <p v-if="pesanError" class="flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
              <TriangleAlert class="mt-0.5 size-4 shrink-0" />
              {{ pesanError }}
            </p>

            <Button size="lg" class="w-full" @click="hitung">
              Hitung Status Gizi
            </Button>

            <p class="text-muted-foreground text-xs leading-relaxed">
              Menghitung BB/U, TB/U, dan BB/TB memakai standar WHO. Batas umur 0–60 bulan.
            </p>
          </CardContent>
        </Card>

        <!-- HASIL -->
        <div class="lg:col-span-3">
          <div
            v-if="!hasil"
            class="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-white/50 p-8 text-center"
          >
            <Scale class="text-emerald-300 size-10" />
            <p class="font-display mt-4 text-lg">Hasil muncul di sini</p>
            <p class="text-muted-foreground mt-1 max-w-xs text-sm">
              Isi formulir dan tekan “Hitung Status Gizi” untuk melihat skor-z beserta kategori statusnya.
            </p>
          </div>

          <div v-else class="space-y-5">
            <Card>
              <CardContent class="gap-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="font-display text-lg">
                    {{ jk === 'L' ? 'Laki-laki' : 'Perempuan' }} · {{ umurLabel }}
                  </p>
                  <p class="text-muted-foreground rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold">
                    Umur {{ umurBulan }} bulan
                  </p>
                </div>
                <KurvaWHO :jk="jk" :umur-bulan="umurBulan ?? 0" :z-bbu="hasil.z_bb_u" />
              </CardContent>
            </Card>

            <div class="grid gap-4 md:grid-cols-3">
              <Card v-for="ind in INDIKATOR_TAMPIL" :key="ind.nama" class="h-full">
                <CardContent class="gap-3">
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
