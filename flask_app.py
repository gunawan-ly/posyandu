from datetime import datetime, date

from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy

from package.kalkulator_gizi import hitung_semua_status

app = Flask(__name__)

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

    # Relasi untuk menarik semua data pengukuran anak ini
    riwayat_pengukuran = db.relationship('Pengukuran', backref='anak', lazy=True)


# TABEL 2: Riwayat Pengukuran Bulanan
class Pengukuran(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Menyambungkan pengukuran ini milik anak yang mana
    anak_id = db.Column(db.Integer, db.ForeignKey('anak.id'), nullable=False)

    # Kolom Input Tabel
    waktu_kunjungan = db.Column(db.Date, nullable=False)
    umur_bulan = db.Column(db.Integer, nullable=False)
    checklist_perkembangan = db.Column(db.String(2))
    berat_badan = db.Column(db.Float, nullable=False)
    panjang_badan = db.Column(db.Float, nullable=False)
    lingkar_lengan = db.Column(db.Float, nullable=False)
    lingkar_kepala = db.Column(db.Float, nullable=False)

    # Kolom Hasil Otomatisasi (diisi oleh perhitungan L, M, S)
    kesimpulan_bb_bulan_lalu = db.Column(db.String(50))
    kesimpulan_bb_umur = db.Column(db.String(50))
    kesimpulan_pb_umur = db.Column(db.String(50))
    kesimpulan_bb_pb = db.Column(db.String(50))
    kesimpulan_lingkar_kepala = db.Column(db.String(50))
    kesimpulan_lingkar_lengan = db.Column(db.String(50))


# Mengeksekusi pembuatan file database
with app.app_context():
    db.create_all()


def hitung_umur_bulan(tanggal_lahir, waktu_kunjungan):
    # Umur dalam bulan berdasarkan perbedaan tahun/bulan (dan penyesuaian hari)
    tahun = waktu_kunjungan.year - tanggal_lahir.year
    bulan = waktu_kunjungan.month - tanggal_lahir.month
    total = tahun * 12 + bulan
    if waktu_kunjungan.day < tanggal_lahir.day:
        total -= 1
    return max(0, total)


def simpan_pengukuran(hasil, form, tanggal_lahir, waktu_kunjungan, umur_bulan):
    # Ambil atau buat data anak berdasarkan nama + tanggal lahir + jenis kelamin
    anak = Anak.query.filter_by(
        nama=form['nama'].strip(),
        tanggal_lahir=tanggal_lahir,
        jenis_kelamin=form['jenis_kelamin'].upper(),
    ).first()
    if anak is None:
        anak = Anak(
            nama=form['nama'].strip(),
            tanggal_lahir=tanggal_lahir,
            jenis_kelamin=form['jenis_kelamin'].upper(),
        )
        db.session.add(anak)

    lingkar_lengan = float(form.get('lingkar_lengan') or 0)
    lingkar_kepala = float(form.get('lingkar_kepala') or 0)

    pengukuran = Pengukuran(
        anak=anak,
        waktu_kunjungan=waktu_kunjungan,
        umur_bulan=umur_bulan,
        checklist_perkembangan=form.get('checklist_perkembangan') or None,
        berat_badan=float(form['berat_badan']),
        panjang_badan=float(form['panjang_badan']),
        lingkar_lengan=lingkar_lengan,
        lingkar_kepala=lingkar_kepala,
        kesimpulan_bb_umur=hasil['status_bb_u'],
        kesimpulan_pb_umur=hasil['status_tb_u'],
        kesimpulan_bb_pb=hasil['status_bb_tb'],
    )
    db.session.add(pengukuran)
    db.session.commit()
    return anak, pengukuran


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html', today=date.today().isoformat())


@app.route('/hitung', methods=['POST'])
def hitung():
    try:
        form = request.form
        tanggal_lahir = datetime.strptime(form['tanggal_lahir'], '%Y-%m-%d').date()
        waktu_kunjungan = datetime.strptime(form['waktu_kunjungan'], '%Y-%m-%d').date()
        berat_badan = float(form['berat_badan'])
        panjang_badan = float(form['panjang_badan'])
    except (KeyError, ValueError):
        return render_template('hasil.html', data=None, error='Isian tidak lengkap atau tidak valid.'), 400

    umur_bulan = hitung_umur_bulan(tanggal_lahir, waktu_kunjungan)
    hasil = hitung_semua_status(form['jenis_kelamin'].upper(), umur_bulan, berat_badan, panjang_badan)

    if hasil['error']:
        return render_template('hasil.html', data=None, error=hasil['error']), 400

    anak, pengukuran = simpan_pengukuran(hasil, form, tanggal_lahir, waktu_kunjungan, umur_bulan)

    return render_template('hasil.html', data={
        'anak': anak,
        'pengukuran': pengukuran,
        'hasil': hasil,
    })


if __name__ == '__main__':
    app.run(debug=True)
