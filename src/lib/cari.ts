// Escape karakter khusus pola ILIKE Postgres agar masukan kader dicari
// apa adanya — tanpa ini, mengetik "%" cocokkan seluruh data.
export function escapeIlike(kata: string): string {
  return kata.replace(/([\\%_])/g, '\\$1')
}
