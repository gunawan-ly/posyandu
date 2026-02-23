import pandas as pd
import os
import math

def hitung_z_score_lms(nilai_aktual, l, m, s):
    # Menghitung Z-score menggunakan metode LMS dari WHO
    if l == 0:
        return math.log(nilai_aktual / m) / s
    else:
        return (((nilai_aktual / m)**l) - 1) / (l * s)

def get_file_path(indikator, jk, umur_bulan):
    # Menentukan nama file CSV berdasarkan indikator, jenis kelamin, dan umur
    # Indikator: 'bbu' (Berat/Umur), 'tbu' (Tinggi/Umur), 'bbtb' (Berat/Tinggi)
    if indikator == 'bbu':
        if jk == 'L': return 'wfa_boys_0_5_years.csv'
        elif jk == 'P': return 'wfa_girls_0_5_years.csv'
    elif indikator == 'tbu':
        # lhfa = Length/Height for age
        if jk == 'L': return 'lhfa_boys_5_years.csv'
        elif jk == 'P': return 'lhfa_girls_5_years.csv'
    elif indikator == 'bbtb':
        # Jika umur < 24 Bulan, pakai tabel Panjang Badan (Length - wfl)
        # Jika umur >= 24 Bulan, pakai tabel Tinggi Badan (Height - wfh)
        if jk == 'L':
            return 'wfl_boys_2_years.csv' if umur_bulan < 24 else 'wfh_boys_5_years.csv'
        elif jk == 'P':
            return 'wfl_girls_2_years.csv' if umur_bulan < 24 else 'wfh_girls_5_years.csv'
    return None

def baca_csv(nama_file):
    file_path = os.path.join('references', nama_file)
    try:
        return pd.read_csv(file_path)
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return None
    
def hitung_semua_status(jk, umur_bulan, berat_badan, panjang_badan):
    # Fungsi utama yang akan dipanggil oleh Flask untuk menghitung ketiga indikator
    hasil = {
        'status_bb_u': '_',
        'status_tb_u': '_',
        'status_bb_tb': '_',
        'error': None
    }

    # Pastikan data lengkap
    if not berat_badan or not panjang_badan:
        hasil['error'] = 'Data tidak lengkap'
        return hasil
    
    # 1. HITUNG BB/U (Berat Badan / Umur)
    df_bbu = baca_csv(get_file_path('tbu', jk, umur_bulan))
    if df_bbu is not None:
        data_bbu = df_bbu[df_bbu['Month'] == umur_bulan]
        if not data_bbu.empty:
            L, M, S = data_bbu['L'].values[0], data_bbu['M'].values[0], data_bbu['S'].values[0]
            z_bbu = hitung_z_score_lms(berat_badan, L, M, S)

            if z_bbu < -3.0:
                hasil['status_bb_u'] = "SK"
            elif -3.0 <= z_bbu < -2.0:
                hasil['status_bb_u'] = "K"
            elif -2.0 <= z_bbu <= 1.0:
                hasil['status_bb_u'] = "N"
            else:
                hasil['status_bb_u'] = "RBL"

    
    # 2. HITUNG PB/TB/U (Tinggi Badan / Umur)
    df_tbu = baca_csv(get_file_path('tbu', jk, umur_bulan))
    if df_tbu is not None:
        data_tbu = df_tbu[df_tbu['Month'] == umur_bulan]
        if not data_tbu.empty:
            L, M, S = data_tbu['L'].values[0], data_tbu['M'].values[0], data_tbu['S'].values[0]
            z_tbu = hitung_z_score_lms(panjang_badan, L, M, S)

            if z_tbu < -3.0:
                hasil['status_tb_u'] = "SP"
            elif -3.0 <= z_tbu < -2.0:
                hasil['status_tb_u'] = "P"
            elif -2.0 <= z_tbu <= 1.0:
                hasil['status_tb_u'] = "N"
            else:
                hasil['status_tb_u'] = "T"

    # 3. HITUNG BB/PB atau BB/TB
    # Ingat: Indikator ini mencari baris berdasarkan panjang/tinggi badan,bukan umur!
    df_bbtb = baca_csv(get_file_path('bbtb', jk, umur_bulan))
    if df_bbtb is not None:
        kolom_cari = 'Length' if umur_bulan < 24 else 'Height'

        index_terdekat = abs(df_bbtb[kolom_cari] - panjang_badan).idxmin()
        data_bbtb = df_bbtb.loc[[index_terdekat]]

        L, M, S = data_bbtb['L'].values[0], data_bbtb['M'].values[0], data_bbtb['S'].values[0]
        z_bbtb = hitung_z_score_lms(berat_badan, L, M, S)

        if z_bbtb < -3.0:
            hasil['status_bb_tb'] = "GK"
        elif -3.0 <= z_bbtb < -2.0:
            hasil['status_bb_tb'] = "GK"
        elif -2.0 <= z_bbtb <= 1.0:
            hasil['status_bb_tb'] = "GB"
        elif 2.0 <= z_bbtb <=3.0:
            hasil['status_bb_tb'] = "GL"
        else:
            hasil['status_bb_tb'] = "O"

    return hasil