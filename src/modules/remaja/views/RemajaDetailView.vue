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
import FormKunjunganRemaja from './detail/FormKunjunganRemaja.vue'
import FormModalRemaja from './FormModalRemaja.vue'
import TabelRiwayatRemaja from './detail/TabelRiwayatRemaja.vue'
import {
  ambilRemaja,
  hapusRemaja,
  hapusKunjunganRemaja,
  listKunjunganRemaja,
  type KunjunganRemaja,
  type Remaja,
} from '@/modules/remaja/db'
import { parseTanggal, umurSaatIni } from '@/lib/umur'
import { formatTanggal as fmtTanggal, labelJk } from '@/lib/label'
import { useAuth } from '@/supabase/useAuth'

const { isAdmin } = useAuth()

const route = useRoute()
const router = useRouter()

const idRemaja = computed(() => {
  const v = route.params.id
  return typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : null
})

const remaja = ref<Remaja | null>(null)
const kunjungan = ref<KunjunganRemaja[]>([])
const sibuk = ref(true)
const pesanError = ref('')
const dlgHapus = ref<InstanceType<typeof ConfirmDialog>>()

// Modal detail kunjungan
const detailOpen = ref(false)
const detailJudul = ref('')
const detailBaris = ref<Array<[string, string | number | null]>>([])

// Modal ubah kunjungan (form yang sama dipakai ulang dalam mode edit)
const editOpen = ref(false)
const kunjunganEdit = ref<KunjunganRemaja | null>(null)

// Modal ubah identitas remaja (konsolidasi form)
const ubahOpen = ref(false)

onMounted(muat)

async function muat() {
  sibuk.value = true
  pesanError.value = ''
  try {
    if (idRemaja.value == null) throw new Error('ID remaja tidak valid.')
    const r = await ambilRemaja(idRemaja.value)
    if (!r) {
      await router.replace('/remaja')
      return
    }
    remaja.value = r
    kunjungan.value = await listKunjunganRemaja(r.id)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data remaja.'
  } finally {
    sibuk.value = false
  }
}

// Dipanggil FormKunjunganRemaja lewat event 'tersimpan'; induk yang memuat ulang riwayat.
async function muatUlangRiwayat() {
  if (!remaja.value) return
  try {
    kunjungan.value = await listKunjunganRemaja(remaja.value.id)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data remaja.'
  }
}

