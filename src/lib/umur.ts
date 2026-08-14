// Parsing tanggal input (YYYY-MM-DD) sebagai waktu lokal, menghindari
// pergeseran zona waktu saat new Date() diinterpretasikan sebagai UTC.
export function parseTanggal(teks: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(teks)
  if (!m) return null
  const [, y, mo, d] = m
  return new Date(Number(y), Number(mo) - 1, Number(d))
}

// Replikasi hitung_umur_bulan dari flask_app.py (umur kalender).
export function hitungUmurBulan(tanggalLahir: Date, waktuKunjungan: Date): number {
  const tahun = waktuKunjungan.getFullYear() - tanggalLahir.getFullYear()
  const bulan = waktuKunjungan.getMonth() - tanggalLahir.getMonth()
  let total = tahun * 12 + bulan
  if (waktuKunjungan.getDate() < tanggalLahir.getDate()) {
    total -= 1
  }
  return Math.max(0, total)
}
