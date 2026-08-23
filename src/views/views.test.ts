// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { hitungSemuaStatus } from '@/lib/kalkulator'
import BalitaRekapView from '@/modules/balita/views/BalitaRekapView.vue'
import KalkulatorView from '@/views/KalkulatorView.vue'
import LandingView from '@/views/LandingView.vue'
import LoginView from '@/views/LoginView.vue'

vi.mock('@/modules/balita/db', () => ({
  listBalita: vi.fn().mockResolvedValue([]),
  listKunjunganPeriode: vi.fn().mockResolvedValue([]),
}))

// Tanpa Supabase saat test — seksi statistik landing memakai fallback tanpa fetch jaringan.
vi.mock('@/supabase/client', () => ({
  supabase: null,
  isSupabaseSiap: () => false,
  wajibSupabase: () => {
    throw new Error('Supabase belum dikonfigurasi.')
  },
}))

// State auth dapat diatur per-test lewat ref-like object ini.
const stateAuth = { value: false }
vi.mock('@/supabase/useAuth', () => ({
  useAuth: () => ({
    // Bentuk computed-like: komponen membaca `.value`.
    isAutentikasi: stateAuth,
    inisialisasi: vi.fn().mockResolvedValue(undefined),
    masuk: vi.fn().mockResolvedValue(undefined),
  }),
}))

// Stub RouterLink yang tetap merender isi slot + meneruskan `to` sebagai href
// agar tujuan navigasi dapat dites.
const OPSI_MOUNT = {
  global: {
    stubs: {
      RouterLink: {
        props: ['to'],
        template: '<a :href="typeof to === \'string\' ? to : (to?.path ?? \'#\')"><slot /></a>',
      },
      RouterView: true,
    },
  },
}

const dorong = vi.fn().mockResolvedValue(undefined)
vi.mock('vue-router', async (importOriginal) => {
  const asli = await importOriginal<typeof import('vue-router')>()
  return { ...asli, useRouter: () => ({ push: dorong }) }
})

describe('render komponen utama', () => {
  it('LandingView ter-render tanpa error', () => {
    const wrapper = mount(LandingView, {
      global: { stubs: { RouterLink: true, RouterView: true } },
    })
    expect(wrapper.text()).toContain('Posyandu')
    expect(wrapper.text()).toContain('Posyandu Wapalo')
  })

  it('Landing hero memuat tombol Masuk & navigasi 4 modul posyandu', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(LandingView, OPSI_MOUNT)
      // Tombol utama Masuk.
      expect(wrapper.text()).toContain('Masuk')
      // Empat modul navigasi.
      for (const nama of ['Bumil & Busui', 'Bayi & Balita', 'Remaja', 'Dewasa & Lansia']) {
        expect(wrapper.text()).toContain(nama)
      }
      // Teks lama sudah tidak ada di landing.
      expect(wrapper.text()).not.toContain('Coba Kalkulator Status Gizi')
      expect(wrapper.text()).not.toContain('Mulai Sekarang')

      // Klik modul terkunci → pesan pengingat muncul, lalu hilang setelah 3 detik.
      const kunci = wrapper.findAll('button').find((b) => b.text().includes('Remaja'))
      expect(kunci).toBeDefined()
      await kunci!.trigger('click')
      expect(wrapper.text()).toContain('masih dalam tahap pengembangan')
      vi.advanceTimersByTime(3100)
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).not.toContain('masih dalam tahap pengembangan')
    } finally {
      vi.useRealTimers()
    }
  })

  it('Tombol Masuk: sudah login → dashboard, belum → halaman login', async () => {
    // Belum login → tautan mengarah ke /login.
    stateAuth.value = false
    let wrapper = mount(LandingView, OPSI_MOUNT)
    await flushPromises()
    let tautan = wrapper.findAll('a').find((a) => a.text().trim() === 'Masuk')
    expect(tautan).toBeDefined()
    expect(tautan!.attributes('href')).toBe('/login')

    // Sudah login → tautan mengarah ke /dashboard.
    stateAuth.value = true
    wrapper = mount(LandingView, OPSI_MOUNT)
    await flushPromises()
    tautan = wrapper.findAll('a').find((a) => a.text().trim() === 'Masuk')
    expect(tautan).toBeDefined()
    expect(tautan!.attributes('href')).toBe('/dashboard')
    stateAuth.value = false
  })

  it('KalkulatorView ter-render tanpa error dan menghitung hasil secara live', async () => {
    const wrapper = mount(KalkulatorView, OPSI_MOUNT)
    expect(wrapper.text()).toContain('Hitung status gizi anak Anda')

    const vm = wrapper.vm as unknown as {
      jk: string
      tanggalLahir: string
      tanggalPengukuran: string
      beratBadan: number | null
      panjangBadan: number | null
      hasil: ReturnType<typeof hitungSemuaStatus> | null
    }
    vm.jk = 'L'
    vm.tanggalLahir = '2024-08-14'
    vm.tanggalPengukuran = '2025-08-14'
    vm.beratBadan = 9.6
    vm.panjangBadan = 75
    await wrapper.vm.$nextTick()

    expect(vm.hasil).not.toBeNull()
    expect(vm.hasil?.status_bb_u).toBe('N')
    expect(wrapper.text()).toContain('Umur 12 bulan')
  })

  it('BalitaRekapView ter-render tanpa error dan menampilkan state kosong', async () => {
    const wrapper = mount(BalitaRekapView, OPSI_MOUNT)
    expect(wrapper.text()).toContain('Rekap Bulanan Balita')
    await flushPromises()
    expect(wrapper.text()).toContain('Belum ada kunjungan di periode ini')
  })

  it('LoginView hanya menyediakan mode masuk (tanpa pendaftaran)', async () => {
    const wrapper = mount(LoginView, OPSI_MOUNT)
    await flushPromises()

    // Elemen masuk ada.
    expect(wrapper.text()).toContain('Masuk akun kader')
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('input#kata-sandi').exists()).toBe(true)

    // Pendaftaran tidak tersedia.
    expect(wrapper.text()).not.toContain('Daftar akun kader')
    expect(wrapper.text()).not.toContain('Buat akun')
    expect(wrapper.text()).toContain('pendaftaran mandiri tidak tersedia')
  })
})
