<script setup lang="ts">
// Modal read-only detail satu kunjungan — dipakai dari tabel riwayat di halaman detail.
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
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
  /** pasangan [label, nilai] dalam urutan tampil */
  baris: Array<[string, string]>
}>()

const emit = defineEmits<{ 'update:open': [nilai: boolean] }>()

const adaIsi = computed(() => props.baris.some(([, v]) => v && v !== '—'))
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[85vh] max-w-lg overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="font-display text-xl font-normal">{{ judul }}</DialogTitle>
        <DialogDescription>Rincian pengukuran & layanan kunjungan ini.</DialogDescription>
      </DialogHeader>

      <p v-if="!adaIsi" class="text-muted-foreground text-sm">Kunjungan ini belum memiliki data tercatat.</p>

      <dl v-else class="border-border/60 divide-y">
        <div v-for="[label, nilai] in baris" :key="label" class="flex items-start justify-between gap-4 py-2 text-sm">
          <dt class="text-muted-foreground shrink-0 font-bold">{{ label }}</dt>
          <dd class="min-w-0 text-right break-all">{{ nilai || '—' }}</dd>
        </div>
      </dl>

      <div class="flex justify-end pt-1">
        <Button variant="outline" @click="emit('update:open', false)">Tutup</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
