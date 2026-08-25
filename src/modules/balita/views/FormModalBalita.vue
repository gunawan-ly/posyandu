<script setup lang="ts">
// Form Tambah/Ubah Balita dalam modal — dipakai dari halaman daftar.
// Setelah simpan: kembali ke daftar (emit 'tersimpan' + tutup modal).
import { TriangleAlert } from '@lucide/vue'
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ambilBalita, buatBalita, ubahBalita, type Balita } from '@/modules/balita/db'
import { parseTanggal } from '@/lib/umur'

const props = defineProps<{
  open: boolean
  /** id balita yang diedit; null = mode tambah */
  idEdit: number | null
}>()

const emit = defineEmits<{
  'update:open': [nilai: boolean]
  tersimpan: [balita: Balita]
}>()

const nama = ref('')
const jenisKelamin = ref('')
const tanggalLahir = ref('')
const tempatLahir = ref('')
const anakKe = ref('')
const namaOrangTua = ref('')
const nik = ref('')
const nomorKk = ref('')
const dusun = ref('')
const alamat = ref('')
const posyandu = ref('')
const bbLahir = ref<string>('')
const pbLahir = ref<string>('')

const sibuk = ref(false)
const memuat = ref(false)
const pesanError = ref('')

function kosongkan() {
  nama.value = ''
  jenisKelamin.value = ''
  tanggalLahir.value = ''
  tempatLahir.value = ''
  anakKe.value = ''
  namaOrangTua.value = ''
  nik.value = ''
  nomorKk.value = ''
  dusun.value = ''
  alamat.value = ''
  posyandu.value = ''
  bbLahir.value = ''
  pbLahir.value = ''
  pesanError.value = ''
}

function isiForm(b: Balita) {
  nama.value = b.nama
  jenisKelamin.value = b.jenis_kelamin ?? ''
  tanggalLahir.value = b.tanggal_lahir
  tempatLahir.value = b.tempat_lahir ?? ''
  anakKe.value = b.anak_ke ?? ''
  namaOrangTua.value = b.nama_orang_tua ?? ''
  nik.value = b.nik ?? ''
  nomorKk.value = b.nomor_kk ?? ''
  dusun.value = b.dusun ?? ''
  alamat.value = b.alamat ?? ''
  posyandu.value = b.posyandu ?? ''
  bbLahir.value = b.bb_lahir != null ? String(b.bb_lahir) : ''
  pbLahir.value = b.pb_lahir != null ? String(b.pb_lahir) : ''
  pesanError.value = ''
}

// Saat modal dibuka: mode edit → muat data; mode tambah → kosongkan.
watch(() => props.open, async (terbuka) => {
  if (!terbuka) return
  if (props.idEdit == null) {
    kosongkan()
    return
  }
  memuat.value = true
  try {
    const b = await ambilBalita(props.idEdit)
    if (!b) {
      pesanError.value = 'Data tidak ditemukan.'
      return
    }
    isiForm(b)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data balita.'
  } finally {
    memuat.value = false
  }
})

async function simpan() {
  pesanError.value = ''

  if (!nama.value.trim()) {
    pesanError.value = 'Nama balita wajib diisi.'
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
    jenis_kelamin: jenisKelamin.value,
    tanggal_lahir: tanggalLahir.value,
    tempat_lahir: tempatLahir.value.trim() || null,
    anak_ke: anakKe.value.trim() || null,
    nama_orang_tua: namaOrangTua.value.trim() || null,
    nik: nik.value.trim() || null,
    nomor_kk: nomorKk.value.trim() || null,
    dusun: dusun.value.trim() || null,
    alamat: alamat.value.trim() || null,
    posyandu: posyandu.value.trim() || null,
    bb_lahir: bbLahir.value ? Number(bbLahir.value) : null,
    pb_lahir: pbLahir.value ? Number(pbLahir.value) : null,
  }

  sibuk.value = true
  try {
    const tersimpan = props.idEdit == null
      ? await buatBalita(payload)
      : await ubahBalita(props.idEdit, payload)
    emit('update:open', false)
    emit('tersimpan', tersimpan)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menyimpan data.'
  } finally {
    sibuk.value = false
  }
}

