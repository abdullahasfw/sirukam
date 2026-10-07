import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BsArrowLeft, BsPrinter } from 'react-icons/bs';

const API = 'http://localhost:5000/api';

export default function SuratPinjam() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${API}/peminjaman/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        const json = await res.json();
        if (!res.ok) setError(json.error);
        else setData(json);
      })
      .catch(() => setError('Gagal menghubungi server. Pastikan backend berjalan.'));
  }, [id, navigate]);

  if (error) {
    return (
      <div className="container py-5 fade-in">
        <div className="alert alert-danger">{error}</div>
        <Link to="/" className="btn btn-gradient">
          <BsArrowLeft /> Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-5">
        <p className="text-muted">Memuat surat...</p>
      </div>
    );
  }

  return (
    <div className="container py-5 surat-wrapper fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3 no-print">
        <Link to="/" className="btn btn-outline-primary btn-action">
          <BsArrowLeft /> Kembali
        </Link>
        <button className="btn btn-gradient" onClick={() => window.print()}>
          <BsPrinter /> Cetak Surat
        </button>
      </div>

      <div className="card surat-card">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h4 className="fw-bold mb-1">SURAT PINJAM RUANGAN</h4>
            <p className="text-muted mb-0">Sistem Peminjaman Ruangan Kampus — SIRUKAM</p>
          </div>

          <div className="info-row">
            <div className="info-label">Nomor</div>
            <div className="info-value">SIRUKAM/{id}/{new Date().getFullYear()}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Pemohon</div>
            <div className="info-value">{localStorage.getItem('username') || '-'}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Ruangan</div>
            <div className="info-value">{data.nama_ruang}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Tanggal</div>
            <div className="info-value">{data.tanggal}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Tujuan</div>
            <div className="info-value text-capitalize">{data.tujuan}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Jumlah Orang</div>
            <div className="info-value">{data.jumlah_orang} orang</div>
          </div>
          <div className="info-row">
            <div className="info-label">Jumlah Meja</div>
            <div className="info-value">{data.jumlah_meja} meja</div>
          </div>
          <div className="info-row">
            <div className="info-label">Jumlah Kursi</div>
            <div className="info-value">{data.jumlah_kursi} kursi</div>
          </div>
          <div className="info-row">
            <div className="info-label">Status</div>
            <div className="info-value">
              <span className={data.status === 'diajukan' ? 'badge-diajukan' : 'badge-draft'}>
                {data.status}
              </span>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <div className="text-center">
              <div>Pemohon,</div>
              <div className="mt-4 fw-bold">({localStorage.getItem('username') || '-'})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
