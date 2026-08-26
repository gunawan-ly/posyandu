import { parseTanggal } from '@/lib/umur'

// Tampilkan nilai Ya/Tidak secara konsisten (data lama memakai Y/T).
export function labelYaTidak(nilai: string | null | undefined): string {
  if (nilai == null || nilai === '') return '—'
  if (nilai === 'Y') return 'Ya'
  if (nilai === 'T') return 'Tidak'
  return nilai
}

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export function labelBulan(ym: string): string {
  const [y, m] = ym.split('-')
  const idx = Number(m) - 1
  return idx >= 0 && idx < 12 ? `${NAMA_BULAN[idx]} ${y}` : ym
}

export function formatUmur(tanggalLahir: string | null): string {
  if (!tanggalLahir) return '—'
  const d = parseTanggal(tanggalLahir)
  if (!d) return '—'
  const now = new Date()
  let bln = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
  if (now.getDate() < d.getDate()) bln--
  if (bln < 0) bln = 0
  const tahun = Math.floor(bln / 12)
  const sisa = bln % 12
  if (tahun === 0) return `${sisa} bulan`
  if (sisa === 0) return `${tahun} tahun`
  return `${tahun} th ${sisa} bln`
}

export function formatTanggal(tgl: string | null): string {
  if (!tgl) return '—'
  const d = parseTanggal(tgl)
  if (!d) return '—'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function labelJk(jk: string | null): string {
  return jk === 'Perempuan' ? 'Perempuan' : jk === 'Laki - Laki' ? 'Laki-laki' : '—'
}
