<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { klasifikasiBbu } from '@/lib/kalkulator'
import { wfaBoy, wfaGirl, type BarisUmur } from '@/lib/kalkulator/tabel'
import { infoStatus, TONE_DOT } from '@/lib/status'

const props = withDefaults(
  defineProps<{
    jk: 'L' | 'P'
    umurBulan?: number
    zBbu?: number | null
  }>(),
  {
    umurBulan: 24,
    zBbu: null,
  },
)

const TABEL = computed<readonly BarisUmur[]>(() => (props.jk === 'L' ? wfaBoy : wfaGirl))

function beratUntukZ(l: number, m: number, s: number, z: number): number {
  if (l === 0) return m * Math.exp(s * z)
  return m * Math.pow(1 + l * s * z, 1 / l)
}

const PAD = { atas: 16, kanan: 12, bawah: 34, kiri: 42 }
const W = 560
const H = 320
const W_INNER = W - PAD.kiri - PAD.kanan
const H_INNER = H - PAD.atas - PAD.bawah
const Z_LINES = [-3, -2, -1, 0, 1, 2, 3]
const TICK_BULAN = [0, 12, 24, 36, 48, 60]

const dataTitik = computed(() => {
  const rows = TABEL.value
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const r of rows) {
    for (const z of Z_LINES) {
      const w = beratUntukZ(r.L, r.M, r.S, z)
      if (w < min) min = w
      if (w > max) max = w
    }
  }
  const pad = (max - min) * 0.08
  return { min: min - pad, max: max + pad, rows }
})

const xUmur = (bulan: number) => PAD.kiri + (bulan / 60) * W_INNER
const yBerat = (berat: number) =>
  PAD.atas +
  (1 - (berat - dataTitik.value.min) / (dataTitik.value.max - dataTitik.value.min)) * H_INNER

function pathZ(z: number): string {
  const pts = dataTitik.value.rows.map((r) => {
    const w = beratUntukZ(r.L, r.M, r.S, z)
    return `${xUmur(r.kunci).toFixed(1)},${yBerat(w).toFixed(1)}`
  })
  return `M ${pts[0]} L ${pts.join(' L ')}`
}

const garisGrid = computed(() => {
  const step = 2
  const start = Math.floor(dataTitik.value.min / step) * step
  const out: { y: number; label: string }[] = []
  for (let w = start; w <= dataTitik.value.max; w += step) {
    out.push({ y: yBerat(w), label: String(w) })
  }
  return out
})

const posisiTitik = computed(() => {
  if (props.zBbu == null) return null
  const bulan = Math.max(0, Math.min(60, Math.round(props.umurBulan)))
  const baris = dataTitik.value.rows.find((r) => r.kunci === bulan)
  if (!baris) return null
  const berat = beratUntukZ(baris.L, baris.M, baris.S, props.zBbu)
  return { x: xUmur(bulan), y: yBerat(berat) }
})

const warnaTitik = computed(() => TONE_DOT[infoStatus(klasifikasiBbu(props.zBbu ?? 0)).tone])

const pathLength = 1600
const offset = ref(pathLength)
const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

onMounted(async () => {
  await nextTick()
  if (reducedMotion) {
    offset.value = 0
    return
  }
  requestAnimationFrame(() => {
    offset.value = 0
  })
})
</script>

<template>
  <svg
    :viewBox="`0 0 ${W} ${H}`"
    class="h-auto w-full"
    role="img"
    aria-label="Kurva pertumbuhan berat badan menurut umur berdasarkan standar WHO"
  >
    <g>
      <line
        v-for="g in garisGrid"
        :key="'grid-' + g.label"
        :x1="PAD.kiri"
        :x2="W - PAD.kanan"
        :y1="g.y"
        :y2="g.y"
        stroke="#134e4a"
        stroke-opacity="0.08"
        stroke-width="1"
      />
      <text
        v-for="g in garisGrid"
        :key="'gl-' + g.label"
        :x="PAD.kiri - 8"
        :y="g.y + 3"
        text-anchor="end"
        fill="#134e4a"
        fill-opacity="0.5"
        font-size="10"
      >
        {{ g.label }}
      </text>
    </g>

    <g>
      <path
        v-for="z in Z_LINES"
        :key="z"
        :d="pathZ(z)"
        fill="none"
        :stroke="z === 0 ? '#059669' : '#0d9488'"
        :stroke-width="z === 0 ? 2.5 : 1"
        :opacity="z === 0 ? 1 : 0.35"
        :style="{
          strokeDasharray: pathLength,
          strokeDashoffset: offset,
          transition: reducedMotion ? 'none' : 'stroke-dashoffset 1.6s ease-out',
        }"
      />
    </g>

    <g>
      <line
        v-for="b in TICK_BULAN"
        :key="'tick-' + b"
        :x1="xUmur(b)"
        :x2="xUmur(b)"
        :y1="H - PAD.bawah"
        :y2="H - PAD.bawah + 5"
        stroke="#134e4a"
        stroke-opacity="0.3"
        stroke-width="1"
      />
      <text
        v-for="b in TICK_BULAN"
        :key="'label-' + b"
        :x="xUmur(b)"
        :y="H - 10"
        text-anchor="middle"
        fill="#134e4a"
        fill-opacity="0.5"
        font-size="10"
      >
        {{ b }}
      </text>
      <text :x="W - PAD.kanan" :y="H - 10" text-anchor="end" fill="#134e4a" fill-opacity="0.5" font-size="10">
        Umur (bulan)
      </text>
    </g>

    <g v-if="posisiTitik">
      <circle :cx="posisiTitik.x" :cy="posisiTitik.y" r="13" :fill="warnaTitik" opacity="0.2" />
      <circle
        :cx="posisiTitik.x"
        :cy="posisiTitik.y"
        r="6"
        :fill="warnaTitik"
        class="drop-shadow-sm"
      />
    </g>
  </svg>
</template>
