<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import LandingCaraPakai from './landing/LandingCaraPakai.vue'
import LandingCta from './landing/LandingCta.vue'
import LandingHero from './landing/LandingHero.vue'
import LandingKalkulatorKilat from './landing/LandingKalkulatorKilat.vue'
import LandingLayanan from './landing/LandingLayanan.vue'
import LandingStatistik from './landing/LandingStatistik.vue'
import LandingTentang from './landing/LandingTentang.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />

    <!-- Latar gradasi lembut (blob) agar efek kartu kaca terlihat -->
    <div class="glass-backdrop" aria-hidden="true">
      <div class="glass-blob-1 anim-glass-drift" />
      <div class="glass-blob-2 anim-glass-drift" />
      <div class="glass-blob-3" />
    </div>

    <main id="konten-utama" class="w-full">
      <!-- ===== HERO ===== -->
      <LandingHero />

      <!-- ===== STATISTIK BULAN INI ===== -->
      <LandingStatistik />

      <!-- ===== LAYANAN POSYANDU ===== -->
      <LandingLayanan />

      <!-- ===== KALKULATOR KILAT ===== -->
      <LandingKalkulatorKilat />

      <!-- ===== CARA PAKAI ===== -->
      <LandingCaraPakai />

      <!-- ===== TENTANG ===== -->
      <LandingTentang />

      <!-- ===== CTA ===== -->
      <LandingCta />
    </main>

    <AppFooter />
  </div>
</template>
