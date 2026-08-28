<script setup lang="ts">
import { ArrowLeft, Baby, Pencil, Trash2, TriangleAlert } from '@lucide/vue'
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
import FormKunjunganBalita from './detail/FormKunjunganBalita.vue'
import FormModalBalita from './FormModalBalita.vue'
import KurvaTabsBalita from './detail/KurvaTabsBalita.vue'
import TabelRiwayatBalita from './detail/TabelRiwayatBalita.vue'
import {
  ambilBalita,
  hapusBalita,
  hapusKunjungan,
  listKunjungan,
  type Balita,
  type Kunjungan,
} from '@/modules/balita/db'
import { parseTanggal, umurSaatIni } from '@/lib/umur'
import { useAuth } from '@/supabase/useAuth'

const { isAdmin } = useAuth()

const route = useRoute()
const router = useRouter()

const idBalita = computed(() => {
  const v = route.params.id
  return typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : null
})

const balita = ref<Balita | null>(null)
const kunjungan = ref<Kunjungan[]>([])
const sibuk = ref(true)
const pesanError = ref('')
const dlgHapus = ref<InstanceType<typeof ConfirmDialog>>()

// Modal detail kunjungan
const detailOpen = ref(false)
const detailJudul = ref('')
const detailBaris = ref<Array<[string, string | number | null]>>([])

// Modal ubah kunjungan (form yang sama dipakai ulang dalam mode edit)
const editOpen = ref(false)
const kunjunganEdit = ref<Kunjungan | null>(null)

// Modal ubah identitas balita (konsolidasi form, v2.30.0)
const ubahOpen = ref(false)

onMounted(muat)

async function muat() {
  sibuk.value = true
  pesanError.value = ''
  try {
    if (idBalita.value == null) throw new Error('ID balita tidak valid.')
    const b = await ambilBalita(idBalita.value)
    if (!b) {
      await router.replace('/balita')
      return
    }
    balita.value = b
    kunjungan.value = await listKunjungan(b.id)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data balita.'
  } finally {
    sibuk.value = false
  }
}

