<script setup lang="ts">
import { ArrowLeft, Baby, Pencil, Plus, Scale, Trash2, TriangleAlert } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import KurvaWHO from '@/components/KurvaWHO.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ambilBalita,
  hapusBalita,
  hapusKunjungan,
  kodeDariLabel,
  listKunjungan,
  tambahKunjungan,
  umurSaatIni,
  type Balita,
  type Kunjungan,
} from '@/supabase/db'
import { parseTanggal } from '@/lib/umur'

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

const tglKunjungan = ref(new Date().toISOString().slice(0, 10))
const beratBadan = ref<string>('')
const tinggiBadan = ref<string>('')
const lingkarLengan = ref<string>('')
const statusLila = ref('')
const menyimpan = ref(false)
const pesanSukses = ref('')
const pesanForm = ref('')

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

const kunjunganTerbaru = computed<Kunjungan | null>(() => kunjungan.value[0] ?? null)

const jkKurva = computed<'L' | 'P'>(() => (balita.value?.jenis_kelamin === 'Perempuan' ? 'P' : 'L'))

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

async function simpanKunjungan() {
  pesanForm.value = ''
  pesanSukses.value = ''
  if (!balita.value) return

  const bb = Number(beratBadan.value)
  const tb = Number(tinggiBadan.value)
  if (!beratBadan.value || !(bb > 0)) {
    pesanForm.value = 'Berat badan wajib diisi (kg).'
    return
  }
  if (!tinggiBadan.value || !(tb > 0)) {
    pesanForm.value = 'Panjang/tinggi badan wajib diisi (cm).'
    return
  }

  menyimpan.value = true
  try {
    await tambahKunjungan(balita.value, {
      tanggal_kunjungan: tglKunjungan.value,
      berat_badan: bb,
      tinggi_badan: tb,
      lingkar_lengan: lingkarLengan.value ? Number(lingkarLengan.value) : null,
      status_lingkar_lengan: statusLila.value || null,
    })
    kunjungan.value = await listKunjungan(balita.value.id)
    beratBadan.value = ''
    tinggiBadan.value = ''
    lingkarLengan.value = ''
    statusLila.value = ''
    pesanSukses.value = 'Kunjungan berhasil dicatat.'
  } catch (e) {
    pesanForm.value = e instanceof Error ? e.message : 'Gagal menyimpan kunjungan.'
  } finally {
    menyimpan.value = false
  }
}

async function hapusKunj(balitaId: number, k: Kunjungan) {
  if (!window.confirm(`Hapus kunjungan ${formatTanggal(k.tanggal_kunjungan)}?`)) return
  try {
    await hapusKunjungan(k.id)
    kunjungan.value = await listKunjungan(balitaId)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus kunjungan.'
  }
}

async function hapusBal() {
  if (!balita.value) return
  if (!window.confirm(`Hapus ${balita.value.nama} beserta seluruh kunjungannya?`)) return
  try {
    await hapusBalita(balita.value.id)
    await router.replace('/balita')
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus data.'
  }
}

const OPSI_STATUS_LILA = ['Normal', 'Gizi Kurang']

