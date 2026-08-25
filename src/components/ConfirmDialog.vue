<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangle } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const terbuka = ref(false)
const pesan = ref('')
const judul = ref('Konfirmasi')
const merah = ref(false)

let selesai: ((hasil: boolean | null) => void) | null = null

function buka(
  teks: string,
  judulTeks?: string,
  opsional?: { merah?: boolean },
): Promise<boolean | null> {
  pesan.value = teks
  judul.value = judulTeks ?? 'Konfirmasi'
  merah.value = opsional?.merah ?? false
  terbuka.value = true
  return new Promise<boolean | null>((resolve) => {
    selesai = resolve
  })
}

function ya() {
  terbuka.value = false
  selesai?.(true)
  selesai = null
}

function tidak() {
  terbuka.value = false
  selesai?.(false)
  selesai = null
}

function tutup() {
  terbuka.value = false
  selesai?.(null)
  selesai = null
}

defineExpose({ buka })
</script>

<template>
  <Dialog :open="terbuka" @update:open="(v) => { if (!v) tutup() }">
    <DialogContent
      class="glass-fluid gap-0 border-0 p-0 sm:max-w-md"
      :show-close-button="false"
      :style="{
        animationDuration: '300ms',
        animationTimingFunction: 'var(--ease-spring)',
      }"
    >
      <DialogHeader class="px-6 pt-6 pb-0">
        <DialogTitle class="font-display flex items-center gap-2 text-lg">
          <AlertTriangle
            v-if="merah"
            class="text-destructive size-5 shrink-0"
          />
          {{ judul }}
        </DialogTitle>
        <DialogDescription class="text-muted-foreground mt-1 text-sm">
          {{ pesan }}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="px-6 py-4">
        <Button variant="outline" @click="tidak">
          Batal
        </Button>
        <Button
          :variant="merah ? 'destructive' : 'default'"
          @click="ya"
        >
          Ya, Hapus
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
