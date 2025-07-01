import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const BuyProduct = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  // Cek apakah user dapat membeli (hanya buyer)
  const canPurchase = userRole === "buyer" || userRole === "superadmin";

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
      setProduct(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    // Biarkan siapapun melihat detail produk, tapi verifikasi role untuk pembelian
    fetchProductDetails();
  }, [productId, fetchProductDetails]);

  const handlePurchase = async () => {
    if (!canPurchase) {
      alert(
        "Hanya buyer yang dapat melakukan pembelian. Silakan login sebagai buyer."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/purchases`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            productId,
            quantity,
            totalPrice: product.hargaPerTon * quantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Gagal melakukan pembelian");
      }

      // Berhasil melakukan pembelian
      alert("Pembelian berhasil!");
      navigate("/marketplace");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product)
    return <div className="text-center py-10">Produk tidak ditemukan</div>;

  return (
    <div>
      <Header />
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Detail Kredit Karbon</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {product.kepemilikanLahan}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {product.files && product.files.length > 0 ? (
                <img
                  src={`${process.env.REACT_APP_BACKEND_BASEURL}/api/cases/${product._id}/files/0`}
                  alt={product.kepemilikanLahan}
                  className="w-full h-64 object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md">
                  <span className="text-gray-500">Tidak ada gambar</span>
                </div>
              )}
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Detail Produk</h3>
                <p>
                  <span className="font-medium">Jenis Pohon:</span>{" "}
                  {product.jenisPohon}
                </p>
                <p>
                  <span className="font-medium">Luas Tanah:</span>{" "}
                  {product.luasTanah} Ha
                </p>
                <p>
                  <span className="font-medium">Jumlah Karbon:</span>{" "}
                  {product.jumlahKarbon} Ton
                </p>
                <p>
                  <span className="font-medium">Lembaga Sertifikasi:</span>{" "}
                  {product.lembagaSertifikasi}
                </p>
                <p>
                  <span className="font-medium">Harga Per Ton:</span> Rp{" "}
                  {product.hargaPerTon?.toLocaleString()}
                </p>
              </div>

              {canPurchase ? (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">
                      Jumlah (Ton)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={product.jumlahKarbon}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">
                      Ringkasan Pembelian
                    </h3>
                    <p>
                      <span className="font-medium">Jumlah:</span> {quantity}{" "}
                      Ton
                    </p>
                    <p>
                      <span className="font-medium">Jumlah Sertifikat:</span>{" "}
                      {quantity} Sertifikat
                    </p>
                    <p>
                      <span className="font-medium">Harga Per Ton:</span> Rp{" "}
                      {product.hargaPerTon?.toLocaleString()}
                    </p>
                    <p className="text-xl font-bold mt-2">
                      Total: Rp{" "}
                      {(product.hargaPerTon * quantity).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={handlePurchase}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                  >
                    {loading ? "Memproses..." : "Beli Sekarang"}
                  </button>
                </>
              ) : (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
                  <p className="font-medium">Informasi</p>
                  <p>
                    Hanya akun dengan role buyer yang dapat melakukan pembelian
                    kredit karbon.
                  </p>
                  <p className="mt-2">
                    Jika Anda ingin membeli, silakan{" "}
                    <a href="/login" className="text-blue-600 underline">
                      login
                    </a>{" "}
                    atau{" "}
                    <a
                      href="/register-user"
                      className="text-blue-600 underline"
                    >
                      daftar
                    </a>{" "}
                    sebagai buyer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyProduct;
