<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    words: string[]
    kecepatanKetik?: number
    kecepatanHapus?: number
    jedaTerlihat?: number
    jedaAwal?: number
  }>(),
  {
    kecepatanKetik: 90,
    kecepatanHapus: 50,
    jedaTerlihat: 1800,
    jedaAwal: 600,
  },
)

const teks = ref('')
const kursor = ref(true)
const gerakReduksi = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let kataIndex = 0
let timeout: ReturnType<typeof setTimeout> | undefined
let interval: ReturnType<typeof setInterval> | undefined

function ketik() {
  const kata = props.words[kataIndex]
  teks.value = kata.slice(0, teks.value.length + 1)
  if (teks.value.length === kata.length) {
    timeout = setTimeout(hapus, props.jedaTerlihat)
  } else {
    timeout = setTimeout(ketik, props.kecepatanKetik)
  }
}

function hapus() {
  teks.value = teks.value.slice(0, -1)
  if (teks.value.length === 0) {
    kataIndex = (kataIndex + 1) % props.words.length
    timeout = setTimeout(ketik, props.jedaAwal)
  } else {
    timeout = setTimeout(hapus, props.kecepatanHapus)
  }
}

onMounted(() => {
  if (gerakReduksi) {
    teks.value = props.words[0]
    interval = setInterval(() => {
      kataIndex = (kataIndex + 1) % props.words.length
      teks.value = props.words[kataIndex]
    }, props.jedaTerlihat)
    return
  }
  timeout = setTimeout(ketik, props.jedaAwal)
  interval = setInterval(() => {
    kursor.value = !kursor.value
  }, 480)
})

onBeforeUnmount(() => {
  clearTimeout(timeout)
  clearInterval(interval)
})
</script>

<template>
  <span class="inline-flex flex-wrap items-center">
    <span>{{ teks }}</span>
    <span
      aria-hidden="true"
      class="inline-block w-[0.06em] -ml-1 self-center rounded-full bg-current align-baseline transition-opacity duration-200"
      :class="kursor ? 'opacity-100' : 'opacity-0'"
      :style="{ height: '1em' }"
    />
  </span>
</template>
