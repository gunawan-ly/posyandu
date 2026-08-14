<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { infoStatus, TONE_BADGE } from '@/lib/status'

const props = defineProps<{ kode: string | null | undefined }>()

const info = computed(() => infoStatus(props.kode))
</script>

<template>
  <Badge variant="outline" :class="TONE_BADGE[info.tone]" class="gap-1 px-2.5 py-1 text-xs">
    <span class="font-bold">{{ info.kode }}</span>
    <span>{{ info.label }}</span>
  </Badge>
</template>
