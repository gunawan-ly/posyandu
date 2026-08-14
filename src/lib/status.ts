export type ToneStatus = 'danger' | 'warning' | 'ok' | 'info'

export interface InfoStatus {
  kode: string
  label: string
  deskripsi: string
  tone: ToneStatus
}

export const DAFTAR_STATUS: Record<string, InfoStatus> = {
  SK: { kode: 'SK', label: 'Sangat Kurus', deskripsi: 'Berat badan sangat jauh di bawah standar seusianya', tone: 'danger' },
  K: { kode: 'K', label: 'Kurus', deskripsi: 'Berat badan di bawah standar seusianya', tone: 'warning' },
  N: { kode: 'N', label: 'Normal', deskripsi: 'Berat badan sesuai standar seusianya', tone: 'ok' },
  RBL: { kode: 'RBL', label: 'Risiko Berat Lebih', deskripsi: 'Berat badan di atas standar seusianya', tone: 'warning' },
  SP: { kode: 'SP', label: 'Sangat Pendek', deskripsi: 'Tinggi badan sangat jauh di bawah standar seusianya', tone: 'danger' },
  P: { kode: 'P', label: 'Pendek', deskripsi: 'Tinggi badan di bawah standar seusianya', tone: 'warning' },
  T: { kode: 'T', label: 'Tinggi', deskripsi: 'Tinggi badan di atas standar seusianya', tone: 'ok' },
  GK: { kode: 'GK', label: 'Gizi Kurang', deskripsi: 'Proporsi berat terhadap tinggi di bawah standar', tone: 'danger' },
  GB: { kode: 'GB', label: 'Gizi Baik', deskripsi: 'Proporsi berat terhadap tinggi sesuai standar', tone: 'ok' },
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
