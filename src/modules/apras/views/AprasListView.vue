<script setup lang="ts">
import { Pencil, Plus, Search, Trash2, UserRound, X } from '@lucide/vue'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Skeleton from '@/components/Skeleton.vue'
import ViewToggle from '@/components/ViewToggle.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import FormModalApras from '@/modules/apras/views/FormModalApras.vue'
import { listApras, hapusApras, type Apras } from '@/modules/apras/db'
import { useDaftarModul } from '@/composables/useDaftarModul'
import { formatTanggal, formatUmur, labelJk } from '@/lib/label'
import { useAuth } from '@/supabase/useAuth'

const { isAdmin } = useAuth()
const dlgHapus = ref<InstanceType<typeof ConfirmDialog>>()

const {
  daftar, cari, sibuk, pesanError, modalTambah, modalUbahOpen, modalUbahData,
  modeView, bukaUbah, bersihkanCari, muat, hapusItem,
} = useDaftarModul<Apras>({
  kunciView: 'view-apras',
  muat: listApras,
  hapus: hapusApras,
  namaItem: 'apras',
})

async function hapus(anak: Apras) {
  const ok = await dlgHapus.value?.buka(
    `Hapus data ${anak.nama} beserta seluruh kunjungannya?`,
    'Hapus Apras',
    { merah: true },
  )
  if (!ok) return
  await hapusItem(anak)
}
</script>

