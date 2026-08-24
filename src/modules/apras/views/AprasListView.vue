<script setup lang="ts">
import { Plus, Search, Trash2, UserRound, Users, X } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Skeleton from '@/components/Skeleton.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { listApras, hapusApras, type Apras } from '@/modules/apras/db'
import { umurSaatIni } from '@/lib/umur'
import { useAuth } from '@/supabase/useAuth'

const { isAdmin } = useAuth()

const daftar = ref<Apras[]>([])
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
    daftar.value = await listApras(cari.value)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data apras.'
  } finally {
    sibuk.value = false
  }
}

function formatUmur(tanggalLahir: string): string {
  const u = umurSaatIni(tanggalLahir)
  if (u == null) return '—'
  const tahun = Math.floor(u / 12)
  const sisa = u % 12
  if (tahun === 0) return `${sisa} bulan`
  if (sisa === 0) return `${tahun} tahun`
  return `${tahun} th ${sisa} bln`
}

function labelJk(jk: string | null): string {
  return jk === 'Perempuan' ? 'Perempuan' : jk === 'Laki - Laki' ? 'Laki-laki' : '—'
}

async function hapus(anak: Apras) {
  if (!window.confirm(`Hapus data ${anak.nama} beserta seluruh kunjungannya?`)) return
  try {
    await hapusApras(anak.id)
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
          <h1 class="font-display mt-3 text-3xl leading-tight sm:text-4xl">Daftar Apras</h1>
          <p class="text-muted-foreground mt-3 max-w-xl text-sm">
            Anak pra sekolah usia 5–6 tahun. Kelola identitas dan catat pengukuran setiap
            kunjungan.
          </p>
        </div>
        <RouterLink v-if="isAdmin" to="/apras/baru">
          <Button size="lg">
            <Plus class="size-4" />
            Tambah Apras
          </Button>
        </RouterLink>
      </div>

      <div class="mt-8 max-w-sm">
        <div class="relative">
          <Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            v-model="cari"
            type="text"
            placeholder="Cari nama, orang tua, atau NIK…"
            aria-label="Cari nama, orang tua, atau NIK"
            class="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-12 md:h-10 w-full rounded-md border py-2 pr-9 pl-9 text-sm shadow-sm outline-none focus-visible:ring-3"
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
          <Users class="text-emerald-300 size-10" />
          <p class="font-display mt-4 text-lg">
            {{ cari ? 'Tidak ada apras ditemukan' : 'Belum ada data apras' }}
          </p>
          <p class="text-muted-foreground mt-1 max-w-sm text-sm">
            <template v-if="cari">
              Tidak ditemukan anak dengan kata kunci “{{ cari }}”. Coba kata kunci lain atau hapus
              pencarian.
            </template>
            <template v-else>
              Mulai dengan menambahkan anak pertama melalui tombol “Tambah Apras”.
            </template>
          </p>
          <Button v-if="cari" variant="outline" size="sm" class="mt-4" @click="bersihkanCari">
            <X class="size-4" />
            Hapus pencarian
          </Button>
        </div>
      </div>

      <div v-else class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="a in daftar" :key="a.id" class="h-full">
          <CardContent class="flex flex-col gap-3">
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 items-center gap-3">
                <span class="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-lg">
                  <UserRound class="size-5" />
                </span>
                <div class="min-w-0">
                  <RouterLink
                    :to="`/apras/${a.id}`"
                    class="font-display hover:text-primary block truncate text-base font-bold"
                  >
                    {{ a.nama }}
                  </RouterLink>
                  <p class="text-muted-foreground mt-0.5 text-xs">
                    {{ labelJk(a.jenis_kelamin) }} · {{ formatUmur(a.tanggal_lahir) }}
                  </p>
                </div>
              </div>
              <button
                v-if="isAdmin"
                type="button"
                class="text-muted-foreground hover:bg-red-50 hover:text-red-600 -mr-1.5 mt-1 shrink-0 rounded-lg p-2 transition-colors"
                aria-label="Hapus apras"
                title="Hapus apras"
                @click="hapus(a)"
              >
                <Trash2 class="size-4" />
              </button>
            </div>

            <div class="border-border/60 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
              <div>
                <p class="text-muted-foreground font-bold uppercase">Posyandu</p>
                <p class="mt-0.5 font-medium">{{ a.posyandu || '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground font-bold uppercase">Orang tua</p>
                <p class="mt-0.5 truncate font-medium">{{ a.nama_orang_tua || '—' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
