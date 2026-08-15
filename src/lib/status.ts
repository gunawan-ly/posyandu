export type ToneStatus = 'danger' | 'warning' | 'ok' | 'info'

export interface InfoStatus {
  kode: string
  label: string
  deskripsi: string
  tone: ToneStatus
}

export const DAFTAR_STATUS: Record<string, InfoStatus> = {
  SK: { kode: 'SK', label: 'Sangat Kurang', deskripsi: 'Berat badan sangat jauh di bawah standar seusianya', tone: 'danger' },
  K: { kode: 'K', label: 'Kurang', deskripsi: 'Berat badan di bawah standar seusianya', tone: 'warning' },
  N: { kode: 'N', label: 'Normal', deskripsi: 'Berat badan sesuai standar seusianya', tone: 'ok' },
  RBL: { kode: 'RBL', label: 'Risiko Berat Berlebih', deskripsi: 'Berat badan di atas standar seusianya', tone: 'warning' },
  SP: { kode: 'SP', label: 'Sangat Pendek', deskripsi: 'Tinggi badan sangat jauh di bawah standar seusianya', tone: 'danger' },
  P: { kode: 'P', label: 'Pendek', deskripsi: 'Tinggi badan di bawah standar seusianya', tone: 'warning' },
  T: { kode: 'T', label: 'Tinggi', deskripsi: 'Tinggi badan di atas standar seusianya', tone: 'ok' },
  GB: { kode: 'GB', label: 'Gizi Buruk', deskripsi: 'Proporsi berat terhadap tinggi sangat jauh di bawah standar', tone: 'danger' },
  GK: { kode: 'GK', label: 'Gizi Kurang', deskripsi: 'Proporsi berat terhadap tinggi di bawah standar', tone: 'warning' },
  GN: { kode: 'GN', label: 'Gizi Baik', deskripsi: 'Proporsi berat terhadap tinggi sesuai standar', tone: 'ok' },
  RGL: { kode: 'RGL', label: 'Risiko Gizi Lebih', deskripsi: 'Proporsi berat terhadap tinggi sedikit di atas standar', tone: 'warning' },
  GL: { kode: 'GL', label: 'Gizi Lebih', deskripsi: 'Proporsi berat terhadap tinggi di atas standar', tone: 'warning' },
  O: { kode: 'O', label: 'Obesitas', deskripsi: 'Proporsi berat terhadap tinggi jauh di atas standar', tone: 'danger' },
}

export function infoStatus(kode: string | null | undefined): InfoStatus {
  return (
    DAFTAR_STATUS[kode ?? ''] ?? {
      kode: kode || '_',
      label: 'Belum dihitung',
      deskripsi: 'Lengkapi data untuk melihat status.',
      tone: 'info',
    }
  )
}

// Pemetaan kode pendek → label Indonesia (sesuai data lama di database)
const LABEL_STATUS: Record<string, string> = {
  SK: 'Sangat Kurang',
  K: 'Kurang',
  N: 'Normal',
  RBL: 'Risiko Berat Berlebih',
  SP: 'Sangat Pendek',
  P: 'Pendek',
  T: 'Tinggi',
  GB: 'Gizi Buruk',
  GK: 'Gizi Kurang',
  GN: 'Gizi Baik',
  RGL: 'Risiko Gizi Lebih',
  GL: 'Gizi Lebih',
  O: 'Obesitas',
  MS: 'Mikrosefali',
  MK: 'Makrosefali',
}

export function labelStatus(kode: string): string {
  return LABEL_STATUS[kode] ?? kode
}

// Balik: label Indonesia (termasuk varian data lama) → kode pendek (badge tampilan)
const ALIAS_LABEL: Record<string, string> = {
  'Sangat Kurus': 'SK',
  'Sangat Kurang': 'SK',
  Kurus: 'K',
  Kurang: 'K',
  Normal: 'N',
  'Berat Berlebih': 'RBL',
  'Risiko Berat Badan Lebih': 'RBL',
  'Risiko Berat Lebih': 'RBL',
  'Risiko Berat Berlebih': 'RBL',
  'Sangat Pendek': 'SP',
  Pendek: 'P',
  Tinggi: 'T',
  'Sangat Buruk': 'GB',
  'Gizi Buruk': 'GB',
  'Gizi Kurang': 'GK',
  'Gizi Baik': 'GN',
  'Risiko Gizi Lebih': 'RGL',
  'Gizi Lebih': 'GL',
  Obesitas: 'O',
  Mikrosefali: 'MS',
  Makrosefali: 'MK',
}

export function kodeDariLabel(label: string | null | undefined): string {
  if (!label) return '_'
  return ALIAS_LABEL[label] ?? label
}

export const TONE_BADGE: Record<ToneStatus, string> = {
  danger: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  ok: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  info: 'bg-teal-100 text-teal-700 border-teal-200',
}

export const TONE_DOT: Record<ToneStatus, string> = {
  danger: '#dc2626',
  warning: '#d97706',
  ok: '#059669',
  info: '#0d9488',
}
