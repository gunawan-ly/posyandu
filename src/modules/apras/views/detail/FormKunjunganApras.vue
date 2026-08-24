<script setup lang="ts">
import { Plus, TriangleAlert } from '@lucide/vue'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { tambahKunjunganApras, type Apras } from '@/modules/apras/db'

const props = defineProps<{
  apras: Apras
  isAdmin: boolean
}>()

const emit = defineEmits<{ tersimpan: [] }>()

const tglKunjungan = ref(new Date().toISOString().slice(0, 10))
const beratBadan = ref<string>('')
const tinggiBadan = ref<string>('')
const lingkarLengan = ref<string>('')
const lingkarKepala = ref<string>('')
const imunisasi = ref('')
const obatCacing = ref('')
const gejalaTbc = ref('')
const mtPanganLokal = ref('')
const dirujuk = ref('')
const edukasi = ref('')
const catatan = ref('')
const menyimpan = ref(false)
const pesanSukses = ref('')
const pesanForm = ref('')

async function simpanKunjungan() {
  pesanForm.value = ''
  pesanSukses.value = ''
  if (!props.apras) return

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

  menyimpan.value = true
  try {
    await tambahKunjunganApras(props.apras, {
      tanggal_kunjungan: tglKunjungan.value,
      berat_badan: bb,
      tinggi_badan: tb,
      lingkar_lengan: lingkarLengan.value ? Number(lingkarLengan.value) : null,
      lingkar_kepala: lingkarKepala.value ? Number(lingkarKepala.value) : null,
      imunisasi: imunisasi.value || null,
      obat_cacing: obatCacing.value || null,
      gejala_tbc: gejalaTbc.value || null,
      mt_pangan_lokal: mtPanganLokal.value || null,
      dirujuk: dirujuk.value || null,
      edukasi: edukasi.value || null,
      catatan: catatan.value || null,
    })
    emit('tersimpan')
    beratBadan.value = ''
    tinggiBadan.value = ''
    lingkarLengan.value = ''
    lingkarKepala.value = ''
    imunisasi.value = ''
    obatCacing.value = ''
    gejalaTbc.value = ''
    mtPanganLokal.value = ''
    dirujuk.value = ''
    edukasi.value = ''
    catatan.value = ''
    pesanSukses.value = 'Kunjungan berhasil dicatat.'
  } catch (e) {
    pesanForm.value = e instanceof Error ? e.message : 'Gagal menyimpan kunjungan.'
  } finally {
    menyimpan.value = false
  }
}

const OPSI_YA_TIDAK = ['Ya', 'Tidak']

const klsInput =
  'border-input bg-background h-12 md:h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
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
            <input id="bb" v-model="beratBadan" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 17,2" class="w-full" :class="klsInput" />
          </div>
          <div>
            <label for="tb" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tinggi badan (cm)</label>
            <input id="tb" v-model="tinggiBadan" type="number" inputmode="decimal" step="0.1" min="0" placeholder="cth: 110" class="w-full" :class="klsInput" />
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

        <div class="border-border/60 border-t pt-4">
          <p class="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">Kesehatan &amp; layanan</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label for="imunisasi" class="text-muted-foreground mb-1.5 block text-xs font-bold">Imunisasi</label>
              <select id="imunisasi" v-model="imunisasi" class="w-full" :class="klsInput">
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
            <div>
              <label for="mt-pangan" class="text-muted-foreground mb-1.5 block text-xs font-bold">MT pangan lokal</label>
              <select id="mt-pangan" v-model="mtPanganLokal" class="w-full" :class="klsInput">
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
          <Plus class="size-4" />
          {{ menyimpan ? 'Menyimpan…' : 'Simpan Kunjungan' }}
        </Button>
      </form>

      <p class="text-muted-foreground border-border/60 border-t pt-3 text-xs leading-relaxed">
        Pengukuran apras (5–6 tahun) dicatat tanpa klasifikasi status — referensi WHO hanya
        sampai usia 60 bulan.
      </p>
    </CardContent>
  </Card>
</template>
