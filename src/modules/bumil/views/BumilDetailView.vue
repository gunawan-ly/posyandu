<script setup lang="ts">
import { ArrowLeft, HeartPulse, Pencil, Plus, Trash2, TriangleAlert } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Skeleton from '@/components/Skeleton.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ambilBumil,
  hapusBumil,
  hapusKunjunganBumil,
  labelYaTidak,
  listKunjunganBumil,
  OPSI_BB_KURVA,
  OPSI_LILA,
  OPSI_TD_KURVA,
  OPSI_YA_TIDAK,
  tambahKunjunganBumil,
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

const tglKunjungan = ref(new Date().toISOString().slice(0, 10))
const usiaKehamilan = ref<string>('')
const beratBadan = ref<string>('')
const bbKurvaKia = ref('')
const lila = ref<string>('')
const lilaWarna = ref('')
const tekananDarah = ref('')
const tdKurvaKia = ref('')
const batuk = ref('')
const demam = ref('')
const bbTidakNaik = ref('')
const kontakTbc = ref('')
const dapatTtd = ref('')
const konsumsiTtd = ref('')
const mtKek = ref('')
const konsumsiMtKek = ref('')
const kelasBumil = ref('')
const dapatEdukasi = ref('')
const dirujuk = ref('')
const menyimpan = ref(false)
const pesanSukses = ref('')
const pesanForm = ref('')

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

// Field hanya relevan untuk ibu hamil; untuk menyusui disembunyikan/dikosongkan.
const sedangHamil = computed(() => bumil.value?.kategori === 'Hamil')