const klsInput =
  'border-input bg-background h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />

    <section class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p v-if="sibuk" class="text-muted-foreground text-sm">Memuat data…</p>

      <template v-else-if="balita">
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
          <div class="flex items-center gap-2">
            <RouterLink :to="`/balita/${balita.id}/edit`">
              <Button variant="outline">
                <Pencil class="size-4" />
                Ubah
              </Button>
            </RouterLink>
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
          <div class="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle class="font-display text-lg font-normal">Kurva BB/U (pengukuran terbaru)</CardTitle>
              </CardHeader>
              <CardContent>
                <template v-if="kunjunganTerbaru">
                  <KurvaWHO
                    :jk="jkKurva"
                    :umur-bulan="kunjunganTerbaru.umur_bulan ?? 0"
                    :z-bbu="kunjunganTerbaru.z_bb_u"
                  />
                  <p class="text-muted-foreground mt-2 text-xs">
                    Kunjungan {{ formatTanggal(kunjunganTerbaru.tanggal_kunjungan) }},
                    umur {{ kunjunganTerbaru.umur_bulan ?? '—' }} bulan,
                    z-score BB/U {{ kunjunganTerbaru.z_bb_u != null ? kunjunganTerbaru.z_bb_u.toFixed(2) : '—' }}.
                  </p>
                </template>
                <div
                  v-else
                  class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-white/50 px-6 py-10 text-center"
                >
                  <Scale class="text-emerald-300 size-8" />
                  <p class="font-display mt-3">Belum ada pengukuran</p>
                  <p class="text-muted-foreground mt-1 text-sm">Catat kunjungan pertama untuk melihat kurva pertumbuhan.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle class="font-display text-lg font-normal">Riwayat kunjungan</CardTitle>
              </CardHeader>
              <CardContent>
                <div v-if="kunjungan.length === 0" class="text-muted-foreground text-sm">
                  Belum ada kunjungan tercatat.
                </div>
                <div v-else class="overflow-x-auto">
                  <table class="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr class="text-muted-foreground border-border/60 border-b text-left text-xs font-bold tracking-wide uppercase">
                        <th class="py-2 pr-3">Tanggal</th>
                        <th class="py-2 pr-3">Umur</th>
                        <th class="py-2 pr-3">BB (kg)</th>
                        <th class="py-2 pr-3">PB (cm)</th>
                        <th class="py-2 pr-3">BB/U</th>
                        <th class="py-2 pr-3">TB/U</th>
                        <th class="py-2 pr-3">BB/TB</th>
                        <th class="py-2 pr-3">LiLA</th>
                        <th class="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="k in kunjungan" :key="k.id" class="border-border/60 border-b last:border-0">
                        <td class="py-3 pr-3 font-medium">{{ formatTanggal(k.tanggal_kunjungan) }}</td>
                        <td class="py-3 pr-3 text-muted-foreground">{{ k.umur_bulan ?? '—' }} bln</td>
                        <td class="py-3 pr-3">{{ k.berat_badan ?? '—' }}</td>
                        <td class="py-3 pr-3">{{ k.tinggi_badan ?? '—' }}</td>
                        <td class="py-3 pr-3"><StatusBadge :kode="kodeDariLabel(k.bb_menurut_umur)" /></td>
                        <td class="py-3 pr-3"><StatusBadge :kode="kodeDariLabel(k.pbtb_menurut_umur)" /></td>
                        <td class="py-3 pr-3"><StatusBadge :kode="kodeDariLabel(k.bb_menurut_pbtb)" /></td>
                        <td class="py-3 pr-3 text-muted-foreground">{{ k.lingkar_lengan ?? '—' }} <span v-if="k.status_lingkar_lengan" class="text-xs">({{ k.status_lingkar_lengan }})</span></td>
                        <td class="py-3 text-right">
                          <button
                            type="button"
                            class="text-muted-foreground hover:text-red-600 rounded-lg p-1.5 transition-colors"
                            aria-label="Hapus kunjungan"
                            @click="hapusKunj(balita.id, k)"
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
          </div>

          <!-- Kanan: identitas + form kunjungan -->
          <div class="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle class="font-display text-lg font-normal">Identitas</CardTitle>
              </CardHeader>
              <CardContent class="gap-3">
                <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Posyandu</p>
                    <p class="mt-0.5">{{ balita.posyandu || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Dusun</p>
                    <p class="mt-0.5">{{ balita.dusun || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Orang tua</p>
                    <p class="mt-0.5">{{ balita.nama_orang_tua || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">Anak ke</p>
                    <p class="mt-0.5">{{ balita.anak_ke || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">NIK</p>
                    <p class="mt-0.5 break-all">{{ balita.nik || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">No. KK</p>
                    <p class="mt-0.5 break-all">{{ balita.nomor_kk || '—' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-muted-foreground text-xs font-bold uppercase">Alamat</p>
                    <p class="mt-0.5">{{ balita.alamat || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">BB lahir</p>
                    <p class="mt-0.5">{{ balita.bb_lahir ?? '—' }} kg</p>
                  </div>
                  <div>
                    <p class="text-muted-foreground text-xs font-bold uppercase">PB lahir</p>
                    <p class="mt-0.5">{{ balita.pb_lahir ?? '—' }} cm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle class="font-display text-lg font-normal">Catat kunjungan</CardTitle>
              </CardHeader>
              <CardContent class="gap-4">
                <form class="space-y-4" @submit.prevent="simpanKunjungan">
                  <div>
                    <label for="tgl-kunjungan" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tanggal kunjungan</label>
                    <input id="tgl-kunjungan" v-model="tglKunjungan" type="date" class="w-full [color-scheme:light]" :class="klsInput" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="bb" class="text-muted-foreground mb-1.5 block text-xs font-bold">Berat badan (kg)</label>
                      <input id="bb" v-model="beratBadan" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 9,6" class="w-full" :class="klsInput" />
                    </div>
                    <div>
                      <label for="pb" class="text-muted-foreground mb-1.5 block text-xs font-bold">Panjang/tinggi (cm)</label>
                      <input id="pb" v-model="tinggiBadan" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 75" class="w-full" :class="klsInput" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label for="lila" class="text-muted-foreground mb-1.5 block text-xs font-bold">LiLA (cm)</label>
                      <input id="lila" v-model="lingkarLengan" type="number" inputmode="decimal" step="0.1" min="0" class="w-full" :class="klsInput" />
                    </div>
                    <div>
                      <label for="status-lila" class="text-muted-foreground mb-1.5 block text-xs font-bold">Status LiLA</label>
                      <select id="status-lila" v-model="statusLila" class="w-full" :class="klsInput">
                        <option value="">— pilih —</option>
                        <option v-for="s in OPSI_STATUS_LILA" :key="s" :value="s">{{ s }}</option>
                      </select>
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
                  Status BB/U, TB/U, dan BB/TB dihitung otomatis dari pengukuran memakai standar WHO.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <RouterLink to="/balita" class="text-muted-foreground hover:text-foreground mt-8 inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft class="size-4" />
          Kembali ke daftar
        </RouterLink>
      </template>
    </section>

    <AppFooter />
  </div>
</template>
