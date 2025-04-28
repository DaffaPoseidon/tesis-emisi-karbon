
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check login status
    const user = JSON.parse(localStorage.getItem('user'));
    setIsLoggedIn(!!user);
    setIsLoading(false);
  }, []);

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center p-4 sm:w-full md:w-3/4 lg:w-1/2">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-600 mb-6">
            Selamat Datang di Sistem Rekap Penanganan Perkara
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-6">
            Pantau perkembangan perkara secara langsung di pengadilan.
          </p>
          
          {isLoggedIn ? (
            <button
              onClick={handleDashboardClick}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Masuk ke Dashboard
            </button>
          ) : (
            <div className="flex flex-col space-y-4 items-center">
              <p className="text-lg text-gray-600">
                Silakan login untuk mengakses dashboard
              </p>
              <button
                onClick={handleLoginClick}
                className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
              >
                Login Sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;