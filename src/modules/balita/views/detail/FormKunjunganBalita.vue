<script setup lang="ts">
import { Pencil, Plus, TriangleAlert } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { labelYaTidak, tambahKunjungan, ubahKunjungan, type Balita, type Kunjungan } from '@/modules/balita/db'
import { hitungZLik, hitungZLil, klasifikasiLika, klasifikasiLila } from '@/lib/kalkulator'
import { adalahGalatJaringan } from '@/lib/galat'
import { statusNaikDariTanggal, type HasilKbm } from '@/lib/kbm'
import { tambahKeAntre } from '@/lib/offlineAntre'
import { labelStatus } from '@/lib/status'
import { hitungUmurBulan, parseTanggal } from '@/lib/umur'

const props = defineProps<{
  balita: Balita
  isAdmin: boolean
  /** Mode ubah: kunjungan yang sedang diedit (terisi awal dari data ini). */
  edit?: Kunjungan | null
  /** Riwayat kunjungan anak — dasar penilaian otomatis KBM (BB naik/tidak). */
  riwayat?: Kunjungan[]
}>()

const emit = defineEmits<{ tersimpan: [] }>()

// Mode ubah: snapshot kunjungan saat setup (komponen di-key per id oleh induk).
const sunting = props.edit ?? null

// Samakan varian label lama (Y/T) agar cocok dengan opsi select.
function opsi(nilai: string | null | undefined): string {
  return nilai ? labelYaTidak(nilai) : ''
}

const tglKunjungan = ref(sunting?.tanggal_kunjungan || new Date().toISOString().slice(0, 10))
const beratBadan = ref<string>(sunting?.berat_badan != null ? String(sunting.berat_badan) : '')
const tinggiBadan = ref<string>(sunting?.tinggi_badan != null ? String(sunting.tinggi_badan) : '')
const lingkarLengan = ref<string>(sunting?.lingkar_lengan != null ? String(sunting.lingkar_lengan) : '')
const lingkarKepala = ref<string>(sunting?.lingkar_kepala != null ? String(sunting.lingkar_kepala) : '')
const bbNaik = ref(opsi(sunting?.bb_naik_tidak))
const imunisasi = ref(opsi(sunting?.imunisasi))
const vitaminA = ref(opsi(sunting?.vitamin_a))
const asiEksklusif = ref(opsi(sunting?.asi_eksklusif))
const mpAsi = ref(opsi(sunting?.mp_asi))
const obatCacing = ref(opsi(sunting?.obat_cacing))
const ceklisPerkembangan = ref(sunting?.ceklis_perkembangan ?? '')
const gejalaTbc = ref(opsi(sunting?.gejala_tbc))
const edukasi = ref(sunting?.edukasi ?? '')
const menyimpan = ref(false)
const pesanSukses = ref('')
const pesanForm = ref('')

const modeUbah = computed(() => props.edit != null)

const jkKurva = computed<'L' | 'P'>(() => (props.balita.jenis_kelamin === 'Perempuan' ? 'P' : 'L'))

// Status LiLA/LiKA dihitung otomatis dari pengukuran (z-score WHO) saat form diisi.
const zLilaLive = computed<number | null>(() => {
  const nilai = Number(lingkarLengan.value)
  if (!lingkarLengan.value || !(nilai > 0) || !props.balita) return null
  const lahir = parseTanggal(props.balita.tanggal_lahir)
  const kunjungan = parseTanggal(tglKunjungan.value)
  if (!lahir || !kunjungan) return null
  // Umur kalender, sama dengan logika penyimpanan kunjungan (db.ts).
  const umur = hitungUmurBulan(lahir, kunjungan)
  return hitungZLil(jkKurva.value, umur, nilai)
})
const statusLilaLive = computed<string>(() =>
  zLilaLive.value != null ? labelStatus(klasifikasiLila(zLilaLive.value)) : '',
)
const zLikaLive = computed<number | null>(() => {
  const nilai = Number(lingkarKepala.value)
  if (!lingkarKepala.value || !(nilai > 0) || !props.balita) return null
  const lahir = parseTanggal(props.balita.tanggal_lahir)
  const kunjungan = parseTanggal(tglKunjungan.value)
  if (!lahir || !kunjungan) return null
  // Umur kalender, sama dengan logika penyimpanan kunjungan (db.ts).
  const umur = hitungUmurBulan(lahir, kunjungan)
  return hitungZLik(jkKurva.value, umur, nilai)
})
const statusLikaLive = computed<string>(() =>
  zLikaLive.value != null ? labelStatus(klasifikasiLika(zLikaLive.value)) : '',
)

