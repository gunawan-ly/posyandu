<script setup lang="ts">
import { Pencil, Plus, TriangleAlert } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import InputSegmen from '@/components/InputSegmen.vue'
import { adalahGalatJaringan } from '@/lib/galat'
import { tambahKeAntre } from '@/lib/offlineAntre'
import {
  tambahKunjunganRemaja,
  ubahKunjunganRemaja,
  type KunjunganRemaja,
  type Remaja,
} from '@/modules/remaja/db'

const props = defineProps<{
  remaja: Remaja
  isAdmin: boolean
  /** Mode ubah: kunjungan yang sedang diedit (terisi awal dari data ini). */
  edit?: KunjunganRemaja | null
}>()

const emit = defineEmits<{ tersimpan: [] }>()

// Mode ubah: snapshot kunjungan saat setup (komponen di-key per id oleh induk).
const sunting = props.edit ?? null

const tglKunjungan = ref(sunting?.tanggal_kunjungan || new Date().toISOString().slice(0, 10))
const beratBadan = ref<string>(sunting?.berat_badan != null ? String(sunting.berat_badan) : '')
const tinggiBadan = ref<string>(sunting?.tinggi_badan != null ? String(sunting.tinggi_badan) : '')
const imt = ref<string>(sunting?.imt || '')
const lingkarPerut = ref<string>(sunting?.lingkar_perut != null ? String(sunting.lingkar_perut) : '')
const tdSistole = ref<string>(sunting?.td_sistole != null ? String(sunting.td_sistole) : '')
const tdDiastole = ref<string>(sunting?.td_diastole != null ? String(sunting.td_diastole) : '')
const tdKategori = ref(sunting?.td_kategori ?? '')
const gulaDarah = ref<string>(sunting?.gula_darah != null ? String(sunting.gula_darah) : '')
const gulaKategori = ref(sunting?.gula_kategori ?? '')
const hb = ref<string>(sunting?.hb != null ? String(sunting.hb) : '')
const anemia = ref(sunting?.anemia ?? '')
const batuk = ref(sunting?.batuk_terus_menerus ?? '')
const demam = ref(sunting?.demam_lebih_dua_minggu ?? '')
const bbTidakNaik = ref(sunting?.bb_tidak_naik_dua_bulan ?? '')
const kontakErat = ref(sunting?.kontak_erat_tbc ?? '')
const edukasi = ref(sunting?.edukasi ?? '')
const rujuk = ref(sunting?.rujuk ?? '')
const catatan = ref(sunting?.catatan ?? '')
const menyimpan = ref(false)
const pesanSukses = ref('')
const pesanForm = ref('')

const modeUbah = computed(() => props.edit != null)

// Jumlah gejala skrining TBC (kontak erat TIDAK dihitung sebagai gejala).
const jumlahGejalaTbc = computed(
  () => [batuk.value, demam.value, bbTidakNaik.value].filter((v) => v === 'Ya').length,
)
const dirujukTbc = computed(() => jumlahGejalaTbc.value >= 2)

const OPSI_YA_TIDAK = ['Ya', 'Tidak'] as const
const OPSI_TD = ['Rendah', 'Normal', 'Tinggi'] as const
const OPSI_GULA = ['Rendah', 'Normal', 'Tinggi'] as const
const OPSI_ANEMIA = ['Ya', 'Tidak'] as const

function kosongkanForm() {
  beratBadan.value = ''
  tinggiBadan.value = ''
  imt.value = ''
  lingkarPerut.value = ''
  tdSistole.value = ''
  tdDiastole.value = ''
  tdKategori.value = ''
  gulaDarah.value = ''
  gulaKategori.value = ''
  hb.value = ''
  anemia.value = ''
  batuk.value = ''
  demam.value = ''
  bbTidakNaik.value = ''
  kontakErat.value = ''
  edukasi.value = ''
  rujuk.value = ''
  catatan.value = ''
}

