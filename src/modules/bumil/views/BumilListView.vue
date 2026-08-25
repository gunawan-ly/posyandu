<script setup lang="ts">
import { HeartPulse, Plus, Search, Trash2, UserRound, X } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Skeleton from '@/components/Skeleton.vue'
import ViewToggle from '@/components/ViewToggle.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import FormModalBumil from './FormModalBumil.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { hapusBumil, listBumil, type Bumil } from '@/modules/bumil/db'
import { parseTanggal } from '@/lib/umur'
import { useAuth } from '@/supabase/useAuth'
import { bacaViewModul, simpanViewModul } from '@/lib/viewModul'

const KUNCI_VIEW = 'view-bumil'

const { isAdmin } = useAuth()

const daftar = ref<Bumil[]>([])
const cari = ref('')
const sibuk = ref(true)
const pesanError = ref('')
// Mode tampilan daftar: kartu (default) ⇄ tabel — diingat per modul via localStorage.
const modeView = ref<'grid' | 'tabel'>(bacaViewModul(KUNCI_VIEW))
let timerCari: ReturnType<typeof setTimeout> | undefined

watch(modeView, (v) => {
  simpanViewModul(KUNCI_VIEW, v)
})

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

function formatTanggal(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Konfirmasi hapus via ConfirmDialog (pengganti window.confirm).
const hapusTarget = ref<Bumil | null>(null)
const dialogHapus = ref(false)
const menghapus = ref(false)

// Modal form tambah/edit: idEdit null = tambah.
const dialogForm = ref(false)
const idEditForm = ref<number | null>(null)

function bukaFormBaru() {
  idEditForm.value = null
  dialogForm.value = true
}

function bukaEdit(b: { id: number }) {
  idEditForm.value = b.id
  dialogForm.value = true
}

function mintaHapus(b: Bumil) {
  hapusTarget.value = b
  dialogHapus.value = true
}

async function hapus() {
  if (!hapusTarget.value) return
  menghapus.value = true
  try {
    await hapusBumil(hapusTarget.value.id)
    dialogHapus.value = false
    await muat()
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus data.'
  } finally {
    menghapus.value = false
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
        <Button v-if="isAdmin" size="lg" @click="bukaFormBaru">
          <Plus class="size-4" />
          Tambah Ibu Hamil
        </Button>
      </div>

      <div class="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div class="w-full max-w-sm">
          <div class="relative">
            <Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              v-model="cari"
              type="text"
              placeholder="Cari nama, suami, NIK, atau dusun…"
              aria-label="Cari nama, suami, NIK, atau dusun"
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
          <HeartPulse class="text-emerald-300 size-10" />
          <p class="font-display mt-4 text-lg">
            {{ cari ? 'Tidak ada ibu hamil ditemukan' : 'Belum ada data ibu hamil' }}
          </p>
          <p class="text-muted-foreground mt-1 max-w-sm text-sm">
            <template v-if="cari">
              Tidak ditemukan ibu dengan kata kunci “{{ cari }}”. Coba kata kunci lain atau hapus
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

      <!-- Data: view kartu -->
      <div v-else-if="modeView === 'grid'" class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                @click="mintaHapus(b)"
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

      <!-- Data: view tabel (semua kolom identitas; kolom Nama frozen/sticky kiri) -->
      <Card v-else class="mt-8">
        <CardContent>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[1900px] text-sm">
              <thead>
                <tr class="text-muted-foreground border-border/60 border-b text-left text-xs font-bold tracking-wide uppercase">
                  <th class="bg-card sticky left-0 z-10 py-2 pr-3 whitespace-nowrap">Nama</th>
                  <th class="py-2 pr-3">Kategori</th>
                  <th class="py-2 pr-3">Umur</th>
                  <th class="py-2 pr-3">NIK</th>
                  <th class="py-2 pr-3 whitespace-nowrap">Tgl lahir</th>
                  <th class="py-2 pr-3 whitespace-nowrap">Suami</th>
                  <th class="py-2 pr-3 whitespace-nowrap">No. KK</th>
                  <th class="py-2 pr-3 whitespace-nowrap">Hamil anak ke</th>
                  <th class="py-2 pr-3 whitespace-nowrap">Jarak anak sblmnya</th>
                  <th class="py-2 pr-3 whitespace-nowrap">Tgl bersalin</th>
                  <th class="py-2 pr-3">Tempat bersalin</th>
                  <th class="py-2 pr-3">Cara persalinan</th>
                  <th class="py-2 pr-3 whitespace-nowrap">Anak ke</th>
                  <th class="py-2 pr-3">Dusun</th>
                  <th class="py-2 pr-3">Alamat</th>
                  <th class="sticky left-0 z-10 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in daftar" :key="b.id" class="group border-border/60 hover:bg-emerald-50/40 relative border-b last:border-0">
                  <td class="bg-white group-hover:bg-emerald-50/40 py-3 pr-3 font-medium whitespace-nowrap sticky left-0 z-10">
                    <RouterLink :to="`/bumil/${b.id}`" class="hover:text-primary font-bold">
                      {{ b.nama }}
                    </RouterLink>
                    <!-- penanda frozen column -->
                    <span class="border-border/60 absolute top-0 right-0 bottom-0 border-r opacity-0 group-hover:opacity-100" aria-hidden="true"></span>
                  </td>
                  <td class="py-3 pr-3 whitespace-nowrap">{{ labelKategori(b.kategori) }}</td>
                  <td class="text-muted-foreground py-3 pr-3 whitespace-nowrap">{{ b.umur || '—' }} th</td>
                  <td class="py-3 pr-3 break-all whitespace-nowrap">{{ b.nik || '—' }}</td>
                  <td class="text-muted-foreground py-3 pr-3 whitespace-nowrap">{{ formatTanggal(b.tanggal_lahir) }}</td>
                  <td class="max-w-[160px] truncate py-3 pr-3 whitespace-nowrap" :title="b.nama_suami || ''">{{ b.nama_suami || '—' }}</td>
                  <td class="py-3 pr-3 break-all whitespace-nowrap">{{ b.nomor_kk || '—' }}</td>
                  <td class="py-3 pr-3 whitespace-nowrap">{{ b.hamil_anak_ke || '—' }}</td>
                  <td class="py-3 pr-3 whitespace-nowrap">{{ b.jarak_dengan_anak_sebelumnya || '—' }}</td>
                  <td class="text-muted-foreground py-3 pr-3 whitespace-nowrap">{{ formatTanggal(b.tanggal_bersalin) }}</td>
                  <td class="max-w-[140px] truncate py-3 pr-3 whitespace-nowrap" :title="b.tempat_bersalin || ''">{{ b.tempat_bersalin || '—' }}</td>
                  <td class="py-3 pr-3 whitespace-nowrap">{{ b.cara_persalin || '—' }}</td>
                  <td class="py-3 pr-3 whitespace-nowrap">{{ b.anak_ke || '—' }}</td>
                  <td class="py-3 pr-3 whitespace-nowrap">{{ b.dusun || '—' }}</td>
                  <td class="max-w-[220px] truncate py-3 pr-3 whitespace-nowrap" :title="b.alamat || ''">{{ b.alamat || '—' }}</td>
                  <td class="py-3 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1">
                      <RouterLink :to="`/bumil/${b.id}`">
                        <Button variant="ghost" size="sm">Detail</Button>
                      </RouterLink>
                      <Button v-if="isAdmin" variant="ghost" size="sm" @click="bukaEdit(b)">Ubah</Button>
                      <button
                        v-if="isAdmin"
                        type="button"
                        class="text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-lg p-2 transition-colors"
                        aria-label="Hapus ibu hamil"
                        title="Hapus ibu hamil"
                        @click="mintaHapus(b)"
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

    <ConfirmDialog
      v-model:open="dialogHapus"
      judul="Hapus data ibu hamil?"
      :deskripsi="`Data ${hapusTarget?.nama || ''} beserta seluruh riwayat kunjungannya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`"
      :menyimpan="menghapus"
      @konfirmasi="hapus"
    />

    <FormModalBumil
      v-model:open="dialogForm"
      :id-edit="idEditForm"
      @tersimpan="muat"
    />
  </div>
</template>
