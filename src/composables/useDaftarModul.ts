import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { bacaViewModul, simpanViewModul } from '@/lib/viewModul'

export function useDaftarModul<T extends { id: number }>(opts: {
  kunciView: string
  muat: (cari: string) => Promise<T[]>
  hapus: (id: number) => Promise<void>
  namaItem: string
}) {
  const daftar = ref<T[]>([])
  const cari = ref('')
  const sibuk = ref(true)
  const pesanError = ref('')
  const modalTambah = ref(false)
  const modalUbahOpen = ref(false)
  const modalUbahData = ref<T | null>(null)

  const modeView = ref<'grid' | 'tabel'>(bacaViewModul(opts.kunciView))
  let timerCari: ReturnType<typeof setTimeout> | undefined

  function bukaUbah(item: T) {
    modalUbahData.value = item
    modalUbahOpen.value = true
  }

  function tutupUbah() {
    modalUbahOpen.value = false
    modalUbahData.value = null
  }

  watch(modeView, (v) => {
    simpanViewModul(opts.kunciView, v)
  })

  onMounted(async () => {
    await muat()
  })

  watch(cari, () => {
    if (timerCari) clearTimeout(timerCari)
    timerCari = setTimeout(() => void muat(), 300)
  })

  onBeforeUnmount(() => {
    if (timerCari) clearTimeout(timerCari)
  })

  function bersihkanCari() {
    cari.value = ''
  }

  async function muat() {
    sibuk.value = true
    pesanError.value = ''
    try {
      daftar.value = await opts.muat(cari.value)
    } catch (e) {
      pesanError.value = e instanceof Error ? e.message : `Gagal memuat data ${opts.namaItem}.`
    } finally {
      sibuk.value = false
    }
  }

  async function hapusItem(item: T) {
    try {
      await opts.hapus(item.id)
      await muat()
    } catch (e) {
      pesanError.value = e instanceof Error ? e.message : 'Gagal menghapus data.'
    }
  }

  return {
    daftar,
    cari,
    sibuk,
    pesanError,
    modalTambah,
    modalUbahOpen,
    modalUbahData,
    modeView,
    bukaUbah,
    tutupUbah,
    bersihkanCari,
    muat,
    hapusItem,
  }
}