async function simpanKunjungan() {
  pesanForm.value = ''
  pesanSukses.value = ''
  if (!props.remaja) return

  const bb = Number(beratBadan.value)
  const tb = Number(tinggiBadan.value)
  if (!beratBadan.value || !(bb > 0)) {
    pesanForm.value = 'Berat badan wajib diisi (kg).'
    return
  }
  if (!tinggiBadan.value || !(tb > 0)) {
    pesanForm.value = 'Tinggi badan wajib diisi (cm).'
    return
  }

  const isi = {
    tanggal_kunjungan: tglKunjungan.value,
    berat_badan: bb,
    tinggi_badan: tb,
    imt: imt.value || null,
    lingkar_perut: lingkarPerut.value ? Number(lingkarPerut.value) : null,
    td_sistole: tdSistole.value ? Number(tdSistole.value) : null,
    td_diastole: tdDiastole.value ? Number(tdDiastole.value) : null,
    td_kategori: tdKategori.value || null,
    gula_darah: gulaDarah.value ? Number(gulaDarah.value) : null,
    gula_kategori: gulaKategori.value || null,
    hb: hb.value ? Number(hb.value) : null,
    anemia: anemia.value || null,
    batuk_terus_menerus: batuk.value || null,
    demam_lebih_dua_minggu: demam.value || null,
    bb_tidak_naik_dua_bulan: bbTidakNaik.value || null,
    kontak_erat_tbc: kontakErat.value || null,
    edukasi: edukasi.value || null,
    rujuk: rujuk.value || null,
    catatan: catatan.value || null,
  }

  menyimpan.value = true
  try {
    if (props.edit) {
      await ubahKunjunganRemaja(props.remaja, props.edit.id, isi)
    } else {
      await tambahKunjunganRemaja(props.remaja, isi)
    }
    emit('tersimpan')
    if (!props.edit) kosongkanForm()
    pesanSukses.value = props.edit ? 'Perubahan kunjungan tersimpan.' : 'Kunjungan berhasil dicatat.'
  } catch (e) {
    // Offline: simpan input mentah ke antrean — dikirim ulang saat online.
    if (adalahGalatJaringan(e) && !props.edit) {
      tambahKeAntre({
        modul: 'remaja',
        identitasId: props.remaja.id,
        nama: props.remaja.nama,
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

        <div class="border-border/60 border-t pt-4">
          <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Hasil Penimbangan / Pengukuran</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label for="bb" class="text-muted-foreground mb-1.5 block text-xs font-bold">Berat badan (kg)</label>
              <input id="bb" v-model="beratBadan" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 45" class="w-full" :class="klsInput" />
            </div>
            <div>
              <label for="tb" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tinggi badan (cm)</label>
              <input id="tb" v-model="tinggiBadan" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 155" class="w-full" :class="klsInput" />
            </div>
          </div>
          <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label for="imt" class="text-muted-foreground mb-1.5 block text-xs font-bold">IMT (mis. 19 (N))</label>
              <input id="imt" v-model="imt" type="text" placeholder="cth: 19 (N)" class="w-full" :class="klsInput" />
            </div>
          </div>
        </div>

        <div class="border-border/60 border-t pt-4">
          <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Pemeriksaan (remaja ≥ 15 tahun, opsional)</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label for="lingkar-perut" class="text-muted-foreground mb-1.5 block text-xs font-bold">Lingkar perut (cm)</label>
              <input id="lingkar-perut" v-model="lingkarPerut" type="number" inputmode="decimal" step="0.1" min="0" class="w-full" :class="klsInput" />
            </div>
          </div>

          <div class="mt-3">
            <p class="text-muted-foreground mb-1.5 block text-xs font-bold">Tekanan darah (mmHg)</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <input id="td-sistole" v-model="tdSistole" type="number" inputmode="numeric" step="1" min="0" placeholder="Sistole" aria-label="Tekanan darah sistole" class="w-full" :class="klsInput" />
              </div>
              <div>
                <input id="td-diastole" v-model="tdDiastole" type="number" inputmode="numeric" step="1" min="0" placeholder="Diastole" aria-label="Tekanan darah diastole" class="w-full" :class="klsInput" />
              </div>
            </div>
            <div class="mt-3">
              <InputSegmen v-model="tdKategori" label="Kategori tekanan darah" :opsi="OPSI_TD" />
            </div>
          </div>

          <div class="mt-3">
            <div>
              <label for="gula-darah" class="text-muted-foreground mb-1.5 block text-xs font-bold">Kadar gula darah sewaktu (mg/dL)</label>
              <input id="gula-darah" v-model="gulaDarah" type="number" inputmode="decimal" step="1" min="0" class="w-full" :class="klsInput" />
            </div>
            <div class="mt-3">
              <InputSegmen v-model="gulaKategori" label="Kategori gula darah" :opsi="OPSI_GULA" />
            </div>
          </div>

          <div class="mt-3 border-t border-border/40 pt-3">
            <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Remaja putri</p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label for="hb" class="text-muted-foreground mb-1.5 block text-xs font-bold">Kadar Hb (mg/dL)</label>
                <input id="hb" v-model="hb" type="number" inputmode="decimal" step="0.1" min="0" class="w-full" :class="klsInput" />
              </div>
              <InputSegmen v-model="anemia" label="Anemia" :opsi="OPSI_ANEMIA" />
            </div>
          </div>
        </div>

        <div class="border-border/60 border-t pt-4">
          <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Skrining gejala TBC</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputSegmen v-model="batuk" label="Batuk terus-menerus" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="demam" label="Demam lebih dari 2 minggu" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="bbTidakNaik" label="BB tidak naik / turun dalam 2 bulan" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="kontakErat" label="Kontak erat dengan pasien TBC" :opsi="OPSI_YA_TIDAK" />
          </div>
          <p
            class="mt-3 rounded-md px-3 py-2 text-xs font-medium"
            :class="dirujukTbc ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'"
            role="status"
          >
            Gejala skrining terpenuhi: {{ jumlahGejalaTbc }} dari 3.
            {{ dirujukTbc ? '≥ 2 gejala — direkomendasikan rujuk ke Puskesmas.' : 'Kontak erat tidak dihitung sebagai gejala.' }}
          </p>
        </div>

        <div class="border-border/60 border-t pt-4">
          <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Layanan</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputSegmen v-model="rujuk" label="Rujuk Pustu/Puskesmas" :opsi="OPSI_YA_TIDAK" />
          </div>
          <div class="mt-3 space-y-3">
            <div>
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
            <div>
              <label for="catatan" class="text-muted-foreground mb-1.5 block text-xs font-bold">Catatan lain (opsional)</label>
              <textarea
                id="catatan"
                v-model="catatan"
                rows="2"
                class="w-full resize-none"
                :class="klsInput"
              ></textarea>
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
          <Pencil v-if="modeUbah" class="size-4" />
          <Plus v-else class="size-4" />
          {{ menyimpan ? 'Menyimpan…' : modeUbah ? 'Simpan Perubahan' : 'Simpan Kunjungan' }}
        </Button>
      </form>

      <p class="text-muted-foreground border-border/60 border-t pt-3 text-xs leading-relaxed">
        IMT diisi manual oleh kader (mis. "19 (N)", status dalam kurung gizi).
        Pemeriksaan (lingkar perut, tekanan darah, gula darah, kadar Hb) khusus
        remaja berusia ≥ 15 tahun &amp; remaja putri.
      </p>
    </CardContent>
  </Card>
</template>
