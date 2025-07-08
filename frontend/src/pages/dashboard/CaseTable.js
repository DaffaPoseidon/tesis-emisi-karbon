import React, { useState } from "react";
import { format } from "date-fns";
import * as XLSX from "xlsx";

const CaseTable = ({ cases, onEdit, onDelete, refreshCases }) => {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const [lastClickTime, setLastClickTime] = useState({});
  const [processingIds, setProcessingIds] = useState(new Set());
  const [expandedCase, setExpandedCase] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const userId = user?._id;

  // Filter data berdasarkan role
  const filteredCases =
    userRole === "seller"
      ? cases.filter((caseItem) => caseItem.penggugah?._id === userId)
      : userRole === "validator" || userRole === "superadmin"
      ? cases.filter(
          (caseItem) =>
            !caseItem.statusPengajuan || caseItem.statusPengajuan === "Diajukan"
        )
      : cases;

  const handleDownloadImage = (caseItem, e) => {
    e.stopPropagation(); // Mencegah toggle expand

    // Jika tidak ada file, tampilkan pesan
    if (!caseItem.files || caseItem.files.length === 0) {
      alert("Tidak ada gambar yang tersedia untuk diunduh");
      return;
    }

    // Buka link download untuk file pertama (gambar)
    window.open(
      `${process.env.REACT_APP_API_BASE_URL}/cases/${caseItem._id}/files/0`,
      "_blank"
    );
  };

  const handleDownloadCaseExcel = (caseItem, e) => {
    e.stopPropagation(); // Mencegah toggle expand

    // Format tanggal untuk Excel
    const formatExcelDate = (dateStr) => {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleDateString("id-ID");
    };

    // Data proyek untuk Excel
    const caseData = {
      "Nama Proyek": caseItem.namaProyek,
      "Luas Tanah (Ha)": caseItem.luasTanah,
      "Sarana Penyerap Emisi": caseItem.saranaPenyerapEmisi,
      "Lembaga Sertifikasi": caseItem.lembagaSertifikasi,
      "Kepemilikan Lahan": caseItem.kepemilikanLahan,
      "Total Karbon (Ton)": caseItem.jumlahKarbon,
      "Status Pengajuan": caseItem.statusPengajuan,
      Penggugah: caseItem.penggugah
        ? `${caseItem.penggugah.firstName} ${caseItem.penggugah.lastName}`
        : "N/A",
    };

    // Data blockchain jika ada
    if (caseItem.blockchainData && caseItem.blockchainData.transactionHash) {
      caseData["Transaction Hash"] = caseItem.blockchainData.transactionHash;
      caseData["Block Number"] = caseItem.blockchainData.blockNumber;
      caseData["Issued On"] = formatExcelDate(caseItem.blockchainData.issuedOn);
    }

    // Sheet utama untuk informasi proyek
    const ws = XLSX.utils.json_to_sheet([caseData]);

    // Worksheet untuk data periode penyerapan karbon
    const proposalsData =
      caseItem.proposals && caseItem.proposals.length > 0
        ? caseItem.proposals.map((proposal, index) => ({
            "No.": index + 1,
            "Tanggal Mulai": formatExcelDate(proposal.tanggalMulai),
            "Tanggal Selesai": formatExcelDate(proposal.tanggalSelesai),
            "Jumlah Karbon (Ton)": proposal.jumlahKarbon,
            Status: proposal.statusProposal,
          }))
        : [
            {
              "No.": 1,
              Keterangan: "Tidak ada data periode penyerapan karbon",
            },
          ];

    const proposalsWs = XLSX.utils.json_to_sheet(proposalsData);

    // Buat workbook dan tambahkan worksheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Informasi Proyek");
    XLSX.utils.book_append_sheet(wb, proposalsWs, "Periode Penyerapan");

    // Simpan file
    const fileName = `Proyek_${caseItem.namaProyek.replace(/\s+/g, "_")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Fungsi untuk mendownload file dokumen
  const handleShowFileMenu = (e) => {
    e.stopPropagation(); // Mencegah toggle expand
    // Tidak perlu lakukan apa-apa karena dropdown muncul dengan hover
  };

  const handleDelete = async (id) => {
    if (!onDelete) return;

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus data ini?"
    );
    if (!confirmed) return;

    try {
      await onDelete(id);
      if (refreshCases) {
        refreshCases();
      }
    } catch (error) {
      console.error("Error deleting case:", error);
    }
  };

  // Toggle expanded view
  const toggleExpand = (id) => {
    if (expandedCase === id) {
      setExpandedCase(null);
    } else {
      setExpandedCase(id);
    }
  };

  // Fungsi update status pengajuan
  const handleStatusUpdate = async (id, newStatus) => {
    const now = Date.now();
    if (lastClickTime[id] && now - lastClickTime[id] < 2000) {
      console.log("Terlalu cepat klik, mohon tunggu...");
      return;
    }

    setLastClickTime((prev) => ({ ...prev, [id]: now }));

    // Jika ID sudah sedang diproses, jangan lakukan apa-apa
    if (processingIds.has(id)) return;

    const token = localStorage.getItem("token");

    // Tambahkan ID ke daftar yang sedang diproses
    setProcessingIds((prev) => new Set(prev).add(id));
    setLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ statusPengajuan: newStatus }),
        }
      );

      if (response.ok) {
        console.log(`Status case ${id} diperbarui ke ${newStatus}`);
        if (refreshCases) {
          await refreshCases();
        }
      } else {
        const data = await response.json();
        setError(data.message);
        console.error("Gagal mengubah status pengajuan:", data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError(error.message);
    } finally {
      // Hapus ID dari daftar yang sedang diproses
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setLoading((prev) => {
        const newLoading = { ...prev };
        delete newLoading[id];
        return newLoading;
      });
    }
  };

  // Fungsi untuk update status proposal individual
  const handleProposalStatusUpdate = async (caseId, proposalId, newStatus) => {
    // Verifikasi agar tidak melakukan double-click
    const key = `${caseId}-${proposalId}`;
    const now = Date.now();
    if (lastClickTime[key] && now - lastClickTime[key] < 2000) {
      console.log("Terlalu cepat klik, mohon tunggu...");
      return;
    }

    setLastClickTime((prev) => ({ ...prev, [key]: now }));

    // Jika sudah sedang diproses, jangan lakukan apa-apa
    if (processingIds.has(key)) return;

    const token = localStorage.getItem("token");

    // Tambahkan ke daftar yang sedang diproses
    setProcessingIds((prev) => new Set(prev).add(key));
    setLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/${caseId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            proposalUpdates: [{ proposalId, status: newStatus }],
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(`Status proposal ${proposalId} diperbarui ke ${newStatus}`);

        // Tampilkan notifikasi sukses
        if (newStatus === "Diterima") {
          alert(
            `Proposal berhasil diterima${
              data.blockchainSuccess
                ? " dan token karbon berhasil diterbitkan"
                : ""
            }`
          );
        } else {
          alert(`Proposal berhasil ditolak`);
        }

        if (refreshCases) {
          await refreshCases();
        }
      } else {
        setError(data.message);
        console.error("Gagal mengubah status proposal:", data.message);
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating proposal status:", error);
      setError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      // Hapus dari daftar yang sedang diproses
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
      setLoading((prev) => {
        const newLoading = { ...prev };
        delete newLoading[key];
        return newLoading;
      });
    }
  };

  // Handler untuk menyetujui semua proposal sekaligus
  const handleApproveAllProposals = async (caseId) => {
    if (!window.confirm("Apakah Anda yakin ingin menyetujui semua proposal?")) {
      return;
    }

    const token = localStorage.getItem("token");
    setLoading((prev) => ({ ...prev, [caseId]: true }));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/${caseId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ statusPengajuan: "Diterima" }),
        }
      );

      if (response.ok) {
        console.log(`Semua proposal untuk case ${caseId} telah disetujui`);
        if (refreshCases) {
          await refreshCases();
        }
      } else {
        const data = await response.json();
        setError(data.message);
        console.error("Gagal menyetujui semua proposal:", data.message);
      }
    } catch (error) {
      console.error("Error approving all proposals:", error);
      setError(error.message);
    } finally {
      setLoading((prev) => {
        const newLoading = { ...prev };
        delete newLoading[caseId];
        return newLoading;
      });
    }
  };

  // Cek visibility kolom
  const showUploaderColumn = ["superadmin", "validator"].includes(userRole);
  const showActionColumn = ["superadmin", "validator", "seller"].includes(
    userRole
  );
  const showApprovalColumn = ["superadmin", "validator"].includes(userRole);

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy");
  };

  // Tampilan yang diperbarui dengan format vertikal
  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-bold mb-4">Data Periode Penyerapan Karbon</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {filteredCases.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          Tidak ada data periode yang tersedia.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCases.map((item) => (
            <div
              key={item._id}
              className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200
              ${
                item.statusPengajuan === "Diterima"
                  ? "bg-green-50"
                  : item.statusPengajuan === "Ditolak"
                  ? "bg-red-50"
                  : "bg-white"
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{item.namaProyek}</h3>
                    <p className="text-sm text-gray-600">
                      Periode:{" "}
                      {new Date(item.tanggalMulai).toLocaleDateString()} -{" "}
                      {new Date(item.tanggalSelesai).toLocaleDateString()}
                    </p>
                    {showUploaderColumn && item.penggugah ? (
                      <p className="text-sm text-gray-600">
                        Diajukan oleh: {item.penggugah.firstName}{" "}
                        {item.penggugah.lastName}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center space-x-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.statusPengajuan === "Diterima"
                          ? "bg-green-100 text-green-800"
                          : item.statusPengajuan === "Ditolak"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.statusPengajuan}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="block text-sm text-gray-500">
                      Luas Tanah
                    </span>
                    <span className="font-medium">{item.luasTanah} Ha</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">
                      Sarana Penyerap
                    </span>
                    <span className="font-medium">
                      {item.saranaPenyerapEmisi}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">
                      Jumlah Karbon
                    </span>
                    <span className="font-medium text-blue-700">
                      {item.jumlahKarbon} Ton
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">
                      Lembaga Sertifikasi
                    </span>
                    <span className="font-medium">
                      {item.lembagaSertifikasi}
                    </span>
                  </div>
                </div>

                {/* Blockchain data jika ada */}
                {item.blockchainData && item.blockchainData.transactionHash && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">
                      Data Blockchain
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Transaction Hash: </span>
                        <a
                          href={`${process.env.REACT_APP_BESU_EXPLORER_URL}/tx/${item.blockchainData.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {item.blockchainData.transactionHash.substring(0, 10)}
                          ...
                        </a>
                      </div>
                      <div>
                        <span className="font-medium">Block Number: </span>
                        <span>{item.blockchainData.blockNumber}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {/* Download Excel button */}
                  <button
                    onClick={(e) => handleDownloadCaseExcel(item, e)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                  >
                    Download Excel
                  </button>

                  {/* Download Files button */}
                  {item.files && item.files.length > 0 && (
                    <div className="relative group">
                      <button
                        onClick={(e) => handleDownloadImage(item, e)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                      >
                        Download Gambar
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                        <div className="py-1">
                          {item.files.map((file, fileIndex) => (
                            <a
                              key={fileIndex}
                              href={`${process.env.REACT_APP_API_BASE_URL}/cases/${item._id}/files/${fileIndex}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {file.fileName || `File ${fileIndex + 1}`}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edit/Delete buttons for seller */}
                  {showActionColumn &&
                    (userRole === "seller" || userRole === "superadmin") && (
                      <>
                        <button
                          onClick={() => {
                            if (item.statusPengajuan === "Diterima") {
                              alert(
                                "Data yang sudah disetujui tidak dapat diedit"
                              );
                              return;
                            }
                            onEdit(item);
                          }}
                          className={`${
                            item.statusPengajuan === "Diterima"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-yellow-500 hover:bg-yellow-600"
                          } text-white px-3 py-1 rounded text-sm`}
                          disabled={item.statusPengajuan === "Diterima"}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (item.statusPengajuan === "Diterima") {
                              alert(
                                "Data yang sudah disetujui tidak dapat dihapus"
                              );
                              return;
                            }
                            handleDelete(item._id);
                          }}
                          className={`${
                            item.statusPengajuan === "Diterima"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          } text-white px-3 py-1 rounded text-sm`}
                          disabled={item.statusPengajuan === "Diterima"}
                        >
                          Hapus
                        </button>
                      </>
                    )}

                  {/* Approval buttons for validator */}
                  {showApprovalColumn &&
                    item.statusPengajuan === "Diajukan" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(item._id, "Diterima")
                          }
                          className={`${
                            loading[item._id]
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600"
                          } text-white px-3 py-1 rounded text-sm`}
                          disabled={loading[item._id]}
                        >
                          {loading[item._id] ? "Memproses..." : "Terima"}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(item._id, "Ditolak")
                          }
                          className={`${
                            loading[item._id]
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          } text-white px-3 py-1 rounded text-sm`}
                          disabled={loading[item._id]}
                        >
                          {loading[item._id] ? "Memproses..." : "Tolak"}
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseTable;
