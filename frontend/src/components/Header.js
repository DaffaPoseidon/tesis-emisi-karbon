// src/components/Header.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Gunakan Link untuk routing dan useNavigate untuk navigasi
import logo from '../images/Logo-Kementerian-Dalam-Negeri.png'; // Import gambar logo

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil token dari localStorage
    const token = JSON.parse(localStorage.getItem('user'));

    // Cek apakah token ada
    if (token) {
      setIsLoggedIn(true); // Set pengguna sebagai logged in
      // Cek apakah role pengguna adalah 'superadmin'
      if (token.role === 'superadmin') {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Fungsi untuk handle logout
  const handleLogout = () => {
    localStorage.removeItem('user'); // Hapus user dari localStorage
    setIsLoggedIn(false); // Set status login menjadi false
    setIsSuperAdmin(false); // Reset role superadmin
    window.location.reload(); // Refresh halaman (seperti CTRL + SHIFT + R)
  };

  return (
    <header className="bg-blue-600 py-4">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Logo di Pojok Kiri */}
        <div className="flex items-center flex-1">
          <Link to="/">
            <img src={logo} alt="Logo Kementerian Dalam Negeri" className="h-20 w-20" />
          </Link>
          <ul className="ml-4 text-white">
            <li>KEMENTERIAN DALAM NEGERI</li>
            <li>SEKRETARIAT JENDERAL</li>
            <li>BIRO HUKUM</li>
          </ul>
        </div>

        {/* Navigasi di Tengah */}
        <div className="flex space-x-8 mx-auto flex-1 justify-center items-center">
          <Link to="/" className="text-white hover:text-gray-300">Beranda</Link>
          <Link to="/data-rekap" className="text-white hover:text-gray-300">Data Rekap</Link>
        </div>

        {/* Tombol Login / Logout dan Register */}
        <div className="flex-1 flex justify-end">
          {isLoggedIn ? (
            <>
              {/* Tombol Logout */}
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
              >
                Log Out
              </button>
              {/* Tombol Register (Hanya untuk Superadmin) */}
              {isSuperAdmin && (
                <Link
                  to="/register"
                  className="ml-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
                >
                  Register Admin
                </Link>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Login Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;