function formatTanggal(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatAngka(n: number | null | undefined): string {
  if (n == null) return '—'
  return String(n)
}

async function simpanKunjungan() {
  pesanForm.value = ''
  pesanSukses.value = ''
  if (!bumil.value) return

  const bb = Number(beratBadan.value)
  if (!beratBadan.value || !(bb > 0)) {
    pesanForm.value = 'Berat badan wajib diisi (kg).'
    return
  }

  menyimpan.value = true
  try {
    await tambahKunjunganBumil(bumil.value, {
      tanggal_kunjungan: tglKunjungan.value,
      usia_kehamilan_minggu: sedangHamil.value && usiaKehamilan.value ? Number(usiaKehamilan.value) : null,
      berat_badan: bb,
      bb_sesuai_kurva_kia: sedangHamil.value ? (bbKurvaKia.value || null) : null,
      lingkaran_lengan_atas: lila.value ? Number(lila.value) : null,
      lila_hijau_merah: lilaWarna.value || null,
      tekanan_darah: sedangHamil.value ? (tekananDarah.value || null) : null,
      td_sesuai_kurva_kia: sedangHamil.value ? (tdKurvaKia.value || null) : null,
      batuk_terus_menerus: batuk.value || null,
      demam_lebih_dua_minggu: demam.value || null,
      bb_tidak_naik_dua_bulan: bbTidakNaik.value || null,
      kontak_tbc: kontakTbc.value || null,
      dapat_tablet_ttd: dapatTtd.value || null,
      konsumsi_ttd: konsumsiTtd.value || null,
      mt_kek_diberikan: mtKek.value || null,
      konsumsi_mt_kek: konsumsiMtKek.value || null,
      kelas_bumil: sedangHamil.value ? (kelasBumil.value || null) : null,
      dapat_edukasi: dapatEdukasi.value || null,
      dirujuk: dirujuk.value || null,
    })
    kunjungan.value = await listKunjunganBumil(bumil.value.id)
    usiaKehamilan.value = ''
    beratBadan.value = ''
    bbKurvaKia.value = ''
    lila.value = ''
    lilaWarna.value = ''
    tekananDarah.value = ''
    tdKurvaKia.value = ''
    batuk.value = ''
    demam.value = ''
    bbTidakNaik.value = ''
    kontakTbc.value = ''
    dapatTtd.value = ''
    konsumsiTtd.value = ''
    mtKek.value = ''
    konsumsiMtKek.value = ''
    kelasBumil.value = ''
    dapatEdukasi.value = ''
    dirujuk.value = ''
    pesanSukses.value = 'Kunjungan berhasil dicatat.'
  } catch (e) {
    pesanForm.value = e instanceof Error ? e.message : 'Gagal menyimpan kunjungan.'
  } finally {
    menyimpan.value = false
  }
}

async function hapusKunj(bumilId: number, k: KunjunganBumil) {
  if (!window.confirm(`Hapus kunjungan ${formatTanggal(k.tanggal_kunjungan)}?`)) return
  try {
    await hapusKunjunganBumil(k.id)
    kunjungan.value = await listKunjunganBumil(bumilId)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus kunjungan.'
  }
}

async function hapusBumilData() {
  if (!bumil.value) return
  if (!window.confirm(`Hapus ${bumil.value.nama} beserta seluruh kunjungannya?`)) return
  try {
    await hapusBumil(bumil.value.id)
    await router.replace('/bumil')
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus data.'
  }
}

const klsInput =
  'border-input bg-background h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />

    <section class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
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
            <RouterLink :to="`/bumil/${bumil.id}/edit`">
              <Button variant="outline">
                <Pencil class="size-4" />
                Ubah
              </Button>
            </RouterLink>
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
            <Card>
              <CardHeader>
                <CardTitle class="font-display text-lg font-normal">Riwayat kunjungan</CardTitle>
              </CardHeader>
              <CardContent>
                <p v-if="kunjungan.length === 0" class="text-muted-foreground text-sm">
                  Belum ada kunjungan tercatat.
                </p>

                <div v-else class="overflow-x-auto">
                  <table class="w-full min-w-[1300px] text-sm">
                    <thead>
                      <tr class="text-muted-foreground border-border/60 border-b text-left text-xs font-bold tracking-wide uppercase">
                        <th class="py-2 pr-3 whitespace-nowrap">Tanggal</th>
                        <th class="py-2 pr-3">Usia kehamilan</th>
                        <th class="py-2 pr-3">BB (kg)</th>
                        <th class="py-2 pr-3">BB sesuai kurva KIA</th>
                        <th class="py-2 pr-3">LiLA (cm)</th>
                        <th class="py-2 pr-3">LiLA status</th>
                        <th class="py-2 pr-3">TD (mmHg)</th>
                        <th class="py-2 pr-3">TD sesuai KIA</th>
                        <th class="py-2 pr-3">Batuk</th>
                        <th class="py-2 pr-3">Demam</th>
                        <th class="py-2 pr-3">BB turun</th>
                        <th class="py-2 pr-3">Kontak TBC</th>
                        <th class="py-2 pr-3">TTD</th>
                        <th class="py-2 pr-3">Konsumsi TTD</th>
                        <th class="py-2 pr-3">MT KEK</th>
                        <th class="py-2 pr-3">Konsumsi MT</th>
                        <th class="py-2 pr-3">Kelas bumil</th>
                        <th class="py-2 pr-3">Edukasi</th>
                        <th class="py-2 pr-3">Rujuk</th>
                        <th class="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="k in kunjungan" :key="k.id" class="border-border/60 border-b last:border-0">
                        <td class="py-3 pr-3 font-medium whitespace-nowrap">{{ formatTanggal(k.tanggal_kunjungan) }}</td>
                        <td class="py-3 pr-3 text-muted-foreground whitespace-nowrap">{{ formatAngka(k.usia_kehamilan_minggu) }} mg</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ formatAngka(k.berat_badan) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ k.bb_sesuai_kurva_kia ?? '—' }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ formatAngka(k.lingkaran_lengan_atas) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">
                          <span
                            v-if="k.lila_hijau_merah === 'Hijau'"
                            class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700"
                          >
                            <span class="size-1.5 rounded-full bg-emerald-600"></span> Hijau
                          </span>
                          <span
                            v-else-if="k.lila_hijau_merah === 'Merah'"
                            class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700"
                          >
                            <span class="size-1.5 rounded-full bg-red-600"></span> Merah
                          </span>
                          <span v-else>—</span>
                        </td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ k.tekanan_darah ?? '—' }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ k.td_sesuai_kurva_kia ?? '—' }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.batuk_terus_menerus) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.demam_lebih_dua_minggu) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.bb_tidak_naik_dua_bulan) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.kontak_tbc) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.dapat_tablet_ttd) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.konsumsi_ttd) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.mt_kek_diberikan) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.konsumsi_mt_kek) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.kelas_bumil) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.dapat_edukasi) }}</td>
                        <td class="py-3 pr-3 whitespace-nowrap">{{ labelYaTidak(k.dirujuk) }}</td>
                        <td v-if="isAdmin" class="py-3 text-right">
                          <button
                            type="button"
                            class="text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-lg p-2 transition-colors"
                            aria-label="Hapus kunjungan"
                            title="Hapus kunjungan"
                            @click="hapusKunj(bumil.id, k)"
                          >
                            <Trash2 class="size-4" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

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
                    <p class="text-muted-foreground text-xs font-bold uppercase">Kategori</p>
                    <p class="mt-0.5">{{ bumil.kategori || '—' }}</p>
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
                    <p class="text-muted-foreground text-xs font-bold uppercase">Hamil ke</p>
                    <p class="mt-0.5">{{ bumil.hamil_anak_ke || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Dusun</p>
                    <p class="mt-0.5">{{ bumil.dusun || '—' }}</p>
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
                    <p class="text-muted-foreground text-xs font-bold uppercase">Bersalin</p>
                    <p class="mt-0.5">{{ bumil.tanggal_bersalin ? formatTanggal(bumil.tanggal_bersalin) : '—' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-muted-foreground text-xs font-bold uppercase">Alamat</p>
                    <p class="mt-0.5">{{ bumil.alamat || '—' }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card v-if="isAdmin">
              <CardHeader>
                <CardTitle class="font-display text-lg font-normal">Catat kunjungan</CardTitle>
              </CardHeader>
              <CardContent class="flex flex-col gap-4">
                <form class="space-y-4" @submit.prevent="simpanKunjungan">
                  <div>
                    <label for="tgl-kunjungan" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tanggal kunjungan</label>
                    <input id="tgl-kunjungan" v-model="tglKunjungan" type="date" class="w-full [color-scheme:light]" :class="klsInput" />
                  </div>
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label for="bb" class="text-muted-foreground mb-1.5 block text-xs font-bold">Berat badan (kg)</label>
                      <input id="bb" v-model="beratBadan" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 55" class="w-full" :class="klsInput" />
                    </div>
                    <div v-if="sedangHamil">
                      <label for="usia-kh" class="text-muted-foreground mb-1.5 block text-xs font-bold">Usia kehamilan (minggu)</label>
                      <input id="usia-kh" v-model="usiaKehamilan" type="number" inputmode="numeric" min="0" max="45" placeholder="cth: 24" class="w-full" :class="klsInput" />
                    </div>
                  </div>

                  <div v-if="sedangHamil" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label for="bb-kurva" class="text-muted-foreground mb-1.5 block text-xs font-bold">BB sesuai kurva KIA</label>
                      <select id="bb-kurva" v-model="bbKurvaKia" class="w-full" :class="klsInput">
                        <option value="">— pilih —</option>
                        <option v-for="s in OPSI_BB_KURVA" :key="s" :value="s">{{ s }}</option>
                      </select>
                    </div>
                    <div>
                      <label for="td-kurva" class="text-muted-foreground mb-1.5 block text-xs font-bold">TD sesuai kurva KIA</label>
                      <select id="td-kurva" v-model="tdKurvaKia" class="w-full" :class="klsInput">
                        <option value="">— pilih —</option>
                        <option v-for="s in OPSI_TD_KURVA" :key="s" :value="s">{{ s }}</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label for="lila" class="text-muted-foreground mb-1.5 block text-xs font-bold">LiLA (cm)</label>
                      <input id="lila" v-model="lila" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 23,5" class="w-full" :class="klsInput" />
                    </div>
                    <div>
                      <label for="lila-warna" class="text-muted-foreground mb-1.5 block text-xs font-bold">Status LiLA</label>
                      <select id="lila-warna" v-model="lilaWarna" class="w-full" :class="klsInput">
                        <option value="">— pilih —</option>
                        <option v-for="s in OPSI_LILA" :key="s" :value="s">{{ s }}</option>
                      </select>
                    </div>
                  </div>

                  <div v-if="sedangHamil">
                    <label for="td" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tekanan darah (mmHg)</label>
                    <input id="td" v-model="tekananDarah" type="text" inputmode="numeric" placeholder="cth: 110/70" class="w-full" :class="klsInput" />
                  </div>

                  <div class="border-border/60 border-t pt-4">
                    <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Skrining & intervensi</p>
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label for="batuk" class="text-muted-foreground mb-1.5 block text-xs font-bold">Batuk terus-menerus</label>
                        <select id="batuk" v-model="batuk" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="demam" class="text-muted-foreground mb-1.5 block text-xs font-bold">Demam > 2 minggu</label>
                        <select id="demam" v-model="demam" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="bb-turun" class="text-muted-foreground mb-1.5 block text-xs font-bold">BB tidak naik 2 bulan</label>
                        <select id="bb-turun" v-model="bbTidakNaik" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="kontak-tbc" class="text-muted-foreground mb-1.5 block text-xs font-bold">Kontak TBC</label>
                        <select id="kontak-tbc" v-model="kontakTbc" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="dapat-ttd" class="text-muted-foreground mb-1.5 block text-xs font-bold">Dapat tablet TTD</label>
                        <select id="dapat-ttd" v-model="dapatTtd" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="konsumsi-ttd" class="text-muted-foreground mb-1.5 block text-xs font-bold">Konsumsi TTD</label>
                        <select id="konsumsi-ttd" v-model="konsumsiTtd" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="mt-kek" class="text-muted-foreground mb-1.5 block text-xs font-bold">MT KEK diberikan</label>
                        <select id="mt-kek" v-model="mtKek" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="konsumsi-mt" class="text-muted-foreground mb-1.5 block text-xs font-bold">Konsumsi MT KEK</label>
                        <select id="konsumsi-mt" v-model="konsumsiMtKek" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div v-if="sedangHamil">
                        <label for="kelas-bumil" class="text-muted-foreground mb-1.5 block text-xs font-bold">Kelas ibu hamil</label>
                        <select id="kelas-bumil" v-model="kelasBumil" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="dapat-edukasi" class="text-muted-foreground mb-1.5 block text-xs font-bold">Dapat edukasi</label>
                        <select id="dapat-edukasi" v-model="dapatEdukasi" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                      <div>
                        <label for="dirujuk" class="text-muted-foreground mb-1.5 block text-xs font-bold">Dirujuk</label>
                        <select id="dirujuk" v-model="dirujuk" class="w-full" :class="klsInput">
                          <option value="">— pilih —</option>
                          <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <p v-if="pesanForm" class="flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
                    <TriangleAlert class="mt-0.5 size-4 shrink-0" />
                    {{ pesanForm }}
                  </p>
                  <p v-if="pesanSukses" class="text-sm font-medium text-emerald-700" role="status">
                    {{ pesanSukses }}
                  </p>

                  <Button size="lg" class="w-full" type="submit" :disabled="menyimpan">
                    <Plus class="size-4" />
                    {{ menyimpan ? 'Menyimpan…' : 'Simpan Kunjungan' }}
                  </Button>
                </form>

                <p class="text-muted-foreground border-border/60 border-t pt-3 text-xs leading-relaxed">
                  Status BB sesuai kurva KIA, LiLA, dan TD dicatat mengikuti kurva KIA
                  {{ sedangHamil ? 'antenatal' : 'pascanatal' }}.
                </p>
              </CardContent>
            </Card>
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
  </div>
</template>
