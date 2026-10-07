const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-jwt-kampus-2026';

// ==================== Koneksi Database ====================
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'peminjaman_ruang',
  dateStrings: true
});

// ==================== Middleware Auth ====================
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa' });
  }
};

// ==================== Auth Endpoints ====================

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  if (username.trim().length < 3)
    return res.status(400).json({ error: 'Username minimal 3 karakter' });
  if (password.length < 3)
    return res.status(400).json({ error: 'Password minimal 3 karakter' });

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username.trim()]);
    if (existing.length > 0)
      return res.status(400).json({ error: 'Username sudah digunakan' });

    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username.trim(), hash]);
    res.json({ message: 'Registrasi berhasil! Silakan login.' });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server: ' + err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username dan password wajib diisi' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username.trim()]);
    if (rows.length === 0)
      return res.status(401).json({ error: 'Username atau password salah' });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid)
      return res.status(401).json({ error: 'Username atau password salah' });

    const token = jwt.sign(
      { id: rows[0].id, username: rows[0].username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, username: rows[0].username });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan server: ' + err.message });
  }
});

// ==================== Ruangan Endpoints ====================

// Semua ruangan
app.get('/api/ruangan', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ruangan ORDER BY nama_ruang');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruangan yang TERSEDIA pada tanggal tertentu
app.get('/api/ruangan/available', auth, async (req, res) => {
  const { tanggal, exclude_id } = req.query;
  if (!tanggal) return res.status(400).json({ error: 'Parameter tanggal wajib' });

  try {
    let bookedQuery = 'SELECT ruangan_id FROM peminjaman WHERE tanggal = ?';
    let params = [tanggal];

    // Saat edit, exclude record sendiri
    if (exclude_id) {
      bookedQuery += ' AND id != ?';
      params.push(exclude_id);
    }

    const [allRooms] = await db.query('SELECT * FROM ruangan ORDER BY nama_ruang');
    const [bookedRows] = await db.query(bookedQuery, params);
    const bookedIds = bookedRows.map(r => r.ruangan_id);

    const result = allRooms.map(room => ({
      ...room,
      isBooked: bookedIds.includes(room.id)
    }));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CRUD Peminjaman ====================

// READ — hanya data milik user yang login (JOIN 3 tabel)
app.get('/api/peminjaman', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.user_id, p.ruangan_id, u.username, r.nama_ruang, r.kapasitas,
             p.tanggal, p.tujuan, p.jumlah_orang, p.jumlah_meja, p.jumlah_kursi, p.status
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN ruangan r ON p.ruangan_id = r.id
      WHERE p.user_id = ?
      ORDER BY p.tanggal DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ SINGLE — untuk halaman surat
app.get('/api/peminjaman/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.username, r.nama_ruang, r.kapasitas
      FROM peminjaman p
      JOIN users u ON p.user_id = u.id
      JOIN ruangan r ON p.ruangan_id = r.id
      WHERE p.id = ? AND p.user_id = ?
    `, [req.params.id, req.user.id]);

    if (rows.length === 0)
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE
app.post('/api/peminjaman', auth, async (req, res) => {
  const { ruangan_id, tanggal, tujuan, jumlah_orang, jumlah_meja, jumlah_kursi } = req.body;

  if (!ruangan_id || !tanggal || !tujuan || !jumlah_orang || !jumlah_meja || !jumlah_kursi)
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  if (!['rapat', 'kelas', 'seminar'].includes(tujuan))
    return res.status(400).json({ error: 'Tujuan harus rapat, kelas, atau seminar' });

  try {
    // Cek kapasitas ruangan
    const [room] = await db.query('SELECT kapasitas FROM ruangan WHERE id = ?', [ruangan_id]);
    if (room.length === 0) return res.status(404).json({ error: 'Ruangan tidak ditemukan' });
    if (jumlah_orang > room[0].kapasitas)
      return res.status(400).json({ error: `Jumlah orang (${jumlah_orang}) melebihi kapasitas ruangan (${room[0].kapasitas})` });

    // Cek ketersediaan (ruangan + tanggal harus unik)
    const [existing] = await db.query(
      'SELECT id FROM peminjaman WHERE ruangan_id = ? AND tanggal = ?',
      [ruangan_id, tanggal]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: 'Ruangan sudah dipinjam pada tanggal tersebut' });

    const [result] = await db.query(
      `INSERT INTO peminjaman (user_id, ruangan_id, tanggal, tujuan, jumlah_orang, jumlah_meja, jumlah_kursi)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, ruangan_id, tanggal, tujuan, jumlah_orang, jumlah_meja, jumlah_kursi]
    );
    res.json({ message: 'Peminjaman berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put('/api/peminjaman/:id', auth, async (req, res) => {
  const { ruangan_id, tanggal, tujuan, jumlah_orang, jumlah_meja, jumlah_kursi } = req.body;

  if (!ruangan_id || !tanggal || !tujuan || !jumlah_orang || !jumlah_meja || !jumlah_kursi)
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  if (!['rapat', 'kelas', 'seminar'].includes(tujuan))
    return res.status(400).json({ error: 'Tujuan harus rapat, kelas, atau seminar' });

  try {
    // Cek kapasitas
    const [room] = await db.query('SELECT kapasitas FROM ruangan WHERE id = ?', [ruangan_id]);
    if (room.length === 0) return res.status(404).json({ error: 'Ruangan tidak ditemukan' });
    if (jumlah_orang > room[0].kapasitas)
      return res.status(400).json({ error: `Jumlah orang (${jumlah_orang}) melebihi kapasitas ruangan (${room[0].kapasitas})` });

    // Cek ketersediaan (exclude record sendiri)
    const [existing] = await db.query(
      'SELECT id FROM peminjaman WHERE ruangan_id = ? AND tanggal = ? AND id != ?',
      [ruangan_id, tanggal, req.params.id]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: 'Ruangan sudah dipinjam pada tanggal tersebut' });

    const [result] = await db.query(
      `UPDATE peminjaman SET ruangan_id=?, tanggal=?, tujuan=?, jumlah_orang=?, jumlah_meja=?, jumlah_kursi=?
       WHERE id=? AND user_id=?`,
      [ruangan_id, tanggal, tujuan, jumlah_orang, jumlah_meja, jumlah_kursi, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Data peminjaman tidak ditemukan' });
    res.json({ message: 'Peminjaman berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/api/peminjaman/:id', auth, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM peminjaman WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Data peminjaman tidak ditemukan' });
    res.json({ message: 'Peminjaman berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AJUKAN SURAT (ubah status draft → diajukan)
app.put('/api/peminjaman/:id/ajukan', auth, async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE peminjaman SET status = 'diajukan' WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Data peminjaman tidak ditemukan' });
    res.json({ message: 'Surat berhasil diajukan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Start Server ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