// ---- Penilaian otomatis BB naik/tidak berdasarkan tabel KBM (per usia) ----

// Kunjungan terakhir SEBELUM tanggal form yang memiliki BB (kunjungan yang
// sedang diedit otomatis tersaring karena tanggalnya tidak lebih awal).
const kunjunganLalu = computed<Kunjungan | null>(() => {
  let terpilih: Kunjungan | null = null
  for (const k of props.riwayat ?? []) {
    if (!k.berat_badan || !k.tanggal_kunjungan) continue
    if (k.tanggal_kunjungan >= tglKunjungan.value) continue
    if (!terpilih || k.tanggal_kunjungan > (terpilih.tanggal_kunjungan ?? '')) terpilih = k
  }
  return terpilih
})

const hasilKbm = computed<HasilKbm | null>(() => {
  const lalu = kunjunganLalu.value
  const bb = Number(beratBadan.value)
  if (!lalu?.berat_badan || !beratBadan.value || !(bb > 0)) return null
  return statusNaikDariTanggal(
    props.balita.tanggal_lahir,
    tglKunjungan.value,
    lalu.tanggal_kunjungan ?? '',
    bb,
    lalu.berat_badan,
  )
})

const umurSaatKunjungan = computed<number | null>(() => {
  const lahir = parseTanggal(props.balita.tanggal_lahir)
  const kini = parseTanggal(tglKunjungan.value)
  return lahir && kini ? hitungUmurBulan(lahir, kini) : null
})

// Pilihan manual kader mengalahkan saran otomatis sampai tanggal/BB berubah.
const bbNaikManual = ref(false)
watch([tglKunjungan, beratBadan], () => {
  bbNaikManual.value = false
})
watch(hasilKbm, (h) => {
  // Mode tambah: isi otomatis. Mode ubah: nilai tersimpan tetap dihormati.
  if (h && !bbNaikManual.value && !props.edit) {
    bbNaik.value = h.naik ? 'Naik' : 'Tidak Naik'
  }
})

function formatBerat(g: number): string {
  if (Math.abs(g) >= 1000) return `${(g / 1000).toFixed(2).replace('.', ',')} kg`
  return `${g} g`
}

