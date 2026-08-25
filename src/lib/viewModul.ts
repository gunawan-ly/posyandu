// Akses localStorage yang aman: bila storage tidak tersedia (test environment,
// private mode, dsb.) kembalikan null tanpa melempar error.
export function bacaViewModul(kunci: string): 'grid' | 'tabel' {
  try {
    const v = localStorage.getItem(kunci)
    return v === 'tabel' ? 'tabel' : 'grid'
  } catch {
    return 'grid'
  }
}

export function simpanViewModul(kunci: string, nilai: 'grid' | 'tabel'): void {
  try {
    localStorage.setItem(kunci, nilai)
  } catch {
    // abaikan: tanpa storage, pilihan tidak diingat (fallback ke default grid)
  }
}
