<script setup lang="ts">
import { Sprout } from '@lucide/vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="no-print border-border/60 bg-card mt-auto border-t">
    <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
      <div class="space-y-3">
        <div class="flex items-center gap-2.5">
          <span class="bg-primary grid size-8 place-items-center rounded-lg text-white">
            <Sprout class="size-4" />
          </span>
          <span class="font-display text-lg font-normal">Posyandu Wapalo</span>
        </div>
        <p class="text-muted-foreground max-w-xs text-sm">
          Sistem informasi posyandu digital: pencatatan data posyandu &amp; kunjungan, pemantauan
          tumbuh kembang, dan kalkulator status gizi berbasis standar WHO.
        </p>
      </div>

      <div>
        <p class="text-sm font-bold">Navigasi</p>
        <ul class="text-muted-foreground mt-3 space-y-2 text-sm">
          <li><RouterLink to="/" class="hover:text-foreground transition-colors">Beranda</RouterLink></li>
          <li><RouterLink to="/#layanan" class="hover:text-foreground transition-colors">Layanan</RouterLink></li>
          <li><RouterLink to="/#kalkulator" class="hover:text-foreground transition-colors">Kalkulator</RouterLink></li>
          <li><RouterLink to="/#tentang" class="hover:text-foreground transition-colors">Tentang</RouterLink></li>
        </ul>
      </div>

      <div>
        <p class="text-sm font-bold">Dasar Standar</p>
        <p class="text-muted-foreground mt-3 text-sm">
          Perhitungan memakai metode LMS dan tabel referensi WHO Child Growth Standards (2006) untuk anak 0–60 bulan.
        </p>
      </div>
    </div>
    <div class="border-border/60 border-t">
      <p class="text-muted-foreground mx-auto max-w-6xl px-4 py-4 text-center text-xs sm:px-6">
        © {{ new Date().getFullYear() }} Posyandu Wapalo — dibuat dengan standar WHO.
      </p>
    </div>
    <div class="bg-primary/5 border-border/60 border-t">
      <p class="text-muted-foreground mx-auto max-w-6xl px-4 py-2.5 text-center text-xs sm:px-6">
        Dikembangkan oleh Awan
      </p>
    </div>
  </footer>
</template>
