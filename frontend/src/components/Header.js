// src/components/Header.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Gunakan Link untuk routing dan useNavigate untuk navigasi
import logo from "../images/Logo-Kementerian-Dalam-Negeri.png"; // Import gambar logo

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isValidator, setIsValidator] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil token dari localStorage
    const token = JSON.parse(localStorage.getItem("user"));

    // Reset semua state role ke false terlebih dahulu
    setIsSuperAdmin(false);
    setIsValidator(false);
    setIsUser(false);

    // Cek apakah token ada
    if (token) {
      setIsLoggedIn(true);

      switch (token.role) {
        case "superadmin":
          setIsSuperAdmin(true);
          break;
        case "validator":
          setIsValidator(true);
          break;
        case "user":
          setIsUser(true);
          break;
        default:
          break;
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Fungsi untuk handle logout
  const handleLogout = () => {
    localStorage.removeItem("user"); // Hapus user dari localStorage
    setIsLoggedIn(false); // Set status login menjadi false
    setIsSuperAdmin(false); // Reset role superadmin
    window.location.reload(); // Refresh halaman (seperti CTRL + SHIFT + R)
  };

  return (
    <header className="bg-blue-600 py-4">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Bagian Kiri: Logo + Navigasi */}
        <div className="flex items-center space-x-12">
          {/* Logo dan Teks */}
          <div className="flex items-center">
            <Link to="/">
              <img
                src={logo}
                alt="Logo Kementerian Dalam Negeri"
                className="h-20 w-20"
              />
            </Link>
            <ul className="ml-4 text-white">
              <li>POLINEMA</li>
              <li>BLOCKCHAIN</li>
              <li>EMISI KARBON</li>
            </ul>
          </div>

          {/* Navigasi Beranda & Data Rekap */}
          <div className="flex space-x-8">
            <Link to="/" className="text-white hover:text-gray-300">
              Beranda
            </Link>
            <Link to="/data-rekap" className="text-white hover:text-gray-300">
              Data Rekap
            </Link>
          </div>
        </div>

        {/* Bagian Kanan: Tombol Login/Register */}
        <div className="flex space-x-4">
          {isLoggedIn ? (
            <>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
              >
                Log Out
              </button>
              {isSuperAdmin && (
                <Link
                  to="/register-validator"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
                >
                  Register Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition duration-300"
              >
                Login
              </Link>
              <Link
                to="/register-user"
                className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
