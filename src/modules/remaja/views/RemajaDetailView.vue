<script setup lang="ts">
import { ArrowLeft, Pencil, Trash2, TriangleAlert, Users } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Skeleton from '@/components/Skeleton.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FormModalRemaja from './FormModalRemaja.vue'
import { ambilRemaja, hapusRemaja, type Remaja } from '@/modules/remaja/db'
import { formatTanggal, formatUmur, labelJk } from '@/lib/label'
import { useAuth } from '@/supabase/useAuth'

const { isAdmin } = useAuth()

const route = useRoute()
const router = useRouter()

const idRemaja = computed(() => {
  const v = route.params.id
  return typeof v === 'string' && /^\d+$/.test(v) ? Number(v) : null
})

const remaja = ref<Remaja | null>(null)
const sibuk = ref(true)
const pesanError = ref('')
const dlgHapus = ref<InstanceType<typeof ConfirmDialog>>()

// Modal ubah identitas remaja (konsolidasi form)
const ubahOpen = ref(false)

onMounted(muat)

async function muat() {
  sibuk.value = true
  pesanError.value = ''
  try {
    if (idRemaja.value == null) throw new Error('ID remaja tidak valid.')
    const r = await ambilRemaja(idRemaja.value)
    if (!r) {
      await router.replace('/remaja')
      return
    }
    remaja.value = r
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal memuat data remaja.'
  } finally {
    sibuk.value = false
  }
}

async function hapusAnak() {
  if (!remaja.value) return
  const ok = await dlgHapus.value?.buka(
    `Hapus ${remaja.value.nama}?`,
    'Hapus Remaja',
    { merah: true },
  )
  if (!ok) return
  try {
    await hapusRemaja(remaja.value.id)
    await router.replace('/remaja')
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus data.'
  }
}
</script>

<template>
  <div class="flex flex-col">
    <AppNavbar />

    <section class="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div v-if="sibuk" role="status" aria-label="Memuat…">
        <div class="flex items-center gap-3">
          <Skeleton class="size-12 rounded-xl" />
          <div class="space-y-2">
            <Skeleton class="h-6 w-56" />
            <Skeleton class="h-4 w-80 max-w-full" />
          </div>
        </div>

        <Card class="mt-8">
          <CardHeader>
            <Skeleton class="h-5 w-32" />
          </CardHeader>
          <CardContent class="flex flex-col gap-2">
            <Skeleton v-for="i in 6" :key="i" class="h-8 w-full" />
          </CardContent>
        </Card>
      </div>

      <template v-else-if="remaja">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="bg-primary/10 text-primary grid size-12 place-items-center rounded-xl">
              <Users class="size-6" />
            </span>
            <div>
              <h1 class="font-display text-2xl leading-tight sm:text-3xl">{{ remaja.nama }}</h1>
              <p class="text-muted-foreground mt-1 text-sm">
                {{ labelJk(remaja.jenis_kelamin) }} ·
                {{ formatUmur(remaja.tanggal_lahir) }} ·
                lahir {{ formatTanggal(remaja.tanggal_lahir) }}
              </p>
            </div>
          </div>
          <div v-if="isAdmin" class="flex items-center gap-2">
            <Button variant="outline" @click="ubahOpen = true">
              <Pencil class="size-4" />
              Ubah
            </Button>
            <Button variant="outline" class="text-red-600" @click="hapusAnak">
              <Trash2 class="size-4" />
              Hapus
            </Button>
          </div>
        </div>

        <p v-if="pesanError" class="mt-4 flex items-center gap-2 text-sm font-medium text-red-600" role="alert">
          <TriangleAlert class="size-4 shrink-0" />
          {{ pesanError }}
        </p>

        <Card class="mt-8">
          <CardHeader>
            <CardTitle class="font-display text-lg font-normal">Identitas</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col gap-3">
            <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <p class="text-muted-foreground text-xs font-bold uppercase">Nama</p>
                <p class="mt-0.5">{{ remaja.nama || '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs font-bold uppercase">Jenis kelamin</p>
                <p class="mt-0.5">{{ labelJk(remaja.jenis_kelamin) }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs font-bold uppercase">NIK</p>
                <p class="mt-0.5 break-all">{{ remaja.nik || '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs font-bold uppercase">Tempat lahir</p>
                <p class="mt-0.5">{{ remaja.tempat_lahir || '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs font-bold uppercase">Tanggal lahir</p>
                <p class="mt-0.5">{{ formatTanggal(remaja.tanggal_lahir) }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs font-bold uppercase">Anak ke</p>
                <p class="mt-0.5">{{ remaja.anak_ke || '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs font-bold uppercase">Nama orang tua</p>
                <p class="mt-0.5">{{ remaja.nama_orang_tua || '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs font-bold uppercase">NIK orang tua</p>
                <p class="mt-0.5 break-all">{{ remaja.nik_orang_tua || '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs font-bold uppercase">No. KK</p>
                <p class="mt-0.5 break-all">{{ remaja.nomor_kk || '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs font-bold uppercase">Nama sekolah</p>
                <p class="mt-0.5">{{ remaja.nama_sekolah || '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs font-bold uppercase">Dusun</p>
                <p class="mt-0.5">{{ remaja.dusun || '—' }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-muted-foreground text-xs font-bold uppercase">Alamat</p>
                <p class="mt-0.5">{{ remaja.alamat || '—' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <RouterLink to="/remaja" class="text-muted-foreground hover:text-foreground mt-8 inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft class="size-4" />
          Kembali ke daftar
        </RouterLink>
      </template>

      <p
        v-else-if="pesanError"
        class="mt-4 flex items-center gap-2 text-sm font-medium text-red-600"
        role="alert"
      >
        <TriangleAlert class="size-4 shrink-0" />
        {{ pesanError }}
      </p>
    </section>

    <AppFooter />

    <ConfirmDialog ref="dlgHapus" />
    <FormModalRemaja v-model:open="ubahOpen" :remaja="remaja" @tersimpan="muat" />
  </div>
</template>
