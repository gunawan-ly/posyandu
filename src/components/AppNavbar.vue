<script setup lang="ts">
import { ChevronDown, ChevronRight, LogOut, Menu, Sprout } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/supabase/useAuth'

const buka = ref(false)
const route = useRoute()
const { isAutentikasi, user, inisialisasi, keluar } = useAuth()

const TAUTAN = [
  { label: 'Beranda', to: { path: '/' } },
  { label: 'Tentang', to: { path: '/', hash: '#tentang' } },
  { label: 'Dashboard', to: { path: '/dashboard' } },
]

const MODUL = [
  { label: 'Balita', to: '/balita' },
  { label: 'Bumil', to: '/bumil' },
]

// --- Tab Tentang aktif: hash #tentang ATAU section #tentang sedang terlihat ---
const tentangTerlihat = ref(false)
const tentangAktif = computed(() => {
  const path = route?.path ?? ''
  return path === '/' && (route?.hash === '#tentang' || tentangTerlihat.value)
})

let pengamat: IntersectionObserver | null = null
let timerCoba: ReturnType<typeof setTimeout> | null = null

function amatiTentang() {
  pengamat?.disconnect()
  if (timerCoba) clearTimeout(timerCoba)
  const el = document.getElementById('tentang')
  if (!el) {
    tentangTerlihat.value = false
    if (route?.path === '/') timerCoba = setTimeout(amatiTentang, 150)
    return
  }
  pengamat = new IntersectionObserver(
    (entri) => {
      tentangTerlihat.value = entri.some((e) => e.isIntersecting)
    },
    { rootMargin: '-64px 0px 0px 0px' },
  )
  pengamat.observe(el)
}

function isAktif(label: string) {
  const path = route?.path ?? ''
  if (label === 'Beranda') return path === '/' && !tentangAktif.value
  if (label === 'Tentang') return tentangAktif.value
  if (label === 'Dashboard') return path.startsWith('/dashboard')
  return false
}

// --- Dropdown modul (Data Balita) ---
const bukaModul = ref(false)
const wadahModul = ref<HTMLElement | null>(null)
const tombolModul = ref<HTMLButtonElement | null>(null)
const menuModul = ref<HTMLElement | null>(null)

function modulAktif() {
  const path = route?.path ?? ''
  return path.startsWith('/balita') || path.startsWith('/bumil')
}

function itemModulAktif(to: string) {
  return (route?.path ?? '').startsWith(to)
}

function klikLuar(event: MouseEvent) {
  if (wadahModul.value && !wadahModul.value.contains(event.target as Node)) {
    bukaModul.value = false
  }
}

function tekanEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && bukaModul.value) {
    bukaModul.value = false
    tombolModul.value?.focus()
  }
}

watch(bukaModul, (b) => {
  if (b) {
    nextTick(() => {
      menuModul.value?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    })
  }
})

onMounted(() => {
  inisialisasi()
  amatiTentang()
  document.addEventListener('click', klikLuar)
  document.addEventListener('keydown', tekanEscape)
})

watch(
  () => route?.path,
  () => {
    bukaModul.value = false
    amatiTentang()
  },
)

onBeforeUnmount(() => {
  pengamat?.disconnect()
  if (timerCoba) clearTimeout(timerCoba)
  document.removeEventListener('click', klikLuar)
  document.removeEventListener('keydown', tekanEscape)
})
</script>

<template>
  <header class="no-print glass-nav sticky top-0 z-40">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
      <RouterLink to="/" class="group flex items-center gap-2.5">
        <span class="bg-primary grid size-9 place-items-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105">
          <Sprout class="size-5" />
        </span>
        <span class="font-display text-lg font-bold tracking-tight">Posyandu Wapalo</span>
      </RouterLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
        <RouterLink
          v-for="t in TAUTAN"
          :key="t.label"
          :to="t.to"
          :aria-current="isAktif(t.label) ? 'page' : undefined"
          class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
          :class="isAktif(t.label) && 'bg-muted text-foreground'"
        >
          {{ t.label }}
        </RouterLink>

        <div v-if="isAutentikasi" ref="wadahModul" class="relative">
          <button
            ref="tombolModul"
            type="button"
            aria-haspopup="menu"
            :aria-expanded="bukaModul"
            :aria-current="modulAktif() ? 'page' : undefined"
            class="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
            :class="
              bukaModul || modulAktif()
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            "
            @click="bukaModul = !bukaModul"
          >
            Data Balita
            <ChevronDown class="size-4 transition-transform" :class="bukaModul && 'rotate-180'" />
          </button>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="translate-y-1 scale-95 opacity-0"
            enter-to-class="translate-y-0 scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="translate-y-0 scale-100 opacity-100"
            leave-to-class="translate-y-1 scale-95 opacity-0"
          >
            <div
              v-if="bukaModul"
              ref="menuModul"
              role="menu"
              aria-label="Modul data"
              class="glass min-w-44 p-1.5"
            >
              <RouterLink
                v-for="m in MODUL"
                :key="m.to"
                :to="m.to"
                role="menuitem"
                tabindex="-1"
                class="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                :class="
                  itemModulAktif(m.to)
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                "
                @click="bukaModul = false"
              >
                {{ m.label }}
                <ChevronRight v-if="itemModulAktif(m.to)" class="size-4" />
              </RouterLink>
            </div>
          </Transition>
        </div>
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
            <SheetTitle class="font-display px-6 pt-6 text-lg font-normal">Posyandu Wapalo</SheetTitle>
            <nav class="flex flex-col gap-1 px-4" aria-label="Menu mobile">
              <RouterLink
                v-for="t in TAUTAN"
                :key="t.label"
                :to="t.to"
                class="text-foreground hover:bg-muted rounded-lg px-4 py-3 text-base font-medium"
                :class="isAktif(t.label) && 'bg-muted text-primary'"
                @click="buka = false"
              >
                {{ t.label }}
              </RouterLink>
              <template v-if="isAutentikasi">
                <p class="text-muted-foreground mt-2 px-4 text-xs font-bold uppercase tracking-wide">Data Balita</p>
                <RouterLink
                  v-for="m in MODUL"
                  :key="m.to"
                  :to="m.to"
                  class="text-foreground hover:bg-muted rounded-lg px-4 py-3 text-base font-medium"
                  :class="itemModulAktif(m.to) && 'bg-muted text-primary'"
                  @click="buka = false"
                >
                  {{ m.label }}
                </RouterLink>
              </template>
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