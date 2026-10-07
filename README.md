# SIRUKAM — Sistem Peminjaman Ruang Kampus

Aplikasi web peminjaman ruangan kampus: mahasiswa/staf mengajukan peminjaman, admin memverifikasi, dan surat bukti peminjaman dapat dicetak.

**Stack:** React 19 (Vite) + Node.js/Express + MySQL

**Image Docker Hub:** [https://hub.docker.com/r/d4n13l7th/projek-popl](https://hub.docker.com/r/d4n13l7th/projek-popl) — tag `d4n13l7th/projek-popl:submit-UTS`

---

## Menjalankan dengan Docker (recommended)

```bash
git clone https://github.com/abdullahasfw/sirukam.git
cd sirukam
docker compose up -d --build
```

Aplikasi tersedia di **http://localhost:5000** (frontend + API dalam satu container).

- Container `sirukam-app` — Express + hasil build React (port 5000)
- Container `sirukam-db` — MySQL 8.0, skema & data awal di otomatis diimport dari `database.sql`

Perintah lain:

```bash
docker compose logs -f app    # log backend
docker compose down -v        # hentikan & hapus volume DB
```

Pull image tanpa build:

```bash
docker pull d4n13l7th/projek-popl:submit-UTS
docker run -p 5000:5000 -e DB_HOST=<host-mysql> d4n13l7th/projek-popl:submit-UTS
```

## Menjalankan manual (development)

Prasyarat: Node.js 20+, MySQL berjalan dengan database `peminjaman_ruang` (import `database.sql`).

```bash
# Backend (port 5000)
cd backend && npm install && npm start

# Frontend (port 5173, butuh backend aktif)
cd frontend && npm install && npm run dev
```

Variabel lingkungan opsional backend: `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`.

## Fitur

- Registrasi & login (JWT, password di-hash bcrypt)
- Dashboard peminjaman: tambah, edit, ajukan, dan hapus pengajuan
- Filter ruangan tersedia per tanggal
- Surat bukti peminjaman (`/surat/:id`) dengan nomor surat otomatis & siap cetak
- Penolakan otomatis jika ruangan sudah dibooking pada tanggal sama
- Akses data per-pengguna (user lain tidak bisa melihat/mengubah)

## API

Base URL: `http://localhost:5000/api` — semua endpoint di bawah butuh header `Authorization: Bearer <token>` kecuali register & login.

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/register` | Registrasi `{username, password}` |
| POST | `/login` | Login `{username, password}` → `{token}` |
| GET | `/ruangan` | Daftar ruangan |
| GET | `/ruangan/available?tanggal=YYYY-MM-DD` | Ruangan + status (`isBooked`) pada tanggal |
| GET | `/peminjaman` | Daftar peminjaman milik user |
| POST | `/peminjaman` | Tambah pengajuan |
| GET | `/peminjaman/:id` | Detail peminjaman (join ruangan) |
| PUT | `/peminjaman/:id` | Edit peminjaman |
| PUT | `/peminjaman/:id/ajukan` | Ajukan → status `diajukan` |
| DELETE | `/peminjaman/:id` | Hapus (hanya milik sendiri) |

Status peminjaman: `diajukan` → `disetujui` / `ditolak`.

## Struktur Proyek

```
sirukam/
├── backend/
│   └── server.js          # Express + MySQL + JWT
├── frontend/
│   └── src/               # React (pages, App, css)
├── database.sql           # Skema + data awal
├── Dockerfile             # Multi-stage: build React → runtime Node
├── docker-compose.yml     # app + mysql
└── docker/mysql/Dockerfile # image MySQL dengan skema terpasang
```

## Design Pattern

### 1. Middleware Pattern (Chain of Responsibility) — autentikasi JWT

Setiap request yang dilindungi melewati rantai middleware `auth`; request berhenti dengan 401 bila token tidak valid, atau lanjut ke handler berikutnya.

```js
// backend/server.js
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next(); // lanjut ke handler berikutnya
  } catch {
    res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa' });
  }
};

app.get('/api/peminjaman', auth, async (req, res) => { ... });
```

### 2. Template Method / Wrapper — guard rute privat di frontend

`PrivateRoute` mendefinisikan kerangka pengecekan sesi; tiap rute tinggal membungkusnya.

```jsx
// frontend/src/App.jsx
function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
}

<Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
<Route path="/surat/:id" element={<PrivateRoute><SuratPinjam /></PrivateRoute>} />
```

### 3. Facade Pattern — endpoint CRUD menyederhanakan akses DB

Handler menyederhanakan operasi multi-query (validasi + insert + pesan ramah) di balik satu API.

```js
// backend/server.js
app.post('/api/peminjaman', auth, async (req, res) => {
  const { ruangan_id, tanggal, jam_mulai, jam_selesai, keperluan } = req.body;
  try {
    const [dup] = await db.query(
      'SELECT id FROM peminjaman WHERE ruangan_id=? AND tanggal=?',
      [ruangan_id, tanggal]
    );
    if (dup.length)
      return res.status(400).json({ error: 'Ruangan sudah dipinjam pada tanggal tersebut' });
    await db.query('INSERT INTO peminjaman (...) VALUES (...)', [...]);
    res.status(201).json({ message: 'Peminjaman berhasil ditambahkan.' });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server: ' + err.message });
  }
});
```

### 4. Repository-ish (Data Access Terpusat) — pool `db` tunggal

Semua akses database lewat satu pool `mysql2`, sehingga koneksi & konfigurasi terpusat dan mudah diganti lewat environment variable.

## User Story

- **Sebagai** mahasiswa, **saya** ingin mendaftar dan login **supaya** bisa mengajukan peminjaman ruangan.
- **Sebagai** mahasiswa, **saya** ingin melihat ruangan yang tersedia pada tanggal tertentu **supaya** tidak memilih ruangan yang sudah dibooking.
- **Sebagai** mahasiswa, **saya** ingin mengajukan/mengedit/menghapus peminjaman **supaya** pengajuan saya akurat.
- **Sebagai** mahasiswa, **saya** ingin melihat surat bukti peminjaman yang bisa dicetak **supaya** ada bukti resmi.
- **Sebagai** admin, **saya** ingin menyetujui/menolak pengajuan **supaya** pemakaian ruangan terkendali.

Dokumentasi Agile/Scrum lengkap (backlog, sprint planning/review/retro) ada di [`docs/`](docs/).

## Anggota Kelompok

Nama — NIM
