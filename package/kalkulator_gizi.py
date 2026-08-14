import os
import math

import pandas as pd

# Folder data WHO ditulis "refrences" (bukan "references")
REF_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'refrences')


def hitung_z_score_lms(nilai_aktual, l, m, s):
    # Menghitung Z-score menggunakan metode LMS dari WHO
    if l == 0:
        return math.log(nilai_aktual / m) / s
    return (((nilai_aktual / m) ** l) - 1) / (l * s)


def get_file_path(indikator, jk, umur_bulan):
    # Menentukan nama file CSV berdasarkan indikator, jenis kelamin, dan umur
    # Indikator: 'bbu' (Berat/Umur), 'tbu' (Tinggi/Umur), 'bbtb' (Berat/Tinggi)
    if jk == 'L':
        jenis = 'boys'
    elif jk == 'P':
        jenis = 'girls'
    else:
        return None

    if indikator == 'bbu':
        # wfa = Weight for Age; cakupan umur 0-60 bulan
        return f'wfa_{jenis}_0_5_years.csv'
    elif indikator == 'tbu':
        # lhfa = Length/Height for age
        # umur < 24 bulan pakai tabel 2 tahun, umur >= 24 pakai tabel 5 tahun
        nama = '2_years' if umur_bulan < 24 else '5_years'
        return f'lhfa_{jenis}_{nama}.csv'
    elif indikator == 'bbtb':
        # umur < 24 bulan pakai Panjang Badan (Length - wfl)
        # umur >= 24 bulan pakai Tinggi Badan (Height - wfh)
        if umur_bulan < 24:
            return f'wfl_{jenis}_2_years.csv'
        return f'wfh_{jenis}_5_years.csv'
    return None


def baca_csv(nama_file):
    file_path = os.path.join(REF_DIR, nama_file)
    try:
        df = pd.read_csv(file_path)
        # Bersihkan spasi ekor pada nama kolom (mis. "M       " pada CSV lhfa)
        df.columns = [str(kolom).strip() for kolom in df.columns]
        return df
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return None


def klasifikasi_bb_u(z):
    # BB/U: SK (<-3), K (-3 s/d <-2), N (-2 s/d +1), RBL (>+1)
    if z < -3.0:
        return 'SK'
    if z < -2.0:
        return 'K'
    if z <= 1.0:
        return 'N'
    return 'RBL'


def klasifikasi_tb_u(z):
    # TB/U: SP (<-3), P (-3 s/d <-2), N (-2 s/d +1), T (>+1)
    if z < -3.0:
        return 'SP'
    if z < -2.0:
        return 'P'
    if z <= 1.0:
        return 'N'
    return 'T'


def klasifikasi_bb_tb(z):
    # BB/TB: GK (<-2), GB (-2 s/d +1), GL (>+1 s/d +3), O (>+3)
    if z < -2.0:
        return 'GK'
    if z <= 1.0:
        return 'GB'
    if z <= 3.0:
        return 'GL'
    return 'O'


def hitung_semua_status(jk, umur_bulan, berat_badan, panjang_badan):
    # Fungsi utama yang dipanggil oleh Flask untuk menghitung ketiga indikator
    hasil = {
        'status_bb_u': '_',
        'status_tb_u': '_',
        'status_bb_tb': '_',
        'z_bb_u': None,
        'z_tb_u': None,
        'z_bb_tb': None,
        'error': None,
    }

    # Pastikan data lengkap
    if not berat_badan or not panjang_badan:
        hasil['error'] = 'Data tidak lengkap'
        return hasil

    # 1. HITUNG BB/U (Berat Badan / Umur) — tabel wfa
    df_bbu = baca_csv(get_file_path('bbu', jk, umur_bulan))
    if df_bbu is not None:
        data_bbu = df_bbu[df_bbu['Month'] == umur_bulan]
        if not data_bbu.empty:
            L, M, S = data_bbu[['L', 'M', 'S']].values[0]
            z_bbu = hitung_z_score_lms(berat_badan, L, M, S)
            hasil['z_bb_u'] = round(float(z_bbu), 2)
            hasil['status_bb_u'] = klasifikasi_bb_u(z_bbu)
        else:
            hasil['error'] = f'Tidak ada data BB/U untuk umur {umur_bulan} bulan'
    else:
        hasil['error'] = hasil['error'] or 'Gagal membaca tabel BB/U'

    # 2. HITUNG PB/TB/U (Panjang/Tinggi Badan / Umur) — tabel lhfa
    df_tbu = baca_csv(get_file_path('tbu', jk, umur_bulan))
    if df_tbu is not None:
        data_tbu = df_tbu[df_tbu['Month'] == umur_bulan]
        if not data_tbu.empty:
            L, M, S = data_tbu[['L', 'M', 'S']].values[0]
            z_tbu = hitung_z_score_lms(panjang_badan, L, M, S)
            hasil['z_tb_u'] = round(float(z_tbu), 2)
            hasil['status_tb_u'] = klasifikasi_tb_u(z_tbu)
        else:
            hasil['error'] = hasil['error'] or f'Tidak ada data TB/U untuk umur {umur_bulan} bulan'
    else:
        hasil['error'] = hasil['error'] or 'Gagal membaca tabel TB/U'

    # 3. HITUNG BB/PB atau BB/TB
    # Indikator ini mencari baris berdasarkan panjang/tinggi badan, bukan umur!
    df_bbtb = baca_csv(get_file_path('bbtb', jk, umur_bulan))
    if df_bbtb is not None:
        kolom_cari = 'Length' if umur_bulan < 24 else 'Height'
        index_terdekat = (df_bbtb[kolom_cari] - panjang_badan).abs().idxmin()
        L, M, S = df_bbtb.loc[[index_terdekat], ['L', 'M', 'S']].values[0]
        z_bbtb = hitung_z_score_lms(berat_badan, L, M, S)
        hasil['z_bb_tb'] = round(float(z_bbtb), 2)
        hasil['status_bb_tb'] = klasifikasi_bb_tb(z_bbtb)
    else:
        hasil['error'] = hasil['error'] or 'Gagal membaca tabel BB/TB'

    return hasil