const klsInput =
  'border-input bg-background h-12 md:h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="font-display text-xl font-normal">
          {{ idEdit == null ? 'Tambah balita baru' : 'Ubah data balita' }}
        </DialogTitle>
        <DialogDescription>
          Isi identitas balita. Kolom bertanda * wajib diisi.
        </DialogDescription>
      </DialogHeader>

      <p v-if="memuat" class="text-muted-foreground text-sm">Memuat data…</p>

      <form v-else class="space-y-4" @submit.prevent="simpan">
        <div>
          <label for="md-nama" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nama anak *</label>
          <input id="md-nama" v-model="nama" type="text" class="w-full" :class="klsInput" placeholder="cth: An Nahda Ramadhania" />
        </div>

        <div>
          <p class="mb-1.5 text-xs font-bold text-muted-foreground">Jenis kelamin *</p>
          <div class="inline-flex w-full rounded-lg border border-emerald-200 bg-emerald-50 p-1" role="group" aria-label="Jenis kelamin">
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

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="md-tgl" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tanggal lahir *</label>
            <input id="md-tgl" v-model="tanggalLahir" type="date" class="w-full [color-scheme:light]" :class="klsInput" />
          </div>
          <div>
            <label for="md-tempat" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tempat lahir</label>
            <input id="md-tempat" v-model="tempatLahir" type="text" class="w-full" :class="klsInput" />
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="md-ortu" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nama orang tua</label>
            <input id="md-ortu" v-model="namaOrangTua" type="text" class="w-full" :class="klsInput" />
          </div>
          <div>
            <label for="md-anakke" class="text-muted-foreground mb-1.5 block text-xs font-bold">Anak ke</label>
            <input id="md-anakke" v-model="anakKe" type="text" class="w-full" :class="klsInput" />
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="md-nik" class="text-muted-foreground mb-1.5 block text-xs font-bold">NIK</label>
            <input id="md-nik" v-model="nik" type="text" inputmode="numeric" class="w-full" :class="klsInput" />
          </div>
          <div>
            <label for="md-kk" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nomor KK</label>
            <input id="md-kk" v-model="nomorKk" type="text" inputmode="numeric" class="w-full" :class="klsInput" />
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="md-dusun" class="text-muted-foreground mb-1.5 block text-xs font-bold">Dusun</label>
            <input id="md-dusun" v-model="dusun" type="text" class="w-full" :class="klsInput" />
          </div>
          <div>
            <label for="md-pos" class="text-muted-foreground mb-1.5 block text-xs font-bold">Posyandu</label>
            <input id="md-pos" v-model="posyandu" type="text" class="w-full" :class="klsInput" />
          </div>
        </div>

        <div>
          <label for="md-alamat" class="text-muted-foreground mb-1.5 block text-xs font-bold">Alamat</label>
          <textarea
            id="md-alamat"
            v-model="alamat"
            rows="2"
            class="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-base shadow-sm outline-none focus-visible:ring-3 md:text-sm"
          />
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="md-bbl" class="text-muted-foreground mb-1.5 block text-xs font-bold">Berat lahir (kg)</label>
            <input id="md-bbl" v-model="bbLahir" type="number" inputmode="decimal" step="0.01" min="0" class="w-full" :class="klsInput" />
          </div>
          <div>
            <label for="md-pbl" class="text-muted-foreground mb-1.5 block text-xs font-bold">Panjang lahir (cm)</label>
            <input id="md-pbl" v-model="pbLahir" type="number" inputmode="decimal" step="0.1" min="0" class="w-full" :class="klsInput" />
          </div>
        </div>

        <p v-if="pesanError" class="flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
          <TriangleAlert class="mt-0.5 size-4 shrink-0" />
          {{ pesanError }}
        </p>

        <div class="flex flex-wrap justify-end gap-2 pt-1">
          <Button variant="outline" type="button" :disabled="sibuk" @click="emit('update:open', false)">Batal</Button>
          <Button size="lg" type="submit" :disabled="sibuk">
            {{ sibuk ? 'Menyimpan…' : idEdit == null ? 'Simpan Balita' : 'Simpan Perubahan' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
