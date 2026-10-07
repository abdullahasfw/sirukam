# Sprint Planning — SIRUKAM

**Proyek:** SIRUKAM (Sistem Peminjaman Ruang Kampus) — UTS POPL
**Metode:** Scrum, sprint 1 minggu (deadline: hari ini)

## Sprint 1 — Fondasi & Autentikasi
**Goal:** Pengguna dapat mendaftar dan login.

- [x] T-01 Setup backend Express + MySQL + import `database.sql`
- [x] US-01 Registrasi (validasi + bcrypt hash)
- [x] US-02 Login + JWT
- [x] Integrasi frontend: halaman Register (validasi konfirmasi password) & Login

**Kriteria selesai:** endpoint register/login teruji via curl; alur register → login sukses di browser.

## Sprint 2 — Dashboard Peminjaman
**Goal:** Mahasiswa dapat mencari ruangan dan mengajukan peminjaman.

- [x] T-02 Setup React (Vite) + routing + `PrivateRoute`
- [x] US-03 Daftar ruangan
- [x] US-04 Filter ruangan tersedia per tanggal (`GET /api/ruangan/available`)
- [x] US-05 Tambah pengajuan peminjaman
- [x] US-06 Edit & hapus pengajuan (hanya milik sendiri)

**Kriteria selesai:** semua endpoint CRUD teruji; penolakan ruangan ganda pada tanggal sama.

## Sprint 3 — Surat Pinjam & Verifikasi
**Goal:** Pengajuan dapat diajukan dan dibuktikan lewat surat.

- [x] US-08 Ubah status ke `diajukan` (`PUT /:id/ajukan`)
- [x] US-07 Halaman Surat Pinjam (`/surat/:id`, nomor otomatis `SIRUKAM/<id>/<tahun>`, siap cetak)
- [x] Fix register (konfirmasi password)

**Kriteria selesai:** smoke test browser — tambah → ajukan → lihat surat.

## Sprint 4 — DevOps & Dokumentasi
**Goal:** Aplikasi bisa dijalankan satu perintah dan terdokumentasi.

- [x] T-06 Dockerfile multi-stage (build React → runtime Node) + `docker-compose.yml` (app + MySQL)
- [x] Push image `d4n13l7th/projek-popl:submit-UTS` ke Docker Hub
- [x] T-07 README + dokumentasi design pattern + dokumen Agile/Scrum
- [ ] Merge ke `main`

**Kriteria selesai:** `docker compose up -d --build` → app jalan di port 5000; README memuat link Docker Hub.
