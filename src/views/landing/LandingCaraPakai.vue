<script setup lang="ts">
import Reveal from '@/components/Reveal.vue'

const LANGKAH = [
  {
    nomor: '1',
    judul: 'Catat pengukuran',
    teks: 'Berat, tinggi, dan lingkar tubuh dicatat langsung dari hasil penimbangan posyandu.',
  },
  {
    nomor: '2',
    judul: 'Status dihitung otomatis',
    teks: 'Sistem membandingkan dengan kurva WHO dan menyimpan status serta riwayat pertumbuhan anak.',
  },
  {
    nomor: '3',
    judul: 'Pantau & tindak lanjuti',
    teks: 'Kader dan orang tua melihat riwayat; bila tidak normal, segera konsultasikan ke tenaga kesehatan.',
  },
]
</script>

<template>
  <section id="cara-pakai" class="border-border/60 bg-card/60 scroll-mt-20 border-y">
    <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <Reveal>
        <p class="text-primary text-xs font-bold tracking-widest uppercase">Langkah sederhana</p>
        <h2 class="font-display mt-4 max-w-xl text-3xl leading-tight font-semibold text-balance sm:text-4xl">
          Dari penimbangan hingga riwayat lengkap.
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
</template>
