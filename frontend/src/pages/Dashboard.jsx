import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BsBoxArrowRight, BsPlusCircle, BsPencilSquare, BsTrash,
  BsSend, BsFileEarmarkText, BsCalendarEvent, BsBuilding
} from 'react-icons/bs';

const API = 'http://localhost:5000/api';

const EMPTY_FORM = {
  ruangan_id: '',
  tanggal: '',
  tujuan: 'rapat',
  jumlah_orang: '',
  jumlah_meja: '',
  jumlah_kursi: ''
};

export default function Dashboard() {
  const [list, setList] = useState([]);
  const [ruangan, setRuangan] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  };

  const handleUnauthorized = (res) => {
    if (res.status === 401) {
      localStorage.clear();
      navigate('/login');
      return true;
    }
    return false;
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/peminjaman`, { headers });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setList(data);
      setError('');
    } catch {
      setError('Gagal menghubungi server. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRuangan = async () => {
    try {
      const res = await fetch(`${API}/ruangan`, { headers });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (res.ok) setRuangan(data);
    } catch {
      /* server down — error sudah ditangani di fetchAll */
    }
  };

  useEffect(() => {
    fetchAll();
    fetchRuangan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!form.ruangan_id || !form.tanggal) {
      return setError('Ruangan dan tanggal wajib diisi.');
    }

    const body = JSON.stringify({
      ...form,
      ruangan_id: Number(form.ruangan_id),
      jumlah_orang: Number(form.jumlah_orang),
      jumlah_meja: Number(form.jumlah_meja),
      jumlah_kursi: Number(form.jumlah_kursi)
    });

    try {
      const url = editId ? `${API}/peminjaman/${editId}` : `${API}/peminjaman`;
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers,
        body
      });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (!res.ok) return setError(data.error);

      setInfo(editId ? 'Peminjaman berhasil diperbarui.' : 'Peminjaman berhasil ditambahkan.');
      resetForm();
      fetchAll();
    } catch {
      setError('Gagal menghubungi server. Pastikan backend berjalan.');
    }
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({
      ruangan_id: String(row.ruangan_id),
      tanggal: row.tanggal,
      tujuan: row.tujuan,
      jumlah_orang: String(row.jumlah_orang),
      jumlah_meja: String(row.jumlah_meja),
      jumlah_kursi: String(row.jumlah_kursi)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus peminjaman ini?')) return;
    setError('');
    setInfo('');
    try {
      const res = await fetch(`${API}/peminjaman/${id}`, { method: 'DELETE', headers });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setInfo('Peminjaman berhasil dihapus.');
      fetchAll();
    } catch {
      setError('Gagal menghubungi server. Pastikan backend berjalan.');
    }
  };

  const handleAjukan = async (id) => {
    if (!window.confirm('Ajukan surat peminjaman ini?')) return;
    setError('');
    setInfo('');
    try {
      const res = await fetch(`${API}/peminjaman/${id}/ajukan`, { method: 'PUT', headers });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setInfo('Surat berhasil diajukan.');
      fetchAll();
    } catch {
      setError('Gagal menghubungi server. Pastikan backend berjalan.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-expand navbar-dark navbar-custom">
        <div className="container">
          <span className="navbar-brand">SIRUKAM</span>
          <div className="d-flex align-items-center gap-3">
            <span className="navbar-text">Halo, <strong>{username}</strong></span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              <BsBoxArrowRight /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4 fade-in">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {info && <div className="alert alert-success py-2">{info}</div>}

        <div className="row g-4">
          {/* ==================== Form Tambah / Edit ==================== */}
          <div className="col-lg-4">
            <div className="card form-card">
              <div className="card-body">
                <h5>
                  <BsPlusCircle />
                  {editId ? 'Edit Peminjaman' : 'Tambah Peminjaman'}
                </h5>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <BsBuilding /> Ruangan
                    </label>
                    <select
                      name="ruangan_id"
                      className="form-select"
                      value={form.ruangan_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">— Pilih ruangan —</option>
                      {ruangan.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nama_ruang} (kap. {r.kapasitas})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <BsCalendarEvent /> Tanggal
                    </label>
                    <input
                      type="date"
                      name="tanggal"
                      className="form-control"
                      value={form.tanggal}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tujuan</label>
                    <select name="tujuan" className="form-select" value={form.tujuan} onChange={handleChange}>
                      <option value="rapat">Rapat</option>
                      <option value="kelas">Kelas</option>
                      <option value="seminar">Seminar</option>
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-4 mb-3">
                      <label className="form-label fw-semibold">Orang</label>
                      <input type="number" name="jumlah_orang" min="1" className="form-control"
                        value={form.jumlah_orang} onChange={handleChange} required />
                    </div>
                    <div className="col-4 mb-3">
                      <label className="form-label fw-semibold">Meja</label>
                      <input type="number" name="jumlah_meja" min="0" className="form-control"
                        value={form.jumlah_meja} onChange={handleChange} required />
                    </div>
                    <div className="col-4 mb-3">
                      <label className="form-label fw-semibold">Kursi</label>
                      <input type="number" name="jumlah_kursi" min="0" className="form-control"
                        value={form.jumlah_kursi} onChange={handleChange} required />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-gradient w-100">
                    {editId ? 'Simpan Perubahan' : 'Tambah'}
                  </button>

                  {editId && (
                    <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={resetForm}>
                      Batal Edit
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* ==================== Tabel Data ==================== */}
          <div className="col-lg-8">
            <div className="card dashboard-card">
              <div className="card-body">
                <h5 className="mb-3">Data Peminjaman Saya</h5>

                {loading ? (
                  <p className="text-muted">Memuat data...</p>
                ) : list.length === 0 ? (
                  <p className="text-muted">Belum ada data peminjaman. Silakan tambah melalui form.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Ruangan</th>
                          <th>Tujuan</th>
                          <th>Orang</th>
                          <th>Status</th>
                          <th className="text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((row) => (
                          <tr key={row.id}>
                            <td>{row.tanggal}</td>
                            <td>{row.nama_ruang}</td>
                            <td><span className={`tujuan-${row.tujuan}`}>{row.tujuan}</span></td>
                            <td>{row.jumlah_orang}</td>
                            <td>
                              <span className={row.status === 'diajukan' ? 'badge-diajukan' : 'badge-draft'}>
                                {row.status}
                              </span>
                            </td>
                            <td className="text-center">
                              <button className="btn btn-outline-primary btn-action me-1"
                                onClick={() => handleEdit(row)} title="Edit">
                                <BsPencilSquare /> Edit
                              </button>
                              {row.status === 'draft' && (
                                <>
                                  <button className="btn btn-outline-success btn-action me-1"
                                    onClick={() => handleAjukan(row.id)} title="Ajukan surat">
                                    <BsSend /> Ajukan
                                  </button>
                                  <button className="btn btn-outline-danger btn-action me-1"
                                    onClick={() => handleDelete(row.id)} title="Hapus">
                                    <BsTrash /> Hapus
                                  </button>
                                </>
                              )}
                              <Link to={`/surat/${row.id}`} className="btn btn-outline-secondary btn-action"
                                title="Lihat surat">
                                <BsFileEarmarkText /> Surat
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
