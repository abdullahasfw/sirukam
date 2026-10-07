-- =============================================
-- DATABASE: Sistem Peminjaman Ruang Kampus
-- Stack: React + Node.js/Express + MySQL
-- =============================================

CREATE DATABASE IF NOT EXISTS peminjaman_ruang;
USE peminjaman_ruang;

-- Tabel users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- Tabel ruangan
CREATE TABLE ruangan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_ruang VARCHAR(100) NOT NULL,
    kapasitas INT NOT NULL
) ENGINE=InnoDB;

-- Tabel peminjaman (berelasi ke users dan ruangan)
CREATE TABLE peminjaman (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ruangan_id INT NOT NULL,
    tanggal DATE NOT NULL,
    tujuan ENUM('rapat','kelas','seminar') NOT NULL,
    jumlah_orang INT NOT NULL,
    jumlah_meja INT NOT NULL,
    jumlah_kursi INT NOT NULL,
    status ENUM('draft','diajukan') DEFAULT 'draft',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ruangan_id) REFERENCES ruangan(id) ON DELETE CASCADE,
    UNIQUE KEY uq_ruangan_tanggal (ruangan_id, tanggal)
) ENGINE=InnoDB;

-- =============================================
-- DATA DUMMY (10 baris per tabel)
-- =============================================

-- Password = username, di-hash bcrypt
INSERT INTO users (username, password) VALUES
('admin',   '$2y$10$p5lSRU5FCpXiTfVv8kyHS.SpMlCkmembPWLUiNnz/rk8tsjGvTR56'),
('budi',    '$2y$10$z4uaTuY.MdHWFIu1xSZUruITZpFnyTiaSMz0iXLtn0g5r/PEUNZ/C'),
('sari',    '$2y$10$L1EQI4JtZAecXu2A/upQNeMsgchQGZo.lO6B1urGx1Kec7F50.wWS'),
('dewi',    '$2y$10$VK.LTk55GML9pu8PYaQ9tusZVn2iYDSvjr69tdZwgq1W7Izyu69.a'),
('andi',    '$2y$10$K3Us8C/BZOOucgS/bAmFLOrq8oZL.SwHg2EbFpdNvfPapWsoGIRu2'),
('rina',    '$2y$10$bambCT09dZlyDmDgcs6SY.S5kvCc7pb/GOJVy6ofIdU8hpBv3YYGe'),
('tono',    '$2y$10$jtyGOGi/0OMuU0JKctVOYuXQpGHTPer0EQEkRwoj9oH8zc8/1UqWW'),
('lina',    '$2y$10$luP1/CIErJVjk7yoEPixbeChUYWfYaPpJzHmAHnlyNCZ0/Qs.r2Dy'),
('rudi',    '$2y$10$Rlqmfkviv.bgIF/BtT9Yg.mftsdtzY8IBdTwKYO1SjKuSpwkIG5Sm'),
('maya',    '$2y$10$j7KMDc6EZsz4.Ah18BVDp.pA1BRmuXVnG2YsmnMFxzqgPWouaBzrq');

-- 10 Data Dummy Ruangan
INSERT INTO ruangan (nama_ruang, kapasitas) VALUES
('Lab Komputer 1', 40),
('Lab Komputer 2', 35),
('Ruang Seminar A', 100),
('Ruang Seminar B', 80),
('Ruang Kelas 101', 50),
('Ruang Kelas 102', 50),
('Ruang Rapat Lt.2', 20),
('Ruang Rapat Lt.3', 15),
('Aula Utama', 200),
('Studio Multimedia', 25);

-- 10 Data Dummy Peminjaman (tujuan, orang, meja, kursi, status)
-- admin punya 3 booking, budi 3, sari 2, dewi 1, andi 1
INSERT INTO peminjaman (user_id, ruangan_id, tanggal, tujuan, jumlah_orang, jumlah_meja, jumlah_kursi, status) VALUES
(1, 1, '2026-06-10', 'kelas',   25, 13, 25, 'diajukan'),
(1, 3, '2026-06-15', 'seminar', 80,  8, 80, 'draft'),
(1, 7, '2026-06-20', 'rapat',   15,  4, 15, 'draft'),
(2, 5, '2026-06-11', 'kelas',   30, 15, 30, 'diajukan'),
(2, 2, '2026-06-13', 'rapat',   10,  3, 10, 'draft'),
(2, 9, '2026-06-18', 'seminar',150, 15,150, 'diajukan'),
(3, 4, '2026-06-12', 'seminar', 60,  6, 60, 'draft'),
(3, 6, '2026-06-16', 'kelas',   40, 20, 40, 'diajukan'),
(4, 10,'2026-06-14', 'rapat',   20,  5, 20, 'draft'),
(5, 8, '2026-06-19', 'rapat',   12,  3, 12, 'diajukan');
