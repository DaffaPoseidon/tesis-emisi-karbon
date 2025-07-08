import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [carbonProducts, setCarbonProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const [imageError, setImageError] = useState(false);
  const canPurchase = userRole === "buyer" || userRole === "superadmin";

  // Tambahkan di useEffect
  useEffect(() => {
    console.log("Backend URL:", process.env.REACT_APP_BACKEND_BASEURL);
    console.log("API URL:", process.env.REACT_APP_API_BASE_URL);
    console.log(
      "Image URL Example:",
      `${process.env.REACT_APP_BACKEND_BASEURL}/api/cases/[product-id]/files/0`
    );

    // Check login status
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(!!user);
    setIsLoading(false);

    // Fetch carbon products
    fetchCarbonProducts();
  }, []);

 const fetchCarbonProducts = async () => {
  setIsLoadingProducts(true);
  try {
    console.log("Fetching carbon products...");
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/cases`
    );

    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw data received:", data);

    // Pastikan data dalam format yang benar
    if (!data || !data.cases || !Array.isArray(data.cases)) {
      console.error("Invalid data format:", data);
      setCarbonProducts([]);
      return;
    }

    // Dalam struktur baru, langsung filter cases dengan status "Diterima"
    const approvedProducts = data.cases
      .filter(item => item.statusPengajuan === "Diterima")
      .map((item) => {
        return {
          ...item,
          jumlahKarbon: Number(item.jumlahKarbon) || 0,
          hargaPerTon: 100000,
          imageUrl: item._id
            ? `${process.env.REACT_APP_BACKEND_BASEURL}/api/cases/${item._id}/files/0`
            : null,
          imageUrlWithTimestamp: item._id
            ? `${process.env.REACT_APP_BACKEND_BASEURL}/api/cases/${
                item._id
              }/files/0?t=${Date.now()}`
            : null,
        };
      })
      .filter(product => product.jumlahKarbon > 0);

    console.log("Processed products:", approvedProducts);
    setCarbonProducts(approvedProducts);
  } catch (error) {
    console.error("Error fetching carbon products:", error);
    setCarbonProducts([]);
  } finally {
    setIsLoadingProducts(false);
  }
};

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleProductClick = (productId) => {
    // Validasi ID sebelum navigasi
    if (!productId) {
      console.error("Error: Trying to view product with undefined ID");
      alert("Maaf, produk ini tidak memiliki ID yang valid");
      return;
    }
    navigate(`/product/${productId}`);
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
        <div className="text-center mt-10 p-4 sm:w-full md:w-3/4 lg:w-1/2">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-600 mb-6">
            BLOCKCHAIN MARKETPLACE EMISI KARBON!
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-6">
            Jelajahi dan investasikan pada proyek penyerapan karbon
            terverifikasi.
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

        {/* Carbon Emission Marketplace Section */}
        <div className="w-full bg-white py-12 px-4 mt-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Marketplace Emisi Karbon
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Jelajahi dan dapatkan kredit karbon terverifikasi yang telah
                divalidasi oleh validator terpercaya. Setiap produk mewakili
                proyek penyerapan karbon dengan blockchain sebagai jaminan
                keaslian.
              </p>
            </div>

            {isLoadingProducts ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {carbonProducts.length > 0 ? (
                  carbonProducts.map((product) => (
                    <div
                      key={product._id || `temp-${Math.random()}`} // Tambahkan fallback untuk key
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative h-48 bg-gray-200">
                        {product.files && product.files.length > 0 ? (
                          <div className="relative">
                            {imageError ? (
                              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md">
                                <span className="text-gray-500">
                                  Gambar tidak tersedia
                                </span>
                              </div>
                            ) : (
                              <img
                                src={
                                  product._id
                                    ? `${
                                        process.env.REACT_APP_BACKEND_BASEURL
                                      }/api/cases/${
                                        product._id
                                      }/files/0?t=${Date.now()}`
                                    : null
                                }
                                alt={
                                  product.kepemilikanLahan || "Produk Karbon"
                                }
                                className="w-full h-64 object-cover rounded-md"
                                onError={() => setImageError(true)}
                              />
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md">
                            <span className="text-gray-500">
                              Tidak ada gambar
                            </span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Terverifikasi
                        </div>
                        {product.blockchainData &&
                          product.blockchainData.transactionHash && (
                            <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Blockchain
                            </div>
                          )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                          {product.kepemilikanLahan || "Proyek Karbon"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Jenis Pohon:</span>{" "}
                          {product.jenisPohon || "-"}
                        </p>

                        <div className="flex justify-between mb-3">
                          <div>
                            <span className="text-sm text-gray-500">
                              Luas Tanah
                            </span>
                            <p className="font-medium">
                              {product.luasTanah || 0} Ha
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Jumlah Karbon
                            </span>
                            <p className="font-medium">
                              {product.jumlahKarbon || 0} Ton
                            </p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm text-gray-500">
                            Jumlah Sertifikat
                          </span>
                          <p className="font-medium">
                            {product.jumlahKarbon || 0} Sertifikat
                          </p>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm text-gray-500">
                            Lembaga Sertifikasi
                          </span>
                          <p className="text-sm font-medium truncate">
                            {product.lembagaSertifikasi || "-"}
                          </p>
                        </div>

                        <div className="mb-3">
                          <span className="text-sm text-gray-500">Penjual</span>
                          <p className="text-sm font-medium truncate">
                            {product.penggugah
                              ? `${product.penggugah.firstName || ""} ${
                                  product.penggugah.lastName || ""
                                }`
                              : "Informasi penjual tidak tersedia"}
                          </p>
                        </div>

                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-sm text-gray-500">
                              Total Harga
                            </span>
                            <p className="text-lg font-bold text-green-600">
                              Rp{" "}
                              {(
                                (product.hargaPerTon || 0) *
                                (product.jumlahKarbon || 0)
                              ).toLocaleString()}
                            </p>
                          </div>
                          {product._id ? (
                            <>
                              <button
                                onClick={() => handleProductClick(product._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition"
                              >
                                Lihat Detail
                              </button>
                              {canPurchase && (
                                <button
                                  onClick={() =>
                                    navigate(`/buy/${product._id}`)
                                  }
                                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition"
                                >
                                  Beli Sekarang
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-red-500 text-xs">
                              ID Produk tidak tersedia
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div>
                            Tervalidasi:{" "}
                            {new Date(
                              product.blockchainData?.issuedOn ||
                                product.updatedAt ||
                                new Date()
                            ).toLocaleDateString()}
                          </div>
                          {product.blockchainData &&
                            product.blockchainData.tokens && (
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-green-500 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span>
                                  {product.blockchainData.tokens.length} Token
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    Tidak ada produk karbon yang tersedia saat ini. Silakan
                    tunggu validator menyetujui pengajuan.
                  </div>
                )}
              </div>
            )}

            <div className="mt-10 text-center">
              <button
                onClick={() => navigate("/marketplace")}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
              >
                Lihat Semua Produk
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