// Dimiccu FormKunjunganBalita lewat event 'tersimpan'; induk yang memuat ulang riwayat.
async function muatUlangRiwayat() {
  if (!balita.value) return
  try {
    kunjungan.value = await listKunjungan(balita.value.id)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data balita.'
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

async function hapusKunj(balitaId: number, k: Kunjungan) {
  const ok = await dlgHapus.value?.buka(`Hapus kunjungan ${formatTanggal(k.tanggal_kunjungan)}?`)
  if (!ok) return
  try {
    await hapusKunjungan(k.id)
    kunjungan.value = await listKunjungan(balitaId)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus kunjungan.'
  }
}

async function hapusDariTabel(k: Kunjungan) {
  if (!balita.value) return
  await hapusKunj(balita.value.id, k)
}

function ubahDariTabel(k: Kunjungan) {
  kunjunganEdit.value = k
  editOpen.value = true
}

async function selesaiEdit() {
  editOpen.value = false
  kunjunganEdit.value = null
  await muatUlangRiwayat()
}

function lihatKunjungan(k: Kunjungan) {
  detailJudul.value = `Kunjungan ${formatTanggal(k.tanggal_kunjungan)}`
  detailBaris.value = [
    ['Tanggal', formatTanggal(k.tanggal_kunjungan)],
    ['Umur', k.umur_bulan != null ? `${k.umur_bulan} bulan` : null],
    ['Berat badan', k.berat_badan != null ? `${k.berat_badan} kg` : null],
    ['Status BB/U', k.bb_menurut_umur],
    ['Tinggi badan', k.tinggi_badan != null ? `${k.tinggi_badan} cm` : null],
    ['Status TB/U', k.pbtb_menurut_umur],
    ['BB/TB', k.bb_menurut_pbtb],
    ['Lingkar kepala', k.lingkar_kepala != null ? `${k.lingkar_kepala} cm` : null],
    ['Status LiKA', k.status_lingkar_kepala],
    ['Lingkar lengan', k.lingkar_lengan != null ? `${k.lingkar_lengan} cm` : null],
    ['Status LiLA', k.status_lingkar_lengan],
    ['BB naik/tidak', k.bb_naik_tidak],
    ['Imunisasi', k.imunisasi],
    ['Vitamin A', k.vitamin_a],
    ['ASI eksklusif', k.asi_eksklusif],
    ['MP-ASI', k.mp_asi],
    ['Obat cacing', k.obat_cacing],
    ['Ceklis perkembangan', k.ceklis_perkembangan],
    ['Gejala TBC', k.gejala_tbc],
    ['Edukasi', k.edukasi],
  ]
  detailOpen.value = true
}

async function hapusBal() {
  if (!balita.value) return
  const ok = await dlgHapus.value?.buka(
    `Hapus ${balita.value.nama} beserta seluruh kunjungannya?`,
    'Hapus Balita',
    { merah: true },
  )
  if (!ok) return
  try {
    await hapusBalita(balita.value.id)
    await router.replace('/balita')
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
              <CardContent class="flex flex-col gap-3">
                <Skeleton class="h-56 w-full" />
                <Skeleton class="h-3 w-72 max-w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton class="h-5 w-44" />
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

      <template v-else-if="balita">
        <RouterLink to="/balita" class="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft class="size-4" />
          Kembali ke daftar
        </RouterLink>

        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="bg-primary/10 text-primary grid size-12 place-items-center rounded-xl">
              <Baby class="size-6" />
            </span>
            <div>
              <h1 class="font-display text-2xl leading-tight sm:text-3xl">{{ balita.nama }}</h1>
              <p class="text-muted-foreground mt-1 text-sm">
                {{ balita.jenis_kelamin === 'Perempuan' ? 'Perempuan' : 'Laki-laki' }} ·
                {{ formatUmur(balita.tanggal_lahir) }} ·
                lahir {{ formatTanggal(balita.tanggal_lahir) }}
              </p>
            </div>
          </div>
          <div v-if="isAdmin" class="flex items-center gap-2">
            <Button variant="outline" @click="ubahOpen = true">
              <Pencil class="size-4" />
              Ubah
            </Button>
            <Button variant="outline" class="text-red-600" @click="hapusBal">
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
          <!-- Kiri: kurva + riwayat -->
          <div class="min-w-0 space-y-6 lg:col-span-2">
            <KurvaTabsBalita :balita="balita" :kunjungan="kunjungan" />

            <TabelRiwayatBalita :kunjungan="kunjungan" :is-admin="isAdmin" @hapus="hapusDariTabel" @ubah="ubahDariTabel" @lihat="lihatKunjungan" />
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
                    <p class="mt-0.5">{{ balita.nama || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Jenis kelamin</p>
                    <p class="mt-0.5">{{ balita.jenis_kelamin === 'Perempuan' ? 'Perempuan' : 'Laki-laki' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">NIK</p>
                    <p class="mt-0.5 break-all">{{ balita.nik || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tempat lahir</p>
                    <p class="mt-0.5">{{ balita.tempat_lahir || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tanggal lahir</p>
                    <p class="mt-0.5">{{ formatTanggal(balita.tanggal_lahir) }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Anak ke</p>
                    <p class="mt-0.5">{{ balita.anak_ke || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Nama orang tua</p>
                    <p class="mt-0.5">{{ balita.nama_orang_tua || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">NIK orang tua</p>
                    <p class="mt-0.5 break-all">{{ balita.nik_orang_tua || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">No. KK</p>
                    <p class="mt-0.5 break-all">{{ balita.nomor_kk || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Dusun</p>
                    <p class="mt-0.5">{{ balita.dusun || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Posyandu</p>
                    <p class="mt-0.5">{{ balita.posyandu || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">BB lahir</p>
                    <p class="mt-0.5">{{ balita.bb_lahir ?? '—' }} kg</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">PB lahir</p>
                    <p class="mt-0.5">{{ balita.pb_lahir ?? '—' }} cm</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-muted-foreground text-xs font-bold uppercase">Alamat</p>
                    <p class="mt-0.5">{{ balita.alamat || '—' }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <FormKunjunganBalita :balita="balita" :is-admin="isAdmin" :riwayat="kunjungan" @tersimpan="muatUlangRiwayat" />
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
    <FormModalBalita v-model:open="ubahOpen" :balita="balita" @tersimpan="muat" />

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
          <FormKunjunganBalita
            v-if="balita && kunjunganEdit"
            :key="kunjunganEdit.id"
            :balita="balita"
            :is-admin="isAdmin"
            :edit="kunjunganEdit"
            :riwayat="kunjungan"
            @tersimpan="selesaiEdit"
          />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
