<script setup lang="ts">
import { Activity, Baby, CalendarDays, ShieldCheck } from '@lucide/vue'
import Reveal from '@/components/Reveal.vue'
import { Card, CardContent } from '@/components/ui/card'
</script>

<template>
  <section id="tentang" class="scroll-mt-20">
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
          <Card variant="glass" class="py-0">
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
</template>
