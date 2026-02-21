import pandas as pd
import os
import math

def hitung_z_scores_lms(berat, l, m, s):
    """Menghitung Z-score menggunakan metode LMS dari WHO."""
    if l == 0:
        return math.log(berat / m) / s
    else:
        return (((berat / m)**l) - 1) / (l * s)
    
def get_data_refrensi(jk, s_umur):
    """Memuat file CSV data referensi WHO berdasarkan jenis kelamin dan satuan umur."""
    # Tentukan nama file berdasarkan input
    if jk == 'L':
        nama_file = 'wfa_boys_13_weeks.csv' if s_umur == 'M' else 'wfa_boys_0_5_years.csv'
    elif jk == 'P':
        nama_file = 'wfa_girls_13_weeks.csv' if s_umur == 'M' else 'wfa_girls_0_5_years.csv'
    else:
        return None # Jenis kelamin tidak valid
    
    # Buat path file yang lengkap
    file_path = os.path.join('/home', 'awanophilee', 'mysite', 'database', nama_file)

    # Coba baca file, return None jika gagal
    try:
        df = pd.read_csv(file_path)
        return df
    except FileNotFoundError:
        print(f"ERROR: File referensi tidak ditemukan di '{file_path}'")
        return None
    except Exception as e:
        print(f"ERROR: Gagal membaca file CSV: {e}")
        return None
    
def proses_status_gizi(nama, jk, umur, s_umur, berat_badan):
    """Fungsi utama untuk memproses dan menghitung status gizi."""
    df = get_data_refrensi(jk, s_umur)

    if df is None:
        # Error jika file referensi tidak bisa dimuat
        return {"error": f"Gagal memuat data referensi. Pastikan file CSV ada di folder 'database'."}
    
    # Tentukan kolom umur dan teks satuan berdasarkan input
    if s_umur == 'M':
        kolom_umur = 'Week'
        satuan_teks = "Minggu"
    elif s_umur == 'B':
        kolom_umur = 'Month'
        satuan_teks = "Bulan"
    else:
        # Seharusnya tidak akan pernah terjadi jika validasi di frontend benar
        return {"error": f"Satuan umur '{s_umur}' tidak didukung."}

    # Cari data yang sesuai dengan umur anak
    data_anak = df[df[kolom_umur] == umur]

    if data_anak.empty:
        # Error jika tidak ada data untuk umur tersebut
        return {"error": f"Data referensi untuk umur {umur} {satuan_teks} tidak tersedia."}
    
    # Ambil nilai LMS dari data referensi
    # .values[0] untuk mengambil nilai pertama dari series
    L = float(data_anak['L'].values[0])
    M = float(data_anak['M'].values[0]) # M adalah nilai median (berat ideal)
    S = float(data_anak['S'].values[0])

    # Hitung Z-score
    z_score = round(hitung_z_scores_lms(berat_badan, L, M, S), 2)

    # Tentukan status gizi berdasarkan Z-score (standar WHO)
    if z_score < -3.0:
        status_gizi = "Gizi Sangat Kurang (Severely Underweight)"
        status_tag = "sangat_kurang"
    elif -3.0 <= z_score < -2.0:
        status_gizi = "Gizi Kurang (Underweight)"
        status_tag = "kurang"
    elif -2.0 <= z_score <= 1.0:
        status_gizi = "Gizi Baik (Normal)"
        status_tag = "baik"
    else: # z_score > 1.0
        status_gizi = "Berisiko Gizi Lebih (Risk of Overweight)"
        status_tag = "lebih"

    # Kembalikan hasil dalam bentuk dictionary yang rapi
    return {
        "error": None,
        "nama": nama,
        "jk": "Laki-laki" if jk == 'L' else "Perempuan",
        "umur_display": f"{umur} {satuan_teks}",
        "berat": berat_badan,
        "z_score": z_score,
        "status": status_gizi,
        "status_tag": status_tag,
        "ideal": round(M, 2) # M adalah berat badan ideal untuk umur tersebut
    }