# Sprint Review — SIRUKAM

## Sprint 1
**Demo:** registrasi → login sukses di browser (`/register` → `/login` → Dashboard).
**Hasil uji:**
- Register duplikat → 400, password salah → 401, tanpa token → 401 (via curl).
- Validasi konfirmasi password di frontend mencegah ketidakcocokan.

## Sprint 2
**Demo:** tambah, edit, ajukan, hapus peminjaman dari Dashboard.
**Hasil uji:**
- `GET /api/ruangan` → 10 row; `GET /api/ruangan/available?tanggal=` → status `isBooked` benar.
- Pemesanan ruangan & tanggal sama ditolak: `{"error":"Ruangan sudah dipinjam pada tanggal tersebut"}` (constraint `uq_ruangan_tanggal`).
- Row milik user lain → 404 (isolasi data per-user OK).

## Sprint 3
**Demo:** pengajuan berstatus `diajukan` → halaman surat `SIRUKAM/13/2026`.
**Hasil uji (Playwright):**
- Register mismatch → pesan error; register valid → redirect `/login`.
- Login → Dashboard "Halo, mahasiswa1", dropdown ruangan terisi dari API.
- Submit → "Peminjaman berhasil ditambahkan."; Ajukan → "Surat berhasil diajukan."
- Halaman Surat render lengkap (nomor surat, data peminjaman, blok tanda tangan).

## Sprint 4
**Demo:** `docker compose up -d --build` → buka `http://localhost:5000`.
**Hasil uji:**
- Build image multi-stage sukses; app + MySQL sehat (healthcheck).
- `/` → 200 HTML (SPA), asset JS 200, `/api/tidak-ada` → `{"error":"Endpoint tidak ditemukan"}`.
- Register user baru via container → login → buka Dashboard di port 5000 sukses.
- Image `d4n13l7th/projek-popl:submit-UTS` ter-push ke Docker Hub.

**Item belum selesai:** US-09/US-10 (persetujuan admin & laporan) masuk backlog berikutnya.
