<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { klasifikasiBbu, klasifikasiBbtb, klasifikasiLika, klasifikasiLila, klasifikasiTbu } from '@/lib/kalkulator'
import {
  acfaBoy,
  acfaGirl,
  hcfaBoy,
  hcfaGirl,
  lhfaBoy2y,
  lhfaBoy5y,
  lhfaGirl2y,
  lhfaGirl5y,
  wfaBoy,
  wfaGirl,
  wfhBoy,
  wfhGirl,
  wflBoy,
  wflGirl,
  type BarisUmur,
} from '@/lib/kalkulator/tabel'
import { infoStatus, TONE_DOT } from '@/lib/status'

type Indikator = 'bbu' | 'tbu' | 'bbtb' | 'lika' | 'lila'

const props = withDefaults(
  defineProps<{
    jk: 'L' | 'P'
    indikator?: Indikator
    umurBulan?: number
    nilai?: number
    z?: number | null
  }>(),
  {
    indikator: 'bbu',
    umurBulan: 24,
    nilai: 0,
    z: null,
  },
)

interface Baris {
  kunci: number
  L: number
  M: number
  S: number
}

const PAD = { atas: 16, kanan: 12, bawah: 34, kiri: 42 }
const W = 560
const H = 320
const W_INNER = W - PAD.kiri - PAD.kanan
const H_INNER = H - PAD.atas - PAD.bawah
const Z_LINES = [-3, -2, -1, 0, 1, 2, 3]
const TICK_UMUR = [0, 12, 24, 36, 48, 60]

function nilaiUntukZ(l: number, m: number, s: number, z: number): number {
  if (l === 0) return m * Math.exp(s * z)
  return m * Math.pow(1 + l * s * z, 1 / l)
}

// TB/U memakai gabungan tabel lhfa 0–24 bln (2_years) + 24–60 bln (5_years).
const gabungLhfa = computed<readonly BarisUmur[]>(() => {
  const dua = props.jk === 'L' ? lhfaBoy2y : lhfaGirl2y
  const lima = props.jk === 'L' ? lhfaBoy5y : lhfaGirl5y
  return [...dua, ...lima.filter((r) => r.kunci > 24)]
})

const tabel = computed<readonly Baris[]>(() => {
  if (props.indikator === 'bbu') return props.jk === 'L' ? wfaBoy : wfaGirl
  if (props.indikator === 'tbu') return gabungLhfa.value
  if (props.indikator === 'lika') return props.jk === 'L' ? hcfaBoy : hcfaGirl
  if (props.indikator === 'lila') return props.jk === 'L' ? acfaBoy : acfaGirl
  const pakaiWfl = props.umurBulan < 24
  if (props.jk === 'L') return pakaiWfl ? wflBoy : wfhBoy
  return pakaiWfl ? wflGirl : wfhGirl
})

const xMin = computed(() => tabel.value[0]?.kunci ?? 0)
const xMax = computed(() => tabel.value[tabel.value.length - 1]?.kunci ?? 60)

const xNilai = (kunci: number) =>
  PAD.kiri + ((kunci - xMin.value) / (xMax.value - xMin.value)) * W_INNER

const dataTitik = computed(() => {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const r of tabel.value) {
    for (const z of Z_LINES) {
      const v = nilaiUntukZ(r.L, r.M, r.S, z)
      if (v < min) min = v
      if (v > max) max = v
    }
  }
  const pad = (max - min) * 0.08
  return { min: min - pad, max: max + pad }
})

const yNilai = (v: number) =>
  PAD.atas +
  (1 - (v - dataTitik.value.min) / (dataTitik.value.max - dataTitik.value.min)) * H_INNER

function pathZ(z: number): string {
  const pts = tabel.value.map((r) => {
    const v = nilaiUntukZ(r.L, r.M, r.S, z)
    return `${xNilai(r.kunci).toFixed(1)},${yNilai(v).toFixed(1)}`
  })
  return `M ${pts[0]} L ${pts.join(' L ')}`
}

const STEP_Y = computed(() => {
  if (props.indikator === 'tbu') return 10
  if (props.indikator === 'lika') return 5
  if (props.indikator === 'lila') return 2
  return 2
})

