import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const BuyProduct = () => {
  const { id } = useParams(); // Ubah dari productId ke id
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    address: "",
  });

  const fetchProductDetails = useCallback(async () => {
    try {
      console.log("Fetching product with ID:", id);
      setLoading(true);

      if (!id) {
        throw new Error("ID produk tidak valid");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/${id}`
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data produk");
      }

      const data = await response.json();

      // Verifikasi status produk
      if (data.statusPengajuan !== "Diterima") {
        throw new Error("Produk ini belum disetujui");
      }

      // Set data produk dengan harga
      setProduct({
        ...data,
        jumlahKarbon: Number(data.jumlahKarbon) || 0,
        hargaPerTon: 100000, // Harga tetap per ton
        totalHarga: (Number(data.jumlahKarbon) || 0) * 100000, // Total harga
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetails();

    // Isi form dengan data user yang sudah login
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData({
        ...formData,
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
      });
    }
  }, [fetchProductDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && value <= (product ? product.jumlahKarbon : 1)) {
      setQuantity(value);
    }
  };

  const calculateTotal = () => {
    if (!product) return 0;
    return quantity * product.hargaPerTon;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Ambil token dari localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Anda harus login terlebih dahulu");
      }

      const purchaseData = {
        caseId: product._id,
        quantity: quantity,
        totalPrice: calculateTotal(),
        paymentMethod: paymentMethod,
        buyerInfo: formData,
      };

      // Gunakan endpoint users/purchase yang baru
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/users/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(purchaseData),
        }
      );

      if (!response.ok) {
        // Parse response dengan error handling yang lebih baik
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal melakukan pembelian");
        } else {
          const errorText = await response.text();
          console.error("Non-JSON error response:", errorText);
          throw new Error("Terjadi kesalahan pada server");
        }
      }

      const data = await response.json();

      alert(
        "Transaction successful! Please check your carbon holdings on the Account page."
      );
      navigate("/account");
    } catch (error) {
      console.error("Error processing purchase:", error);
      setError(error.message);
      alert(`Failed to process purchase: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          </div>
          <Link
            to="/marketplace"
            className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-bold">Product not available</p>
            <p>This product isn't available</p>
          </div>
          <Link
            to="/marketplace"
            className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Link
            to={`/product/${id}`}
            className="text-blue-600 hover:text-blue-800 flex items-center"
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
            Back to Product Details
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Purchase Form
              </h1>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Buyer Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Purchase Amount
                  </h2>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="1"
                      max={product.jumlahKarbon}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-600">
                      of {product.jumlahKarbon} Tons available
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Payment Method
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="transfer"
                        name="paymentMethod"
                        value="transfer"
                        checked={paymentMethod === "transfer"}
                        onChange={() => setPaymentMethod("transfer")}
                        className="mr-2"
                      />
                      <label htmlFor="transfer">Bank</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="emoney"
                        name="paymentMethod"
                        value="emoney"
                        checked={paymentMethod === "emoney"}
                        onChange={() => setPaymentMethod("emoney")}
                        className="mr-2"
                      />
                      <label htmlFor="emoney">DANA</label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition duration-200"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm Purchase"}
                </button>
              </form>
            </div>

            <div className="md:w-1/2 bg-gray-50 p-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Purchase Summary
              </h2>

              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <h3 className="font-medium text-lg mb-2">
                  {product.namaProyek}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Absorption Medium</p>
                    <p className="font-medium">{product.saranaPenyerapEmisi}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Land Area</p>
                    <p className="font-medium">{product.luasTanah} Meter</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Certification Organization</p>
                    <p className="font-medium">{product.lembagaSertifikasi}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Carbon Absorption Period
              </h2>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <p className="text-gray-600">Start Date</p>
                    <p className="font-medium">
                      {formatDate(product.tanggalMulai)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">End Date</p>
                    <p className="font-medium">
                      {formatDate(product.tanggalSelesai)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Carbon Amount</p>
                    <p className="font-medium">{product.jumlahKarbon} Ton</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Total Cost Summary
                </h2>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between py-2">
                    <span>Price per Ton</span>
                    <span>
                      Rp {product.hargaPerTon.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Amount</span>
                    <span>{quantity} Tons</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-lg border-t border-gray-200 mt-2 pt-2">
                    <span>Total</span>
                    <span>Rp {calculateTotal().toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyProduct;
