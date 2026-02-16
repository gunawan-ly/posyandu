import pandas as pd
import os

def get_data_refrensi(jk):
    if jk == 'L':
        nama_file = 'wfa_boys_13_weeks_zscores.csv'
    elif jk == 'P':
        nama_file = 'wfa_girls_13_weeks_zscores.csv'
    else:
        return None
    
    file_path = os.path.join('/home', 'awanophlee', 'mysite', 'database', nama_file)
    df = pd.read_csv(file_path)
    return df

def proses_status_gizi(nama, jk, umur_minggu, berat_badan):
    df = get_data_refrensi(jk)

    if df is None:
        return {"Error: Gagal membaca file CSV"}
    
    data_anak = df[df['Week'] == umur_minggu]

    if data_anak.empty:
        return "Error: Data refrensi untuk umur tersebut tidak tersedia"
    
    batas_bawah = data_anak['min2'].values[0]
    batas_atas = data_anak['pls2'].values[0]
    berat_ideal = data_anak['normal'].values[0]

    if berat_badan < batas_bawah:
        status_gizi = "Gizi Kurang"
    elif berat_badan > batas_atas:
        status_gizi = "Gizi Lebih"
    else:
        status_gizi = "Gizi Normal"

    return {
        "error": None,
        "nama": nama,
        "jk": jk,
        "umur": umur_minggu,
        "berat": berat_badan,
        "status": status_gizi,
        "batas_bawah": batas_bawah,
        "batas_atas": batas_atas,
        "ideal": berat_ideal
    }
