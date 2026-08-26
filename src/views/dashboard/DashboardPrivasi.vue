<script setup lang="ts">
import { ShieldCheck } from '@lucide/vue'
</script>

<template>
  <section class="border-border/60 bg-card/60 border-t">
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div class="glass-strong flex items-start gap-4 p-6">
        <span class="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
          <ShieldCheck class="size-5" />
        </span>
        <div>
          <h2 class="font-display text-lg font-semibold">Data anak Anda aman.</h2>
          <p class="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            Pencatatan dan pemantauan data posyandu hanya dapat dilakukan kader yang sudah masuk.
            Setiap data pribadi anak dilindungi autentikasi dan aturan akses ketat — pengunjung
            umum hanya melihat angka agregat, bukan data perorangan.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
