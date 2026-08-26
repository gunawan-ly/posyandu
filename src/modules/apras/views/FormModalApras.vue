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
import InputPosyandu from '@/components/InputPosyandu.vue'
import { Button } from '@/components/ui/button'
import { ambilApras, buatApras, ubahApras, type Apras } from '@/modules/apras/db'
import { parseTanggal } from '@/lib/umur'

const props = defineProps<{
  open: boolean
  apras?: Apras | null
}>()

const emit = defineEmits<{
  'update:open': [nilai: boolean]
  tersimpan: []
}>()

const nama = ref('')
const nik = ref('')
const jenisKelamin = ref('')
const tanggalLahir = ref('')
const tempatLahir = ref('')
const namaOrangTua = ref('')
const nikOrangTua = ref('')
const nomorKk = ref('')
const dusun = ref('')
const alamat = ref('')
const posyandu = ref('')

const sibuk = ref(false)
const memuat = ref(false)
const pesanError = ref('')

const judul = ref('Tambah Apras baru')

watch(() => props.open, async (terbuka) => {
  if (!terbuka) return
  bersihkanForm()
  if (props.apras) {
    judul.value = 'Ubah data Apras'
    memuat.value = true
    try {
      const b = await ambilApras(props.apras.id)
      if (b) isiForm(b)
    } catch (e) {
      pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data.'
    } finally {
      memuat.value = false
    }
  } else {
    judul.value = 'Tambah Apras baru'
  }
})

function bersihkanForm() {
  nama.value = ''
  nik.value = ''
  jenisKelamin.value = ''
  tanggalLahir.value = ''
  tempatLahir.value = ''
  namaOrangTua.value = ''
  nikOrangTua.value = ''
  nomorKk.value = ''
  dusun.value = ''
  alamat.value = ''
  posyandu.value = ''
  pesanError.value = ''
}

function isiForm(b: Apras) {
  nama.value = b.nama
  nik.value = b.nik ?? ''
  jenisKelamin.value = b.jenis_kelamin ?? ''
  tanggalLahir.value = b.tanggal_lahir
  tempatLahir.value = b.tempat_lahir ?? ''
  namaOrangTua.value = b.nama_orang_tua ?? ''
  nikOrangTua.value = b.nik_orang_tua ?? ''
  nomorKk.value = b.nomor_kk ?? ''
  dusun.value = b.dusun ?? ''
  alamat.value = b.alamat ?? ''
  posyandu.value = b.posyandu ?? ''
}

async function simpan() {
  pesanError.value = ''

  if (!nama.value.trim()) {
    pesanError.value = 'Nama anak wajib diisi.'
    return
  }
  if (!jenisKelamin.value) {
    pesanError.value = 'Pilih jenis kelamin.'
    return
  }
  const lahir = parseTanggal(tanggalLahir.value)
  if (!lahir) {
    pesanError.value = 'Tanggal lahir belum diisi dengan benar (YYYY-MM-DD).'
    return
  }
  if (lahir.getTime() > Date.now()) {
    pesanError.value = 'Tanggal lahir tidak boleh di masa depan.'
    return
  }

  const payload = {
    nama: nama.value.trim(),
    nik: nik.value.trim() || null,
    jenis_kelamin: jenisKelamin.value,
    tanggal_lahir: tanggalLahir.value,
    tempat_lahir: tempatLahir.value.trim() || null,
    nama_orang_tua: namaOrangTua.value.trim() || null,
    nik_orang_tua: nikOrangTua.value.trim() || null,
    nomor_kk: nomorKk.value.trim() || null,
    dusun: dusun.value.trim() || null,
    alamat: alamat.value.trim() || null,
    posyandu: posyandu.value.trim() || null,
  }

  sibuk.value = true
  try {
    if (props.apras) {
      await ubahApras(props.apras.id, payload)
    } else {
      await buatApras(payload)
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
            <label for="fm-nama" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nama Anak *</label>
            <input id="fm-nama" v-model="nama" type="text" :class="klsInput" placeholder="cth: Raka Pratama" />
          </div>

          <div>
            <label for="fm-nik" class="text-muted-foreground mb-1.5 block text-xs font-bold">NIK</label>
            <input id="fm-nik" v-model="nik" type="text" inputmode="numeric" :class="klsInput" />
          </div>

          <div>
            <p class="mb-1.5 text-xs font-bold text-muted-foreground">Jenis Kelamin *</p>
            <div class="inline-flex w-full rounded-lg border border-emerald-200 bg-emerald-50 p-1" role="group" aria-label="Jenis Kelamin">
              <button
                v-for="(label, k) in { 'Laki - Laki': 'Laki-laki', Perempuan: 'Perempuan' }"
                :key="k"
                type="button"
                :class="jenisKelamin === k
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'"
                class="flex-1 rounded-md px-3 py-2 text-sm font-bold transition-colors"
                @click="jenisKelamin = k"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="fm-tgl-lahir" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tanggal Lahir *</label>
              <input id="fm-tgl-lahir" v-model="tanggalLahir" type="date" class="w-full [color-scheme:light]" :class="klsInput" />
            </div>
            <div>
              <label for="fm-tempat-lahir" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tempat Lahir</label>
              <input id="fm-tempat-lahir" v-model="tempatLahir" type="text" :class="klsInput" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="fm-ortu" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nama Orang Tua</label>
              <input id="fm-ortu" v-model="namaOrangTua" type="text" :class="klsInput" />
            </div>
            <div>
              <label for="fm-nik-ortu" class="text-muted-foreground mb-1.5 block text-xs font-bold">NIK Orang Tua</label>
              <input id="fm-nik-ortu" v-model="nikOrangTua" type="text" inputmode="numeric" :class="klsInput" />
            </div>
          </div>

          <div>
            <label for="fm-no-kk" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nomor KK</label>
            <input id="fm-no-kk" v-model="nomorKk" type="text" inputmode="numeric" :class="klsInput" />
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

          <InputPosyandu v-model="posyandu" />

          <p v-if="pesanError" class="flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
            <TriangleAlert class="mt-0.5 size-4 shrink-0" />
            {{ pesanError }}
          </p>

          <div class="flex flex-wrap justify-end gap-2">
            <Button variant="outline" type="button" @click="tutup">Batal</Button>
            <Button size="lg" type="submit" :disabled="sibuk">
              {{ sibuk ? 'Menyimpan…' : apras ? 'Simpan Perubahan' : 'Simpan Apras' }}
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>
