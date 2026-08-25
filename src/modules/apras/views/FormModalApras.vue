<script setup lang="ts">
// Form Tambah/Ubah Apras dalam modal — dipakai dari halaman daftar.
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
import { ambilApras, buatApras, ubahApras, type Apras } from '@/modules/apras/db'
import { parseTanggal } from '@/lib/umur'

const props = defineProps<{
  open: boolean
  /** id apras yang diedit; null = mode tambah */
  idEdit: number | null
}>()

const emit = defineEmits<{
  'update:open': [nilai: boolean]
  tersimpan: [apras: Apras]
}>()

// Urutan form sesuai permintaan pengguna:
// Nama, NIK anak, JK, Tgl lahir, Tempat lahir, Nama ortu, NIK ortu, No. KK, Anak ke, Dusun, Alamat, Posyandu.
const nama = ref('')
const nik = ref('')
const jenisKelamin = ref('')
const tanggalLahir = ref('')
const tempatLahir = ref('')
const namaOrangTua = ref('')
const nikOrangTua = ref('')
const nomorKk = ref('')
const anakKe = ref('')
const dusun = ref('')
const alamat = ref('')
const posyandu = ref('')

const sibuk = ref(false)
const memuat = ref(false)
const pesanError = ref('')

function kosongkan() {
  nama.value = ''
  nik.value = ''
  jenisKelamin.value = ''
  tanggalLahir.value = ''
  tempatLahir.value = ''
  namaOrangTua.value = ''
  nikOrangTua.value = ''
  nomorKk.value = ''
  anakKe.value = ''
  dusun.value = ''
  alamat.value = ''
  posyandu.value = ''
  pesanError.value = ''
}

function isiForm(a: Apras) {
  nama.value = a.nama
  nik.value = a.nik ?? ''
  jenisKelamin.value = a.jenis_kelamin ?? ''
  tanggalLahir.value = a.tanggal_lahir
  tempatLahir.value = a.tempat_lahir ?? ''
  namaOrangTua.value = a.nama_orang_tua ?? ''
  nikOrangTua.value = a.nik_orang_tua ?? ''
  nomorKk.value = a.nomor_kk ?? ''
  anakKe.value = a.anak_ke ?? ''
  dusun.value = a.dusun ?? ''
  alamat.value = a.alamat ?? ''
  posyandu.value = a.posyandu ?? ''
  pesanError.value = ''
}

watch(() => props.open, async (terbuka) => {
  if (!terbuka) return
  if (props.idEdit == null) {
    kosongkan()
    return
  }
  memuat.value = true
  try {
    const a = await ambilApras(props.idEdit)
    if (!a) {
      pesanError.value = 'Data tidak ditemukan.'
      return
    }
    isiForm(a)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data apras.'
  } finally {
    memuat.value = false
  }
})

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
    anak_ke: anakKe.value.trim() || null,
    dusun: dusun.value.trim() || null,
    alamat: alamat.value.trim() || null,
    posyandu: posyandu.value.trim() || null,
  }

  sibuk.value = true
  try {
    const tersimpan = props.idEdit == null
      ? await buatApras(payload)
      : await ubahApras(props.idEdit, payload)
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
          {{ idEdit == null ? 'Tambah apras baru' : 'Ubah data apras' }}
        </DialogTitle>
        <DialogDescription>
          Isi identitas anak. Kolom bertanda * wajib diisi.
        </DialogDescription>
      </DialogHeader>

      <p v-if="memuat" class="text-muted-foreground text-sm">Memuat data…</p>

      <form v-else class="space-y-4" @submit.prevent="simpan">
        <div>
          <label for="md-nama" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nama anak *</label>
          <input id="md-nama" v-model="nama" type="text" class="w-full" :class="klsInput" placeholder="cth: An Nahda Ramadhania" />
        </div>

        <div>
          <label for="md-nik" class="text-muted-foreground mb-1.5 block text-xs font-bold">NIK (anak)</label>
          <input id="md-nik" v-model="nik" type="text" inputmode="numeric" class="w-full" :class="klsInput" />
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

        <div>
          <label for="md-ortu" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nama orang tua</label>
          <input id="md-ortu" v-model="namaOrangTua" type="text" class="w-full" :class="klsInput" />
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="md-nikortu" class="text-muted-foreground mb-1.5 block text-xs font-bold">NIK orang tua</label>
            <input id="md-nikortu" v-model="nikOrangTua" type="text" inputmode="numeric" class="w-full" :class="klsInput" />
          </div>
          <div>
            <label for="md-kk" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nomor KK</label>
            <input id="md-kk" v-model="nomorKk" type="text" inputmode="numeric" class="w-full" :class="klsInput" />
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="md-anakke" class="text-muted-foreground mb-1.5 block text-xs font-bold">Anak ke</label>
            <input id="md-anakke" v-model="anakKe" type="text" class="w-full" :class="klsInput" />
          </div>
          <div>
            <label for="md-dusun" class="text-muted-foreground mb-1.5 block text-xs font-bold">Dusun</label>
            <input id="md-dusun" v-model="dusun" type="text" class="w-full" :class="klsInput" />
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

        <div>
          <label for="md-pos" class="text-muted-foreground mb-1.5 block text-xs font-bold">Posyandu</label>
          <input id="md-pos" v-model="posyandu" type="text" class="w-full" :class="klsInput" />
        </div>

        <p v-if="pesanError" class="flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
          <TriangleAlert class="mt-0.5 size-4 shrink-0" />
          {{ pesanError }}
        </p>

        <div class="flex flex-wrap justify-end gap-2 pt-1">
          <Button variant="outline" type="button" :disabled="sibuk" @click="emit('update:open', false)">Batal</Button>
          <Button size="lg" type="submit" :disabled="sibuk">
            {{ sibuk ? 'Menyimpan…' : idEdit == null ? 'Simpan Apras' : 'Simpan Perubahan' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
