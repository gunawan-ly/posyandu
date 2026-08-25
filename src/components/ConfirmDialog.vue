<script setup lang="ts">
// Dialog konfirmasi reusable — pengganti window.confirm() bawaan browser.
// Dipakai via v-model:open; aksi dijalankan caller pada event 'konfirmasi'.
import { TriangleAlert } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

defineProps<{
  open: boolean
  judul: string
  deskripsi: string
  labelKonfirmasi?: string
  menyimpan?: boolean
}>()

const emit = defineEmits<{
  'update:open': [nilai: boolean]
  konfirmasi: []
}>()

function tutup() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <div class="mb-1 flex items-start gap-3 sm:text-left">
          <span class="grid size-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
            <TriangleAlert class="size-5" />
          </span>
          <div class="min-w-0">
            <DialogTitle>{{ judul }}</DialogTitle>
            <DialogDescription class="mt-1">{{ deskripsi }}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <slot />

      <DialogFooter>
        <Button variant="outline" :disabled="menyimpan" @click="tutup">Batal</Button>
        <Button variant="destructive" :disabled="menyimpan" @click="emit('konfirmasi')">
          {{ menyimpan ? 'Menghapus…' : labelKonfirmasi || 'Hapus' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
