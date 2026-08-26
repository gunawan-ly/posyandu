<script setup lang="ts">
import { ArrowLeft, Pencil, Trash2, TriangleAlert, Users } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import DetailKunjunganModal from '@/components/DetailKunjunganModal.vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Skeleton from '@/components/Skeleton.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import FormKunjunganApras from './detail/FormKunjunganApras.vue'
import FormModalApras from './FormModalApras.vue'
import TabelRiwayatApras from './detail/TabelRiwayatApras.vue'
import {
  ambilApras,
  hapusApras,
  hapusKunjunganApras,
  listKunjunganApras,
  type Apras,
  type KunjunganApras,
} from '@/modules/apras/db'
import { parseTanggal, umurSaatIni } from '@/lib/umur'
import { useAuth } from '@/supabase/useAuth'

const { isAdmin } = useAuth()

const route = useRoute()
const router = useRouter()

const idApras = computed(() => {
  const v = route.params.id
  return typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : null
})

const apras = ref<Apras | null>(null)
const kunjungan = ref<KunjunganApras[]>([])
const sibuk = ref(true)
const pesanError = ref('')
const dlgHapus = ref<InstanceType<typeof ConfirmDialog>>()

// Modal detail kunjungan
const detailOpen = ref(false)
const detailJudul = ref('')
const detailBaris = ref<Array<[string, string | number | null]>>([])

// Modal ubah kunjungan (form yang sama dipakai ulang dalam mode edit)
const editOpen = ref(false)
const kunjunganEdit = ref<KunjunganApras | null>(null)

// Modal ubah identitas apras (konsolidasi form, v2.30.0)
const ubahOpen = ref(false)

onMounted(muat)

async function muat() {
  sibuk.value = true
  pesanError.value = ''
  try {
    if (idApras.value == null) throw new Error('ID apras tidak valid.')
    const a = await ambilApras(idApras.value)
    if (!a) {
      await router.replace('/apras')
      return
    }
    apras.value = a
    kunjungan.value = await listKunjunganApras(a.id)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data apras.'
  } finally {
    sibuk.value = false
  }
}

// Dimiccu FormKunjunganApras lewat event 'tersimpan'; induk yang memuat ulang riwayat.
async function muatUlangRiwayat() {
  if (!apras.value) return
  try {
    kunjungan.value = await listKunjunganApras(apras.value.id)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data apras.'
  }
}

function formatUmur(tanggalLahir: string): string {
  const u = umurSaatIni(tanggalLahir)
  if (u == null) return '—'
  const tahun = Math.floor(u / 12)
  const sisa = u % 12
  if (tahun === 0) return `${sisa} bulan`
  if (sisa === 0) return `${tahun} tahun`
  return `${tahun} tahun ${sisa} bulan`
}

