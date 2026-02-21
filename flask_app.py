from flask import Flask, render_template, request
from package.kalkulator_gizi import proses_status_gizi
from styles import THEME, FORM, STATUS

app = Flask(__name__)

@app.route('/')
def home():
    """Menampilkan halaman utama dengan form input."""
    all_styles = {**THEME, **FORM}
    return render_template('index.html', s=all_styles)

@app.route('/hitung', methods=['POST'])
def hitung():
    """Menerima data dari form, memproses, dan menampilkan hasil atau error."""
    all_styles = {**THEME, **FORM, **STATUS}
    try:
        # 1. Ambil data dari form
        nama = request.form.get('nama') or "Tanpa Nama"
        jk = request.form.get('jk')
        s_umur = request.form.get('satuan_umur')
        umur_str = request.form.get('umur')
        berat_str = request.form.get('berat')

        # 2. Validasi input: pastikan tidak ada yang kosong
        if not all([jk, s_umur, umur_str, berat_str]):
            # Jika ada yang kosong, kembali ke halaman utama dengan pesan error
            return render_template('index.html', s=all_styles, error="Semua kolom wajib diisi.")

        # 3. Konversi ke tipe data yang benar (int, float)
        umur = int(umur_str)
        berat = float(berat_str)

        # 4. Panggil fungsi kalkulator dari package
        hasil = proses_status_gizi(nama, jk, umur, s_umur, berat)

        # 5. Cek jika ada error dari kalkulator (misal: data referensi tidak ada)
        if hasil.get("error"):
            return render_template('index.html', s=all_styles, error=hasil["error"])
        
        # 6. Jika berhasil, tampilkan halaman hasil
        return render_template('hasil.html', **hasil, s=all_styles)

    except ValueError:
        # Error ini terjadi jika 'umur' atau 'berat' diisi teks, bukan angka
        return render_template('index.html', s=all_styles, error="Input umur dan berat badan harus berupa angka.")
    except Exception as e:
        # Menangkap error tak terduga lainnya untuk keamanan
        app.logger.error(f"Terjadi kesalahan tak terduga: {e}")
        return render_template('index.html', s=all_styles, error="Terjadi kesalahan pada server. Silakan coba lagi.")

if __name__ == "__main__":
    app.run(debug=True)