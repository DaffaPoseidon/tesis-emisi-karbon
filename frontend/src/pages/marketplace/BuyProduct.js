import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const BuyProduct = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  // User data
  const user = JSON.parse(localStorage.getItem("user"));
  const canPurchase =
    user && (user.role === "buyer" || user.role === "superadmin");

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
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

      // Set data produk dengan harga
      setProduct({
        ...data,
        proposals: approvedProposals,
        jumlahKarbon: totalKarbon,
        hargaPerTon: 100000, // Harga tetap per ton
        totalHarga: totalKarbon * 100000, // Total harga
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!canPurchase) {
      navigate("/marketplace");
      return;
    }
    fetchProductDetails();
  }, [productId, fetchProductDetails, canPurchase, navigate]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= product.jumlahKarbon) {
      setQuantity(value);
    }
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    return quantity * product.hargaPerTon;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !canPurchase) {
      setError("Anda harus login sebagai buyer untuk melakukan pembelian");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const purchaseData = {
        productId: productId,
        quantity: quantity,
        totalPrice: calculateTotalPrice(),
        buyerId: user._id,
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(purchaseData),
        }
      );

      if (response.ok) {
        alert("Pembelian berhasil!");
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Terjadi kesalahan pada pembelian"
        );
      }
    } catch (error) {
      console.error("Error processing purchase:", error);
      setError(error.message);
    }
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
            onClick={() => navigate(`/product/${productId}`)}
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
            Kembali ke Detail Produk
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Checkout
              </h1>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Informasi Produk
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800">
                    {product.namaProyek}
                  </h3>
                  <p className="text-gray-600">
                    Kepemilikan: {product.kepemilikanLahan}
                  </p>
                  <p className="text-gray-600">
                    Lembaga Sertifikasi: {product.lembagaSertifikasi}
                  </p>
                  <p className="text-gray-600">
                    Total Karbon: {product.jumlahKarbon} Ton
                  </p>
                  <p className="text-gray-600">
                    Harga per Ton: Rp {product.hargaPerTon.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Informasi Penjual
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    {product.penggugah
                      ? `${product.penggugah.firstName} ${product.penggugah.lastName}`
                      : "Informasi penjual tidak tersedia"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="quantity"
                    className="block text-lg font-semibold text-gray-700 mb-2"
                  >
                    Jumlah Pembelian (Ton)
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.jumlahKarbon}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maksimum: {product.jumlahKarbon} Ton
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Ringkasan Pembelian
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Harga per Ton</span>
                      <span>Rp {product.hargaPerTon.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Jumlah</span>
                      <span>{quantity} Ton</span>
                    </div>
                    <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>Rp {calculateTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition duration-200"
                >
                  Konfirmasi Pembelian
                </button>
              </form>
            </div>

            <div className="md:w-1/2 bg-gray-50 p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Periode Penyerapan Karbon yang Dibeli
              </h2>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {product.proposals && product.proposals.length > 0 ? (
                  product.proposals.map((proposal, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg shadow-sm"
                    >
                      <h3 className="font-medium text-gray-800">
                        Periode {index + 1}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <p className="text-gray-600">Tanggal Mulai</p>
                          <p className="font-medium">
                            {new Date(
                              proposal.tanggalMulai
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tanggal Selesai</p>
                          <p className="font-medium">
                            {new Date(
                              proposal.tanggalSelesai
                            ).toLocaleDateString()}
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
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    Tidak ada data periode penyerapan karbon yang tersedia.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyProduct;
