<script setup lang="ts">
import { ArrowRight, Baby, HeartPulse, UserRound, Users } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import Reveal from '@/components/Reveal.vue'
import { Card, CardContent } from '@/components/ui/card'
import { KAMPANYE_HUT } from './kampanye'

// ---- Layanan posyandu ----
interface ModulLayanan {
  kunci: string
  nama: string
  deskripsi: string
  ikon: typeof Baby
  aktif: boolean
  href?: string
}

const LAYANAN: ModulLayanan[] = [
  {
    kunci: 'balita',
    nama: 'Balita',
    deskripsi: 'Identitas, pengukuran, kurva pertumbuhan, dan riwayat kunjungan balita 0–60 bulan.',
    ikon: Baby,
    aktif: true,
    href: '/balita',
  },
  {
    kunci: 'apras',
    nama: 'Apras',
    deskripsi: 'Pencatatan anak pra sekolah (5–6 tahun).',
    ikon: UserRound,
    aktif: true,
    href: '/apras',
  },
  {
    kunci: 'bumil',
    nama: 'Bumil',
    deskripsi: 'Pemantauan ibu hamil: identitas, kunjungan, dan status kesehatan.',
    ikon: HeartPulse,
    aktif: true,
    href: '/bumil',
  },
  {
    kunci: 'remaja',
    nama: 'Remaja',
    deskripsi: 'Pencatatan tumbuh kembang dan kesehatan remaja.',
    ikon: UserRound,
    aktif: true,
    href: '/remaja',
  },
  {
    kunci: 'lansia',
    nama: 'Dewasa & Lansia',
    deskripsi: 'Pemantauan kesehatan dewasa dan lansia di posyandu.',
    ikon: Users,
    aktif: false,
  },
]
</script>

<template>
  <section id="layanan" class="border-border/60 bg-card/60 scroll-mt-20 border-y">
    <div class="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <!-- Pola garis diagonal halus (motif Indonesia, lapisan kampanye) -->
      <div
        v-if="KAMPANYE_HUT"
        class="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style="background-image: repeating-linear-gradient(45deg, #dc2626 0, #dc2626 1px, transparent 1px, transparent 16px)"
      />

      <Reveal>
        <p class="text-primary text-xs font-bold tracking-widest uppercase">Layanan terpadu</p>
        <h2 class="font-display mt-4 max-w-xl text-3xl leading-tight font-semibold text-balance sm:text-4xl">
          Satu posyandu, lima sasaran kesehatan.
        </h2>
        <p class="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed">
          Setiap kelompok warga memiliki pencatatan dan pemantauan sendiri dalam satu sistem.
          Balita & bumil sudah berjalan; layanan lainnya menyusul.
        </p>
      </Reveal>

      <div class="mt-12 grid gap-5 md:grid-cols-2">
        <Reveal v-for="(m, i) in LAYANAN" :key="m.kunci" :delay="i * 80">
          <component :is="m.aktif ? RouterLink : 'div'" :to="m.aktif ? m.href : null" class="block h-full">
            <Card
              variant="glass"
              class="relative h-full overflow-hidden py-0 transition-all duration-300"
              :class="m.aktif
                ? 'hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10'
                : 'opacity-80'"
            >
              <!-- Pita merah tipis di puncak kartu layanan aktif (lapisan kampanye) -->
              <span
                v-if="m.aktif && KAMPANYE_HUT"
                aria-hidden="true"
                class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600"
              />
              <CardContent class="flex flex-col gap-4 p-6 sm:p-7">
                <div class="flex items-start justify-between gap-3">
                  <span
                    class="grid size-12 place-items-center rounded-xl"
                    :class="m.aktif ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'"
                  >
                    <component :is="m.ikon" class="size-6" />
                  </span>
                  <span
                    v-if="m.aktif"
                    class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700"
                  >
                    Aktif
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 rounded-full border border-transparent bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground"
                  >
                    Segera
                  </span>
                </div>
                <div>
                  <h3 class="font-display text-xl font-semibold">{{ m.nama }}</h3>
                  <p class="text-muted-foreground mt-1.5 text-sm leading-relaxed">{{ m.deskripsi }}</p>
                </div>
                <p
                  v-if="m.aktif"
                  class="inline-flex items-center gap-1.5 text-sm font-bold"
                  :class="KAMPANYE_HUT ? 'text-red-600' : 'text-primary'"
                >
                  Buka layanan
                  <ArrowRight class="size-4" />
                </p>
              </CardContent>
            </Card>
          </component>
        </Reveal>
      </div>
    </div>
  </section>
</template>
