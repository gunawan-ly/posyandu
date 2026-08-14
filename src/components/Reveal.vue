<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { ref } from 'vue'

withDefaults(
  defineProps<{
    delay?: number
  }>(),
  { delay: 0 },
)

const el = ref<HTMLElement>()
const terlihat = ref(false)
const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const { stop } = useIntersectionObserver(
  el,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      terlihat.value = true
      stop()
    }
  },
  { threshold: 0.15 },
)
</script>

<template>
  <div
    ref="el"
    :class="terlihat ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    :style="reducedMotion ? undefined : { transition: `opacity .6s ease-out ${delay}ms, transform .6s ease-out ${delay}ms` }"
  >
    <slot />
  </div>
</template>
