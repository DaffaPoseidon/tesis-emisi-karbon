import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    personalAddress: "",
    companyDetails: {
      name: "",
      address: "",
      phone: "",
      taxId: "",
      industry: ""
    }
  });

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate("/login");
          return;
        }
        
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
        
        const data = await response.json();
        setUser(data.user);
        
        // Initialize form data
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          phoneNumber: data.user.phoneNumber || "",
          personalAddress: data.user.personalAddress || "",
          companyDetails: {
            name: data.user.companyDetails?.name || "",
            address: data.user.companyDetails?.address || "",
            phone: data.user.companyDetails?.phone || "",
            taxId: data.user.companyDetails?.taxId || "",
            industry: data.user.companyDetails?.industry || ""
          }
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("company.")) {
      const companyField = name.split(".")[1];
      setFormData({
        ...formData,
        companyDetails: {
          ...formData.companyDetails,
          [companyField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      const data = await response.json();
      setUser(data.user);
      setEditMode(false);
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message);
    } finally {
      setLoading(false);
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
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-bold">No user data</p>
            <p>Please login to view your account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-1/4 bg-gray-50 p-6 border-r border-gray-200">
              <div className="sticky top-8">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600 mt-1">Role: {user.role}</p>
                </div>
                
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full text-left px-4 py-2 rounded ${
                      activeTab === "profile"
                        ? "bg-green-100 text-green-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Profile
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("balance")}
                    className={`w-full text-left px-4 py-2 rounded ${
                      activeTab === "balance"
                        ? "bg-green-100 text-green-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Saldo
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("carbon")}
                    className={`w-full text-left px-4 py-2 rounded ${
                      activeTab === "carbon"
                        ? "bg-green-100 text-green-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Kepemilikan Karbon
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="md:w-3/4 p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                      Profil Akun
                    </h1>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {editMode ? "Batal" : "Edit Profil"}
                    </button>
                  </div>
                  
                  {editMode ? (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">
                          Informasi Pribadi
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Nama Depan
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Nama Belakang
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Nomor Telepon
                            </label>
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Alamat
                            </label>
                            <input
                              type="text"
                              name="personalAddress"
                              value={formData.personalAddress}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">
                          Informasi Perusahaan
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Nama Perusahaan
                            </label>
                            <input
                              type="text"
                              name="company.name"
                              value={formData.companyDetails.name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Telepon Perusahaan
                            </label>
                            <input
                              type="tel"
                              name="company.phone"
                              value={formData.companyDetails.phone}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Alamat Perusahaan
                            </label>
                            <input
                              type="text"
                              name="company.address"
                              value={formData.companyDetails.address}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              NPWP
                            </label>
                            <input
                              type="text"
                              name="company.taxId"
                              value={formData.companyDetails.taxId}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Industri
                            </label>
                            <input
                              type="text"
                              name="company.industry"
                              value={formData.companyDetails.industry}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Simpan Perubahan
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">
                          Informasi Pribadi
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Nama Lengkap</p>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Telepon</p>
                              <p className="font-medium">
                                {user.phoneNumber || "Belum diisi"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Alamat</p>
                              <p className="font-medium">
                                {user.personalAddress || "Belum diisi"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">
                          Informasi Perusahaan
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Nama Perusahaan</p>
                              <p className="font-medium">
                                {user.companyDetails?.name || "Belum diisi"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Telepon</p>
                              <p className="font-medium">
                                {user.companyDetails?.phone || "Belum diisi"}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">Alamat</p>
                              <p className="font-medium">
                                {user.companyDetails?.address || "Belum diisi"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">NPWP</p>
                              <p className="font-medium">
                                {user.companyDetails?.taxId || "Belum diisi"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Industri</p>
                              <p className="font-medium">
                                {user.companyDetails?.industry || "Belum diisi"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Balance Tab */}
              {activeTab === "balance" && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Saldo Akun
                  </h1>
                  
                  <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white mb-6">
                    <p className="text-xl font-semibold mb-1">Total Saldo</p>
                    <p className="text-4xl font-bold">
                      Rp {user.balance?.toLocaleString("id-ID") || "0"}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">
                      Riwayat Transaksi
                    </h2>
                    
                    {user.carbonCredits && user.carbonCredits.length > 0 ? (
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Deskripsi
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jumlah
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {user.carbonCredits.map((credit, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(credit.purchaseDate).toLocaleDateString("id-ID")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  Pembelian kredit karbon {credit.caseId?.namaProyek || "Proyek"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                                  -Rp {(credit.quantity * 100000).toLocaleString("id-ID")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded text-center text-gray-500">
                        Belum ada riwayat transaksi
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Carbon Credits Tab */}
              {activeTab === "carbon" && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Kepemilikan Kredit Karbon
                  </h1>
                  
                  <div className="bg-green-50 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-green-800">Total Kredit Karbon</h2>
                      <span className="text-2xl font-bold text-green-600">
                        {user.carbonCredits?.reduce((total, credit) => total + credit.quantity, 0) || 0} Ton
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      Kredit karbon yang Anda miliki dapat digunakan untuk mengimbangi emisi karbon dari aktivitas bisnis Anda.
                    </p>
                  </div>
                  
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Detail Kepemilikan
                  </h2>
                  
                  {user.carbonCredits && user.carbonCredits.length > 0 ? (
                    <div className="space-y-4">
                      {user.carbonCredits.map((credit, index) => (
                        <div key={index} className="bg-white border rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-800">
                              {credit.caseId?.namaProyek || "Kredit Karbon"}
                            </h3>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {credit.quantity} Ton
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">ID Transaksi</p>
                              <p className="truncate">{credit.transactionId}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Tanggal Pembelian</p>
                              <p>{new Date(credit.purchaseDate).toLocaleDateString("id-ID")}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Sarana Penyerap</p>
                              <p>{credit.caseId?.saranaPenyerapEmisi || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Lembaga Sertifikasi</p>
                              <p>{credit.caseId?.lembagaSertifikasi || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded text-center text-gray-500">
                      Anda belum memiliki kredit karbon
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;