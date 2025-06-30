import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRouteSeller = ({ element }) => {
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

    // Ubah untuk mengizinkan validator juga mengakses Dashboard
    if (token.role !== 'seller' && token.role !== 'superadmin' && token.role !== 'validator') {
      navigate('/');
      return;
    }
  }, [navigate]);

  // Jika role sesuai, tampilkan halaman yang diminta
  return element;
};

export default ProtectedRouteSeller;