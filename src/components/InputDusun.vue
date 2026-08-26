<script setup lang="ts">
import { computed } from 'vue'

// Pilihan Dusun (toggle segmen gaya sama dengan pemilihan jenis kelamin).
const OPSI_DUSUN = ['Kayumas', 'Tengah', 'Cempaka'] as const

const props = defineProps<{
  modelValue: string
  label?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [nilai: string] }>()

const labelTampil = computed(() => props.label ?? 'Dusun')

// Nilai tersimpan lama bisa berupa teks bebas di luar 3 pilihan — tetap
// dipertahankan (tidak ada tombol aktif) sampai kader memilih salah satu.
const diLuarOpsi = computed(
  () => props.modelValue !== '' && !(OPSI_DUSUN as readonly string[]).includes(props.modelValue),
)
</script>

<template>
  <div>
    <p class="text-muted-foreground mb-1.5 block text-xs font-bold">{{ labelTampil }}</p>
    <div class="inline-flex w-full rounded-lg border border-emerald-200 bg-emerald-50 p-1" role="group" :aria-label="labelTampil">
      <button
        v-for="d in OPSI_DUSUN"
        :key="d"
        type="button"
        :class="modelValue === d
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'"
        class="flex-1 rounded-md px-3 py-2 text-sm font-bold transition-colors"
        @click="emit('update:modelValue', d)"
      >
        {{ d }}
      </button>
    </div>
    <p v-if="diLuarOpsi" class="text-muted-foreground mt-1 text-xs">
      Nilai tersimpan saat ini: "{{ modelValue }}" — pilih salah satu di atas untuk mengubahnya.
    </p>
  </div>
</template>
