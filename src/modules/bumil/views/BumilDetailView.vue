<script setup lang="ts">
import { ArrowLeft, HeartPulse, Pencil, Trash2, TriangleAlert } from '@lucide/vue'
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
import FormKunjunganBumil from './detail/FormKunjunganBumil.vue'
import FormModalBumil from './FormModalBumil.vue'
import TabelRiwayatBumil from './detail/TabelRiwayatBumil.vue'
import {
  ambilBumil,
  hapusBumil,
  hapusKunjunganBumil,
  listKunjunganBumil,
  type Bumil,
  type KunjunganBumil,
} from '@/modules/bumil/db'
import { parseTanggal } from '@/lib/umur'
import { useAuth } from '@/supabase/useAuth'

const { isAdmin } = useAuth()

const route = useRoute()
const router = useRouter()

const idBumil = computed(() => {
  const v = route.params.id
  return typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : null
})

const bumil = ref<Bumil | null>(null)
const kunjungan = ref<KunjunganBumil[]>([])
const sibuk = ref(true)
const pesanError = ref('')
const dlgHapus = ref<InstanceType<typeof ConfirmDialog>>()

// Modal detail kunjungan
const detailOpen = ref(false)
const detailJudul = ref('')
const detailBaris = ref<Array<[string, string | number | null]>>([])

// Modal ubah kunjungan (form yang sama dipakai ulang dalam mode edit)
const editOpen = ref(false)
const kunjunganEdit = ref<KunjunganBumil | null>(null)

// Modal ubah identitas bumil (konsolidasi form, v2.30.0)
const ubahOpen = ref(false)

onMounted(muat)

async function muat() {
  sibuk.value = true
  pesanError.value = ''
  try {
    if (idBumil.value == null) throw new Error('ID ibu hamil tidak valid.')
    const b = await ambilBumil(idBumil.value)
    if (!b) {
      await router.replace('/bumil')
      return
    }
    bumil.value = b
    kunjungan.value = await listKunjunganBumil(b.id)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data ibu hamil.'
  } finally {
    sibuk.value = false
  }
}

const kunjunganTerbaru = computed<KunjunganBumil | null>(() => kunjungan.value.at(-1) ?? null)

