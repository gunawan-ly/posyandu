<script setup lang="ts">
import { HeartPulse, Plus, Search, Trash2, UserRound, X } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Skeleton from '@/components/Skeleton.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { hapusBumil, listBumil, type Bumil } from '@/modules/bumil/db'
import { useAuth } from '@/supabase/useAuth'

const { isAdmin } = useAuth()

const daftar = ref<Bumil[]>([])
const cari = ref('')
const sibuk = ref(true)
const pesanError = ref('')
let timerCari: ReturnType<typeof setTimeout> | undefined

onMounted(async () => {
  await muat()
})

// Pencarian real-time: refetch otomatis ±300 ms setelah berhenti mengetik.
watch(cari, () => {
  if (timerCari) clearTimeout(timerCari)
  timerCari = setTimeout(() => void muat(), 300)
})

onBeforeUnmount(() => {
  if (timerCari) clearTimeout(timerCari)
})

function bersihkanCari() {
  cari.value = ''
}

async function muat() {
  sibuk.value = true
  pesanError.value = ''
  try {
    daftar.value = await listBumil(cari.value)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data ibu hamil.'
  } finally {
    sibuk.value = false
  }
}

function labelKategori(k: string | null): string {
  return k ?? '—'
}

async function hapus(bumil: Bumil) {
  if (!window.confirm(`Hapus data ${bumil.nama} beserta seluruh kunjungannya?`)) return
  try {
    await hapusBumil(bumil.id)
    await muat()
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus data.'
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />

    <section class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-primary text-xs font-bold tracking-widest uppercase">Data posyandu</p>
          <h1 class="font-display mt-3 text-3xl leading-tight sm:text-4xl">Ibu hamil & menyusui</h1>
          <p class="text-muted-foreground mt-3 max-w-xl text-sm">
            Kelola identitas ibu hamil dan catat kunjungan antenatal setiap bulan.
          </p>
        </div>
        <RouterLink v-if="isAdmin" to="/bumil/baru">
          <Button size="lg">
            <Plus class="size-4" />
            Tambah Ibu Hamil
          </Button>
        </RouterLink>
      </div>

      <div class="mt-8 max-w-sm">
        <div class="relative">
          <Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            v-model="cari"
            type="text"
            placeholder="Cari nama ibu…"
            aria-label="Cari nama ibu"
            class="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border py-2 pr-9 pl-9 text-sm shadow-sm outline-none focus-visible:ring-3"
          />
          <button
            v-if="cari"
            type="button"
            aria-label="Hapus pencarian"
            title="Hapus pencarian"
            class="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 transition-colors"
            @click="bersihkanCari"
          >
            <X class="size-4" />
          </button>
        </div>
      </div>

      <p v-if="pesanError" class="mt-4 text-sm font-medium text-red-600" role="alert">
        {{ pesanError }}
      </p>

      <div
        v-if="sibuk"
        class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-label="Memuat…"
      >
        <Card v-for="i in 6" :key="i" class="h-full">
          <CardContent class="flex flex-col gap-3">
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 items-center gap-3">
                <Skeleton class="size-10 rounded-lg" />
                <div class="flex-1 space-y-2">
                  <Skeleton class="h-4 w-40" />
                  <Skeleton class="h-3 w-24" />
                </div>
              </div>
              <Skeleton class="mt-1 size-5 rounded" />
            </div>
            <div class="grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
              <Skeleton class="h-3 w-16" />
              <Skeleton class="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div v-else-if="daftar.length === 0" class="mt-8">
        <div
          class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-white/50 px-8 py-14 text-center"
        >
          <HeartPulse class="text-emerald-300 size-10" />
          <p class="font-display mt-4 text-lg">
            {{ cari ? 'Tidak ada ibu hamil ditemukan' : 'Belum ada data ibu hamil' }}
          </p>
          <p class="text-muted-foreground mt-1 max-w-sm text-sm">
            <template v-if="cari">
              Tidak ditemukan ibu dengan nama “{{ cari }}”. Coba kata kunci lain atau hapus
              pencarian.
            </template>
            <template v-else>
              Mulai dengan menambahkan ibu hamil pertama melalui tombol “Tambah Ibu Hamil”.
            </template>
          </p>
          <Button v-if="cari" variant="outline" size="sm" class="mt-4" @click="bersihkanCari">
            <X class="size-4" />
            Hapus pencarian
          </Button>
        </div>
      </div>

      <div v-else class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="b in daftar" :key="b.id" class="h-full">
          <CardContent class="flex flex-col gap-3">
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 items-center gap-3">
                <span class="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-lg">
                  <UserRound class="size-5" />
                </span>
                <div class="min-w-0">
                  <RouterLink
                    :to="`/bumil/${b.id}`"
                    class="font-display hover:text-primary block truncate text-base font-bold"
                  >
                    {{ b.nama }}
                  </RouterLink>
                  <p class="text-muted-foreground mt-0.5 text-xs">
                    {{ labelKategori(b.kategori) }} · {{ b.umur || '—' }} th
                  </p>
                </div>
              </div>
              <button
                v-if="isAdmin"
                type="button"
                class="text-muted-foreground hover:bg-red-50 hover:text-red-600 -mr-1.5 mt-1 shrink-0 rounded-lg p-2 transition-colors"
                aria-label="Hapus ibu hamil"
                title="Hapus ibu hamil"
                @click="hapus(b)"
              >
                <Trash2 class="size-4" />
              </button>
            </div>

            <div class="border-border/60 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
              <div>
                <p class="text-muted-foreground font-bold uppercase">Dusun</p>
                <p class="mt-0.5 font-medium">{{ b.dusun || '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground font-bold uppercase">Suami</p>
                <p class="mt-0.5 truncate font-medium">{{ b.nama_suami || '—' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
