// src/components/ProtectedRoute.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For React Router v6

const ProtectedRoute = ({ element, ...rest }) => {
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

    // Cek apakah role user adalah 'superadmin' atau 'admin'
    if (token.role !== 'superadmin' && token.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [navigate]); // Menjalankan efek hanya pada mount dan ketika `navigate` berubah

  // Jika role sesuai, tampilkan halaman yang diminta
  return element;
};

export default ProtectedRoute;
