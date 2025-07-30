import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";

const ProductDetail = () => {
  const { id } = useParams();
  console.log("Product ID from URL:", id);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductDetails = async () => {
    try {
      console.log("Fetching product with ID:", id);
      setLoading(true);

      if (!id) {
        throw new Error("ID produk tidak valid");
      }

      // Tambahkan token autentikasi
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Tambahkan header Authorization
          },
        }
      );

      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error("Gagal mengambil data produk");
      }

      const data = await response.json();
      console.log("Product data received:", data);

      // Verifikasi status produk
      if (data.statusPengajuan !== "Diterima") {
        throw new Error("Produk ini belum disetujui");
      }

      // Set data produk dengan harga
      setProduct({
        ...data,
        jumlahKarbon: Number(data.jumlahKarbon) || 0,
        hargaPerTon: 100000,
        totalHarga: (Number(data.jumlahKarbon) || 0) * 100000,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    } else {
      console.error("No product ID available");
      setError("ID produk tidak ditemukan");
      setLoading(false);
    }
  }, [id]);

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

  if (!product || product.jumlahKarbon <= 0) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-bold">Not Available</p>
            <p>
              Produk ini tidak memiliki jumlah karbon yang tersedia atau telah
              terjual habis.
            </p>
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
            to="/marketplace"
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
            Back to Marketplace
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.namaProyek}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Project Details
                  </h2>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Land Area:</span>{" "}
                      {product.luasTanah} Meter
                    </p>
                    <p>
                      <span className="font-medium">Absorption Method:</span>{" "}
                      {product.saranaPenyerapEmisi}
                    </p>
                    <p>
                      <span className="font-medium">Ownership:</span>{" "}
                      {product.kepemilikanLahan}
                    </p>
                    <p>
                      <span className="font-medium">
                        Certification Institute:
                      </span>{" "}
                      {product.lembagaSertifikasi}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {product.pengunggah
                        ? `${product.pengunggah.firstName} ${product.pengunggah.lastName}`
                        : "Not Available"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {product.pengunggah
                        ? product.pengunggah.email
                        : "Not Available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Carbon Absorption Period
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Period</span>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        Approved
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p>{formatDate(product.tanggalMulai)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">End Date</p>
                        <p>{formatDate(product.tanggalSelesai)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Carbon Amount</p>
                        <p className="font-medium">
                          {product.jumlahKarbon} Tons
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {product.blockchainData &&
                product.blockchainData.transactionHash && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-blue-700 mb-2">
                      Blockchain Verification
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Transaction Hash
                        </p>
                        <a
                          href={`${process.env.REACT_APP_BESU_EXPLORER_URL}/tx/${product.blockchainData.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {`${product.blockchainData.transactionHash.substring(
                            0,
                            10
                          )}...`}
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Block Number</p>
                        <p>{product.blockchainData.blockNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tokens</p>
                        <p>
                          {product.blockchainData.tokens
                            ? product.blockchainData.tokens.length
                            : 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Issued On</p>
                        <p>
                          {product.blockchainData.issuedOn
                            ? new Date(
                                product.blockchainData.issuedOn
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <div className="md:w-1/3 bg-gray-50 p-8 border-l border-gray-200">
              <div className="sticky top-8">
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Rp {product.hargaPerTon.toLocaleString("id-ID")}/Ton
                  </h2>
                  <div className="mb-4">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span>Total Carbon</span>
                      <span className="font-medium">
                        {product.jumlahKarbon} Tons
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span>Total Value</span>
                      <span className="font-medium">
                        Rp {product.totalHarga.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                  {product.statusPengajuan === "Diterima" ? (
                    <Link
                      to={`/product/${product._id}/buy`}
                      className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-medium py-3 px-4 rounded-md transition duration-200"
                    >
                      Buy Now
                    </Link>
                  ) : (
                    <button className="w-full bg-gray-400 text-white text-center font-medium py-3 px-4 rounded-md cursor-not-allowed">
                      Not Available
                    </button>
                  )}{" "}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700 mb-2">
                    Important Notes:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>
                      • Carbon certificates can be used to offset company
                      emissions.
                    </li>
                    <li>• All transactions are verified through blockchain.</li>
                    <li>
                      • Each ton of carbon is represented as an NFT on the
                      blockchain.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