<template>
  <div class="flex flex-col">
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
        <Button v-if="isAdmin" size="lg" @click="modalTambah = true">
          <Plus class="size-4" />
          Tambah Apras
        </Button>
      </div>

      <div class="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div class="w-full max-w-sm">
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

        <ViewToggle v-model="modeView" />
      </div>

      <p v-if="pesanError" class="mt-4 text-sm font-medium text-red-600" role="alert">
        {{ pesanError }}
      </p>

      <!-- Kerangka memuat -->
      <div v-if="sibuk" role="status" aria-label="Memuat…">
        <div v-if="modeView === 'grid'" class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <div class="border-border/60 grid grid-cols-2 gap-2 border-t pt-3">
                <Skeleton class="h-3 w-16" />
                <Skeleton class="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        </div>
        <Card v-else class="mt-8">
          <CardContent class="flex flex-col gap-2">
            <Skeleton v-for="i in 6" :key="i" class="h-10 w-full" />
          </CardContent>
        </Card>
      </div>

      <!-- Kosong -->
      <div v-else-if="daftar.length === 0" class="mt-8">
        <div
          class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-white/50 px-8 py-14 text-center"
        >
          <UserRound class="text-emerald-300 size-10" />
          <p class="font-display mt-4 text-lg">
            {{ cari ? 'Tidak ada apras ditemukan' : 'Belum ada data apras' }}
          </p>
          <p class="text-muted-foreground mt-1 max-w-sm text-sm">
            <template v-if="cari">
              Tidak ditemukan anak dengan kata kunci "{{ cari }}". Coba kata kunci lain atau hapus
              pencarian.
            </template>
            <template v-else>
              Mulai dengan menambahkan anak pertama melalui tombol "Tambah Apras".
            </template>
          </p>
          <Button v-if="cari" variant="outline" size="sm" class="mt-4" @click="bersihkanCari">
            <X class="size-4" />
            Hapus pencarian
          </Button>
        </div>
      </div>

      <!-- Data: view kartu -->
      <div v-else-if="modeView === 'grid'" class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <div v-if="isAdmin" class="flex items-center gap-1">
                <button
                  type="button"
                  class="text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 -mr-1.5 mt-1 shrink-0 rounded-lg p-2 transition-colors"
                  aria-label="Ubah apras"
                  title="Ubah apras"
                  @click="bukaUbah(a)"
                >
                  <Pencil class="size-4" />
                </button>
                <button
                  type="button"
                  class="text-muted-foreground hover:bg-red-50 hover:text-red-600 -mr-1.5 mt-1 shrink-0 rounded-lg p-2 transition-colors"
                  aria-label="Hapus apras"
                  title="Hapus apras"
                  @click="hapus(a)"
                >
                  <Trash2 class="size-4" />
                </button>
              </div>
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

      <!-- Data: view tabel (semua kolom identitas; kolom Nama frozen/sticky kiri) -->
      <Card v-else class="mt-8">
        <CardContent>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[1600px] text-sm">
              <thead>
                <tr class="text-muted-foreground border-border/60 border-b text-left text-xs font-bold tracking-wide uppercase">
                  <th class="bg-card sticky left-0 z-10 py-2 pr-3 whitespace-nowrap">Nama</th>
                  <th class="py-2 pr-3">JK</th>
                  <th class="py-2 pr-3">Umur</th>
                  <th class="py-2 pr-3">NIK</th>
                  <th class="py-2 pr-3 whitespace-nowrap">Tempat lahir</th>
                  <th class="py-2 pr-3 whitespace-nowrap">Tgl lahir</th>
                  <th class="py-2 pr-3 whitespace-nowrap">Orang tua</th>
                  <th class="py-2 pr-3 whitespace-nowrap">NIK ortu</th>
                  <th class="py-2 pr-3 whitespace-nowrap">No. KK</th>
                  <th class="py-2 pr-3">Dusun</th>
                  <th class="py-2 pr-3">Alamat</th>
                  <th class="py-2 pr-3">Posyandu</th>
                  <th class="sticky left-0 z-10 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in daftar" :key="a.id" class="group border-border/60 hover:bg-emerald-50/40 relative border-b last:border-0">
                  <td
                    class="bg-white group-hover:bg-emerald-50/40 py-3 pr-3 font-medium whitespace-nowrap sticky left-0 z-10"
                  >
                    <RouterLink :to="`/apras/${a.id}`" class="hover:text-primary font-bold">
                      {{ a.nama }}
                    </RouterLink>
                    <!-- penanda frozen column -->
                    <span class="border-border/60 absolute top-0 right-0 bottom-0 border-r opacity-0 group-hover:opacity-100" aria-hidden="true"></span>
                  </td>
                  <td class="py-3 pr-3 whitespace-nowrap">{{ labelJk(a.jenis_kelamin) }}</td>
                  <td class="text-muted-foreground py-3 pr-3 whitespace-nowrap">{{ formatUmur(a.tanggal_lahir) }}</td>
                  <td class="py-3 pr-3 break-all whitespace-nowrap">{{ a.nik || '—' }}</td>
                  <td class="max-w-[140px] truncate py-3 pr-3 whitespace-nowrap" :title="a.tempat_lahir || ''">{{ a.tempat_lahir || '—' }}</td>
                  <td class="text-muted-foreground py-3 pr-3 whitespace-nowrap">{{ formatTanggal(a.tanggal_lahir) }}</td>
                  <td class="max-w-[160px] truncate py-3 pr-3 whitespace-nowrap" :title="a.nama_orang_tua || ''">{{ a.nama_orang_tua || '—' }}</td>
                  <td class="py-3 pr-3 break-all whitespace-nowrap">{{ a.nik_orang_tua || '—' }}</td>
                  <td class="py-3 pr-3 break-all whitespace-nowrap">{{ a.nomor_kk || '—' }}</td>
                  <td class="py-3 pr-3 whitespace-nowrap">{{ a.dusun || '—' }}</td>
                  <td class="max-w-[220px] truncate py-3 pr-3 whitespace-nowrap" :title="a.alamat || ''">{{ a.alamat || '—' }}</td>
                  <td class="py-3 pr-3 whitespace-nowrap">{{ a.posyandu || '—' }}</td>
                  <td class="py-3 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1">
                      <RouterLink :to="`/apras/${a.id}`">
                        <Button variant="ghost" size="sm">Detail</Button>
                      </RouterLink>
                      <button
                        v-if="isAdmin"
                        type="button"
                        class="text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 rounded-lg p-2 transition-colors"
                        aria-label="Ubah apras"
                        title="Ubah apras"
                        @click="bukaUbah(a)"
                      >
                        <Pencil class="size-4" />
                      </button>
                      <button
                        v-if="isAdmin"
                        type="button"
                        class="text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-lg p-2 transition-colors"
                        aria-label="Hapus apras"
                        title="Hapus apras"
                        @click="hapus(a)"
                      >
                        <Trash2 class="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>

    <AppFooter />

    <ConfirmDialog ref="dlgHapus" />
    <FormModalApras v-model:open="modalTambah" @tersimpan="muat" />
    <FormModalApras v-model:open="modalUbahOpen" :apras="modalUbahData" @tersimpan="muat" @update:open="(v) => { if (!v) { modalUbahOpen = false; modalUbahData = null } }" />
  </div>
</template>
