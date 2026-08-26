<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { useStatistikPublik } from '@/composables/useStatistikPublik'
import { balitaPerluPerhatian, type KunjunganTerakhir } from '@/modules/balita/db'
import { useAuth } from '@/supabase/useAuth'
import DashboardHero from '@/views/dashboard/DashboardHero.vue'
import DashboardStatistik from '@/views/dashboard/DashboardStatistik.vue'
import DashboardLayanan from '@/views/dashboard/DashboardLayanan.vue'
import DashboardPerhatian from '@/views/dashboard/DashboardPerhatian.vue'
import DashboardPrivasi from '@/views/dashboard/DashboardPrivasi.vue'

const { isAutentikasi, inisialisasi } = useAuth()
const {
  statistik,
  statistikLoading,
  statistikError,
  labelBulanIni,
  KARTU_STATISTIK,
  muat: muatStatistik,
} = useStatistikPublik()

const perluPerhatian = ref<KunjunganTerakhir[]>([])
const muatPerhatianLoading = ref(false)
const muatPerhatianError = ref('')

async function muatPerluPerhatian() {
  muatPerhatianError.value = ''
  muatPerhatianLoading.value = true
  try {
    perluPerhatian.value = await balitaPerluPerhatian()
  } catch (e) {
    muatPerhatianError.value = e instanceof Error ? e.message : 'Gagal memuat data.'
  } finally {
    muatPerhatianLoading.value = false
  }
}

onMounted(async () => {
  await inisialisasi()
  await muatStatistik()
  if (isAutentikasi.value) await muatPerluPerhatian()
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />

    <!-- Latar gradasi lembut (blob) agar efek kartu kaca terlihat -->
    <div class="glass-backdrop" aria-hidden="true">
      <div class="glass-blob-1 anim-glass-drift" />
      <div class="glass-blob-2 anim-glass-drift" />
      <div class="glass-blob-3" />
    </div>

    <main id="konten-utama" class="w-full">
      <DashboardHero />

      <DashboardStatistik
        :statistik="statistik"
        :statistik-loading="statistikLoading"
        :statistik-error="statistikError"
        :label-bulan-ini="labelBulanIni"
        :kartu-statistik="KARTU_STATISTIK"

      />

      <DashboardLayanan />

      <DashboardPerhatian
        v-if="isAutentikasi"
        :daftar="perluPerhatian"
        :loading="muatPerhatianLoading"
        :error="muatPerhatianError"
      />

      <DashboardPrivasi />
    </main>

    <AppFooter />
  </div>
</template>
