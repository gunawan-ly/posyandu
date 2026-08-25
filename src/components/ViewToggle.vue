<script setup lang="ts">
import { LayoutGrid, Table } from '@lucide/vue'

// Toggle tampilan halaman daftar: kartu (grid) ⇄ tabel.
// Dipakai bersama oleh semua modul via v-model; pilihan disimpan caller di localStorage.
defineProps<{
  modelValue: 'grid' | 'tabel'
}>()

const emit = defineEmits<{ 'update:modelValue': [nilai: 'grid' | 'tabel'] }>()

const OPSI: Array<{ nilai: 'grid' | 'tabel'; label: string }> = [
  { nilai: 'grid', label: 'Kartu' },
  { nilai: 'tabel', label: 'Tabel' },
]
</script>

<template>
  <div
    class="border-primary/20 inline-flex rounded-lg border bg-emerald-50/60 p-1"
    role="group"
    aria-label="Mode tampilan daftar"
  >
    <button
      v-for="o in OPSI"
      :key="o.nilai"
      type="button"
      :aria-pressed="modelValue === o.nilai"
      :class="
        modelValue === o.nilai
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      "
      class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors"
      @click="emit('update:modelValue', o.nilai)"
    >
      <LayoutGrid v-if="o.nilai === 'grid'" class="size-3.5" />
      <Table v-else class="size-3.5" />
      {{ o.label }}
    </button>
  </div>
</template>
