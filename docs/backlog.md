# Product Backlog — SIRUKAM

| ID | User Story | Prioritas | Status |
|----|-----------|-----------|--------|
| US-01 | Sebagai pengguna, saya ingin mendaftar akun agar dapat masuk ke sistem | High | Done (Sprint 1) |
| US-02 | Sebagai pengguna, saya ingin login dengan aman (JWT + hash password) agar data saya terlindungi | High | Done (Sprint 1) |
| US-03 | Sebagai mahasiswa, saya ingin melihat daftar ruangan agar tahu pilihan ruang | High | Done (Sprint 2) |
| US-04 | Sebagai mahasiswa, saya ingin melihat ruangan yang tersedia pada tanggal tertentu agar tidak bentrok jadwal | High | Done (Sprint 2) |
| US-05 | Sebagai mahasiswa, saya ingin mengajukan peminjaman ruangan agar permintaan saya tercatat | High | Done (Sprint 2) |
| US-06 | Sebagai mahasiswa, saya ingin mengedit dan menghapus pengajuan saya agar bisa memperbaiki data | Medium | Done (Sprint 2) |
| US-07 | Sebagai mahasiswa, saya ingin melihat surat bukti peminjaman yang dapat dicetak sebagai bukti resmi | High | Done (Sprint 3) |
| US-08 | Sebagai mahasiswa, saya ingin status pengajuan (diajukan/disetujui/ditolak) agar tahu hasil verifikasi | Medium | Done (Sprint 3) |
| US-09 | Sebagai admin, saya ingin menyetujui/menolak pengajuan agar pemakaian ruangan terkendali | Medium | Backlog |
| US-10 | Sebagai admin, saya ingin melihat seluruh laporan peminjaman untuk evaluasi | Low | Backlog |
| US-11 | Sebagai pengguna, saya ingin menjalankan aplikasi dengan satu perintah Docker agar mudah di-deploy | High | Done (Sprint 4) |

## Backlog Teknis (enabler)

| ID | Task | Sprint |
|----|------|--------|
| T-01 | Setup backend Express + MySQL + skema DB | Sprint 1 |
| T-02 | Setup frontend React + routing | Sprint 2 |
| T-03 | Halaman Dashboard (CRUD peminjaman) | Sprint 2 |
| T-04 | Halaman Surat Pinjam | Sprint 3 |
| T-05 | Fix validasi konfirmasi password saat register | Sprint 3 |
| T-06 | Dockerfile multi-stage + docker-compose + image Docker Hub | Sprint 4 |
| T-07 | README + dokumentasi Agile/Scrum + design pattern | Sprint 4 |
