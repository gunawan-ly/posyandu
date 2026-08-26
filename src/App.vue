<script setup lang="ts">
import AntreBanner from '@/components/AntreBanner.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <div class="flex-1">
      <RouterView />
    </div>
    <!-- Status offline & antrean kunjungan yang belum terkirim (global). -->
    <AntreBanner />
  </div>
</template>
