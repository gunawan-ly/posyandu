<script setup lang="ts">
import { ArrowRight, Lock } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import Reveal from '@/components/Reveal.vue'
import { Button } from '@/components/ui/button'
import { KAMPANYE_HUT, TEX_KAMPANYE } from './kampanye'
</script>

<template>
  <section class="border-border/60 bg-card/60 border-t">
    <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <Reveal>
        <div class="from-primary to-accent relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-10 text-center shadow-2xl shadow-primary/25 sm:p-16">
          <!-- Pita merah tipis di puncak CTA (lapisan kampanye) -->
          <span
            v-if="KAMPANYE_HUT"
            aria-hidden="true"
            class="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 via-red-400 to-red-600"
          />
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
            <p v-if="KAMPANYE_HUT" class="text-xs font-bold tracking-widest text-white/80 uppercase">
              {{ TEX_KAMPANYE.cta }}
            </p>
            <p class="mt-3 text-xs font-bold tracking-widest text-white/70 uppercase">Sehat &amp; mandiri untuk semua</p>
            <h2 class="font-display mx-auto mt-4 max-w-2xl text-3xl leading-tight font-semibold text-white text-balance sm:text-4xl">
              Mulai kelola data posyandu secara digital.
            </h2>
            <p class="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/80">
              Kader dapat masuk untuk mencatat dan memantau kunjungan. Pengunjung lain bebas mencoba kalkulator status gizi tanpa daftar.
            </p>
            <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
              <RouterLink to="/dashboard">
                <Button size="lg" variant="secondary" class="gap-2 bg-white text-emerald-700 shadow-lg hover:bg-emerald-50">
                  Jelajahi Layanan
                  <ArrowRight class="size-4" />
                </Button>
              </RouterLink>
              <RouterLink to="/login">
                <Button size="lg" variant="outline" class="border-white/40 bg-transparent text-white shadow-lg hover:bg-white/10">
                  <Lock class="size-4" />
                  Masuk sebagai Kader
                </Button>
              </RouterLink>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
</template>
