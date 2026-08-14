<script setup lang="ts">
import {
  Activity,
  ArrowRight,
  Baby,
  Calculator,
  CalendarDays,
  ClipboardList,
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
import Typewriter from '@/components/Typewriter.vue'
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

const KATA_POSYANDU = ['Wapalo', 'Sehat', 'Mandiri']

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
    ikon: ClipboardList,
    judul: 'Siapkan data',
    teks: 'Catat berat badan (kg), panjang/tinggi badan (cm), dan tanggal lahir anak dari hasil penimbangan.',
  },
  {
    nomor: '2',
    ikon: Calculator,
    judul: 'Isi di kalkulator',
    teks: 'Pilih jenis kelamin, masukkan tanggal, dan nilai pengukuran. Hasil dihitung langsung di perangkat Anda.',
  },
  {
    nomor: '3',
    ikon: ShieldCheck,
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

      <div class="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-24 lg:pb-28">
        <Reveal>
          <p class="text-primary inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-sm">
            <Sparkles class="size-3.5" />
            Standar WHO · Metode LMS
          </p>

          <h1 class="font-display mt-6 text-[2.9rem] leading-[1.06] font-semibold sm:text-6xl lg:text-[4.3rem]">
            Posyandu
            <span class="text-primary inline-flex">
              <Typewriter :words="KATA_POSYANDU" />
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

          <dl class="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-emerald-200/70 pt-7">
            <div>
              <dt class="text-muted-foreground text-xs font-bold tracking-wide uppercase">Cakupan</dt>
              <dd class="font-display mt-0.5 text-2xl font-semibold">0–60 bln</dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs font-bold tracking-wide uppercase">Indikator</dt>
              <dd class="font-display mt-0.5 text-2xl font-semibold">3 status</dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs font-bold tracking-wide uppercase">Dasar</dt>
              <dd class="font-display mt-0.5 text-2xl font-semibold">WHO 2006</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal :delay="140">
          <div class="relative">
            <div
              class="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/25 to-accent/20 blur-xl"
              aria-hidden="true"
            />
            <Card class="rounded-3xl border-emerald-100 shadow-2xl shadow-primary/10">
              <CardContent class="gap-0 p-6 sm:p-7">
                <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
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

                <KurvaWHO :jk="jk" :umur-bulan="umur" :z="hasil?.z_bb_u ?? null" />

                <div class="mt-6 grid gap-5 sm:grid-cols-3">
                  <div>
                    <label for="mini-umur" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                      <span>Umur</span><span class="text-foreground">{{ umur }} bln</span>
                    </label>
                    <input id="mini-umur" v-model.number="umur" type="range" min="0" max="60" step="1" class="accent-primary w-full" />
                  </div>
                  <div>
                    <label for="mini-berat" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                      <span>Berat</span><span class="text-foreground">{{ berat }} kg</span>
                    </label>
                    <input id="mini-berat" v-model.number="berat" type="range" min="2" max="25" step="0.1" class="accent-primary w-full" />
                  </div>
                  <div>
                    <label for="mini-panjang" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                      <span>Panjang</span><span class="text-foreground">{{ panjang }} cm</span>
                    </label>
                    <input id="mini-panjang" v-model.number="panjang" type="range" min="45" max="120" step="0.5" class="accent-primary w-full" />
                  </div>
                </div>

                <div v-if="hasil" class="mt-6 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:grid-cols-3">
                  <div>
                    <p class="text-muted-foreground text-xs font-bold">BB/U</p>
                    <StatusBadge class="mt-1" :kode="hasil.status_bb_u" />
                    <p class="text-muted-foreground mt-1.5 text-xs">z = {{ hasil.z_bb_u?.toFixed(2) }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold">TB/U</p>
                    <StatusBadge class="mt-1" :kode="hasil.status_tb_u" />
                    <p class="text-muted-foreground mt-1.5 text-xs">z = {{ hasil.z_tb_u?.toFixed(2) }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold">BB/TB</p>
                    <StatusBadge class="mt-1" :kode="hasil.status_bb_tb" />
                    <p class="text-muted-foreground mt-1.5 text-xs">z = {{ hasil.z_bb_tb?.toFixed(2) }}</p>
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
      <div class="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal>
          <p class="text-primary text-xs font-bold tracking-widest uppercase">Tiga sudut pandang</p>
          <h2 class="font-display mt-3 max-w-xl text-3xl leading-tight font-semibold sm:text-4xl">
            Status gizi dinilai dari tiga indikator.
          </h2>
        </Reveal>
        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <Reveal v-for="(ind, i) in INDIKATOR" :key="ind.nama" :delay="i * 100">
            <Card class="group hover:border-primary/40 hover:shadow-primary/10 h-full rounded-2xl border-emerald-100 transition-all hover:-translate-y-1 hover:shadow-xl">
              <CardContent class="gap-5">
                <span class="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground grid size-13 place-items-center rounded-2xl transition-colors">
                  <component :is="ind.ikon" class="size-6" />
                </span>
                <div>
                  <p class="text-muted-foreground text-xs font-bold tracking-wide uppercase">
                    {{ ind.nama }} · tabel {{ ind.tabel }}
                  </p>
                  <h3 class="font-display mt-1.5 text-xl font-semibold">{{ ind.judul }}</h3>
                  <p class="text-muted-foreground mt-2 text-sm leading-relaxed">{{ ind.deskripsi }}</p>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <Reveal :delay="150">
          <div class="mt-10 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-7">
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
      <div class="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal>
          <p class="text-primary text-xs font-bold tracking-widest uppercase">Langkah sederhana</p>
          <h2 class="font-display mt-3 max-w-xl text-3xl leading-tight font-semibold sm:text-4xl">
            Tiga langkah, semua di tangan Anda.
          </h2>
        </Reveal>

        <div class="relative mt-14 grid gap-14 md:grid-cols-3 md:gap-8">
          <span
            aria-hidden="true"
            class="absolute top-6 right-[16%] left-[16%] hidden border-t-2 border-dashed border-emerald-200 md:block"
          />
          <Reveal v-for="(l, i) in LANGKAH" :key="l.nomor" :delay="i * 100">
            <div class="relative flex flex-col items-center text-center">
              <div class="relative">
                <span class="font-display bg-primary text-primary-foreground relative z-10 grid size-13 place-items-center rounded-full text-lg font-semibold shadow-lg shadow-primary/25 ring-8 ring-background">
                  {{ l.nomor }}
                </span>
              </div>
              <span class="bg-primary/10 text-primary mt-5 grid size-10 place-items-center rounded-xl">
                <component :is="l.ikon" class="size-5" />
              </span>
              <h3 class="font-display mt-4 text-xl font-semibold">{{ l.judul }}</h3>
              <p class="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">{{ l.teks }}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- ===== TENTANG ===== -->
    <section id="tentang" class="border-border/60 bg-card/60 scroll-mt-20 border-y">
      <div class="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div class="grid items-start gap-12 md:grid-cols-2">
          <Reveal>
            <p class="text-primary text-xs font-bold tracking-widest uppercase">Tentang standar</p>
            <h2 class="font-display mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
              Berbasis kurva pertumbuhan WHO.
            </h2>
            <p class="text-muted-foreground mt-5 leading-relaxed">
              WHO Child Growth Standards (2006) menjadi rujukan global untuk menilai tumbuh kembang anak. Metode LMS memodelkan distribusi berat dan tinggi pada setiap bulan usia, lalu mengubah pengukuran menjadi skor-z.
            </p>
            <p class="text-muted-foreground mt-4 leading-relaxed">
              Dari skor-z itulah status gizi disimpulkan: berat badan per umur, tinggi badan per umur, dan berat badan per tinggi.
            </p>
            <div class="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <ShieldCheck class="mt-0.5 size-5 shrink-0 text-amber-600" />
              <p class="text-sm leading-relaxed text-amber-800">
                Kalkulator ini alat bantu awal, bukan diagnosis medis. Bila hasil di luar kategori normal, segera konsultasikan ke tenaga kesehatan atau kunjungi posyandu.
              </p>
            </div>
          </Reveal>
          <Reveal :delay="120">
            <Card class="rounded-2xl border-emerald-100">
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
      <div class="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal>
          <div class="from-primary to-accent relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-10 text-center shadow-2xl shadow-primary/25 sm:p-16">
            <div class="absolute inset-0 opacity-10" aria-hidden="true" style="background-image: radial-gradient(24rem 12rem at 50% 0%, rgba(255,255,255,.9), transparent 70%)" />
            <div class="absolute inset-0 opacity-[0.07]" aria-hidden="true" style="background-image: radial-gradient(circle, #ffffff 1px, transparent 1px); background-size: 24px 24px" />
            <div class="relative">
              <p class="text-xs font-bold tracking-widest text-white/70 uppercase">Gratis · Tanpa daftar</p>
              <h2 class="font-display mx-auto mt-3 max-w-2xl text-3xl leading-tight font-semibold text-white sm:text-4xl">
                Cek status gizi anak sekarang, gratis.
              </h2>
              <p class="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/80">
                Hasil langsung di browser tanpa perlu daftar. Cukup masukkan pengukuran dari Buku KMS atau hasil penimbangan posyandu.
              </p>
              <RouterLink to="/kalkulator" class="mt-9 inline-block">
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

    <AppFooter />
  </div>
</template>
