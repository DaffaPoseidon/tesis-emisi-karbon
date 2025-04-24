// src/landingPage/LandingPage.js
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header'; // Impor Header
import { useNavigate } from 'react-router-dom'; // For navigation

const LandingPage = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil token dari localStorage
    const token = JSON.parse(localStorage.getItem('user'));

    // Cek apakah token ada dan apakah role sesuai
    if (token && (token.role === 'seller')) {
      setHasAccess(true); // Pengguna memiliki akses
    } else {
      setHasAccess(false); // Pengguna tidak memiliki akses
    }
  }, []); // Menjalankan hanya pada mount

  return (
    <div>
      <Header /> {/* Menampilkan Header */}
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center p-4 sm:w-full md:w-3/4 lg:w-1/2">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-600 mb-6">
            Selamat Datang di Sistem Rekap Penanganan Perkara
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-6">
            Pantau perkembangan perkara secara langsung di pengadilan.
          </p>
          {hasAccess ? (
            <a
              href="/dashboard"
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Dashboard
            </a>
          ) : (
            <p className="text-lg text-red-500">
              {/* Anda tidak memiliki akses ke Dashboard. Silakan login sebagai admin atau superadmin. */}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;