function formatTanggal(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function hapusKunj(a: Apras, k: KunjunganApras) {
  const ok = await dlgHapus.value?.buka(`Hapus kunjungan ${formatTanggal(k.tanggal_kunjungan)}?`)
  if (!ok) return
  try {
    await hapusKunjunganApras(k.id)
    kunjungan.value = await listKunjunganApras(a.id)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus kunjungan.'
  }
}

async function hapusDariTabel(k: KunjunganApras) {
  if (!apras.value) return
  await hapusKunj(apras.value, k)
}

function ubahDariTabel(k: KunjunganApras) {
  kunjunganEdit.value = k
  editOpen.value = true
}

async function selesaiEdit() {
  editOpen.value = false
  kunjunganEdit.value = null
  await muatUlangRiwayat()
}

function lihatKunjungan(k: KunjunganApras) {
  detailJudul.value = `Kunjungan ${formatTanggal(k.tanggal_kunjungan)}`
  detailBaris.value = [
    ['Tanggal', formatTanggal(k.tanggal_kunjungan)],
    ['Umur', k.umur_bulan != null ? `${k.umur_bulan} bulan` : null],
    ['Berat badan', k.berat_badan != null ? `${k.berat_badan} kg` : null],
    ['Tinggi badan', k.tinggi_badan != null ? `${k.tinggi_badan} cm` : null],
    ['Lingkar kepala', k.lingkar_kepala != null ? `${k.lingkar_kepala} cm` : null],
    ['Lingkar lengan', k.lingkar_lengan != null ? `${k.lingkar_lengan} cm` : null],
    ['Obat cacing', k.obat_cacing],
    ['Gejala TBC', k.gejala_tbc],
    ['Dirujuk', k.dirujuk],
    ['Edukasi', k.edukasi],
    ['Catatan', k.catatan],
  ]
  detailOpen.value = true
}

async function hapusAnak() {
  if (!apras.value) return
  const ok = await dlgHapus.value?.buka(
    `Hapus ${apras.value.nama} beserta seluruh kunjungannya?`,
    'Hapus Apras',
    { merah: true },
  )
  if (!ok) return
  try {
    await hapusApras(apras.value.id)
    await router.replace('/apras')
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus data.'
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />

    <section class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div v-if="sibuk" role="status" aria-label="Memuat…">
        <div class="flex items-center gap-3">
          <Skeleton class="size-12 rounded-xl" />
          <div class="space-y-2">
            <Skeleton class="h-6 w-56" />
            <Skeleton class="h-4 w-80 max-w-full" />
          </div>
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-3">
          <div class="min-w-0 space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton class="h-5 w-40" />
              </CardHeader>
              <CardContent class="flex flex-col gap-2">
                <Skeleton v-for="i in 5" :key="i" class="h-8 w-full" />
              </CardContent>
            </Card>
          </div>

          <div class="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton class="h-5 w-24" />
              </CardHeader>
              <CardContent class="flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Skeleton v-for="i in 4" :key="i" class="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <template v-else-if="apras">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="bg-primary/10 text-primary grid size-12 place-items-center rounded-xl">
              <Users class="size-6" />
            </span>
            <div>
              <h1 class="font-display text-2xl leading-tight sm:text-3xl">{{ apras.nama }}</h1>
              <p class="text-muted-foreground mt-1 text-sm">
                {{ apras.jenis_kelamin === 'Perempuan' ? 'Perempuan' : 'Laki-laki' }} ·
                {{ formatUmur(apras.tanggal_lahir) }} ·
                lahir {{ formatTanggal(apras.tanggal_lahir) }}
              </p>
            </div>
          </div>
          <div v-if="isAdmin" class="flex items-center gap-2">
            <Button variant="outline" @click="ubahOpen = true">
              <Pencil class="size-4" />
              Ubah
            </Button>
            <Button variant="outline" class="text-red-600" @click="hapusAnak">
              <Trash2 class="size-4" />
              Hapus
            </Button>
          </div>
        </div>

        <p v-if="pesanError" class="mt-4 flex items-center gap-2 text-sm font-medium text-red-600" role="alert">
          <TriangleAlert class="size-4 shrink-0" />
          {{ pesanError }}
        </p>

        <div class="mt-8 grid gap-6 lg:grid-cols-3">
          <!-- Kiri: riwayat -->
          <div class="min-w-0 space-y-6 lg:col-span-2">
            <TabelRiwayatApras :kunjungan="kunjungan" :is-admin="isAdmin" @hapus="hapusDariTabel" @ubah="ubahDariTabel" @lihat="lihatKunjungan" />
          </div>

          <!-- Kanan: identitas + form kunjungan -->
          <div class="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle class="font-display text-lg font-normal">Identitas</CardTitle>
              </CardHeader>
              <CardContent class="flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Nama</p>
                    <p class="mt-0.5">{{ apras.nama || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Jenis kelamin</p>
                    <p class="mt-0.5">{{ apras.jenis_kelamin === 'Perempuan' ? 'Perempuan' : 'Laki-laki' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">NIK</p>
                    <p class="mt-0.5 break-all">{{ apras.nik || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tempat lahir</p>
                    <p class="mt-0.5">{{ apras.tempat_lahir || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tanggal lahir</p>
                    <p class="mt-0.5">{{ formatTanggal(apras.tanggal_lahir) }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Anak ke</p>
                    <p class="mt-0.5">{{ apras.anak_ke || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Nama orang tua</p>
                    <p class="mt-0.5">{{ apras.nama_orang_tua || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">NIK orang tua</p>
                    <p class="mt-0.5 break-all">{{ apras.nik_orang_tua || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">No. KK</p>
                    <p class="mt-0.5 break-all">{{ apras.nomor_kk || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Dusun</p>
                    <p class="mt-0.5">{{ apras.dusun || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Posyandu</p>
                    <p class="mt-0.5">{{ apras.posyandu || '—' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-muted-foreground text-xs font-bold uppercase">Alamat</p>
                    <p class="mt-0.5">{{ apras.alamat || '—' }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <FormKunjunganApras :apras="apras" :is-admin="isAdmin" @tersimpan="muatUlangRiwayat" />
          </div>
        </div>

        <RouterLink to="/apras" class="text-muted-foreground hover:text-foreground mt-8 inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft class="size-4" />
          Kembali ke daftar
        </RouterLink>
      </template>

      <p
        v-else-if="pesanError"
        class="mt-4 flex items-center gap-2 text-sm font-medium text-red-600"
        role="alert"
      >
        <TriangleAlert class="size-4 shrink-0" />
        {{ pesanError }}
      </p>
    </section>

    <AppFooter />

    <ConfirmDialog ref="dlgHapus" />
    <DetailKunjunganModal v-model:open="detailOpen" :judul="detailJudul" :baris="detailBaris" />
    <FormModalApras v-model:open="ubahOpen" :apras="apras" @tersimpan="muat" />

    <Dialog :open="editOpen" @update:open="(v) => { if (!v) selesaiEdit() }">
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
            <Pencil class="text-primary size-5 shrink-0" />
            Ubah kunjungan {{ formatTanggal(kunjunganEdit?.tanggal_kunjungan ?? null) }}
          </DialogTitle>
          <DialogDescription class="sr-only">Ubah data kunjungan</DialogDescription>
        </DialogHeader>
        <div class="max-h-[80vh] overflow-y-auto px-6 py-4">
          <FormKunjunganApras
            v-if="apras && kunjunganEdit"
            :key="kunjunganEdit.id"
            :apras="apras"
            :is-admin="isAdmin"
            :edit="kunjunganEdit"
            @tersimpan="selesaiEdit"
          />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
