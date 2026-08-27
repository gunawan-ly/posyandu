// Logika murni Rekap Tahunan Bumil/Busui sesuai format resmi puskesmas:
// baris = 12 bulan, kolom = indikator (sasaran, kunjungan, hasil
// pemeriksaan, TTD, PMT KEK, kelas, vitamin A nifas, KB, edukasi, rujuk).
//
// Aturan hitung (konsisten dengan rekap Balita):
// - Nilai kosong/tak diisi tidak masuk hitungan kedua kolom pasangan.
// - Konsumsi TTD/PMT "Setiap Hari" dipetakan dari nilai tersimpan 'Ya',
//   "Tidak" dari 'Tidak' (label di lembar kerja mengikuti format resmi).
// - Bergejala TBC = memenuhi minimal 2 dari 3 gejala skrining (batuk
//   terus-menerus, demam >2 minggu, BB tidak naik 2 bulan); kontak TBC
//   bukan gejala sehingga tidak dihitung.
// - Kategori (Hamil vs Nifas/Menyusui) diambil dari KUNJUNGAN — sumber
//   kebenaran historis. Identitas memiliki kategori "saat ini" untuk tampilan
//   & statistik publik, tapi TIDAK dipakai rekap. Per bulan, kategori ibu
//   ditentukan dari kunjungan terakhir ibu tsb pada/atau sebelum akhir bulan.
// - Sasaran per bulan = ibu yang sudah punya kunjungan pada/atau sebelum
//   akhir bulan tsb (belum pernah kunjungan = belum masuk sasaran, mulai
//   dihitung sejak bulan kunjungan pertamanya).

export interface KunjunganRekap {
  bumil_id: number | null
  kategori: string | null
  tanggal_kunjungan: string | null
  berat_badan: number | null
  bb_sesuai_kurva_kia: string | null
  lingkaran_lengan_atas: number | null
  lila_hijau_merah: string | null
  tekanan_darah: string | null
  td_sesuai_kurva_kia: string | null
  batuk_terus_menerus: string | null
  demam_lebih_dua_minggu: string | null
  bb_tidak_naik_dua_bulan: string | null
  /** Riwayat kontak TBC tersimpan di kunjungan tapi BUKAN gejala — tidak masuk hitung bergejala. */
  kontak_tbc?: string | null
  dapat_tablet_ttd: string | null
  konsumsi_ttd: string | null
  mt_kek_diberikan: string | null
  konsumsi_mt_kek: string | null
  kelas_bumil: string | null
  vitamin_a: string | null
  kb_pasca_persalinan: string | null
  dapat_edukasi: string | null
  dirujuk: string | null
}

export interface BarisRekapBumil {
  bulan: number // 0–11
  // Sasaran & kehadiran per kategori
  sasaranHamil: number
  sasaranMenyusui: number
  datangHamil: number
  datangMenyusui: number
  tidakDatangHamil: number
  tidakDatangMenyusui: number
  // Hasil pengukuran/pemeriksaan
  bbHijau: number
  bbMerah: number
  lilaHijau: number
  lilaMerah: number
  tdHijau: number
  tdMerah: number
  bergejalaTbc: number
  // TTD
  ttdDapat: number
  ttdSetiapHari: number
  ttdTidak: number
  // PMT Bumil KEK
  pmtDapat: number
  pmtSetiapHari: number
  pmtTidak: number
  // Kelas bumil
  kelasYa: number
  kelasTidak: number
  // Vitamin A nifas
  vitAYa: number
  vitATidak: number
  // KB pasca persalinan
  kbYa: number
  kbTidak: number
  // Edukasi & rujukan
  edukasi: number
  rujukHamil: number
  rujukMenyusui: number
}

const GEJALA_SKRINING = ['batuk_terus_menerus', 'demam_lebih_dua_minggu', 'bb_tidak_naik_dua_bulan'] as const

