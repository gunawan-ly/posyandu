<script setup lang="ts">
import { Sparkles } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Reveal from '@/components/Reveal.vue'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/supabase/useAuth'
import { KAMPANYE_HUT, TEX_KAMPANYE } from './kampanye'

const { isAutentikasi, inisialisasi } = useAuth()

// Status pengecekan sesi untuk tombol Masuk (tombol aktif setelah sesi diketahui).
const cekSesi = ref(true)

onMounted(async () => {
  try {
    await inisialisasi()
  } finally {
    cekSesi.value = false
  }
})

// Masuk cerdas: sudah login → dashboard; belum → halaman login.
const tujuanMasuk = computed(() => (isAutentikasi.value ? '/dashboard' : '/login'))

// ---- Navigasi modul posyandu (hero) ----
// Semua modul diarahkan ke rutenya masing-masing.
interface ModulNav {
  nama: string
  href: string
  aktif: boolean
}

const MODUL_NAV: ModulNav[] = [
  { nama: 'Bumil & Busui', href: '/bumil', aktif: true },
  { nama: 'Bayi & Balita', href: '/balita', aktif: true },
  { nama: 'Apras', href: '/apras', aktif: true },
  { nama: 'Remaja', href: '/remaja', aktif: true },
  { nama: 'Dewasa & Lansia', href: '/lansia', aktif: true },
]
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div
        class="bg-primary/5 absolute inset-0"
        style="background-image: radial-gradient(48rem 26rem at 88% -8%, rgba(13, 148, 136, 0.16), transparent 62%)"
      />
      <div class="bg-primary/10 absolute -top-28 right-[8%] size-96 rounded-full blur-3xl" />
      <div class="bg-accent/10 absolute -bottom-32 -left-24 size-80 rounded-full blur-3xl" />
      <!-- Cahaya merah halus (lapisan kampanye) -->
      <div
        v-if="KAMPANYE_HUT"
        class="anim-melayang bg-red-500/10 absolute -top-24 right-[14%] size-72 rounded-full blur-3xl"
      />
      <div
        class="absolute inset-0 opacity-[0.035]"
        style="background-image: radial-gradient(circle, #059669 1px, transparent 1px); background-size: 28px 28px"
      />
    </div>

    <!-- Angka 81 sebagai watermark elegan (lapisan kampanye, desktop) -->
    <div
      v-if="KAMPANYE_HUT"
      aria-hidden="true"
      class="pointer-events-none absolute -top-8 right-[-3%] -z-10 hidden select-none lg:block"
    >
      <span class="font-display anim-melayang text-red-600/[0.10] text-[22rem] leading-none font-bold">
        81
      </span>
    </div>

    <svg
      class="pointer-events-none absolute inset-x-0 -bottom-2 -z-10 h-36 w-full sm:h-48 lg:h-56"
      viewBox="0 0 1280 300"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M -40 244 C 160 200, 300 84, 520 60 C 700 42, 900 30, 1080 20 C 1180 15, 1240 12, 1320 9"
        fill="none"
        stroke="#0d9488"
        stroke-width="2"
        stroke-dasharray="7 9"
        stroke-opacity="0.3"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M -40 280 C 160 236, 300 120, 520 96 C 700 78, 900 66, 1080 56 C 1180 51, 1240 48, 1320 44"
        fill="none"
        stroke="#059669"
        stroke-width="5"
        stroke-opacity="0.45"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
      <circle cx="520" cy="96" r="6" fill="#059669" opacity="0.55" />
      <circle cx="1080" cy="56" r="6" fill="#059669" opacity="0.55" />
    </svg>

    <div
      class="mx-auto max-w-6xl px-4 pt-16 pb-16 sm:px-6 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24"
    >
      <Reveal>
        <div class="mx-auto max-w-3xl text-center">
          <!-- Badge kampanye HUT ke-81 RI -->
          <div v-if="KAMPANYE_HUT" class="mb-4 flex justify-center">
            <span class="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3.5 py-1.5 text-xs font-bold tracking-wide text-red-700 shadow-sm">
              <svg class="size-3.5 shrink-0" viewBox="0 0 16 10" aria-hidden="true">
                <rect width="16" height="3.4" rx="0.6" fill="#dc2626" />
                <rect y="6.6" width="16" height="3.4" rx="0.6" fill="#ffffff" stroke="#dc2626" stroke-width="0.6" />
              </svg>
              {{ TEX_KAMPANYE.badge }}
            </span>
          </div>

          <p class="text-primary inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-sm">
            <Sparkles class="size-3.5" />
            Posyandu Wapalo — Platform digital untuk posyandu
          </p>

          <h1 class="font-display mt-6 text-[2.6rem] leading-[1.1] font-semibold text-balance sm:text-5xl lg:text-[3.6rem]">
            Satu catatan digital untuk tumbuh kembang
            <span
              :class="KAMPANYE_HUT ? 'text-red-600' : 'text-primary'"
              class="relative inline-block"
            >
              seluruh warga.
              <svg
                :stroke="KAMPANYE_HUT ? '#dc2626' : '#0d9488'"
                class="absolute -bottom-2 left-0 w-full sm:-bottom-3"
                viewBox="0 0 220 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M 4 9 C 60 3, 160 3, 216 8"
                  stroke-width="4"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
            </span>
          </h1>

          <!-- Pesan kampanye: kemerdekaan ↔ pelayanan -->
          <p v-if="KAMPANYE_HUT" class="mx-auto mt-6 max-w-xl text-base font-medium text-red-700">
            {{ TEX_KAMPANYE.garis }}
          </p>

          <p class="text-muted-foreground mx-auto mt-4 max-w-xl text-lg leading-relaxed">
            Posyandu Wapalo membantu kader mencatat pengukuran, memantau status gizi, dan menjaga
            riwayat tumbuh kembang bagi balita, anak pra sekolah, dan ibu hamil/menyusui.
          </p>

          <!-- CTA utama: Masuk (paling atas tengah) — tujuan cerdas sesi -->
          <div class="mt-9 flex justify-center">
            <RouterLink :to="tujuanMasuk">
              <Button
                size="lg"
                :variant="KAMPANYE_HUT ? 'destructive' : 'default'"
                class="gap-2 px-8 shadow-lg"
                :class="KAMPANYE_HUT ? 'shadow-red-600/25' : 'shadow-primary/25'"
              >
                Masuk
              </Button>
            </RouterLink>
          </div>

          <!-- Navigasi modul posyandu -->
          <div class="mt-5 flex justify-center">
            <div class="flex flex-wrap items-center justify-center gap-2.5">
              <template v-for="(m, i) in MODUL_NAV" :key="m.nama">
                <RouterLink :to="m.href">
                  <Button variant="outline" size="sm" class="font-medium">
                    {{ i + 1 }}. {{ m.nama }}
                  </Button>
                </RouterLink>
              </template>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
</template>

<style scoped>
/* Animasi halus lapisan kampanye — tetap hormati prefers-reduced-motion */
@keyframes melayang-hut {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.anim-melayang {
  animation: melayang-hut 7s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .anim-melayang {
    animation: none;
  }
}
</style>
