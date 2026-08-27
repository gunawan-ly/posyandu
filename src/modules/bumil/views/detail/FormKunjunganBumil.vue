<script setup lang="ts">
import { Pencil, Plus, TriangleAlert } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import InputSegmen from '@/components/InputSegmen.vue'
import { adalahGalatJaringan } from '@/lib/galat'
import { tambahKeAntre } from '@/lib/offlineAntre'
import {
  KATEGORI_BUMIL,
  OPSI_BB_KURVA,
  OPSI_LILA,
  OPSI_TD_KURVA,
  OPSI_YA_TIDAK,
  tambahKunjunganBumil,
  ubahKunjunganBumil,
  type Bumil,
  type KunjunganBumil,
} from '@/modules/bumil/db'

const props = defineProps<{
  bumil: Bumil
  isAdmin: boolean
  /** Mode ubah: kunjungan yang sedang diedit (terisi awal dari data ini). */
  edit?: KunjunganBumil | null
}>()

const emit = defineEmits<{ tersimpan: [] }>()

// Mode ubah: snapshot kunjungan saat setup (komponen di-key per id oleh induk).
const sunting = props.edit ?? null

const tglKunjungan = ref(sunting?.tanggal_kunjungan || new Date().toISOString().slice(0, 10))
// Kategori kunjungan: default dari status saat ini di identitas (bisa diubah
// per kunjungan agar rekap historis akurat). Wajib diisi saat simpan.
const kategoriKunjungan = ref(sunting?.kategori ?? props.bumil.kategori ?? '')
const usiaKehamilan = ref<string>(sunting?.usia_kehamilan_minggu != null ? String(sunting.usia_kehamilan_minggu) : '')
const beratBadan = ref<string>(sunting?.berat_badan != null ? String(sunting.berat_badan) : '')
const bbKurvaKia = ref(sunting?.bb_sesuai_kurva_kia ?? '')
const lila = ref<string>(sunting?.lingkaran_lengan_atas != null ? String(sunting.lingkaran_lengan_atas) : '')
const lilaWarna = ref(sunting?.lila_hijau_merah ?? '')
const tekananDarah = ref(sunting?.tekanan_darah ?? '')
const tdKurvaKia = ref(sunting?.td_sesuai_kurva_kia ?? '')
const batuk = ref(sunting?.batuk_terus_menerus ?? '')
const demam = ref(sunting?.demam_lebih_dua_minggu ?? '')
const bbTidakNaik = ref(sunting?.bb_tidak_naik_dua_bulan ?? '')
const kontakTbc = ref(sunting?.kontak_tbc ?? '')
const dapatTtd = ref(sunting?.dapat_tablet_ttd ?? '')
const konsumsiTtd = ref(sunting?.konsumsi_ttd ?? '')
const mtKek = ref(sunting?.mt_kek_diberikan ?? '')
const konsumsiMtKek = ref(sunting?.konsumsi_mt_kek ?? '')
const kelasBumil = ref(sunting?.kelas_bumil ?? '')
const vitaminA = ref(sunting?.vitamin_a ?? '')
const kbPascaPersalinan = ref(sunting?.kb_pasca_persalinan ?? '')
const dapatEdukasi = ref(sunting?.dapat_edukasi ?? '')
const dirujuk = ref(sunting?.dirujuk ?? '')
const menyimpan = ref(false)
const pesanSukses = ref('')
const pesanForm = ref('')

const modeUbah = computed(() => props.edit != null)

// Field hanya relevan untuk ibu hamil; untuk menyusui disembunyikan/dikosongkan.
// Kategori diambil dari KUNJUNGAN yang sedang diisi (bukan identitas) agar
// rekap historis akurat — satu ibu bisa berpindah kategori lintas kunjungan.
const sedangHamil = computed(() => kategoriKunjungan.value === 'Hamil')

function kosongkanForm() {
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
  vitaminA.value = ''
  kbPascaPersalinan.value = ''
  dapatEdukasi.value = ''
  dirujuk.value = ''
}

