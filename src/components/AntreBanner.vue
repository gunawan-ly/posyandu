<script setup lang="ts">
import { CloudOff, RefreshCw, Trash2 } from '@lucide/vue'
import { onMounted } from 'vue'
import { buangSemuaGagal, sinkronkan, useOfflineAntre } from '@/lib/offlineAntre'

const { daring, sedangSinkron, totalAntre, totalGagal } = useOfflineAntre()

// Coba sinkron saat aplikasi dibuka (selain reaksi otomatis event 'online').
onMounted(() => {
  void sinkronkan()
})
</script>

<template>
  <div
    v-if="!daring || totalAntre > 0"
    class="glass-fluid fixed right-4 bottom-4 z-50 flex max-w-xs items-center gap-2 rounded-xl border border-amber-200/60 px-3 py-2 text-sm shadow-lg"
    role="status"
  >
    <CloudOff class="size-4 shrink-0 text-amber-600" />
    <span class="min-w-0 flex-1 leading-snug">
      <template v-if="!daring">Anda sedang offline — kunjungan tersimpan di perangkat.</template>
      <template v-else-if="totalAntre > 0">
        {{ totalAntre }} kunjungan menunggu terkirim.
        <span v-if="totalGagal > 0" class="block text-xs font-bold text-red-600">
          {{ totalGagal }} gagal kirim — periksa lalu buang bila tidak perlu.
        </span>
      </template>
    </span>
    <button
      v-if="daring && totalAntre - totalGagal > 0"
      type="button"
      class="text-primary hover:bg-primary/10 shrink-0 rounded-md p-1.5 transition-colors disabled:opacity-50"
      :disabled="sedangSinkron"
      :aria-label="sedangSinkron ? 'Sedang mengirim' : 'Kirim sekarang'"
      title="Kirim sekarang"
      @click="sinkronkan()"
    >
      <RefreshCw class="size-4" :class="sedangSinkron ? 'animate-spin' : ''" />
    </button>
    <button
      v-if="daring && totalGagal > 0"
      type="button"
      class="text-muted-foreground hover:bg-red-50 hover:text-red-600 shrink-0 rounded-md p-1.5 transition-colors"
      aria-label="Buang kunjungan yang gagal"
      title="Buang yang gagal"
      @click="buangSemuaGagal()"
    >
      <Trash2 class="size-4" />
    </button>
  </div>
</template>
