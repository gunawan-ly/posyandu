<script setup lang="ts">
import {
  ArrowRight,
  LayoutDashboard,
  Lock,
  Plus,
  Sparkles,
} from '@lucide/vue'
import { RouterLink } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/supabase/useAuth'

const { isAutentikasi, isAdmin, user } = useAuth()
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div
        class="bg-primary/5 absolute inset-0"
        style="background-image: radial-gradient(48rem 26rem at 88% -8%, rgba(13, 148, 136, 0.16), transparent 62%)"
      />
      <div class="bg-primary/10 absolute -top-28 right-[8%] size-96 rounded-full blur-3xl" />
      <div
        class="absolute inset-0 opacity-[0.035]"
        style="background-image: radial-gradient(circle, #059669 1px, transparent 1px); background-size: 28px 28px"
      />
    </div>

    <div class="mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 sm:pt-18">
      <div v-if="!isAutentikasi" class="mx-auto max-w-3xl text-center">
        <p class="text-primary inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-sm">
          <Sparkles class="size-3.5" />
          Dashboard posyandu
        </p>
        <h1 class="font-display mt-6 text-3xl leading-tight font-semibold text-balance sm:text-5xl">
          Satu posyandu,
          <span class="text-primary">lima sasaran kesehatan.</span>
        </h1>
        <p class="text-muted-foreground mx-auto mt-5 max-w-xl text-base leading-relaxed">
          Pantau layanan posyandu dalam satu sistem digital — dari pencatatan balita hingga
          pemantauan bumil, remaja, dewasa, dan lansia.
        </p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <RouterLink to="/login">
            <Button size="lg" class="gap-2 shadow-lg shadow-primary/25">
              <Lock class="size-4" />
              Masuk sebagai Kader
            </Button>
          </RouterLink>
          <RouterLink to="/kalkulator">
            <Button variant="outline" size="lg">
              Coba Kalkulator
              <ArrowRight class="size-4" />
            </Button>
          </RouterLink>
        </div>
      </div>

      <div v-else class="mx-auto max-w-3xl">
        <p class="text-primary inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-sm">
          <LayoutDashboard class="size-3.5" />
          Dashboard kader
        </p>
        <div class="mt-5 flex flex-wrap items-center gap-3">
          <h1 class="font-display text-3xl leading-tight font-semibold text-balance sm:text-4xl">
            Selamat datang kembali.
          </h1>
          <Badge v-if="isAdmin" variant="outline" class="bg-emerald-100 text-emerald-700 border-emerald-200">
            Admin
          </Badge>
        </div>
        <p class="text-muted-foreground mt-3 max-w-xl text-sm" :title="user?.email">
          Anda masuk sebagai <span class="text-foreground font-medium">{{ user?.email }}</span>.
          Pantau status gizi dan kelola data kunjungan balita.
        </p>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <RouterLink v-if="isAdmin" to="/balita?tambah=1">
            <Button size="lg" class="gap-2 shadow-lg shadow-primary/25">
              <Plus class="size-4" />
              Tambah Balita
            </Button>
          </RouterLink>
          <RouterLink to="/balita">
            <Button variant="outline" size="lg">
              Buka Data Balita
              <ArrowRight class="size-4" />
            </Button>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
