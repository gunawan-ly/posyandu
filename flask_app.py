from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


# Konfigurasi database: menyimpan data ke file bernama posyandu.db
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///posyandu.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# TABEL 1: Data Induk Anak
class Anak(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(100), nullable=False)
    tanggal_lahir = db.Column(db.Date, nullable=False)
    jenis_kelamin = db.Column(db.String(1), nullable=False)

    # Ini "Jembatan" ajaib untuk menarik semua data pengukuran anak ini nanti
    riwayat_pengukuran = db.relationship('Pengukuran', backref='anak', lazy=True)

# TABEL 2: Riwayat Pengukuran Blanan
class Pengukuran(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Ini kuncinya: menyambungkan pengukuran ini milik anak yang mana
    anak_id = db.Column(db.Integer, db.ForeignKey('anak.id'), nullable=False)

    # Kolom Input Tabel
    waktu_kunjungan = db.Column(db.Date, nullable=False)
    umur_bulan = db.Column(db.Integer, nullable=False)
    checklist_perkembangan = db.Column(db.String(2))
    berat_badan = db.Column(db.Float, nullable=False)
    panjang_badan = db.Column(db.Float, nullable=False)
    lingkar_lengan = db.Column(db.Float, nullable=False)
    lingkar_kepala = db.Column(db.Float, nullable=False)

    # Kolom Hasil Otomatisasi (Nanti diisi oleh perhitungan L, M, S)
    kesimpulan_bb_bulan_lalu = db.Column(db.String(50))
    kesimpulan_bb_umur = db.Column(db.String(50))
    kesimpulan_pb_umur = db.Column(db.String(50))
    kesimpulan_bb_pb = db.Column(db.String(50))
    kesimpulan_lingkar_kepala = db.Column(db.String(50))
    kesimpulan_lingkar_lengan = db.Column(db.String(50))

# Mengeksekusi pembuatan file database
with app.app_context():
    db.create_all()
    print("Database berhasil dibuat!")

if __name__ == '__main__':
    app.run(debug=True)