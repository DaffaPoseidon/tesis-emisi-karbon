import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/cases`
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil data produk");
        }

        const data = await response.json();
        console.log("Raw data received:", data);

        // Dalam struktur baru, langsung filter cases dengan status "Diterima"
        const availableProducts = data.cases
          .filter((product) => product.statusPengajuan === "Diterima")
          .map((product) => {
            return {
              ...product,
              jumlahKarbon: Number(product.jumlahKarbon) || 0,
              hargaPerTon: 100000, // Harga tetap per ton
              totalHarga: (Number(product.jumlahKarbon) || 0) * 100000, // Total harga
            };
          })
          .filter((product) => product.jumlahKarbon > 0);

        console.log("Processed products:", availableProducts);
        setProducts(availableProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products berdasarkan search term
  const filteredProducts = products.filter(
    (product) =>
      product.namaProyek.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.saranaPenyerapEmisi
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

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

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4">
            Carbon Marketplace
          </h1>
          <p className="text-center text-gray-600 max-w-3xl mx-auto">
            Purchase carbon credits to offset your emissions.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error!</p>
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Cari proyek berdasarkan nama atau jenis penyerap..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No products available
            </h3>
            <p className="mt-1 text-gray-500">
              There are no carbon projects matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      {product.namaProyek}
                    </h2>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p>
                      <span className="font-medium">Absorption Medium:</span>{" "}
                      {product.saranaPenyerapEmisi}
                    </p>
                    <p>
                      <span className="font-medium">Land Area:</span>{" "}
                      {product.luasTanah} Ha
                    </p>
                    <p>
                      <span className="font-medium">Certification Organization:</span>{" "}
                      {product.lembagaSertifikasi}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Absorption Period:</h3>
                    <div className="text-sm bg-gray-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span>
                          {new Date(product.tanggalMulai).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            product.tanggalSelesai
                          ).toLocaleDateString()}
                        </span>
                        <span className="font-medium">
                          {product.jumlahKarbon} Ton
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="text-gray-500">Total Carbon</p>
                      <p className="text-xl font-bold text-gray-800">
                        {product.jumlahKarbon} Ton
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Price per Ton</p>
                      <p className="text-xl font-bold text-green-600">
                        Rp {product.hargaPerTon.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <p className="text-gray-500">Penjual</p>
                        <p className="font-medium text-gray-800">
                          {product.penggugah
                            ? `${product.penggugah.firstName} ${product.penggugah.lastName}`
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/product/${product._id}`}
                      className="flex items-center text-green-600"
                    >
                      <span className="mr-1">Details</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
