<script setup lang="ts">
import { ArrowLeft, TriangleAlert } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ambilBalita, buatBalita, ubahBalita, type Balita } from '@/supabase/db'
import { parseTanggal } from '@/lib/umur'

const route = useRoute()
const router = useRouter()

const idEdit = computed(() => {
  const v = route.params.id
  return typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : null
})

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

onMounted(async () => {
  if (idEdit.value == null) return
  memuat.value = true
  try {
    const b = await ambilBalita(idEdit.value)
    if (!b) {
      await router.replace('/balita')
      return
    }
    isiForm(b)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data balita.'
  } finally {
    memuat.value = false
  }
})

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
}

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
    const tersimpan = idEdit.value == null
      ? await buatBalita(payload)
      : await ubahBalita(idEdit.value, payload)
    await router.replace(`/balita/${tersimpan.id}`)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menyimpan data.'
  } finally {
    sibuk.value = false
  }
}

const klsInput =
  'border-input bg-background h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />

    <section class="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <RouterLink to="/balita" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium">
        <ArrowLeft class="size-4" />
        Kembali ke daftar
      </RouterLink>

      <Card class="mt-6">
        <CardHeader>
          <CardTitle class="font-display text-2xl font-normal">
            {{ idEdit == null ? 'Tambah balita baru' : 'Ubah data balita' }}
          </CardTitle>
        </CardHeader>

        <CardContent class="gap-5">
          <p v-if="memuat" class="text-muted-foreground text-sm">Memuat data…</p>

          <form v-else class="space-y-5" @submit.prevent="simpan">
            <div>
              <label for="nama" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nama balita *</label>
              <input id="nama" v-model="nama" type="text" class="w-full" :class="klsInput" placeholder="cth: An Nahda Ramadhania" />
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

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="tgl-lahir" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tanggal lahir *</label>
                <input id="tgl-lahir" v-model="tanggalLahir" type="date" class="w-full [color-scheme:light]" :class="klsInput" />
              </div>
              <div>
                <label for="tempat-lahir" class="text-muted-foreground mb-1.5 block text-xs font-bold">Tempat lahir</label>
                <input id="tempat-lahir" v-model="tempatLahir" type="text" class="w-full" :class="klsInput" />
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="ortu" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nama orang tua</label>
                <input id="ortu" v-model="namaOrangTua" type="text" class="w-full" :class="klsInput" />
              </div>
              <div>
                <label for="anak-ke" class="text-muted-foreground mb-1.5 block text-xs font-bold">Anak ke</label>
                <input id="anak-ke" v-model="anakKe" type="text" class="w-full" :class="klsInput" />
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="nik" class="text-muted-foreground mb-1.5 block text-xs font-bold">NIK</label>
                <input id="nik" v-model="nik" type="text" inputmode="numeric" class="w-full" :class="klsInput" />
              </div>
              <div>
                <label for="no-kk" class="text-muted-foreground mb-1.5 block text-xs font-bold">Nomor KK</label>
                <input id="no-kk" v-model="nomorKk" type="text" inputmode="numeric" class="w-full" :class="klsInput" />
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="dusun" class="text-muted-foreground mb-1.5 block text-xs font-bold">Dusun</label>
                <input id="dusun" v-model="dusun" type="text" class="w-full" :class="klsInput" />
              </div>
              <div>
                <label for="posyandu" class="text-muted-foreground mb-1.5 block text-xs font-bold">Posyandu</label>
                <input id="posyandu" v-model="posyandu" type="text" class="w-full" :class="klsInput" />
              </div>
            </div>

            <div>
              <label for="alamat" class="text-muted-foreground mb-1.5 block text-xs font-bold">Alamat</label>
              <textarea
                id="alamat"
                v-model="alamat"
                rows="2"
                class="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-base shadow-sm outline-none focus-visible:ring-3 md:text-sm"
              />
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="bb-lahir" class="text-muted-foreground mb-1.5 block text-xs font-bold">Berat lahir (kg)</label>
                <input id="bb-lahir" v-model="bbLahir" type="number" inputmode="decimal" step="0.01" min="0" class="w-full" :class="klsInput" />
              </div>
              <div>
                <label for="pb-lahir" class="text-muted-foreground mb-1.5 block text-xs font-bold">Panjang lahir (cm)</label>
                <input id="pb-lahir" v-model="pbLahir" type="number" inputmode="decimal" step="0.1" min="0" class="w-full" :class="klsInput" />
              </div>
            </div>

            <p v-if="pesanError" class="flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
              <TriangleAlert class="mt-0.5 size-4 shrink-0" />
              {{ pesanError }}
            </p>

            <div class="flex flex-wrap justify-end gap-2">
              <Button variant="outline" type="button" @click="router.push('/balita')">Batal</Button>
              <Button size="lg" type="submit" :disabled="sibuk">
                {{ sibuk ? 'Menyimpan…' : idEdit == null ? 'Simpan Balita' : 'Simpan Perubahan' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>

    <AppFooter />
  </div>
</template>
