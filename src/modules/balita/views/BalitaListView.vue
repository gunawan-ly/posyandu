<script setup lang="ts">
import { Plus, Search, Trash2, UserRound, Users } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { listBalita, hapusBalita, type Balita } from '@/modules/balita/db'
import { umurSaatIni } from '@/lib/umur'
import { useAuth } from '@/supabase/useAuth'

const { isAdmin } = useAuth()

const daftar = ref<Balita[]>([])
const cari = ref('')
const sibuk = ref(true)
const pesanError = ref('')

onMounted(async () => {
  await muat()
})

async function muat() {
  sibuk.value = true
  pesanError.value = ''
  try {
    daftar.value = await listBalita(cari.value)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data balita.'
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

async function hapus(balita: Balita) {
  if (!window.confirm(`Hapus data ${balita.nama} beserta seluruh kunjungannya?`)) return
  try {
    await hapusBalita(balita.id)
    await muat()
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus data.'
  }
}
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />

    <section class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-primary text-xs font-bold tracking-widest uppercase">Data posyandu</p>
          <h1 class="font-display mt-3 text-3xl leading-tight sm:text-4xl">Daftar balita</h1>
          <p class="text-muted-foreground mt-3 max-w-xl text-sm">
            Kelola identitas balita dan catat pengukuran setiap kunjungan.
          </p>
        </div>
        <RouterLink v-if="isAdmin" to="/balita/baru">
          <Button size="lg">
            <Plus class="size-4" />
            Tambah Balita
          </Button>
        </RouterLink>
      </div>

      <div class="mt-8 max-w-sm">
        <div class="relative">
          <Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            v-model="cari"
            type="search"
            placeholder="Cari nama balita…"
            class="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border pr-3 pl-9 text-sm shadow-sm outline-none focus-visible:ring-3"
            @keyup.enter="muat"
          />
        </div>
        <div class="mt-2 flex justify-end">
          <Button variant="ghost" size="sm" @click="muat">Terapkan pencarian</Button>
        </div>
      </div>

      <p v-if="pesanError" class="mt-4 text-sm font-medium text-red-600" role="alert">
        {{ pesanError }}
      </p>

      <div v-if="sibuk" class="text-muted-foreground mt-10 text-sm">Memuat data…</div>

      <div v-else-if="daftar.length === 0" class="mt-10">
        <div
          class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-white/50 px-8 py-14 text-center"
        >
          <Users class="text-emerald-300 size-10" />
          <p class="font-display mt-4 text-lg">Belum ada data balita</p>
          <p class="text-muted-foreground mt-1 max-w-sm text-sm">
            Mulai dengan menambahkan balita pertama melalui tombol “Tambah Balita”.
          </p>
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
                    :to="`/balita/${b.id}`"
                    class="font-display hover:text-primary block truncate text-base font-bold"
                  >
                    {{ b.nama }}
                  </RouterLink>
                  <p class="text-muted-foreground mt-0.5 text-xs">
                    {{ labelJk(b.jenis_kelamin) }} · {{ formatUmur(b.tanggal_lahir) }}
                  </p>
                </div>
              </div>
              <button
                v-if="isAdmin"
                type="button"
                class="text-muted-foreground hover:bg-red-50 hover:text-red-600 -mr-1.5 mt-1 shrink-0 rounded-lg p-2 transition-colors"
                aria-label="Hapus balita"
                title="Hapus balita"
                @click="hapus(b)"
              >
                <Trash2 class="size-4" />
              </button>
            </div>

            <div class="border-border/60 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
              <div>
                <p class="text-muted-foreground font-bold uppercase">Posyandu</p>
                <p class="mt-0.5 font-medium">{{ b.posyandu || '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground font-bold uppercase">Orang tua</p>
                <p class="mt-0.5 truncate font-medium">{{ b.nama_orang_tua || '—' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
