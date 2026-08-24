// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { hitungSemuaStatus } from '@/lib/kalkulator'
import { aprasRoutes } from '@/modules/apras/routes'
import AprasListView from '@/modules/apras/views/AprasListView.vue'
import BalitaRekapView from '@/modules/balita/views/BalitaRekapView.vue'
import { remajaRoutes } from '@/modules/remaja/routes'
import RemajaListView from '@/modules/remaja/views/RemajaListView.vue'
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

  it('Landing hero memuat tombol Masuk & navigasi modul posyandu', async () => {
    const wrapper = mount(LandingView, OPSI_MOUNT)
    // Tombol utama Masuk.
    expect(wrapper.text()).toContain('Masuk')
    // Lima modul navigasi.
    for (const nama of [
      'Bumil & Busui',
      'Bayi & Balita',
      'Apras',
      'Remaja',
      'Dewasa & Lansia',
    ]) {
      expect(wrapper.text()).toContain(nama)
    }
    // Teks lama sudah tidak ada di landing.
    expect(wrapper.text()).not.toContain('Coba Kalkulator Status Gizi')
    expect(wrapper.text()).not.toContain('Mulai Sekarang')

    // Tidak ada lagi pesan pengingat modul terkunci.
    expect(wrapper.text()).not.toContain('masih dalam tahap pengembangan')
  })

  it('Rute /apras terdaftar dan memuat placeholder Modul Apras', async () => {
    // Meta guard rute: daftar butuh login, tambah data butuh admin.
    const ruteDaftar = aprasRoutes.find((r) => r.path === '/apras')
    const ruteBaru = aprasRoutes.find((r) => r.path === '/apras/baru')
    expect(ruteDaftar?.name).toBe('apras')
    expect(ruteDaftar?.meta).toMatchObject({ requiresAuth: true })
    expect(ruteBaru?.meta).toMatchObject({ requiresAuth: true, requiresAdmin: true })

    // Halaman placeholder menampilkan keterangan sasaran.
    const wrapper = mount(AprasListView, OPSI_MOUNT)
    await flushPromises()
    expect(wrapper.text()).toContain('Modul Apras')
    expect(wrapper.text()).toContain('Anak Pra Sekolah')
    expect(wrapper.text()).toContain('sedang disiapkan')
  })

  it('Rute /remaja terdaftar dan memuat placeholder Modul Remaja', async () => {
    // Meta guard rute: daftar butuh login, tambah data butuh admin.
    const ruteDaftar = remajaRoutes.find((r) => r.path === '/remaja')
    const ruteBaru = remajaRoutes.find((r) => r.path === '/remaja/baru')
    expect(ruteDaftar?.name).toBe('remaja')
    expect(ruteDaftar?.meta).toMatchObject({ requiresAuth: true })
    expect(ruteBaru?.meta).toMatchObject({ requiresAuth: true, requiresAdmin: true })

    // Halaman placeholder menampilkan keterangan sasaran.
    const wrapper = mount(RemajaListView, OPSI_MOUNT)
    await flushPromises()
    expect(wrapper.text()).toContain('Modul Remaja')
    expect(wrapper.text()).toContain('Usia Sekolah & Remaja')
    expect(wrapper.text()).toContain('tumbuh kembang dan kesehatan remaja')
  })

  it('Navigasi modul: Apras & Remaja aktif, Dewasa & Lansia tetap terkunci dengan gembok', () => {
    const wrapper = mount(LandingView, OPSI_MOUNT)

    // Tautan aktif menuju /apras dan /remaja tersedia di landing.
    for (const [href, nama] of [
      ['/apras', 'Apras'],
      ['/remaja', 'Remaja'],
    ] as const) {
      const tautan = wrapper.findAll('a').find((a) => a.attributes('href') === href)
      expect(tautan).toBeDefined()
      expect(tautan!.text()).toContain(nama)

      // Tombol modul dibungkus tautan aktif ke rutenya.
      const tombol = wrapper.findAll('button').find((b) => b.text().includes(nama))
      expect(tombol).toBeDefined()
      expect(tombol!.element.closest('a')?.getAttribute('href')).toBe(href)
    }

    // Dewasa & Lansia masih terkunci: tombol tanpa tautan, tetap memakai ikon gembok.
    const tombolLansia = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Dewasa & Lansia'))
    expect(tombolLansia).toBeDefined()
    expect(tombolLansia!.element.closest('a')).toBeNull()
    expect(tombolLansia!.find('svg.lucide-lock').exists()).toBe(true)
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
