from flask import Flask, render_template, request
import pandas as pd
import os
from styles import THEME, FORM

app = Flask(__name__)

# Fungsi untuk membaca database refrensi
def get_data_refrensi(jk):
    # Mengarahkan ke folder database
    # Sesuaikan nama file
    # Logika percabangan untuk memilih file
    if jk == 'L':
        nama_file = 'wfa_boys_13_weeks_zscores.csv'
    elif jk == 'P':
        nama_file = 'wfa_girls_13_weeks_zscores.csv'
    else:
        return None # Jaga-jaga jika input tidak valid
    file_path = os.path.join('/home', 'awanophilee', 'mysite', 'database', nama_file)
    df = pd.read_csv(file_path)
    return df # Jangan lupa menambahkan baris ini

# Route untuk menampilkan halaman utama
@app.route('/')
def home():
    combined_styles = {**THEME, **FORM}
    return render_template('index.html', s=combined_styles)

# Route untuk memproses hitungan
@app.route('/hitung', methods=['POST'])
def hitung():
    # 1. Menangkap data dari form input (index.html)
    nama = request.form.get('nama')
    if not nama:
        nama = "Tanpa Nama" # Nilai deefault jika kosong
    
    jk = request.form.get('jk')
    umur_minggu = int(request.form.get('umur'))
    berat_badan = float(request.form.get('berat'))

    # 2. Membaca data refrensi dari pandas
    try:
        df = get_data_refrensi(jk)
    except Exception as e:
        return f"Terjasi kesalahan saat membaca database: {e}"
    
    if df is None:
        return "Error: Jenis kelamin tidak valid"
    
    # 3. Memfilter data (mencari baris yang umurnya sesuai input)
    data_anak = df[df['Week'] == umur_minggu]

    # Cek data umur jika tidak ditemukan di tabel (misal > 13 minggu)
    if data_anak.empty:
        return "Error: Data refrensi untuk umur tersebut tidak tersedia"
    
    # 4. Mengekstrak nilai batas dari bari yang di temukan
    # Mengambl nilai dari kolom Z-score
    batas_bawah = data_anak['min2'].values[0] # Garis -2 SD
    batas_atas = data_anak['pls2'].values[0] # Garis +2 SD
    berat_ideal = data_anak['normal'].values[0] # Garis median 0

    # 5. LOGIKA PENENTUAN STATUS GIZI
    if berat_badan < batas_bawah:
        status_gizi = "Gizi Kurang"
    elif berat_badan > batas_atas:
        status_gizi = "Gizi Lebih"
    else:
        status_gizi = "Normal"

    # 6. Mengirim data dan hasil ke halaman hasil.html
    return render_template('hasil.html', nama=nama, jk=jk, umur=umur_minggu, berat=berat_badan, status=status_gizi, batas_bawah=batas_bawah, batas_atas=batas_atas, ideal=berat_ideal)

if __name__ == "__main__":
    app.run(debug=True)