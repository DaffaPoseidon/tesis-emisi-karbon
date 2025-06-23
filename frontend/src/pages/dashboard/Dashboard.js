import React, { useState, useEffect, useCallback, useRef } from 'react';
import CaseForm from './CaseForm';
import CaseTable from './CaseTable';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    luasTanah: "",
    jenisPohon: "",
    lembagaSertifikasi: "",
    jumlahKarbon: "",
    metodePengukuran: "",
    jenisTanah: "",
    lokasiGeografis: "",
    kepemilikanLahan: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false); // State untuk modal
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const initialFormState = {
    luasTanah: "",
    jenisPohon: "",
    lembagaSertifikasi: "",
    jumlahKarbon: "",
    metodePengukuran: "",
    jenisTanah: "",
    lokasiGeografis: "",
    kepemilikanLahan: "",
    file: null,
  };

  // Fetch daftar kasus
  const fetchCases = useCallback(async () => {
    console.log("Fetching cases...");
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        console.log("Cases fetched successfully:", data.cases.length);
        setCases(data.cases);
        return true; // Return success for promise chaining
      } else {
        console.error("Gagal mengambil data");
        return false;
      }
    } catch (error) {
      console.error("Error:", error.message);
      return false;
    }
  }, []);
  
  // Memastikan fetchCases dipanggil pada mount
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleDownloadExcel = () => {
    const modifiedCases = cases.map((caseItem, index) => ({
      Nomor: index + 1,
      "Luas Tanah (Ha)": caseItem.luasTanah,
      "Jenis Pohon": caseItem.jenisPohon,
      "Lembaga Sertifikasi": caseItem.lembagaSertifikasi,
      "Jumlah Karbon (Ton)": caseItem.jumlahKarbon,
      "Metode Pengukuran": caseItem.metodePengukuran,
      "Jenis Tanah": caseItem.jenisTanah,
      "Lokasi Geografis": caseItem.lokasiGeografis,
      "Kepemilikan Lahan": caseItem.kepemilikanLahan,
    }));

    const ws = XLSX.utils.json_to_sheet(modifiedCases);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Pengajuan');
    XLSX.writeFile(wb, 'data_pengajuan.xlsx');
  };

  // Fungsi delete kasus
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cases/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Data berhasil dihapus');
        fetchCases(); // Refresh data setelah delete
      } else {
        const errorResult = await response.json();
        console.error('Gagal menghapus data:', errorResult.message);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (caseData) => {
    setFormData(caseData);
    setEditMode(true);
  };

  const handleUpdate = async (localFormData) => {
    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();

    // Validasi file saat update
    if (!localFormData.file) {
      setShowModal(true); // Tampilkan modal jika file tidak diunggah
      return; // Hentikan proses update
    }

    // Lanjutkan proses update jika file ada
    Object.keys(localFormData).forEach((key) => {
      if (key === 'file' && localFormData.file) {
        Array.from(localFormData.file).forEach((file) => {
          formDataToSend.append('files', file);
        });
      } else {
        formDataToSend.append(key, localFormData[key]);
      }
    });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/${localFormData._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        await fetchCases();
        setEditMode(false);
        setFormData(initialFormState); // Reset form
        fileInputRef.current.value = ''; // Reset input file
      } else {
        const errorResult = await response.json();
        console.error('Gagal memperbarui data:', errorResult.message);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const goToHome = () => {
    navigate('/'); // Kembali ke halaman utama
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-700 mb-6">Dashboard</h1>
          <button
            onClick={goToHome}
            className="text-blue-500 hover:text-blue-700 font-bold text-lg"
          >
            Kembali ke Beranda
          </button>
        </div>

        {/* MODAL UNTUK FILE KOSONG */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <p className="text-red-500 text-lg font-bold">File harus diunggah!</p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Form untuk menambah atau mengedit kasus */}
        <CaseForm
          initialFormState={initialFormState}
          formData={formData}
          setFormData={setFormData}
          editMode={editMode}
          handleUpdate={handleUpdate}
          refreshCases={fetchCases}
          setEditMode={setEditMode}
          setShowModal={setShowModal} // Kirim setShowModal ke CaseForm
        />

        {/* Search bar */}
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Cari berdasarkan nama penggugat..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-4 py-2 w-full sm:w-80 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleDownloadExcel}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Download Semua Data Dalam Excel
          </button>
        </div>

        {/* Tabel kasus */}
        <CaseTable
  cases={cases.filter((caseItem) =>
    caseItem.kepemilikanLahan.toLowerCase().includes(searchQuery.toLowerCase())
  )}
  onEdit={handleEdit}
  onDelete={handleDelete}
  refreshCases={async () => {
    console.log("Manual refresh triggered");
    await fetchCases(); 
    console.log("Manual refresh completed");
  }}
/>
      </div>
    </div>
  );
};

export default Dashboard;