<script setup lang="ts">
import InputSegmen from './InputSegmen.vue'

// Pilihan Posyandu — toggle segmen gaya sama dengan pemilihan jenis kelamin.
const OPSI_POSYANDU = ['Coklat 1', 'Coklat 2', 'Luar Daerah'] as const

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [nilai: string] }>()
</script>

<template>
  <InputSegmen
    :model-value="modelValue"
    label="Posyandu"
    :opsi="OPSI_POSYANDU"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
