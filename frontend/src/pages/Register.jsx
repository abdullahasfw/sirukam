import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsPersonPlus } from 'react-icons/bs';

const API = 'http://localhost:5000/api';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username.trim() || !form.password) {
      return setError('Username dan password wajib diisi.');
    }
    if (form.username.trim().length < 3) {
      return setError('Username minimal 3 karakter.');
    }
    if (form.password.length < 3) {
      return setError('Password minimal 3 karakter.');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess(data.message);
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch {
      setError('Gagal menghubungi server. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card card fade-in">
        <div className="card-body">
          <h3 className="text-center mb-4"><BsPersonPlus /> Register</h3>

          {error && <div className="alert alert-danger py-2">{error}</div>}
          {success && <div className="alert alert-success py-2">{success}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label fw-semibold">Username</label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Minimal 3 karakter"
                value={form.username}
                onChange={handleChange}
                minLength={3}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Minimal 3 karakter"
                value={form.password}
                onChange={handleChange}
                minLength={3}
                required
              />
            </div>
            <button type="submit" className="btn btn-gradient w-100" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            Sudah punya akun? <Link to="/login">Login di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