function formatTanggal(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatAngka(n: number | null | undefined): string {
  if (n == null) return '—'
  return String(n)
}

// Dimiccu FormKunjunganBumil lewat event 'tersimpan'; induk yang memuat ulang riwayat.
async function muatUlangRiwayat() {
  if (!bumil.value) return
  try {
    kunjungan.value = await listKunjunganBumil(bumil.value.id)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data ibu hamil.'
  }
}

async function hapusKunj(bumilId: number, k: KunjunganBumil) {
  const ok = await dlgHapus.value?.buka(`Hapus kunjungan ${formatTanggal(k.tanggal_kunjungan)}?`)
  if (!ok) return
  try {
    await hapusKunjunganBumil(k.id)
    kunjungan.value = await listKunjunganBumil(bumilId)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus kunjungan.'
  }
}

async function hapusDariTabel(k: KunjunganBumil) {
  if (!bumil.value) return
  await hapusKunj(bumil.value.id, k)
}

function ubahDariTabel(k: KunjunganBumil) {
  kunjunganEdit.value = k
  editOpen.value = true
}

async function selesaiEdit() {
  editOpen.value = false
  kunjunganEdit.value = null
  await muatUlangRiwayat()
}

function lihatKunjungan(k: KunjunganBumil) {
  detailJudul.value = `Kunjungan ${formatTanggal(k.tanggal_kunjungan)}`
  detailBaris.value = [
    ['Tanggal', formatTanggal(k.tanggal_kunjungan)],
    ['Usia kehamilan', k.usia_kehamilan_minggu != null ? `${k.usia_kehamilan_minggu} minggu` : null],
    ['Berat badan', k.berat_badan != null ? `${k.berat_badan} kg` : null],
    ['BB sesuai kurva KIA', k.bb_sesuai_kurva_kia],
    ['LiLA', k.lingkaran_lengan_atas != null ? `${k.lingkaran_lengan_atas} cm` : null],
    ['Status LiLA', k.lila_hijau_merah],
    ['Tekanan darah', k.tekanan_darah != null ? `${k.tekanan_darah} mmHg` : null],
    ['TD sesuai kurva KIA', k.td_sesuai_kurva_kia],
    ['Batuk terus-menerus', k.batuk_terus_menerus],
    ['Demam > 2 minggu', k.demam_lebih_dua_minggu],
    ['BB tidak naik 2 bulan', k.bb_tidak_naik_dua_bulan],
    ['Kontak TBC', k.kontak_tbc],
    ['Dapat tablet TTD', k.dapat_tablet_ttd],
    ['Konsumsi TTD', k.konsumsi_ttd],
    ['MT KEK diberikan', k.mt_kek_diberikan],
    ['Konsumsi MT KEK', k.konsumsi_mt_kek],
    ['Vitamin A (nifas)', k.vitamin_a],
    ['KB pasca persalinan', k.kb_pasca_persalinan],
    ['Kelas bumil', k.kelas_bumil],
    ['Edukasi', k.dapat_edukasi],
    ['Dirujuk', k.dirujuk],
  ]
  detailOpen.value = true
}

async function hapusBumilData() {
  if (!bumil.value) return
  const ok = await dlgHapus.value?.buka(
    `Hapus ${bumil.value.nama} beserta seluruh kunjungannya?`,
    'Hapus Ibu Hamil',
    { merah: true },
  )
  if (!ok) return
  try {
    await hapusBumil(bumil.value.id)
    await router.replace('/bumil')
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
                <Skeleton class="h-5 w-44" />
              </CardHeader>
              <CardContent class="flex flex-col gap-2">
                <Skeleton v-for="i in 5" :key="i" class="h-8 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton class="h-5 w-56" />
              </CardHeader>
              <CardContent class="flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Skeleton v-for="i in 4" :key="i" class="h-8 w-full" />
                </div>
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

      <template v-else-if="bumil">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="bg-primary/10 text-primary grid size-12 place-items-center rounded-xl">
              <HeartPulse class="size-6" />
            </span>
            <div>
              <h1 class="font-display text-2xl leading-tight sm:text-3xl">{{ bumil.nama }}</h1>
              <p class="text-muted-foreground mt-1 text-sm">
                {{ bumil.kategori || '—' }}
                <template v-if="bumil.umur"> · umur {{ bumil.umur }} th</template>
                <template v-if="bumil.tanggal_lahir"> · lahir {{ formatTanggal(bumil.tanggal_lahir) }}</template>
              </p>
            </div>
          </div>
          <div v-if="isAdmin" class="flex items-center gap-2">
            <Button variant="outline" @click="ubahOpen = true">
              <Pencil class="size-4" />
              Ubah
            </Button>
            <Button variant="outline" class="text-red-600" @click="hapusBumilData">
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
          <!-- Kiri: riwayat kunjungan -->
          <div class="min-w-0 space-y-6 lg:col-span-2">
            <TabelRiwayatBumil :kunjungan="kunjungan" :is-admin="isAdmin" @hapus="hapusDariTabel" @ubah="ubahDariTabel" @lihat="lihatKunjungan" />

            <Card v-if="kunjunganTerbaru">
              <CardHeader>
                <CardTitle class="font-display text-lg font-normal">Ringkasan kunjungan terakhir</CardTitle>
              </CardHeader>
              <CardContent class="flex flex-col gap-3">
                <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tanggal</p>
                    <p class="mt-0.5">{{ formatTanggal(kunjunganTerbaru.tanggal_kunjungan) }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">BB</p>
                    <p class="mt-0.5">{{ formatAngka(kunjunganTerbaru.berat_badan) }} kg</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">LiLA</p>
                    <p class="mt-0.5">{{ formatAngka(kunjunganTerbaru.lingkaran_lengan_atas) }} cm</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tekanan darah</p>
                    <p class="mt-0.5">{{ kunjunganTerbaru.tekanan_darah ?? '—' }} mmHg</p>
                  </div>
                </div>
                <div v-if="kunjunganTerbaru.lila_hijau_merah" class="text-sm">
                  Status LiLA:
                  <span
                    :class="kunjunganTerbaru.lila_hijau_merah === 'Merah' ? 'font-bold text-red-600' : 'font-bold text-emerald-700'"
                  >
                    {{ kunjunganTerbaru.lila_hijau_merah }}
                  </span>
                  <template v-if="kunjunganTerbaru.bb_sesuai_kurva_kia">
                    <span class="text-muted-foreground mx-2">·</span>
                    BB sesuai kurva KIA:
                    <span class="font-bold">{{ kunjunganTerbaru.bb_sesuai_kurva_kia }}</span>
                  </template>
                </div>
              </CardContent>
            </Card>
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
                    <p class="mt-0.5">{{ bumil.nama || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Kategori</p>
                    <p class="mt-0.5">{{ bumil.kategori || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">NIK</p>
                    <p class="mt-0.5 break-all">{{ bumil.nik || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">No. KK</p>
                    <p class="mt-0.5 break-all">{{ bumil.nomor_kk || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tanggal lahir</p>
                    <p class="mt-0.5">{{ bumil.tanggal_lahir ? formatTanggal(bumil.tanggal_lahir) : '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Umur</p>
                    <p class="mt-0.5">{{ bumil.umur || '—' }} th</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Suami</p>
                    <p class="mt-0.5">{{ bumil.nama_suami || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Hamil anak ke</p>
                    <p class="mt-0.5">{{ bumil.hamil_anak_ke || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Anak ke</p>
                    <p class="mt-0.5">{{ bumil.anak_ke || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Jarak anak sebelumnya</p>
                    <p class="mt-0.5">{{ bumil.jarak_dengan_anak_sebelumnya || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Dusun</p>
                    <p class="mt-0.5">{{ bumil.dusun || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tanggal bersalin</p>
                    <p class="mt-0.5">{{ bumil.tanggal_bersalin ? formatTanggal(bumil.tanggal_bersalin) : '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Tempat bersalin</p>
                    <p class="mt-0.5">{{ bumil.tempat_bersalin || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Cara persalinan</p>
                    <p class="mt-0.5">{{ bumil.cara_persalin || '—' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-muted-foreground text-xs font-bold uppercase">Alamat</p>
                    <p class="mt-0.5">{{ bumil.alamat || '—' }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <FormKunjunganBumil :bumil="bumil" :is-admin="isAdmin" @tersimpan="muatUlangRiwayat" />
          </div>
        </div>

        <RouterLink to="/bumil" class="text-muted-foreground hover:text-foreground mt-8 inline-flex items-center gap-1.5 text-sm font-medium">
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
    <FormModalBumil v-model:open="ubahOpen" :bumil="bumil" @tersimpan="muat" />

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
          <FormKunjunganBumil
            v-if="bumil && kunjunganEdit"
            :key="kunjunganEdit.id"
            :bumil="bumil"
            :is-admin="isAdmin"
            :edit="kunjunganEdit"
            @tersimpan="selesaiEdit"
          />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
