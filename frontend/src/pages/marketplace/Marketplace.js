import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Tambahkan user role check
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user?.role;
  const canPurchase = userRole === 'buyer' || userRole === 'superadmin';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cases`);
      
      if (response.ok) {
        const data = await response.json();
        // Filter produk yang sudah diterima
        const approvedProducts = data.cases.filter(
          item => item.statusPengajuan === "Diterima"
        );
        
        // Set harga tetap Rp 100.000
        const productsWithPrice = approvedProducts.map(product => ({
          ...product,
          hargaPerTon: 100000
        }));
        
        setProducts(productsWithPrice);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
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
              products.map(product => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48 bg-gray-200">
                    {product.files && product.files.length > 0 ? (
                      <img 
                        src={`${process.env.REACT_APP_BACKEND_BASEURL}/api/cases/${product._id}/files/0`}
                        alt={product.kepemilikanLahan}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const container = e.target.parentNode;
                          if (container) {
                            const fallbackDiv = document.createElement("div");
                            fallbackDiv.className = "w-full h-full flex items-center justify-center bg-gray-300";
                            fallbackDiv.innerHTML = '<span class="text-gray-500">Gambar tidak tersedia</span>';
                            container.appendChild(fallbackDiv);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                        <span>Tidak ada gambar</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold">{product.kepemilikanLahan}</h3>
                    <p className="text-gray-600">{product.jenisPohon}</p>
                    <p className="text-green-600 font-bold mt-2">Rp {product.hargaPerTon.toLocaleString()}/ton</p>
                    
                    {/* Bagian tombol dengan kondisi role */}
                    <div className="mt-4 flex space-x-2">
                      <button 
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex-1"
                      >
                        Lihat Detail
                      </button>
                      
                      {canPurchase && (
                        <button 
                          onClick={() => navigate(`/buy/${product._id}`)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex-1"
                        >
                          Beli Sekarang
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center col-span-full">Tidak ada produk yang tersedia saat ini.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;