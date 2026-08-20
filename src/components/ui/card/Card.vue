<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"]
    variant?: "solid" | "glass" | "glass-strong"
  }>(),
  { variant: "solid" },
)
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'text-card-foreground flex flex-col gap-6 rounded-[1.25rem] border py-6',
        variant === 'glass' && 'glass',
        variant === 'glass-strong' && 'glass-strong',
        variant === 'solid' &&
          'bg-card border-border/60 shadow-[0_1px_2px_rgba(19,78,74,0.04),0_16px_40px_-16px_rgba(19,78,74,0.22)]',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
