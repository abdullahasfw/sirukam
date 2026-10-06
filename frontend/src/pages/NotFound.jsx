import { Link } from 'react-router-dom';
import { BsArrowLeft, BsExclamationTriangle } from 'react-icons/bs';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="text-center fade-in">
        <h1>404</h1>
        <h3 className="mb-3"><BsExclamationTriangle /> Halaman Tidak Ditemukan</h3>
        <p className="mb-4 opacity-75">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dihapus.
        </p>
        <Link to="/" className="btn btn-outline-light btn-lg">
          <BsArrowLeft /> Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
