<script setup lang="ts">
import { ArrowRight, BarChart3, HeartPulse, Lock, TrendingUp } from '@lucide/vue'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import KurvaWHO from '@/components/KurvaWHO.vue'
import Reveal from '@/components/Reveal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { hitungSemuaStatus } from '@/lib/kalkulator'
import InputSegmen from '@/components/InputSegmen.vue'

const jk = ref<'L' | 'P'>('L')
const umur = ref(24)
const berat = ref(12.2)
const panjang = ref(87)

const hasil = computed(() =>
  hitungSemuaStatus(jk.value, umur.value, berat.value, panjang.value),
)

// ---- Cara pakai ----
const MANFAAT = [
  {
    ikon: BarChart3,
    judul: 'Pencatatan digital',
    teks: 'Data balita dan kunjungan tersimpan rapi di satu tempat — pengganti Buku KMS manual yang mudah hilang.',
  },
  {
    ikon: TrendingUp,
    judul: 'Status gizi otomatis',
    teks: 'Setiap pengukuran langsung dihitung memakai kurva pertumbuhan WHO dan tersimpan sebagai riwayat.',
  },
  {
    ikon: Lock,
    judul: 'Privasi terjaga',
    teks: 'Data anak dilindungi autentikasi dan aturan akses ketat. Hanya kader terdaftar yang dapat mengelolanya.',
  },
]
</script>

<template>
  <section id="kalkulator" class="scroll-mt-20">
    <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <div class="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <p class="text-primary text-xs font-bold tracking-widest uppercase">Coba sekarang</p>
          <h2 class="font-display mt-4 max-w-md text-3xl leading-tight font-semibold text-balance sm:text-4xl">
            Cek status gizi anak, gratis tanpa daftar.
          </h2>
          <p class="text-muted-foreground mt-6 max-w-md text-sm leading-relaxed">
            Masukkan jenis kelamin, umur, berat, dan tinggi badan. Hasil status gizi dan kurva
            pertumbuhan WHO muncul seketika di perangkat Anda — cukup dari Buku KMS atau hasil
            penimbangan posyandu.
          </p>
          <ul class="mt-8 space-y-4">
            <li v-for="(m, i) in MANFAAT" :key="m.judul" class="flex gap-3" :style="{ transitionDelay: `${i * 60}ms` }">
              <span class="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                <component :is="m.ikon" class="size-5" />
              </span>
              <p class="text-sm leading-relaxed"><span class="font-bold">{{ m.judul }}.</span> {{ m.teks }}</p>
            </li>
          </ul>
          <RouterLink to="/kalkulator" class="mt-9 inline-block">
            <Button size="lg" class="gap-2 shadow-lg shadow-primary/25">
              Buka Kalkulator Lengkap
              <ArrowRight class="size-4" />
            </Button>
          </RouterLink>
        </Reveal>

        <Reveal :delay="140">
          <div class="relative">
            <div
              class="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/25 to-accent/20 blur-xl"
              aria-hidden="true"
            />
            <Card
              variant="glass-strong"
              class="rounded-3xl py-0"
            >
              <CardContent class="gap-0 p-6 sm:p-7">
                <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <p class="font-display flex items-center gap-2 text-lg font-semibold">
                    <HeartPulse class="text-primary size-5" />
                    Kalkulator kilat
                  </p>
                  <InputSegmen
                    v-model="jk"
                    label="Jenis kelamin"
                    :opsi="['L', 'P']"
                    :display="{ L: 'Laki-laki', P: 'Perempuan' }"
                  />
                </div>

                <div class="rounded-2xl border border-border bg-white p-3 sm:p-4">
                  <KurvaWHO :jk="jk" :umur-bulan="umur" :z="hasil?.z_bb_u ?? null" />
                </div>

                <div class="mt-7 grid gap-5 sm:grid-cols-3">
                  <div>
                    <label for="mini-umur" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                      <span>Umur</span><span class="text-foreground tabular-nums">{{ umur }} bln</span>
                    </label>
                    <input id="mini-umur" v-model.number="umur" type="range" min="0" max="60" step="1" class="accent-primary w-full" />
                  </div>
                  <div>
                    <label for="mini-berat" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                      <span>Berat</span><span class="text-foreground tabular-nums">{{ berat }} kg</span>
                    </label>
                    <input id="mini-berat" v-model.number="berat" type="range" min="2" max="25" step="0.1" class="accent-primary w-full" />
                  </div>
                  <div>
                    <label for="mini-panjang" class="text-muted-foreground mb-2 flex justify-between text-xs font-bold">
                      <span>Panjang</span><span class="text-foreground tabular-nums">{{ panjang }} cm</span>
                    </label>
                    <input id="mini-panjang" v-model.number="panjang" type="range" min="45" max="120" step="0.5" class="accent-primary w-full" />
                  </div>
                </div>

                <div v-if="hasil" class="mt-6 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:grid-cols-3">
                  <div>
                    <p class="text-muted-foreground text-xs font-bold">BB/U</p>
                    <StatusBadge class="mt-1" :kode="hasil.status_bb_u" />
                    <p class="text-muted-foreground mt-1.5 text-xs tabular-nums">z = {{ hasil.z_bb_u?.toFixed(2) }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold">TB/U</p>
                    <StatusBadge class="mt-1" :kode="hasil.status_tb_u" />
                    <p class="text-muted-foreground mt-1.5 text-xs tabular-nums">z = {{ hasil.z_tb_u?.toFixed(2) }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold">BB/TB</p>
                    <StatusBadge class="mt-1" :kode="hasil.status_bb_tb" />
                    <p class="text-muted-foreground mt-1.5 text-xs tabular-nums">z = {{ hasil.z_bb_tb?.toFixed(2) }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
</template>