const garisGrid = computed(() => {
  const step = STEP_Y.value
  const start = Math.floor(dataTitik.value.min / step) * step
  const out: { y: number; label: string }[] = []
  for (let v = start; v <= dataTitik.value.max; v += step) {
    out.push({ y: yNilai(v), label: String(v) })
  }
  return out
})

const tickX = computed(() => {
  if (props.indikator === 'bbtb') {
    const step = 5
    const start = Math.ceil(xMin.value / step) * step
    const out: number[] = []
    for (let v = start; v <= xMax.value; v += step) out.push(v)
    return out
  }
  return TICK_UMUR.filter((v) => v >= xMin.value && v <= xMax.value)
})

const LABEL_X = computed(() =>
  props.indikator === 'bbtb' ? 'Panjang/Tinggi (cm)' : 'Umur (bulan)',
)

const posisiTitik = computed(() => {
  if (props.z == null) return null
  if (props.indikator === 'bbtb') {
    let terdekat = tabel.value[0]
    let selisih = Number.POSITIVE_INFINITY
    for (const r of tabel.value) {
      const s = Math.abs(r.kunci - props.nilai)
      if (s < selisih) {
        selisih = s
        terdekat = r
      }
    }
    const kunci = Math.max(xMin.value, Math.min(xMax.value, props.nilai))
    const v = nilaiUntukZ(terdekat.L, terdekat.M, terdekat.S, props.z)
    return { x: xNilai(kunci), y: yNilai(v) }
  }
  const bulan = Math.max(xMin.value, Math.min(xMax.value, Math.round(props.umurBulan)))
  const baris = tabel.value.find((r) => r.kunci === bulan)
  if (!baris) return null
  const v = nilaiUntukZ(baris.L, baris.M, baris.S, props.z)
  return { x: xNilai(bulan), y: yNilai(v) }
})

const warnaTitik = computed(() => {
  if (props.z == null) return TONE_DOT.info
  const kode =
    props.indikator === 'bbu'
      ? klasifikasiBbu(props.z)
      : props.indikator === 'tbu'
        ? klasifikasiTbu(props.z)
        : props.indikator === 'lika'
          ? klasifikasiLika(props.z)
          : props.indikator === 'lila'
            ? klasifikasiLila(props.z)
            : klasifikasiBbtb(props.z)
  return TONE_DOT[infoStatus(kode).tone]
})

const LABEL_KURVA: Record<Indikator, string> = {
  bbu: 'Kurva pertumbuhan berat badan menurut umur (BB/U) standar WHO',
  tbu: 'Kurva pertumbuhan panjang/tinggi badan menurut umur (TB/U) standar WHO',
  bbtb: 'Kurva pertumbuhan berat badan menurut panjang/tinggi (BB/TB) standar WHO',
  lika: 'Kurva pertumbuhan lingkar kepala menurut umur (LiKA/U) standar WHO',
  lila: 'Kurva pertumbuhan lingkar lengan atas menurut umur (LiLA/U) standar WHO',
}

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
    :aria-label="LABEL_KURVA[indikator]"
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
        v-for="gz in Z_LINES"
        :key="gz"
        :d="pathZ(gz)"
        fill="none"
        :stroke="gz === 0 ? '#059669' : '#0d9488'"
        :stroke-width="gz === 0 ? 2.5 : 1"
        :opacity="gz === 0 ? 1 : 0.35"
        :style="{
          strokeDasharray: pathLength,
          strokeDashoffset: offset,
          transition: reducedMotion ? 'none' : 'stroke-dashoffset 1.6s ease-out',
        }"
      />
    </g>

    <g>
      <line
        v-for="b in tickX"
        :key="'tick-' + b"
        :x1="xNilai(b)"
        :x2="xNilai(b)"
        :y1="H - PAD.bawah"
        :y2="H - PAD.bawah + 5"
        stroke="#134e4a"
        stroke-opacity="0.3"
        stroke-width="1"
      />
      <text
        v-for="b in tickX"
        :key="'label-' + b"
        :x="xNilai(b)"
        :y="H - 10"
        text-anchor="middle"
        fill="#134e4a"
        fill-opacity="0.5"
        font-size="10"
      >
        {{ b }}
      </text>
      <text :x="W - PAD.kanan" :y="H - 10" text-anchor="end" fill="#134e4a" fill-opacity="0.5" font-size="10">
        {{ LABEL_X }}
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