async function simpanKunjungan() {
  pesanForm.value = ''
  pesanSukses.value = ''
  if (!props.bumil) return

  const bb = Number(beratBadan.value)
  if (!beratBadan.value || !(bb > 0)) {
    pesanForm.value = 'Berat badan wajib diisi (kg).'
    return
  }
  if (!kategoriKunjungan.value) {
    pesanForm.value = 'Pilih kategori (Hamil, Menyusui, atau Nifas).'
    return
  }

  const isi = {
    tanggal_kunjungan: tglKunjungan.value,
    kategori: kategoriKunjungan.value,
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
    vitamin_a: !sedangHamil.value ? (vitaminA.value || null) : null,
    kb_pasca_persalinan: !sedangHamil.value ? (kbPascaPersalinan.value || null) : null,
    dapat_edukasi: dapatEdukasi.value || null,
    dirujuk: dirujuk.value || null,
  }

  menyimpan.value = true
  try {
    if (props.edit) {
      await ubahKunjunganBumil(props.bumil, props.edit.id, isi)
    } else {
      await tambahKunjunganBumil(props.bumil, isi)
    }
    emit('tersimpan')
    if (!props.edit) kosongkanForm()
    pesanSukses.value = props.edit ? 'Perubahan kunjungan tersimpan.' : 'Kunjungan berhasil dicatat.'
  } catch (e) {
    // Offline: simpan input mentah ke antrean — dikirim ulang saat online.
    if (adalahGalatJaringan(e) && !props.edit) {
      tambahKeAntre({
        modul: 'bumil',
        identitasId: props.bumil.id,
        nama: props.bumil.nama ?? 'Ibu hamil',
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
        <InputSegmen v-model="kategoriKunjungan" :opsi="KATEGORI_BUMIL" label="Kategori (Hamil / Nifas / Menyusui)" />
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
          <InputSegmen v-model="bbKurvaKia" label="BB sesuai kurva KIA" :opsi="OPSI_BB_KURVA" />
          <InputSegmen v-model="tdKurvaKia" label="TD sesuai kurva KIA" :opsi="OPSI_TD_KURVA" />
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label for="lila" class="text-muted-foreground mb-1.5 block text-xs font-bold">LiLA (cm)</label>
            <input id="lila" v-model="lila" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 23,5" class="w-full" :class="klsInput" />
          </div>
          <InputSegmen v-model="lilaWarna" label="Status LiLA" :opsi="OPSI_LILA" />
        </div>

        <div v-if="sedangHamil">
          <label for="td" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tekanan darah (mmHg)</label>
          <input id="td" v-model="tekananDarah" type="text" inputmode="numeric" placeholder="cth: 110/70" class="w-full" :class="klsInput" />
        </div>

        <div class="border-border/60 border-t pt-4">
          <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Skrining & intervensi</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputSegmen v-model="batuk" label="Batuk terus-menerus" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="demam" label="Demam > 2 minggu" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="bbTidakNaik" label="BB tidak naik 2 bulan" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="kontakTbc" label="Kontak TBC" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="dapatTtd" label="Dapat tablet TTD" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="konsumsiTtd" label="Konsumsi TTD" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="mtKek" label="MT KEK diberikan" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="konsumsiMtKek" label="Konsumsi MT KEK" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-if="sedangHamil" v-model="kelasBumil" label="Kelas ibu hamil" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-if="!sedangHamil" v-model="vitaminA" label="Vitamin A (nifas)" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-if="!sedangHamil" v-model="kbPascaPersalinan" label="KB pasca persalinan" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="dapatEdukasi" label="Dapat edukasi" :opsi="OPSI_YA_TIDAK" />
            <InputSegmen v-model="dirujuk" label="Dirujuk" :opsi="OPSI_YA_TIDAK" />
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
        Status BB sesuai kurva KIA, LiLA, dan TD dicatat mengikuti kurva KIA
        {{ sedangHamil ? 'antenatal' : 'pascanatal' }}.
      </p>
    </CardContent>
  </Card>
</template>