function bulanDari(tanggal: string | null): number {
  if (!tanggal) return -1
  const d = new Date(tanggal)
  return Number.isNaN(d.getTime()) ? -1 : d.getMonth()
}

function adalahTahun(tanggal: string | null, tahun: number): boolean {
  if (!tanggal) return false
  const d = new Date(tanggal)
  return !Number.isNaN(d.getTime()) && d.getFullYear() === tahun
}

function kategoriMenyusui(kategori: string | null): boolean {
  return kategori === 'Menyusui' || kategori === 'Nifas'
}

function barisKosong(bulan: number): BarisRekapBumil {
  return {
    bulan,
    sasaranHamil: 0,
    sasaranMenyusui: 0,
    datangHamil: 0,
    datangMenyusui: 0,
    tidakDatangHamil: 0,
    tidakDatangMenyusui: 0,
    bbHijau: 0,
    bbMerah: 0,
    lilaHijau: 0,
    lilaMerah: 0,
    tdHijau: 0,
    tdMerah: 0,
    bergejalaTbc: 0,
    ttdDapat: 0,
    ttdSetiapHari: 0,
    ttdTidak: 0,
    pmtDapat: 0,
    pmtSetiapHari: 0,
    pmtTidak: 0,
    kelasYa: 0,
    kelasTidak: 0,
    vitAYa: 0,
    vitATidak: 0,
    kbYa: 0,
    kbTidak: 0,
    edukasi: 0,
    rujukHamil: 0,
    rujukMenyusui: 0,
  }
}

