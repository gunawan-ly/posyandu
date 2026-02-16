from flask import Flask, render_template, request
from package.kalkulator_gizi import proses_status_gizi
from styles import THEME, FORM

app = Flask(__name__)

# Route untuk menampilkan halaman utama
@app.route('/')
def home():
    combined_styles = {**THEME, **FORM}
    return render_template('index.html', s=combined_styles)

@app.route('/hitung', methods=['POST'])
def hitung():
    nama = request.form.get('nama')
    if not nama:
        nama = "Tanpa Nama"
    jk = request.form.get('jk')
    umur = int(request.form.get('umur'))
    berat = float(request.form.get('berat'))
    hasil = proses_status_gizi(nama, jk, umur, berat)

    if hasil.get("error"):
        return hasil["error"]
    
    return render_template('hasil.html', **hasil)

if __name__ == "__main__":
    app.run(debug=True)