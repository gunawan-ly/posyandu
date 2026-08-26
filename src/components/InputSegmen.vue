<script setup lang="ts">
import { computed } from 'vue'

// Toggle segmen pilihan tunggal — gaya visual sama dengan pemilihan jenis
// kelamin (dipakai Dusun & Posyandu). Nilai lama di luar daftar opsi tetap
// dipertahankan dengan catatan kecil sampai pengguna memilih salah satu.
const props = withDefaults(
  defineProps<{
    modelValue: string
    opsi: readonly string[]
    label?: string
  }>(),
  { label: '' },
)

const emit = defineEmits<{ 'update:modelValue': [nilai: string] }>()

const labelTampil = computed(() => props.label || props.opsi[0] || '')

const diLuarOpsi = computed(
  () => props.modelValue !== '' && !props.opsi.includes(props.modelValue),
)
</script>

<template>
  <div>
    <p class="text-muted-foreground mb-1.5 block text-xs font-bold">{{ labelTampil }}</p>
    <div
      class="inline-flex w-full rounded-lg border border-emerald-200 bg-emerald-50 p-1"
      role="group"
      :aria-label="labelTampil"
    >
      <button
        v-for="o in opsi"
        :key="o"
        type="button"
        :class="modelValue === o
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'"
        class="flex-1 rounded-md px-3 py-2 text-sm font-bold transition-colors"
        @click="emit('update:modelValue', o)"
      >
        {{ o }}
      </button>
    </div>
    <p v-if="diLuarOpsi" class="text-muted-foreground mt-1 text-xs">
      Nilai tersimpan saat ini: "{{ modelValue }}" — pilih salah satu di atas untuk mengubahnya.
    </p>
  </div>
</template>
