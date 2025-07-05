import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { format } from "date-fns";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // User role check
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const canPurchase = userRole === "buyer" || userRole === "superadmin";

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      console.log(
        "Fetching product details from:",
        `${process.env.REACT_APP_API_BASE_URL}/cases/${productId}`
      );

      // Periksa apakah productId valid
      if (!productId) {
        throw new Error("ID produk tidak valid");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/${productId}`
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data produk");
      }

      const data = await response.json();

      // Filter hanya proposal yang telah diterima
      const approvedProposals = data.proposals
        ? data.proposals.filter(
            (proposal) => proposal.statusProposal === "Diterima"
          )
        : [];

      // Hitung ulang jumlah karbon dari proposal yang diterima
      const totalKarbon = approvedProposals.reduce(
        (sum, proposal) => sum + proposal.jumlahKarbon,
        0
      );

      // Set data produk dengan harga dan proposal yang difilter
      setProduct({
        ...data,
        proposals: approvedProposals,
        jumlahKarbon: totalKarbon,
        hargaPerTon: 100000, // Harga tetap per ton
        totalHarga: totalKarbon * 100000, // Total harga
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy");
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error!</p>
            <p>{error}</p>
            <button
              onClick={() => navigate("/marketplace")}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Kembali ke Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4">
          <p>Produk tidak ditemukan.</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Kembali ke Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Kembali ke Marketplace
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              {product.files && product.files.length > 0 ? (
                <img
                  src={`${
                    process.env.REACT_APP_BACKEND_BASEURL
                  }/api/cases/${productId}/files/0?t=${Date.now()}`}
                  alt={product.kepemilikanLahan}
                  className="w-full h-64 md:h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/600x400?text=No+Image";
                  }}
                />
              ) : (
                <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Tidak ada gambar</span>
                </div>
              )}
            </div>

            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {product.namaProyek}
                </h1>
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Terverifikasi
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">
                    Informasi Proyek
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-gray-600 text-sm">Kepemilikan Lahan</p>
                      <p className="font-medium">{product.kepemilikanLahan}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Luas Tanah</p>
                      <p className="font-medium">{product.luasTanah} Ha</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Sarana Penyerap</p>
                      <p className="font-medium">
                        {product.saranaPenyerapEmisi}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">
                        Lembaga Sertifikasi
                      </p>
                      <p className="font-medium">
                        {product.lembagaSertifikasi}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Karbon</p>
                      <p className="font-medium">{product.jumlahKarbon} Ton</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Jumlah Sertifikat</p>
                      <p className="font-medium">
                        {product.jumlahKarbon} Sertifikat
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informasi penjual */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">
                    Informasi Penjual
                  </h2>
                  <div className="mt-2">
                    <p className="text-gray-600 text-sm">Nama Penjual</p>
                    <p className="font-medium">
                      {product.penggugah
                        ? `${product.penggugah.firstName} ${product.penggugah.lastName}`
                        : "Informasi penjual tidak tersedia"}
                    </p>
                  </div>
                </div>

                {/* Blockchain data jika ada */}
                {product.blockchainData &&
                  product.blockchainData.transactionHash && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-700">
                        Data Blockchain
                      </h2>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600 text-sm">
                            Transaction Hash
                          </p>
                          <a
                            href={`${process.env.REACT_APP_BESU_EXPLORER_URL}/tx/${product.blockchainData.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate block"
                          >
                            {product.blockchainData.transactionHash.substring(
                              0,
                              16
                            )}
                            ...
                          </a>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Block Number</p>
                          <p className="font-medium">
                            {product.blockchainData.blockNumber}
                          </p>
                        </div>
                        {product.blockchainData.tokens && (
                          <div>
                            <p className="text-gray-600 text-sm">Token Count</p>
                            <p className="font-medium">
                              {product.blockchainData.tokens.length}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-600 text-sm">Issued On</p>
                          <p className="font-medium">
                            {new Date(
                              product.blockchainData.issuedOn
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600 text-sm">Harga per Ton</p>
                      <p className="text-2xl font-bold text-green-600">
                        Rp {product.hargaPerTon.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Harga</p>
                      <p className="text-2xl font-bold text-green-600">
                        Rp {product.totalHarga.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {canPurchase && (
                    <button
                      onClick={() => navigate(`/buy/${productId}`)}
                      className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition duration-200"
                    >
                      Beli Sekarang
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Periode Penyerapan Karbon yang Tervalidasi */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Periode Penyerapan Karbon yang Tervalidasi
            </h2>

            {product.proposals && product.proposals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.proposals.map((proposal, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                      <span className="font-medium">Periode {index + 1}</span>
                    </div>

                    <div className="ml-5">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Tanggal Mulai</p>
                          <p className="font-medium">
                            {formatDate(proposal.tanggalMulai)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tanggal Selesai</p>
                          <p className="font-medium">
                            {formatDate(proposal.tanggalSelesai)}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">Jumlah Karbon</p>
                          <p className="font-medium">
                            {proposal.jumlahKarbon} Ton
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Tidak ada periode penyerapan karbon yang tervalidasi.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