function formatUmur(tanggalLahir: string | null): string {
  const u = umurSaatIni(tanggalLahir ?? '')
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

function angka(nilai: number | null, satuan: string): string | null {
  return nilai != null ? `${nilai} ${satuan}` : null
}

async function hapusKunj(r: Remaja, k: KunjunganRemaja) {
  const ok = await dlgHapus.value?.buka(`Hapus kunjungan ${formatTanggal(k.tanggal_kunjungan)}?`)
  if (!ok) return
  try {
    await hapusKunjunganRemaja(k.id)
    kunjungan.value = await listKunjunganRemaja(r.id)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus kunjungan.'
  }
}

async function hapusDariTabel(k: KunjunganRemaja) {
  if (!remaja.value) return
  await hapusKunj(remaja.value, k)
}

function ubahDariTabel(k: KunjunganRemaja) {
  kunjunganEdit.value = k
  editOpen.value = true
}

async function selesaiEdit() {
  editOpen.value = false
  kunjunganEdit.value = null
  await muatUlangRiwayat()
}

const YA_TIDAK = (v: string | null) => v || null
const gabung = (angka: string | null, kategori: string | null) =>
  angka ? `${angka}${kategori ? ` (${kategori})` : ''}` : null

function lihatKunjungan(k: KunjunganRemaja) {
  detailJudul.value = `Kunjungan ${formatTanggal(k.tanggal_kunjungan)}`
  const td = k.td_sistole != null ? `${k.td_sistole}/${k.td_diastole ?? '?'} mmHg` : null
  detailBaris.value = [
    ['Tanggal', formatTanggal(k.tanggal_kunjungan)],
    ['Umur', k.umur_tahun != null ? `${k.umur_tahun.toFixed(1)} tahun` : null],
    ['Berat badan', angka(k.berat_badan, 'kg')],
    ['Tinggi badan', angka(k.tinggi_badan, 'cm')],
    ['IMT', k.imt || null],
    ['Lingkar perut', angka(k.lingkar_perut, 'cm')],
    ['Tekanan darah', gabung(td, k.td_kategori)],
    ['Gula darah', gabung(k.gula_darah != null ? `${k.gula_darah} mg/dL` : null, k.gula_kategori)],
    ['Kadar Hb', angka(k.hb, 'mg/dL')],
    ['Anemia', YA_TIDAK(k.anemia)],
    ['Batuk terus-menerus', YA_TIDAK(k.batuk_terus_menerus)],
    ['Demam > 2 minggu', YA_TIDAK(k.demam_lebih_dua_minggu)],
    ['BB tidak naik 2 bulan', YA_TIDAK(k.bb_tidak_naik_dua_bulan)],
    ['Kontak erat TBC', YA_TIDAK(k.kontak_erat_tbc)],
    ['Rujuk Pustu/Puskesmas', YA_TIDAK(k.rujuk)],
    ['Edukasi', k.edukasi],
    ['Catatan', k.catatan],
  ]
  detailOpen.value = true
}

async function hapusRemajaData() {
  if (!remaja.value) return
  const ok = await dlgHapus.value?.buka(
    `Hapus ${remaja.value.nama} beserta seluruh kunjungannya?`,
    'Hapus Remaja',
    { merah: true },
  )
  if (!ok) return
  try {
    await hapusRemaja(remaja.value.id)
    await router.replace('/remaja')
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus data.'
  }
}
</script>

<template>
  <div class="flex flex-col">
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

      <template v-else-if="remaja">
        <RouterLink to="/remaja" class="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft class="size-4" />
          Kembali ke daftar
        </RouterLink>

        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="bg-primary/10 text-primary grid size-12 place-items-center rounded-xl">
              <Users class="size-6" />
            </span>
            <div>
              <h1 class="font-display text-2xl leading-tight sm:text-3xl">{{ remaja.nama }}</h1>
              <p class="text-muted-foreground mt-1 text-sm">
                {{ labelJk(remaja.jenis_kelamin) }} ·
                {{ formatUmur(remaja.tanggal_lahir) }} ·
                lahir {{ fmtTanggal(remaja.tanggal_lahir) }}
              </p>
            </div>
          </div>
          <div v-if="isAdmin" class="flex items-center gap-2">
            <Button variant="outline" @click="ubahOpen = true">
              <Pencil class="size-4" />
              Ubah
            </Button>
            <Button variant="outline" class="text-red-600" @click="hapusRemajaData">
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
            <TabelRiwayatRemaja :kunjungan="kunjungan" :is-admin="isAdmin" @hapus="hapusDariTabel" @ubah="ubahDariTabel" @lihat="lihatKunjungan" />
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
                    <p class="mt-0.5">{{ remaja.nama || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Jenis kelamin</p>
                    <p class="mt-0.5">{{ labelJk(remaja.jenis_kelamin) }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">NIK</p>
                    <p class="mt-0.5 break-all">{{ remaja.nik || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tempat lahir</p>
                    <p class="mt-0.5">{{ remaja.tempat_lahir || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tanggal lahir</p>
                    <p class="mt-0.5">{{ fmtTanggal(remaja.tanggal_lahir) }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Nama orang tua</p>
                    <p class="mt-0.5">{{ remaja.nama_orang_tua || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">NIK orang tua</p>
                    <p class="mt-0.5 break-all">{{ remaja.nik_orang_tua || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">No. KK</p>
                    <p class="mt-0.5 break-all">{{ remaja.nomor_kk || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Nama sekolah</p>
                    <p class="mt-0.5">{{ remaja.nama_sekolah || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Dusun</p>
                    <p class="mt-0.5">{{ remaja.dusun || '—' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-muted-foreground text-xs font-bold uppercase">Alamat</p>
                    <p class="mt-0.5">{{ remaja.alamat || '—' }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <FormKunjunganRemaja :remaja="remaja" :is-admin="isAdmin" @tersimpan="muatUlangRiwayat" />
          </div>
        </div>
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
    <FormModalRemaja v-model:open="ubahOpen" :remaja="remaja" @tersimpan="muat" />

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
          <FormKunjunganRemaja
            v-if="remaja && kunjunganEdit"
            :key="kunjunganEdit.id"
            :remaja="remaja"
            :is-admin="isAdmin"
            :edit="kunjunganEdit"
            @tersimpan="selesaiEdit"
          />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
