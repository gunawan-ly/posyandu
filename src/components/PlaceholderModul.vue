<script setup lang="ts">
import { Blocks, UserRound } from '@lucide/vue'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { Card, CardContent } from '@/components/ui/card'

// Komponen placeholder generik untuk modul posyandu yang belum aktif.
// Dipakai wrapper tiap modul (mis. RemajaListView, LansiaListView) dengan teks dari props.
defineProps<{
  namaModul: string
  rentangUsia: string
  deskripsiSingkat: string
}>()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />

    <section class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p class="text-primary text-xs font-bold tracking-widest uppercase">Data posyandu</p>
      <h1 class="font-display mt-3 text-3xl leading-tight sm:text-4xl">Modul {{ namaModul }}</h1>
      <p class="text-muted-foreground mt-3 max-w-xl text-sm">
        {{ rentangUsia }}
      </p>

      <Card variant="glass" class="mt-8 py-0">
        <CardContent class="flex flex-col items-center gap-4 p-8 text-center sm:p-12">
          <span class="bg-primary/10 text-primary grid size-14 place-items-center rounded-2xl">
            <Blocks class="size-7" />
          </span>
          <h2 class="font-display text-xl font-semibold">Sedang dalam persiapan</h2>
          <p class="text-muted-foreground max-w-md text-sm leading-relaxed">
            {{ deskripsiSingkat }}
          </p>
          <div
            class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-white/50 px-6 py-8"
          >
            <UserRound class="text-emerald-300 size-8" />
            <p class="font-display mt-3 text-base">Belum ada data {{ namaModul.toLowerCase() }}</p>
            <p class="text-muted-foreground mt-1 max-w-sm text-sm">
              Daftar sasaran dan form kunjungan akan tersedia setelah struktur tabel selesai
              disiapkan.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>

    <AppFooter />
  </div>
</template>
