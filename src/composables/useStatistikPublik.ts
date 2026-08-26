import { computed, ref } from 'vue'
import { supabase } from '@/supabase/client'
import { labelBulan } from '@/lib/label'

export interface StatistikPublik {
  balita_bayi: number
  balita_balita: number
  apras_total: number
  bumil_hamil: number
  bumil_menyusui: number
  kunjungan_balita_bulan_ini: number
  kunjungan_apras_bulan_ini: number
  kunjungan_bumil_bulan_ini: number
  kunjungan_bulan_ini: number
  bulan_ini: string
}

export interface KartuStatistik {
  label: string
  nilai: number | null
  akhiran: string
  keterangan: string
  key: string
}

export function useStatistikPublik() {
  const statistik = ref<StatistikPublik | null>(null)
  const statistikLoading = ref(true)
  const statistikError = ref(false)

  const labelBulanIni = computed(() =>
    statistik.value
      ? labelBulan(statistik.value.bulan_ini)
      : labelBulan(new Date().toISOString().slice(0, 7)),
  )

  const SASARAN = computed<KartuStatistik[]>(() => {
    const s = statistik.value
    return [
      {
        label: 'Bayi',
        nilai: s?.balita_bayi ?? null,
        akhiran: 'anak',
        keterangan: 'sasaran 0–11 bulan',
        key: 'bayi',
      },
      {
        label: 'Balita',
        nilai: s?.balita_balita ?? null,
        akhiran: 'anak',
        keterangan: 'sasaran 12–60 bulan',
        key: 'balita',
      },
      {
        label: 'Apras',
        nilai: s?.apras_total ?? null,
        akhiran: 'anak',
        keterangan: 'sasaran 5–6 tahun',
        key: 'apras',
      },
      {
        label: 'Ibu Hamil',
        nilai: s?.bumil_hamil ?? null,
        akhiran: 'ibu',
        keterangan: 'sasaran ibu hamil',
        key: 'bumil',
      },
      {
        label: 'Ibu Menyusui',
        nilai: s?.bumil_menyusui ?? null,
        akhiran: 'ibu',
        keterangan: 'sasaran ibu menyusui',
        key: 'busui',
      },
    ]
  })

  const KUNJUNGAN = computed<KartuStatistik[]>(() => {
    const s = statistik.value
    const totalBalita = s ? s.balita_bayi + s.balita_balita : 0
    const totalBumil = s ? s.bumil_hamil + s.bumil_menyusui : 0
    const persen = (kunjungan: number, sasaran: number): number =>
      sasaran > 0 ? Math.round((kunjungan / sasaran) * 1000) / 10 : 0
    return [
      {
        label: 'Kunjungan Balita',
        nilai: s ? persen(s.kunjungan_balita_bulan_ini, totalBalita) : null,
        akhiran: '%',
        keterangan: s ? `bulan ini dari ${totalBalita} sasaran` : '–',
        key: 'kunj-balita',
      },
      {
        label: 'Kunjungan Apras',
        nilai: s ? persen(s.kunjungan_apras_bulan_ini, s.apras_total) : null,
        akhiran: '%',
        keterangan: s ? `bulan ini dari ${s.apras_total} sasaran` : '–',
        key: 'kunj-apras',
      },
      {
        label: 'Kunjungan Bumil/Menyusui',
        nilai: s ? persen(s.kunjungan_bumil_bulan_ini, totalBumil) : null,
        akhiran: '%',
        keterangan: s ? `bulan ini dari ${totalBumil} sasaran` : '–',
        key: 'kunj-bumil',
      },
    ]
  })

  /** @deprecated Gunakan SASARAN + KUNJUNGAN untuk layout baru berkolom. */
  const KARTU_STATISTIK = computed(() => [...SASARAN.value, ...KUNJUNGAN.value])

  async function muat() {
    statistikLoading.value = true
    if (!supabase) {
      statistikError.value = true
      statistikLoading.value = false
      return
    }
    try {
      const { data, error } = await supabase.rpc('statistik_publik')
      if (error) throw error
      statistik.value = data as StatistikPublik
    } catch {
      statistikError.value = true
    } finally {
      statistikLoading.value = false
    }
  }

  return { statistik, statistikLoading, statistikError, labelBulanIni, SASARAN, KUNJUNGAN, KARTU_STATISTIK, muat }
}
