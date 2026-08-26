<script setup lang="ts">
import { TriangleAlert } from '@lucide/vue'
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import InputDusun from '@/components/InputDusun.vue'
import { Button } from '@/components/ui/button'
import { ambilBumil, buatBumil, KATEGORI_BUMIL, ubahBumil, type Bumil } from '@/modules/bumil/db'
import { parseTanggal } from '@/lib/umur'

const props = defineProps<{
  open: boolean
  bumil?: Bumil | null
}>()

const emit = defineEmits<{
  'update:open': [nilai: boolean]
  tersimpan: []
}>()

const nama = ref('')
const kategori = ref('')
const nik = ref('')
const tanggalLahir = ref('')
const umur = ref('')
const namaSuami = ref('')
const nomorKk = ref('')
const hamilAnakKe = ref('')
const jarakAnakSebelumnya = ref('')
const dusun = ref('')
const alamat = ref('')
const tanggalBersalin = ref('')
const tempatBersalin = ref('')
const caraPersalin = ref('')

const sibuk = ref(false)
const memuat = ref(false)
const pesanError = ref('')

const judul = ref('Tambah ibu hamil baru')

watch(() => props.open, async (terbuka) => {
  if (!terbuka) return
  bersihkanForm()
  if (props.bumil) {
    judul.value = 'Ubah data ibu hamil'
    memuat.value = true
    try {
      const b = await ambilBumil(props.bumil.id)
      if (b) isiForm(b)
    } catch (e) {
      pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data.'
    } finally {
      memuat.value = false
    }
  } else {
    judul.value = 'Tambah ibu hamil baru'
  }
})

function bersihkanForm() {
  nama.value = ''
  kategori.value = ''
  nik.value = ''
  tanggalLahir.value = ''
  umur.value = ''
  namaSuami.value = ''
  nomorKk.value = ''
  hamilAnakKe.value = ''
  jarakAnakSebelumnya.value = ''
  dusun.value = ''
  alamat.value = ''
  tanggalBersalin.value = ''
  tempatBersalin.value = ''
  caraPersalin.value = ''
  pesanError.value = ''
}

function isiForm(b: Bumil) {
  nama.value = b.nama ?? ''
  kategori.value = b.kategori ?? ''
  nik.value = b.nik ?? ''
  tanggalLahir.value = b.tanggal_lahir ?? ''
  umur.value = b.umur ?? ''
  namaSuami.value = b.nama_suami ?? ''
  nomorKk.value = b.nomor_kk ?? ''
  hamilAnakKe.value = b.hamil_anak_ke ?? ''
  jarakAnakSebelumnya.value = b.jarak_dengan_anak_sebelumnya ?? ''
  dusun.value = b.dusun ?? ''
  alamat.value = b.alamat ?? ''
  tanggalBersalin.value = b.tanggal_bersalin ?? ''
  tempatBersalin.value = b.tempat_bersalin ?? ''
  caraPersalin.value = b.cara_persalin ?? ''
}

async function simpan() {
  pesanError.value = ''

  if (!nama.value.trim()) {
    pesanError.value = 'Nama ibu hamil wajib diisi.'
    return
  }
  if (!kategori.value) {
    pesanError.value = 'Pilih kategori (Hamil atau Menyusui).'
    return
  }
  if (tanggalLahir.value) {
    const lahir = parseTanggal(tanggalLahir.value)
    if (!lahir) {
      pesanError.value = 'Tanggal lahir belum diisi dengan benar (YYYY-MM-DD).'
      return
    }
    if (lahir.getTime() > Date.now()) {
      pesanError.value = 'Tanggal lahir tidak boleh di masa depan.'
      return
    }
  }
  if (tanggalBersalin.value && tanggalLahir.value) {
    const bersalin = parseTanggal(tanggalBersalin.value)
    const lahirIbu = parseTanggal(tanggalLahir.value)
    if (bersalin && lahirIbu && bersalin.getTime() < lahirIbu.getTime()) {
      pesanError.value = 'Tanggal bersalin tidak boleh sebelum tanggal lahir.'
      return
    }
  }

  const payload = {
    nama: nama.value.trim(),
    kategori: kategori.value,
    nik: nik.value.trim() || null,
    tanggal_lahir: tanggalLahir.value || null,
    umur: umur.value.trim() || null,
    nama_suami: namaSuami.value.trim() || null,
    nomor_kk: nomorKk.value.trim() || null,
    hamil_anak_ke: hamilAnakKe.value.trim() || null,
    jarak_dengan_anak_sebelumnya: jarakAnakSebelumnya.value.trim() || null,
    dusun: dusun.value.trim() || null,
    alamat: alamat.value.trim() || null,
    tanggal_bersalin: tanggalBersalin.value || null,
    tempat_bersalin: tempatBersalin.value.trim() || null,
    cara_persalin: caraPersalin.value.trim() || null,
  }

  sibuk.value = true
  try {
    if (props.bumil) {
      await ubahBumil(props.bumil.id, payload)
    } else {
      await buatBumil(payload)
    }
    emit('update:open', false)
    emit('tersimpan')
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menyimpan data.'
  } finally {
    sibuk.value = false
  }
}

