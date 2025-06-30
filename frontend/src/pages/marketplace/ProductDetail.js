import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // User role check
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user?.role;
  const canPurchase = userRole === 'buyer' || userRole === 'superadmin';

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching product details from:', `${process.env.REACT_APP_API_BASE_URL}/cases/${productId}`);
      
      // Periksa apakah productId valid
      if (!productId) {
        throw new Error('ID produk tidak valid');
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cases/${productId}`);
      
      // Log informasi response untuk debugging
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Produk tidak ditemukan');
        } else {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Gagal mengambil data produk (${response.status})`);
        }
      }
      
      const data = await response.json();
      console.log('Product data received:', data);
      
      // Set data produk dengan harga
      setProduct({
        ...data,
        hargaPerTon: 100000
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!product) return <div className="text-center py-10">Produk tidak ditemukan</div>;

  return (
    <div>
      <Header />
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Detail Kredit Karbon</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{product.kepemilikanLahan}</h2>
          
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
                <p><span className="font-medium">Jenis Pohon:</span> {product.jenisPohon}</p>
                <p><span className="font-medium">Luas Tanah:</span> {product.luasTanah} Ha</p>
                <p><span className="font-medium">Jumlah Karbon:</span> {product.jumlahKarbon} Ton</p>
                <p><span className="font-medium">Lembaga Sertifikasi:</span> {product.lembagaSertifikasi}</p>
                <p><span className="font-medium">Harga Per Ton:</span> Rp {product.hargaPerTon.toLocaleString()}</p>
              </div>
              
              {canPurchase ? (
                <button
                  onClick={() => navigate(`/buy/${product._id}`)}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                >
                  Beli Sekarang
                </button>
              ) : (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
                  <p className="font-medium">Informasi</p>
                  <p>Hanya akun dengan role buyer yang dapat melakukan pembelian kredit karbon.</p>
                  <p className="mt-2">Jika Anda ingin membeli, silakan <a href="/login" className="text-blue-600 underline">login</a> atau <a href="/register-user" className="text-blue-600 underline">daftar</a> sebagai buyer.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;