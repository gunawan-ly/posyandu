<script setup lang="ts">
import { computed } from 'vue'
import { Eye } from '@lucide/vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps<{
  open: boolean
  judul: string
  baris: Array<[string, string | number | null]>
}>()

const emit = defineEmits<{ 'update:open': [nilai: boolean] }>()

function tutup() {
  emit('update:open', false)
}

const filteredBaris = computed(() =>
  props.baris.filter(([, v]) => v != null && v !== ''),
)
</script>

<template>
  <Dialog :open="open" @update:open="(v) => { if (!v) tutup() }">
    <DialogContent
      class="glass-fluid gap-0 border-0 p-0 sm:max-w-lg"
      :show-close-button="false"
      :style="{
        animationDuration: '300ms',
        animationTimingFunction: 'var(--ease-spring)',
      }"
    >
      <DialogHeader class="px-6 pt-6 pb-0">
        <DialogTitle class="font-display flex items-center gap-2 text-lg">
          <Eye class="text-primary size-5 shrink-0" />
          {{ judul }}
        </DialogTitle>
        <DialogDescription class="sr-only">Detail kunjungan</DialogDescription>
      </DialogHeader>

      <div class="max-h-[70vh] overflow-y-auto px-6 py-4">
        <div v-if="filteredBaris.length === 0" class="text-muted-foreground text-sm">
          Tidak ada data untuk ditampilkan.
        </div>
        <dl v-else class="space-y-3">
          <div
            v-for="([label, nilai], i) in filteredBaris"
            :key="i"
            class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm"
          >
            <dt class="text-muted-foreground text-xs font-bold uppercase">{{ label }}</dt>
            <dd class="font-medium">{{ nilai }}</dd>
          </div>
        </dl>
      </div>

      <div class="flex justify-end px-6 py-4">
        <button
          type="button"
          class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          @click="tutup"
        >
          Tutup
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>
