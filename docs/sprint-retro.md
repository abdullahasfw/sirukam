# Sprint Retrospective — SIRUKAM

## Yang berjalan baik (Keep)
- Commit bertahap dan konvensional per tahap → riwayat mudah ditelusuri.
- Verifikasi menyeluruh (curl untuk API + Playwright untuk UI) sebelum commit → bug tertangkap dini.
- Kontrak API antar-frontend & backend konsisten → integrasi mulus.
- Multi-stage Dockerfile sekali build untuk frontend + backend → image tunggal, deploy sederhana.

## Yang perlu diperbaiki (Improve)
- Dependensi frontend dibiarkan tanpa lock bersama lebih awal → ERESOLVE vite 8 vs plugin-react muncul di tengah jalan; ke depan, tentukan versi sejak awal dan commit lockfile bersama.
- Validasi form (konfirmasi password) baru ditambah setelah fitur jadi → pindahkan validasi ke awal pembuatan form.
- Belum ada automated test (hanya uji manual) → tambah unit test endpoint & smoke test UI.
- `.gitignore` dibuat belakangan sehingga `node_modules` hampir ikut ter-commit → sediakan `.gitignore` sejak awal.

## Tindakan lanjutan (Action)
1. US-09/US-10: persetujuan admin & laporan peminjaman.
2. Tambah automated test (Jest/Supertest untuk API, Playwright untuk UI).
3. Gunakan environment variable production-ready untuk `JWT_SECRET` (bukan default).
4. Pertimbangkan halaman 404 yang sudah ada diperluas ke error boundary frontend.
