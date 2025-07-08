import React, { useState, useEffect, useCallback, useRef } from "react";
import CaseForm from "./CaseForm";
import CaseTable from "./CaseTable";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState("");
  const [localFormData, setLocalFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
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

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedInUser);
  }, []);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false); // State untuk modal
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

  const filteredCases =
    user?.role === "validator"
      ? cases.filter(
          (caseItem) =>
            !caseItem.statusPengajuan || caseItem.statusPengajuan === "Diajukan"
        )
      : user?.role === "seller"
      ? cases.filter((caseItem) => caseItem.penggugah?._id === user?._id)
      : cases;

  const handleDownloadExcel = () => {
    // Modifikasi data untuk format Excel
    const excelData = cases.map((caseItem, index) => {
      // Format tanggal untuk Excel
      const formatExcelDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("id-ID");
      };

      // Hitung total karbon dari proposal yang diterima
      const approvedTotalCarbon = caseItem.proposals
        ? caseItem.proposals
            .filter((p) => p.statusProposal === "Diterima")
            .reduce((sum, p) => sum + Number(p.jumlahKarbon), 0)
        : 0;

      return {
        "No.": index + 1,
        "ID Proyek": caseItem._id,
        "Nama Proyek": caseItem.namaProyek,
        "Luas Tanah (Ha)": caseItem.luasTanah,
        "Sarana Penyerap Emisi": caseItem.saranaPenyerapEmisi,
        "Lembaga Sertifikasi": caseItem.lembagaSertifikasi,
        "Kepemilikan Lahan": caseItem.kepemilikanLahan,
        "Status Pengajuan": caseItem.statusPengajuan,
        "Total Karbon (Ton)": caseItem.jumlahKarbon,
        "Karbon Disetujui (Ton)": approvedTotalCarbon,
        "Jumlah Sertifikat": caseItem.jumlahSertifikat || 0,
        "Jumlah Periode": caseItem.proposals ? caseItem.proposals.length : 0,
        "Periode Disetujui": caseItem.proposals
          ? caseItem.proposals.filter((p) => p.statusProposal === "Diterima")
              .length
          : 0,
        "Periode Ditolak": caseItem.proposals
          ? caseItem.proposals.filter((p) => p.statusProposal === "Ditolak")
              .length
          : 0,
        Penggugah: caseItem.penggugah
          ? `${caseItem.penggugah.firstName} ${caseItem.penggugah.lastName}`
          : "N/A",
        "Email Penggugah": caseItem.penggugah
          ? caseItem.penggugah.email
          : "N/A",
        "Tanggal Pengajuan": formatExcelDate(caseItem.createdAt),
        "Tanggal Update": formatExcelDate(caseItem.updatedAt),
      };
    });

    // Tambahkan data blockchain jika ada
    excelData.forEach((row) => {
      const caseItem = cases.find((c) => c._id === row["ID Proyek"]);
      if (caseItem.blockchainData && caseItem.blockchainData.transactionHash) {
        row["Transaction Hash"] = caseItem.blockchainData.transactionHash;
        row["Block Number"] = caseItem.blockchainData.blockNumber;
        row["Tanggal Penerbitan"] = caseItem.blockchainData.issuedOn
          ? new Date(caseItem.blockchainData.issuedOn).toLocaleDateString(
              "id-ID"
            )
          : "N/A";
      }
    });

    // Buat workbook dan worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Proyek Karbon");

    // Tambahkan worksheet khusus untuk periode
    const allPeriods = [];
    cases.forEach((caseItem) => {
      if (caseItem.proposals && caseItem.proposals.length > 0) {
        caseItem.proposals.forEach((proposal) => {
          allPeriods.push({
            "ID Proyek": caseItem._id,
            "Nama Proyek": caseItem.namaProyek,
            "Tanggal Mulai": new Date(proposal.tanggalMulai).toLocaleDateString(
              "id-ID"
            ),
            "Tanggal Selesai": new Date(
              proposal.tanggalSelesai
            ).toLocaleDateString("id-ID"),
            "Jumlah Karbon (Ton)": proposal.jumlahKarbon,
            Status: proposal.statusProposal,
            Penggugah: caseItem.penggugah
              ? `${caseItem.penggugah.firstName} ${caseItem.penggugah.lastName}`
              : "N/A",
          });
        });
      }
    });

    if (allPeriods.length > 0) {
      const periodsWs = XLSX.utils.json_to_sheet(allPeriods);
      XLSX.utils.book_append_sheet(wb, periodsWs, "Periode Penyerapan");
    }

    // Simpan file
    const fileName = `Data_Proyek_Karbon_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Fungsi delete kasus
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        console.log("Data berhasil dihapus");
        fetchCases(); // Refresh data setelah delete
      } else {
        const errorResult = await response.json();
        console.error("Gagal menghapus data:", errorResult.message);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (caseData) => {
    // Map caseData untuk format yang sesuai dengan form
    const formattedData = {
      ...caseData,
      // Format tanggal untuk tampilan di form
      tanggalMulai: new Date(caseData.tanggalMulai),
      tanggalSelesai: new Date(caseData.tanggalSelesai),
    };

    setFormData(formattedData);
    setEditMode(true);
  };

  const handleUpdate = async (formData) => {
    const token = localStorage.getItem("token");
    const formDataToSend = new FormData();

    // Validasi file saat update
    if (!formData.file && !localFormData.files?.length) {
      setShowModal(true); // Tampilkan modal jika file tidak diunggah
      return; // Hentikan proses update
    }

    // Tambahkan data utama
    Object.keys(formData).forEach((key) => {
      if (key === "file" && formData.file) {
        for (let i = 0; i < formData.file.length; i++) {
          formDataToSend.append("files", formData.file[i]);
        }
      } else if (
        key !== "file" &&
        key !== "files" &&
        key !== "blockchainData"
      ) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/${formData._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        alert("Data berhasil diperbarui");
        setLocalFormData(initialFormState);
        setEditMode(false);
        fetchCases();
      } else {
        const errorData = await response.json();
        alert(`Gagal memperbarui data: ${errorData.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const goToHome = () => {
    navigate("/"); // Kembali ke halaman utama
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-700 mb-1">Dashboard</h1>
            {user?.role === "validator" && (
              <p className="text-gray-500">
                Mode Validator - Anda dapat melihat dan memvalidasi data
              </p>
            )}
            {user?.role === "seller" && (
              <p className="text-gray-500">
                Mode Seller - Anda dapat mengelola data pengajuan Anda
              </p>
            )}
            {user?.role === "superadmin" && (
              <p className="text-gray-500">
                Mode Superadmin - Anda memiliki akses penuh
              </p>
            )}
          </div>
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
              <p className="text-red-500 text-lg font-bold">
                File harus diunggah!
              </p>
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
        {(user?.role === "seller" || user?.role === "superadmin") && (
          <CaseForm
            initialFormState={formData}
            refreshCases={fetchCases}
            editMode={editMode}
            formData={formData}
            setFormData={setFormData}
            handleUpdate={handleUpdate}
            setEditMode={setEditMode}
          />
        )}

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
          cases={filteredCases.filter((caseItem) =>
            caseItem.kepemilikanLahan
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )}
          onEdit={user?.role !== "validator" ? handleEdit : null}
          onDelete={user?.role !== "validator" ? handleDelete : null}
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
