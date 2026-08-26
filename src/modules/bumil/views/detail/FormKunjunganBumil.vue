<script setup lang="ts">
import { Pencil, Plus, TriangleAlert } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adalahGalatJaringan } from '@/lib/galat'
import { tambahKeAntre } from '@/lib/offlineAntre'
import {
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
const dapatEdukasi = ref(sunting?.dapat_edukasi ?? '')
const dirujuk = ref(sunting?.dirujuk ?? '')
const menyimpan = ref(false)
const pesanSukses = ref('')
const pesanForm = ref('')

const modeUbah = computed(() => props.edit != null)

// Field hanya relevan untuk ibu hamil; untuk menyusui disembunyikan/dikosongkan.
const sedangHamil = computed(() => props.bumil.kategori === 'Hamil')

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

  const isi = {
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
