<script setup lang="ts">
import { LogOut, Menu, Sprout } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/supabase/useAuth'

const buka = ref(false)
const { isAutentikasi, user, inisialisasi, keluar } = useAuth()

onMounted(() => {
  inisialisasi()
})

const TAUTAN = [
  { label: 'Beranda', href: '/' },
  { label: 'Kalkulator', href: '/kalkulator' },
  { label: 'Dashboard', href: '/dashboard' },
]
</script>

<template>
  <header class="bg-background/80 border-border/60 sticky top-0 z-40 border-b backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
      <RouterLink to="/" class="group flex items-center gap-2.5">
        <span class="bg-primary grid size-9 place-items-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105">
          <Sprout class="size-5" />
        </span>
        <span class="font-display text-lg font-normal tracking-tight">
          Posyandu<span class="text-primary">Gizi</span>
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
        <RouterLink
          v-for="t in TAUTAN"
          :key="t.href"
          :to="t.href"
          class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          {{ t.label }}
        </RouterLink>
        <RouterLink
          v-if="isAutentikasi"
          to="/balita"
          class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          Data Balita
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2">
        <RouterLink to="/kalkulator" class="hidden md:block">
          <Button>Hitung Sekarang</Button>
        </RouterLink>

        <template v-if="isAutentikasi">
          <span
            class="text-muted-foreground hidden max-w-40 truncate text-sm font-medium lg:block"
            :title="user?.email"
          >
            {{ user?.email }}
          </span>
          <Button variant="outline" size="icon" aria-label="Keluar" @click="keluar">
            <LogOut class="size-4" />
          </Button>
        </template>
        <RouterLink v-else to="/login" class="hidden md:block">
          <Button variant="outline">Masuk</Button>
        </RouterLink>

        <Sheet v-model:open="buka">
          <SheetTrigger as-child>
            <Button variant="outline" size="icon" class="md:hidden" aria-label="Buka menu">
              <Menu class="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetTitle class="font-display px-6 pt-6 text-lg font-normal">PosyanduGizi</SheetTitle>
            <nav class="flex flex-col gap-1 px-4" aria-label="Menu mobile">
              <RouterLink
                v-for="t in TAUTAN"
                :key="t.href"
                :to="t.href"
                class="text-foreground hover:bg-muted rounded-lg px-4 py-3 text-base font-medium"
                @click="buka = false"
              >
                {{ t.label }}
              </RouterLink>
              <RouterLink
                v-if="isAutentikasi"
                to="/balita"
                class="text-foreground hover:bg-muted rounded-lg px-4 py-3 text-base font-medium"
                @click="buka = false"
              >
                Data Balita
              </RouterLink>
              <div v-if="isAutentikasi" class="border-border/60 mt-2 flex items-center justify-between border-t px-4 pt-3">
                <span class="text-muted-foreground truncate text-sm">{{ user?.email }}</span>
                <Button variant="outline" size="sm" @click="buka = false; keluar()">Keluar</Button>
              </div>
              <div v-else class="px-1 pt-2">
                <RouterLink to="/login" @click="buka = false">
                  <Button variant="outline" class="w-full">Masuk</Button>
                </RouterLink>
              </div>
              <RouterLink to="/kalkulator" class="px-1 pt-2" @click="buka = false">
                <Button class="w-full">Hitung Sekarang</Button>
              </RouterLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