// Hitung rekap tahunan lengkap: 12 baris (Jan–Des) untuk tahun tertentu.
// Sumber kategori & sasaran sepenuhnya dari KUNJUNGAN (bukan identitas).
export function hitungRekapTahunan(
  kunjungan: KunjunganRekap[],
  tahun: number,
): BarisRekapBumil[] {
  const baris = Array.from({ length: 12 }, (_, i) => barisKosong(i))
  const akhirBulan = Array.from({ length: 12 }, (_, b) => new Date(tahun, b + 1, 0, 23, 59, 59).getTime())

  // Kunci ibu: urutkan kunjungan per bumil_id secara kronologis agar mudah
  // menentukan kunjungan terakhir sebelum/termasuk sebuah bulan.
  const perIbu = new Map<number, KunjunganRekap[]>()
  for (const k of kunjungan) {
    if (k.bumil_id == null) continue
    if (!adalahTahun(k.tanggal_kunjungan, tahun)) continue
    let daftar = perIbu.get(k.bumil_id)
    if (!daftar) {
      daftar = []
      perIbu.set(k.bumil_id, daftar)
    }
    daftar.push(k)
  }
  for (const daftar of perIbu.values()) {
    daftar.sort((a, b) => (a.tanggal_kunjungan ?? '').localeCompare(b.tanggal_kunjungan ?? ''))
  }

  // Fungsi kategori ibu pada bulan b: dari kunjungan terakhir <= akhir bulan b.
  // Ibu tanpa kunjungan pada/atau sebelum bulan b → null (bukan sasaran saat itu).
  function kategoriPadaBulan(id: number, b: number): string | null {
    const daftar = perIbu.get(id)
    if (!daftar || daftar.length === 0) return null
    let hasil: string | null = null
    for (const k of daftar) {
      const t = new Date(k.tanggal_kunjungan ?? '').getTime()
      if (Number.isNaN(t)) continue
      if (t <= akhirBulan[b]) hasil = k.kategori ?? null
      else break
    }
    return hasil
  }

  // Sasaran per bulan: ibu yang punya kunjungan sampai akhir bulan, dikelompokkan
  // per kategori sesuai kunjungan terakhirnya hingga bulan tsb.
  for (const b of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
    for (const id of perIbu.keys()) {
      const kategori = kategoriPadaBulan(id, b)
      if (kategori == null) continue
      if (kategoriMenyusui(kategori)) baris[b].sasaranMenyusui++
      else baris[b].sasaranHamil++
    }
  }

  // Set ibu unik yang datang per bulan per kategori (distinct bumil_id).
  const datangSet = Array.from({ length: 12 }, () => ({ hamil: new Set<number>(), menyusui: new Set<number>() }))

  for (const k of kunjungan) {
    if (!adalahTahun(k.tanggal_kunjungan, tahun)) continue
    const b = bulanDari(k.tanggal_kunjungan)
    if (b < 0 || b > 11) continue

    const menyusui = kategoriMenyusui(k.kategori ?? null)
    if (k.bumil_id != null) {
      ;(menyusui ? datangSet[b].menyusui : datangSet[b].hamil).add(k.bumil_id)
    }

    // Hasil pengukuran/pemeriksaan
    if (k.berat_badan != null) {
      if (k.bb_sesuai_kurva_kia === 'Sesuai') baris[b].bbHijau++
      else if (k.bb_sesuai_kurva_kia === 'Tidak Sesuai') baris[b].bbMerah++
    }
    if (k.lingkaran_lengan_atas != null) {
      if (k.lila_hijau_merah === 'Hijau') baris[b].lilaHijau++
      else if (k.lila_hijau_merah === 'Merah') baris[b].lilaMerah++
    }
    if (k.tekanan_darah) {
      if (k.td_sesuai_kurva_kia === 'Normal') baris[b].tdHijau++
      else if (k.td_sesuai_kurva_kia === 'Tinggi') baris[b].tdMerah++
    }
    const jumlahGejala = GEJALA_SKRINING.filter((g) => k[g] === 'Ya').length
    if (jumlahGejala >= 2) baris[b].bergejalaTbc++

    // TTD
    if (k.dapat_tablet_ttd === 'Ya') baris[b].ttdDapat++
    if (k.konsumsi_ttd === 'Ya') baris[b].ttdSetiapHari++
    else if (k.konsumsi_ttd === 'Tidak') baris[b].ttdTidak++

    // PMT Bumil KEK
    if (k.mt_kek_diberikan === 'Ya') baris[b].pmtDapat++
    if (k.konsumsi_mt_kek === 'Ya') baris[b].pmtSetiapHari++
    else if (k.konsumsi_mt_kek === 'Tidak') baris[b].pmtTidak++

    // Kelas bumil
    if (k.kelas_bumil === 'Ya') baris[b].kelasYa++
    else if (k.kelas_bumil === 'Tidak') baris[b].kelasTidak++

    // Vitamin A nifas & KB pasca persalinan
    if (k.vitamin_a === 'Ya') baris[b].vitAYa++
    else if (k.vitamin_a === 'Tidak') baris[b].vitATidak++
    if (k.kb_pasca_persalinan === 'Ya') baris[b].kbYa++
    else if (k.kb_pasca_persalinan === 'Tidak') baris[b].kbTidak++

    // Edukasi & rujukan (rujuk dibagi kategori kunjungan tsb)
    if (k.dapat_edukasi === 'Ya') baris[b].edukasi++
    if (k.dirujuk === 'Ya') {
      if (menyusui) baris[b].rujukMenyusui++
      else baris[b].rujukHamil++
    }
  }

  for (let b = 0; b < 12; b++) {
    baris[b].datangHamil = datangSet[b].hamil.size
    baris[b].datangMenyusui = datangSet[b].menyusui.size
    baris[b].tidakDatangHamil = Math.max(0, baris[b].sasaranHamil - baris[b].datangHamil)
    baris[b].tidakDatangMenyusui = Math.max(0, baris[b].sasaranMenyusui - baris[b].datangMenyusui)
  }

  return baris
}

// Total kolom satu indikator sepanjang tahun (untuk kolom Jumlah).
export function totalKolom(baris: BarisRekapBumil[], ambil: (b: BarisRekapBumil) => number): number {
  return baris.reduce((total, b) => total + ambil(b), 0)
}
