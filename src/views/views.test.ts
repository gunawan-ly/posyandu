// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { hitungSemuaStatus } from '@/lib/kalkulator'
import KalkulatorView from '@/views/KalkulatorView.vue'
import LandingView from '@/views/LandingView.vue'

describe('render komponen utama', () => {
  it('LandingView ter-render tanpa error', () => {
    const wrapper = mount(LandingView, {
      global: { stubs: { RouterLink: true, RouterView: true } },
    })
    expect(wrapper.text()).toContain('Posyandu')
    expect(wrapper.text()).toContain('PosyanduGizi')
  })

  it('KalkulatorView ter-render tanpa error dan menghitung hasil', async () => {
    const wrapper = mount(KalkulatorView, {
      global: { stubs: { RouterLink: true, RouterView: true } },
    })
    expect(wrapper.text()).toContain('Hitung status gizi anak Anda')

    const vm = wrapper.vm as unknown as {
      jk: string
      tanggalLahir: string
      tanggalPengukuran: string
      beratBadan: number | null
      panjangBadan: number | null
      hitung: () => void
      hasil: ReturnType<typeof hitungSemuaStatus> | null
    }
    vm.jk = 'L'
    vm.tanggalLahir = '2024-08-14'
    vm.tanggalPengukuran = '2025-08-14'
    vm.beratBadan = 9.6
    vm.panjangBadan = 75
    vm.hitung()
    await wrapper.vm.$nextTick()

    expect(vm.hasil).not.toBeNull()
    expect(vm.hasil?.status_bb_u).toBe('N')
    expect(wrapper.text()).toContain('Umur 12 bulan')
  })
})