function formatTanggalSingkat(tgl: string | null): string {
  const d = parseTanggal(tgl ?? '')
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function kosongkanForm() {
  beratBadan.value = ''
  tinggiBadan.value = ''
  lingkarLengan.value = ''
  lingkarKepala.value = ''
  bbNaik.value = ''
  imunisasi.value = ''
  vitaminA.value = ''
  asiEksklusif.value = ''
  mpAsi.value = ''
  obatCacing.value = ''
  ceklisPerkembangan.value = ''
  gejalaTbc.value = ''
  edukasi.value = ''
}

async function simpanKunjungan() {
  pesanForm.value = ''
  pesanSukses.value = ''
  if (!props.balita) return

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

  const isi = {
    tanggal_kunjungan: tglKunjungan.value,
    berat_badan: bb,
    tinggi_badan: tb,
    lingkar_lengan: lingkarLengan.value ? Number(lingkarLengan.value) : null,
    lingkar_kepala: lingkarKepala.value ? Number(lingkarKepala.value) : null,
    bb_naik_tidak: bbNaik.value || null,
    imunisasi: imunisasi.value || null,
    vitamin_a: vitaminA.value || null,
    asi_eksklusif: asiEksklusif.value || null,
    mp_asi: mpAsi.value || null,
    obat_cacing: obatCacing.value || null,
    ceklis_perkembangan: ceklisPerkembangan.value || null,
    gejala_tbc: gejalaTbc.value || null,
    edukasi: edukasi.value || null,
  }

  menyimpan.value = true
  try {
    if (props.edit) {
      await ubahKunjungan(props.balita, props.edit.id, isi)
    } else {
      await tambahKunjungan(props.balita, isi)
    }
    emit('tersimpan')
    if (!props.edit) kosongkanForm()
    pesanSukses.value = props.edit ? 'Perubahan kunjungan tersimpan.' : 'Kunjungan berhasil dicatat.'
  } catch (e) {
    // Offline: simpan input mentah ke antrean — status dihitung ulang saat sync.
    if (adalahGalatJaringan(e) && !props.edit) {
      tambahKeAntre({
        modul: 'balita',
        identitasId: props.balita.id,
        nama: props.balita.nama,
        tanggal_kunjungan: tglKunjungan.value,
        isi,
      })
      kosongkanForm()
      pesanSukses.value =
        'Perangkat sedang offline — kunjungan tersimpan di perangkat dan otomatis terkirim saat online.'
    } else {
      pesanForm.value = e instanceof Error ? e.message : 'Gagal menyimpan kunjungan.'
    }
  } finally {
    menyimpan.value = false
  }
}

const OPSI_YA_TIDAK = ['Ya', 'Tidak']
const OPSI_NAIK = ['Naik', 'Tidak Naik']
const OPSI_CEKLIS = ['L', 'TL']

const klsInput =
  'border-input bg-background h-12 md:h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
  <Card v-if="isAdmin" :class="modeUbah ? 'border-none bg-transparent shadow-none' : ''">
    <CardHeader v-if="!modeUbah">
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
            <input id="bb" v-model="beratBadan" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 9,6" class="w-full" :class="klsInput" />
          </div>
          <div>
            <label for="pb" class="text-muted-foreground mb-1.5 block text-xs font-bold">Panjang/tinggi (cm)</label>
            <input id="pb" v-model="tinggiBadan" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 75" class="w-full" :class="klsInput" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label for="lila" class="text-muted-foreground mb-1.5 block text-xs font-bold">LiLA (cm)</label>
            <input id="lila" v-model="lingkarLengan" type="number" inputmode="decimal" step="0.1" min="0" class="w-full" :class="klsInput" />
          </div>
          <div>
            <label for="lika" class="text-muted-foreground mb-1.5 block text-xs font-bold">LiKA (cm)</label>
            <input id="lika" v-model="lingkarKepala" type="number" inputmode="decimal" step="0.1" min="0" class="w-full" :class="klsInput" />
          </div>
        </div>

        <div v-if="statusLilaLive || statusLikaLive" class="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm">
          <span v-if="statusLilaLive">
            Status LiLA: <span class="font-bold">{{ statusLilaLive }}</span>
            <span v-if="zLilaLive != null" class="text-muted-foreground"> (z {{ zLilaLive.toFixed(2) }})</span>
          </span>
          <span v-if="statusLilaLive && statusLikaLive" class="mx-2 text-emerald-300">·</span>
          <span v-if="statusLikaLive">
            Status LiKA: <span class="font-bold">{{ statusLikaLive }}</span>
            <span v-if="zLikaLive != null" class="text-muted-foreground"> (z {{ zLikaLive.toFixed(2) }})</span>
          </span>
        </div>

        <div v-if="hasilKbm" class="border-border/60 rounded-lg border px-3 py-2 text-sm" role="status">
          Kenaikan BB sejak {{ formatTanggalSingkat(kunjunganLalu?.tanggal_kunjungan ?? null) }}:
          <span class="font-bold" :class="hasilKbm.kenaikanG >= 0 ? 'text-emerald-700' : 'text-red-600'">
            {{ formatBerat(hasilKbm.kenaikanG) }}
          </span>
          <span class="text-muted-foreground">
            · KBM {{ formatBerat(hasilKbm.kbmG) }}
            <template v-if="umurSaatKunjungan != null">(usia {{ umurSaatKunjungan }} bln)</template>
          </span>
          →
          <span class="font-bold" :class="hasilKbm.naik ? 'text-emerald-700' : 'text-red-600'">
            {{ hasilKbm.naik ? 'Naik' : 'Tidak Naik' }}
          </span>
          <span v-if="!modeUbah" class="text-muted-foreground block text-xs">Pilihan "BB naik" di bawah terisi otomatis; boleh diubah manual.</span>
        </div>

        <div class="border-border/60 border-t pt-4">
          <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Gizi & kesehatan</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label for="bb-naik" class="text-muted-foreground mb-1.5 block text-xs font-bold">BB naik</label>
              <select id="bb-naik" v-model="bbNaik" class="w-full" :class="klsInput" @change="bbNaikManual = true">
                <option value="">— pilih —</option>
                <option v-for="s in OPSI_NAIK" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label for="ceklis-perkembangan" class="text-muted-foreground mb-1.5 block text-xs font-bold">Ceklis perkembangan</label>
              <select id="ceklis-perkembangan" v-model="ceklisPerkembangan" class="w-full" :class="klsInput">
                <option value="">— pilih —</option>
                <option v-for="s in OPSI_CEKLIS" :key="s" :value="s">{{ s === 'L' ? 'L (Lengkap)' : 'TL (Tidak Lengkap)' }}</option>
              </select>
            </div>
            <div>
              <label for="imunisasi" class="text-muted-foreground mb-1.5 block text-xs font-bold">Imunisasi</label>
              <select id="imunisasi" v-model="imunisasi" class="w-full" :class="klsInput">
                <option value="">— pilih —</option>
                <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label for="vitamin-a" class="text-muted-foreground mb-1.5 block text-xs font-bold">Vitamin A</label>
              <select id="vitamin-a" v-model="vitaminA" class="w-full" :class="klsInput">
                <option value="">— pilih —</option>
                <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label for="asi-eksklusif" class="text-muted-foreground mb-1.5 block text-xs font-bold">ASI eksklusif</label>
              <select id="asi-eksklusif" v-model="asiEksklusif" class="w-full" :class="klsInput">
                <option value="">— pilih —</option>
                <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label for="mp-asi" class="text-muted-foreground mb-1.5 block text-xs font-bold">MP-ASI</label>
              <select id="mp-asi" v-model="mpAsi" class="w-full" :class="klsInput">
                <option value="">— pilih —</option>
                <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label for="obat-cacing" class="text-muted-foreground mb-1.5 block text-xs font-bold">Obat cacing</label>
              <select id="obat-cacing" v-model="obatCacing" class="w-full" :class="klsInput">
                <option value="">— pilih —</option>
                <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label for="gejala-tbc" class="text-muted-foreground mb-1.5 block text-xs font-bold">Gejala TBC</label>
              <select id="gejala-tbc" v-model="gejalaTbc" class="w-full" :class="klsInput">
                <option value="">— pilih —</option>
                <option v-for="s in OPSI_YA_TIDAK" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
          <div class="mt-3">
            <label for="edukasi" class="text-muted-foreground mb-1.5 block text-xs font-bold">Edukasi (opsional)</label>
            <textarea
              id="edukasi"
              v-model="edukasi"
              rows="2"
              class="w-full resize-none"
              :class="klsInput"
              placeholder="Catatan edukasi gizi/kesehatan…"
            ></textarea>
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
          <Pencil v-if="modeUbah" class="size-4" />
          <Plus v-else class="size-4" />
          {{ menyimpan ? 'Menyimpan…' : modeUbah ? 'Simpan Perubahan' : 'Simpan Kunjungan' }}
        </Button>
      </form>

      <p class="text-muted-foreground border-border/60 border-t pt-3 text-xs leading-relaxed">
        Status BB/U, TB/U, dan BB/TB dihitung otomatis dari pengukuran memakai standar WHO.
      </p>
    </CardContent>
  </Card>
</template>
