import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Tambahkan user role check
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const canPurchase = userRole === "buyer" || userRole === "superadmin";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases`
      );

      if (response.ok) {
        const data = await response.json();

        // Filter produk yang sudah diterima
        const approvedProducts = data.cases.filter(
          (item) => item.statusPengajuan === "Diterima"
        );

        // Untuk setiap produk, filter proposal yang sudah diterima
        const productsWithApprovedProposals = approvedProducts.map(
          (product) => {
            const approvedProposals = product.proposals
              ? product.proposals.filter(
                  (proposal) => proposal.statusProposal === "Diterima"
                )
              : [];

            // Hitung total karbon dari proposal yang diterima
            const totalKarbon = approvedProposals.reduce(
              (sum, proposal) => sum + proposal.jumlahKarbon,
              0
            );

            return {
              ...product,
              proposals: approvedProposals,
              jumlahKarbon: totalKarbon,
              hargaPerTon: 100000, // Harga tetap 100.000 per ton
            };
          }
        );

        // Filter produk yang memiliki setidaknya satu proposal yang diterima
        const validProducts = productsWithApprovedProposals.filter(
          (product) => product.proposals.length > 0 && product.jumlahKarbon > 0
        );

        setProducts(validProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Marketplace Emisi Karbon</h1>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48 bg-gray-200">
                    {product.files && product.files.length > 0 ? (
                      <img
                        src={`${
                          process.env.REACT_APP_BACKEND_BASEURL
                        }/api/cases/${product._id}/files/0?t=${Date.now()}`}
                        alt={product.kepemilikanLahan}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/300x200?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center">
                        <span className="text-gray-500">Tidak ada gambar</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Terverifikasi
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                      {product.namaProyek}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Jenis Penyerap:</span>{" "}
                      {product.saranaPenyerapEmisi}
                    </p>

                    {/* Informasi penjual */}
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Penjual:</span>{" "}
                      {product.penggugah
                        ? `${product.penggugah.firstName} ${product.penggugah.lastName}`
                        : "Informasi penjual tidak tersedia"}
                    </p>

                    <div className="flex justify-between mb-3">
                      <div>
                        <span className="text-sm text-gray-500">
                          Luas Tanah
                        </span>
                        <p className="font-medium">{product.luasTanah} Ha</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">
                          Jumlah Karbon
                        </span>
                        <p className="font-medium">
                          {product.jumlahKarbon} Ton
                        </p>
                      </div>
                    </div>

                    {/* Menampilkan jumlah proposal yang disetujui */}
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">
                        Jumlah Periode Tervalidasi
                      </span>
                      <p className="font-medium">
                        {product.proposals.length} Periode
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
                            product.hargaPerTon * product.jumlahKarbon
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProductClick(product._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition"
                        >
                          Lihat Detail
                        </button>
                        {canPurchase && (
                          <button
                            onClick={() => navigate(`/buy/${product._id}`)}
                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition"
                          >
                            Beli
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                Tidak ada produk karbon yang tersedia saat ini. Silakan tunggu
                validator menyetujui pengajuan.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
