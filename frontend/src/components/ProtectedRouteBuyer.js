import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRouteBuyer = ({ element }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil token dari localStorage
    const token = JSON.parse(localStorage.getItem('user'));

    if (!token) {
      // Jika token tidak ada, arahkan ke login
      console.log('Token sudah tidak ada');
      navigate('/login');
      return;
    }

    // Cek apakah role user adalah 'buyer' (atau superadmin)
    // Hanya buyer yang boleh membeli
    if (token.role !== 'buyer' && token.role !== 'superadmin') {
      // Arahkan ke detail produk tanpa akses pembelian
      // atau beri pesan tidak boleh membeli
      alert('Hanya buyer yang dapat melakukan pembelian');
      navigate('/marketplace');
      return;
    }
  }, [navigate]);

  // Jika role sesuai, tampilkan halaman yang diminta
  return element;
};

export default ProtectedRouteBuyer;