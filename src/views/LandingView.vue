<script setup lang="ts">
import {
  Activity,
  ArrowRight,
  Baby,
  CalendarDays,
  HeartPulse,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import KurvaWHO from '@/components/KurvaWHO.vue'
import Reveal from '@/components/Reveal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { hitungSemuaStatus } from '@/lib/kalkulator'
import { infoStatus, TONE_BADGE } from '@/lib/status'

const jk = ref<'L' | 'P'>('L')
const umur = ref(24)
const berat = ref(12.2)
const panjang = ref(87)

const hasil = computed(() =>
  hitungSemuaStatus(jk.value, umur.value, berat.value, panjang.value),
)

const INDIKATOR = [
  {
    ikon: Scale,
    nama: 'BB/U',
    judul: 'Berat Badan per Umur',
    tabel: 'wfa',
    deskripsi: 'Menakar berat badan terhadap umur anak. Deteksi dini kurang gizi, kurus, hingga risiko berat lebih.',
  },
  {
    ikon: Ruler,
    nama: 'TB/U',
    judul: 'Tinggi Badan per Umur',
    tabel: 'lhfa',
    deskripsi: 'Membandingkan tinggi atau panjang badan dengan usianya. Tolok ukur utama deteksi stunting.',
  },
  {
    ikon: TrendingUp,
    nama: 'BB/TB',
    judul: 'Berat Badan per Tinggi',
    tabel: 'wfl / wfh',
    deskripsi: 'Proporsi berat terhadap panjang (di bawah 2 tahun) atau tinggi badan. Menandai gizi kurang hingga obesitas.',
  },
]

const LANGKAH = [
  {
    nomor: '1',
    judul: 'Siapkan data',
    teks: 'Catat berat badan (kg), panjang/tinggi badan (cm), dan tanggal lahir anak dari hasil penimbangan.',
  },
  {
    nomor: '2',
    judul: 'Isi di kalkulator',
    teks: 'Pilih jenis kelamin, masukkan tanggal, dan nilai pengukuran. Hasil dihitung langsung di perangkat Anda.',
  },
  {
    nomor: '3',
    judul: 'Baca status & tindak lanjut',
    teks: 'Lihat status ketiga indikator. Bila tidak normal, kunjungi posyandu atau fasilitas kesehatan terdekat.',
  },
]

const KET = [
  { kode: 'SK', label: 'Sangat Kurus' },
  { kode: 'K', label: 'Kurus' },
  { kode: 'N', label: 'Normal' },
  { kode: 'RBL', label: 'Risiko Berat Lebih' },
  { kode: 'SP', label: 'Sangat Pendek' },
  { kode: 'P', label: 'Pendek' },
  { kode: 'T', label: 'Tinggi' },
  { kode: 'GK', label: 'Gizi Buruk' },
  { kode: 'GB', label: 'Gizi Baik' },
  { kode: 'GL', label: 'Gizi Lebih' },
  { kode: 'O', label: 'Obesitas' },
]
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />

    <main id="konten-utama">
      <!-- ===== HERO ===== -->
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 -z-10" aria-hidden="true">
          <div
            class="bg-primary/5 absolute inset-0"
            style="background-image: radial-gradient(48rem 26rem at 88% -8%, rgba(13, 148, 136, 0.16), transparent 62%)"
          />
          <div class="bg-primary/10 absolute -top-28 right-[8%] size-96 rounded-full blur-3xl" />
          <div class="bg-accent/10 absolute -bottom-32 -left-24 size-80 rounded-full blur-3xl" />
          <div
            class="absolute inset-0 opacity-[0.035]"
            style="background-image: radial-gradient(circle, #059669 1px, transparent 1px); background-size: 28px 28px"
          />
        </div>

        <svg
          class="pointer-events-none absolute inset-x-0 -bottom-2 -z-10 h-36 w-full sm:h-48 lg:h-56"
          viewBox="0 0 1280 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -40 244 C 160 200, 300 84, 520 60 C 700 42, 900 30, 1080 20 C 1180 15, 1240 12, 1320 9"
            fill="none"
            stroke="#0d9488"
            stroke-width="2"
            stroke-dasharray="7 9"
            stroke-opacity="0.3"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
          />
          <path
            d="M -40 280 C 160 236, 300 120, 520 96 C 700 78, 900 66, 1080 56 C 1180 51, 1240 48, 1320 44"
            fill="none"
            stroke="#059669"
            stroke-width="5"
            stroke-opacity="0.45"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
          />
          <circle cx="520" cy="96" r="6" fill="#059669" opacity="0.55" />
          <circle cx="1080" cy="56" r="6" fill="#059669" opacity="0.55" />
        </svg>

        <div
          class="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-16 sm:px-6 sm:pt-20 sm:pb-20 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16 lg:pt-24 lg:pb-28"
        >
          <Reveal>
            <p class="text-primary inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles class="size-3.5" />
              Standar WHO · Metode LMS
            </p>

            <h1 class="font-display mt-6 text-[2.9rem] leading-[1.06] font-semibold text-balance sm:text-6xl lg:text-[4.1rem]">
              Tumbuh kembang anak,
              <span class="relative inline-block text-primary">
                terukur dengan akurat.
                <svg
                  class="absolute -bottom-2 left-0 w-full sm:-bottom-3"
                  viewBox="0 0 220 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M 4 9 C 60 3, 160 3, 216 8"
                    stroke="#0d9488"
                    stroke-width="4"
                    stroke-linecap="round"
                    vector-effect="non-scaling-stroke"
                  />
                </svg>
              </span>
            </h1>

            <p class="text-muted-foreground mt-6 max-w-md text-lg leading-relaxed">
              Masukkan berat badan, tinggi badan, dan umur — hasil status gizi muncul seketika, mengikuti kurva pertumbuhan WHO untuk anak 0–60 bulan.
            </p>

            <div class="mt-9 flex flex-wrap items-center gap-3">
              <RouterLink to="/kalkulator">
                <Button size="lg" class="gap-2 shadow-lg shadow-primary/25">
                  Hitung Sekarang
                  <ArrowRight class="size-4" />
                </Button>
              </RouterLink>
              <RouterLink to="/#indikator">
                <Button variant="outline" size="lg">Pelajari Indikator</Button>
              </RouterLink>
            </div>

            <dl class="mt-12 grid max-w-md grid-cols-3 gap-x-4 border-t border-border pt-6">
              <div>
                <dt class="text-muted-foreground text-xs font-bold tracking-wide uppercase">Cakupan</dt>
                <dd class="font-display mt-1 text-2xl font-semibold tabular-nums">0–60 bln</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs font-bold tracking-wide uppercase">Indikator</dt>
                <dd class="font-display mt-1 text-2xl font-semibold tabular-nums">3 status</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs font-bold tracking-wide uppercase">Dasar</dt>
                <dd class="font-display mt-1 text-2xl font-semibold">WHO 2006</dd>
              </div>
            </dl>
          </Reveal>

          <Reveal :delay="140">
            <div class="relative">
              <div
                class="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/25 to-accent/20 blur-xl"
                aria-hidden="true"
              />
              <Card class="rounded-3xl border-emerald-100 py-0 shadow-2xl shadow-primary/10">
                <CardContent class="gap-0 p-6 sm:p-7">
                  <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <p class="font-display flex items-center gap-2 text-lg font-semibold">
                      <HeartPulse class="text-primary size-5" />
                      Kalkulator kilat
                    </p>
                    <div
                      class="inline-flex rounded-xl border border-emerald-200 bg-emerald-50 p-1"
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
                        class="rounded-lg px-3 py-1.5 text-sm font-bold transition-colors"
                        @click="jk = k"
                      >
                        {{ label }}
                      </button>
                    </div>
                  </div>

                  <div class="rounded-2xl border border-border bg-white p-3 sm:p-4">
                    <KurvaWHO :jk="jk" :umur-bulan="umur" :z="hasil?.z_bb_u ?? null" />
                  </div>

                  <div class="mt-7 grid gap-5 sm:grid-cols-3">
                    <div>
                      <label for="mini-umur" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                        <span>Umur</span><span class="text-foreground tabular-nums">{{ umur }} bln</span>
                      </label>
                      <input id="mini-umur" v-model.number="umur" type="range" min="0" max="60" step="1" class="accent-primary w-full" />
                    </div>
                    <div>
                      <label for="mini-berat" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                        <span>Berat</span><span class="text-foreground tabular-nums">{{ berat }} kg</span>
                      </label>
                      <input id="mini-berat" v-model.number="berat" type="range" min="2" max="25" step="0.1" class="accent-primary w-full" />
                    </div>
                    <div>
                      <label for="mini-panjang" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                        <span>Panjang</span><span class="text-foreground tabular-nums">{{ panjang }} cm</span>
                      </label>
                      <input id="mini-panjang" v-model.number="panjang" type="range" min="45" max="120" step="0.5" class="accent-primary w-full" />
                    </div>
                  </div>

                  <div v-if="hasil" class="mt-6 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:grid-cols-3">
                    <div>
                      <p class="text-muted-foreground text-xs font-bold">BB/U</p>
                      <StatusBadge class="mt-1" :kode="hasil.status_bb_u" />
                      <p class="text-muted-foreground mt-1.5 text-xs tabular-nums">z = {{ hasil.z_bb_u?.toFixed(2) }}</p>
                    </div>
                    <div>
                      <p class="text-muted-foreground text-xs font-bold">TB/U</p>
                      <StatusBadge class="mt-1" :kode="hasil.status_tb_u" />
                      <p class="text-muted-foreground mt-1.5 text-xs tabular-nums">z = {{ hasil.z_tb_u?.toFixed(2) }}</p>
                    </div>
                    <div>
                      <p class="text-muted-foreground text-xs font-bold">BB/TB</p>
                      <StatusBadge class="mt-1" :kode="hasil.status_bb_tb" />
                      <p class="text-muted-foreground mt-1.5 text-xs tabular-nums">z = {{ hasil.z_bb_tb?.toFixed(2) }}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Reveal>
        </div>
      </section>

      <!-- ===== INDIKATOR ===== -->
      <section id="indikator" class="border-border/60 bg-card/60 scroll-mt-20 border-y">
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <p class="text-primary text-xs font-bold tracking-widest uppercase">Tiga sudut pandang</p>
            <h2 class="font-display mt-4 max-w-xl text-3xl leading-tight font-semibold text-balance sm:text-4xl">
              Status gizi dinilai dari tiga indikator.
            </h2>
          </Reveal>
          <div class="mt-12 grid gap-6 md:grid-cols-3">
            <Reveal v-for="(ind, i) in INDIKATOR" :key="ind.nama" :delay="i * 100">
              <Card class="group h-full rounded-2xl border-emerald-100 py-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                <CardContent class="gap-0 p-6 sm:p-7">
                  <span class="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground grid size-13 place-items-center rounded-2xl transition-colors duration-300">
                    <component :is="ind.ikon" class="size-6" />
                  </span>
                  <p class="text-muted-foreground mt-6 text-xs font-bold tracking-wide uppercase">
                    {{ ind.nama }} · tabel {{ ind.tabel }}
                  </p>
                  <h3 class="font-display mt-1.5 text-xl font-semibold">{{ ind.judul }}</h3>
                  <p class="text-muted-foreground mt-2 text-sm leading-relaxed">{{ ind.deskripsi }}</p>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          <Reveal :delay="150">
            <div class="mt-10 rounded-2xl border border-emerald-100 bg-white p-6 sm:p-7">
              <p class="text-muted-foreground text-xs font-bold tracking-widest uppercase">Status gizi</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="k in KET"
                  :key="k.kode"
                  class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
                  :class="TONE_BADGE[infoStatus(k.kode).tone]"
                >
                  {{ k.label }}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <!-- ===== CARA PAKAI ===== -->
      <section id="cara-pakai" class="scroll-mt-20">
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <p class="text-primary text-xs font-bold tracking-widest uppercase">Langkah sederhana</p>
            <h2 class="font-display mt-4 max-w-xl text-3xl leading-tight font-semibold text-balance sm:text-4xl">
              Tiga langkah, semua di tangan Anda.
            </h2>
          </Reveal>

          <div class="relative mt-14 grid gap-14 md:grid-cols-3 md:gap-8">
            <span
              aria-hidden="true"
              class="absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dashed border-emerald-200 md:block"
            />
            <Reveal v-for="(l, i) in LANGKAH" :key="l.nomor" :delay="i * 100">
              <div class="relative flex flex-col items-center text-center">
                <span class="font-display bg-primary text-primary-foreground relative z-10 grid size-14 place-items-center rounded-full text-xl font-semibold shadow-lg shadow-primary/25 ring-8 ring-background">
                  {{ l.nomor }}
                </span>
                <h3 class="font-display mt-6 text-xl font-semibold">{{ l.judul }}</h3>
                <p class="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">{{ l.teks }}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <!-- ===== TENTANG ===== -->
      <section id="tentang" class="border-border/60 bg-card/60 scroll-mt-20 border-y">
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div class="grid items-start gap-12 md:grid-cols-2 lg:gap-16">
            <Reveal>
              <div class="flex items-center gap-3">
                <svg class="size-10 shrink-0" viewBox="0 0 56 32" fill="none" aria-hidden="true">
                  <path
                    d="M2 26 C 14 20, 22 10, 32 8 C 40 6, 48 6, 54 4"
                    stroke="#0d9488"
                    stroke-width="2"
                    stroke-dasharray="4 4"
                    stroke-linecap="round"
                  />
                  <path
                    d="M2 30 C 16 24, 24 14, 34 12 C 42 10, 50 10, 54 8"
                    stroke="#059669"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                  <circle cx="34" cy="12" r="3" fill="#059669" />
                </svg>
                <p class="text-primary text-xs font-bold tracking-widest uppercase">Tentang standar</p>
              </div>
              <h2 class="font-display mt-4 text-3xl leading-tight font-semibold text-balance sm:text-4xl">
                Berbasis kurva pertumbuhan WHO.
              </h2>
              <p class="text-muted-foreground mt-6 leading-relaxed">
                WHO Child Growth Standards (2006) menjadi rujukan global untuk menilai tumbuh kembang anak. Metode LMS memodelkan distribusi berat dan tinggi pada setiap bulan usia, lalu mengubah pengukuran menjadi skor-z.
              </p>
              <p class="text-muted-foreground mt-4 leading-relaxed">
                Dari skor-z itulah status gizi disimpulkan: berat badan per umur, tinggi badan per umur, dan berat badan per tinggi.
              </p>
              <div class="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <ShieldCheck class="mt-0.5 size-5 shrink-0 text-amber-600" />
                <p class="text-sm leading-relaxed text-amber-800">
                  Kalkulator ini alat bantu awal, bukan diagnosis medis. Bila hasil di luar kategori normal, segera konsultasikan ke tenaga kesehatan atau kunjungi posyandu.
                </p>
              </div>
            </Reveal>
            <Reveal :delay="120">
              <Card class="rounded-2xl border-emerald-100 py-0">
                <CardContent class="gap-0 p-6 sm:p-7">
                  <p class="font-display mb-6 text-lg font-semibold">Mengapa skor-z?</p>
                  <ul class="space-y-5">
                    <li class="flex gap-3">
                      <span class="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                        <CalendarDays class="size-5" />
                      </span>
                      <p class="text-sm leading-relaxed"><span class="font-bold">Umur-presisi.</span> Tiap bulan usia punya kurva sendiri — bukan sekadar kategori kasar, hasilnya peka terhadap perubahan kecil.</p>
                    </li>
                    <li class="flex gap-3">
                      <span class="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                        <Baby class="size-5" />
                      </span>
                      <p class="text-sm leading-relaxed"><span class="font-bold">Jenis kelamin dibedakan.</span> Kurva laki-laki dan perempuan terpisah sesuai standar internasional.</p>
                    </li>
                    <li class="flex gap-3">
                      <span class="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                        <Activity class="size-5" />
                      </span>
                      <p class="text-sm leading-relaxed"><span class="font-bold">Ambang baku.</span> Batas −2 dan −3 SD dipakai secara konsisten untuk kategori kurus, pendek, dan gizi kurang.</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      <!-- ===== CTA ===== -->
      <section>
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div class="from-primary to-accent relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-10 text-center shadow-2xl shadow-primary/25 sm:p-16">
              <div class="absolute inset-0 opacity-10" aria-hidden="true" style="background-image: radial-gradient(24rem 12rem at 50% 0%, rgba(255,255,255,.9), transparent 70%)" />
              <svg
                class="pointer-events-none absolute inset-x-0 -bottom-6 h-36 w-full opacity-[0.09]"
                viewBox="0 0 1280 300"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M -40 244 C 160 200, 300 84, 520 60 C 700 42, 900 30, 1080 20"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="3"
                  stroke-dasharray="8 10"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                />
                <path
                  d="M -40 280 C 160 236, 300 120, 520 96 C 700 78, 900 66, 1080 56"
                  fill="none"
                  stroke="#ffffff"
                  stroke-width="6"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
              <div class="relative">
                <p class="text-xs font-bold tracking-widest text-white/70 uppercase">Gratis · Tanpa daftar</p>
                <h2 class="font-display mx-auto mt-4 max-w-2xl text-3xl leading-tight font-semibold text-white text-balance sm:text-4xl">
                  Cek status gizi anak sekarang, gratis.
                </h2>
                <p class="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/80">
                  Hasil langsung di browser tanpa perlu daftar. Cukup masukkan pengukuran dari Buku KMS atau hasil penimbangan posyandu.
                </p>
                <RouterLink to="/kalkulator" class="mt-10 inline-block">
                  <Button size="lg" variant="secondary" class="gap-2 bg-white text-emerald-700 shadow-lg hover:bg-emerald-50">
                    Buka Kalkulator
                    <ArrowRight class="size-4" />
                  </Button>
                </RouterLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>