function tutup() {
  emit('update:open', false)
}

const klsInput =
  'border-input bg-background h-12 md:h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
  <Dialog :open="open" @update:open="(v) => { if (!v) tutup() }">
    <DialogContent
      class="glass-fluid gap-0 border-0 p-0 sm:max-w-2xl"
      :show-close-button="false"
      :style="{
        animationDuration: '300ms',
        animationTimingFunction: 'var(--ease-spring)',
      }"
    >
      <DialogHeader class="px-6 pt-6 pb-0">
        <DialogTitle class="font-display text-xl font-normal">{{ judul }}</DialogTitle>
        <DialogDescription class="sr-only">{{ judul }}</DialogDescription>
      </DialogHeader>

      <div class="max-h-[80vh] overflow-y-auto px-6 py-4">
        <p v-if="memuat" class="text-muted-foreground text-sm">Memuat data…</p>

        <form v-else class="space-y-5" @submit.prevent="simpan">
          <div>
            <label for="fm-nama" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nama ibu *</label>
            <input id="fm-nama" v-model="nama" type="text" :class="klsInput" placeholder="cth: Wiwin Idrus" />
          </div>

          <div>
            <p class="mb-1.5 text-xs font-bold text-muted-foreground">Kategori *</p>
            <div class="inline-flex w-full rounded-lg border border-emerald-200 bg-emerald-50 p-1" role="group" aria-label="Kategori">
              <button
                v-for="k in KATEGORI_BUMIL"
                :key="k"
                type="button"
                :class="kategori === k
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'"
                class="flex-1 rounded-md px-3 py-2 text-sm font-bold transition-colors"
                @click="kategori = k"
              >
                {{ k }}
              </button>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="fm-nik" class="text-muted-foreground mb-1.5 block text-xs font-bold">NIK</label>
              <input id="fm-nik" v-model="nik" type="text" inputmode="numeric" :class="klsInput" />
            </div>
            <div>
              <label for="fm-no-kk" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nomor KK</label>
              <input id="fm-no-kk" v-model="nomorKk" type="text" inputmode="numeric" :class="klsInput" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="fm-tgl-lahir" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tanggal lahir</label>
              <input id="fm-tgl-lahir" v-model="tanggalLahir" type="date" class="w-full [color-scheme:light]" :class="klsInput" />
            </div>
            <div>
              <label for="fm-umur" class="text-muted-foreground mb-1.5 block text-xs font-bold">Umur (tahun)</label>
              <input id="fm-umur" v-model="umur" type="number" inputmode="numeric" min="10" max="55" :class="klsInput" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="fm-nama-suami" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nama suami</label>
              <input id="fm-nama-suami" v-model="namaSuami" type="text" :class="klsInput" />
            </div>
            <div>
              <label for="fm-hamil-ke" class="text-muted-foreground mb-1.5 block text-xs font-bold">Hamil anak ke</label>
              <input id="fm-hamil-ke" v-model="hamilAnakKe" type="text" :class="klsInput" placeholder="cth: 2" />
            </div>
          </div>

          <div>
            <label for="fm-jarak" class="text-muted-foreground mb-1.5 block text-xs font-bold">Jarak dengan anak sebelumnya</label>
            <input id="fm-jarak" v-model="jarakAnakSebelumnya" type="text" :class="klsInput" placeholder="cth: 3 tahun" />
          </div>

          <InputDusun v-model="dusun" />

          <div>
            <label for="fm-alamat" class="text-muted-foreground mb-1.5 block text-xs font-bold">Alamat</label>
            <textarea
              id="fm-alamat"
              v-model="alamat"
              rows="2"
              class="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-base shadow-sm outline-none focus-visible:ring-3 md:text-sm"
            />
          </div>

          <div class="border-border/60 grid gap-4 border-t pt-4 sm:grid-cols-2">
            <p class="text-muted-foreground col-span-full mb-0 text-xs font-bold tracking-widest uppercase">Data persalinan</p>
            <div>
              <label for="fm-tgl-bersalin" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tanggal bersalin</label>
              <input id="fm-tgl-bersalin" v-model="tanggalBersalin" type="date" class="w-full [color-scheme:light]" :class="klsInput" />
            </div>
            <div>
              <label for="fm-tempat-bersalin" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tempat bersalin</label>
              <input id="fm-tempat-bersalin" v-model="tempatBersalin" type="text" :class="klsInput" />
            </div>
            <div>
              <label for="fm-cara-persalin" class="text-muted-foreground mb-1.5 block text-xs font-bold">Cara persalinan</label>
              <input id="fm-cara-persalin" v-model="caraPersalin" type="text" :class="klsInput" placeholder="cth: Normal / SC" />
            </div>
          </div>

          <p v-if="pesanError" class="flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
            <TriangleAlert class="mt-0.5 size-4 shrink-0" />
            {{ pesanError }}
          </p>

          <div class="flex flex-wrap justify-end gap-2">
            <Button variant="outline" type="button" @click="tutup">Batal</Button>
            <Button size="lg" type="submit" :disabled="sibuk">
              {{ sibuk ? 'Menyimpan…' : bumil ? 'Simpan Perubahan' : 'Simpan Ibu Hamil' }}
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
