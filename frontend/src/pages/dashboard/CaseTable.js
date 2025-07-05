import React, { useState } from "react";

const CaseTable = ({ cases, onEdit, onDelete, refreshCases }) => {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const [lastClickTime, setLastClickTime] = useState({});
  const [processingIds, setProcessingIds] = useState(new Set());

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

  const handleDelete = async (id) => {
    if (!onDelete) return;

    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus data ini?");
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
            proposalUpdates: [{ proposalId, status: newStatus }]
          }),
        }
      );

      if (response.ok) {
        console.log(`Status proposal ${proposalId} diperbarui ke ${newStatus}`);
        if (refreshCases) {
          await refreshCases();
        }
      } else {
        const data = await response.json();
        setError(data.message);
        console.error("Gagal mengubah status proposal:", data.message);
      }
    } catch (error) {
      console.error("Error updating proposal status:", error);
      setError(error.message);
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
  const showActionColumn = ["superadmin", "validator", "seller"].includes(userRole);
  const showApprovalColumn = ["superadmin", "validator"].includes(userRole);
  const showBlockchainColumn = userRole === "user" || userRole === "superadmin";

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow rounded p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Daftar Proyek</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {filteredCases.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          Tidak ada proyek yang tersedia.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCases.map((item) => (
            <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header proyek */}
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{item.namaProyek}</h3>
                  <p className="text-sm text-gray-600">
                    {showUploaderColumn && item.penggugah ? 
                      `Diajukan oleh: ${item.penggugah.firstName} ${item.penggugah.lastName}` : 
                      ""}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  {/* Tombol download */}
                  {item.files && item.files.length > 0 && (
                    <div className="dropdown">
                      <button className="bg-blue-500 text-white px-3 py-1 rounded">
                        Download
                      </button>
                      <div className="dropdown-content">
                        {item.files.map((file, fileIndex) => (
                          <a
                            key={fileIndex}
                            href={`${process.env.REACT_APP_BACKEND_BASEURL}/api/cases/${item._id}/files/${fileIndex}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            {file.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tombol edit & hapus */}
                  {showActionColumn && userRole === "seller" && (
                    <>
                      <button
                        onClick={() => onEdit(item)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Hapus
                      </button>
                    </>
                  )}
                  
                  {/* Tombol approve all untuk validator */}
                  {showApprovalColumn && (
                    <button
                      onClick={() => handleApproveAllProposals(item._id)}
                      className={`${
                        loading[item._id]
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      } text-white px-3 py-1 rounded flex items-center`}
                      disabled={loading[item._id]}
                    >
                      {loading[item._id] ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Memproses...</span>
                        </>
                      ) : (
                        "Terima Semua"
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Detail proyek */}
              <div className="p-4 bg-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="block text-sm text-gray-500">Luas Tanah</span>
                    <span className="font-medium">{item.luasTanah} Ha</span>
                  </div>
                  
                  <div>
                    <span className="block text-sm text-gray-500">Sarana Penyerap</span>
                    <span className="font-medium">{item.saranaPenyerapEmisi}</span>
                  </div>
                  
                  <div>
                    <span className="block text-sm text-gray-500">Kepemilikan Lahan</span>
                    <span className="font-medium">{item.kepemilikanLahan}</span>
                  </div>
                  
                  <div>
                    <span className="block text-sm text-gray-500">Lembaga Sertifikasi</span>
                    <span className="font-medium">{item.lembagaSertifikasi}</span>
                  </div>
                </div>
                
                {/* Blockchain data jika ada */}
                {item.blockchainData && item.blockchainData.transactionHash && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <h4 className="font-medium text-blue-700">Data Blockchain</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="font-medium">Transaction Hash: </span>
                        <a
                          href={`${process.env.REACT_APP_BESU_EXPLORER_URL}/tx/${item.blockchainData.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {item.blockchainData.transactionHash.substring(0, 10)}...
                        </a>
                      </div>
                      
                      <div>
                        <span className="font-medium">Block Number: </span>
                        <span>{item.blockchainData.blockNumber}</span>
                      </div>
                      
                      {item.blockchainData.tokens && (
                        <div>
                          <span className="font-medium">Tokens: </span>
                          <span>{item.blockchainData.tokens.length}</span>
                        </div>
                      )}
                      
                      <div>
                        <span className="font-medium">Issued On: </span>
                        <span>{new Date(item.blockchainData.issuedOn).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Proposal list */}
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Periode Penyerapan Karbon</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Periode
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jumlah Karbon
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          {showApprovalColumn && (
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Aksi
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {item.proposals && item.proposals.map((proposal) => {
                          const key = `${item._id}-${proposal._id}`;
                          return (
                            <tr key={proposal._id}>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {formatDate(proposal.tanggalMulai)} - {formatDate(proposal.tanggalSelesai)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {proposal.jumlahKarbon} Ton
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {proposal.statusProposal === "Diajukan" ? (
                                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                                    Diajukan
                                  </span>
                                ) : proposal.statusProposal === "Diterima" ? (
                                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                                    Diterima
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                                    Ditolak
                                  </span>
                                )}
                              </td>
                              {showApprovalColumn && (
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleProposalStatusUpdate(item._id, proposal._id, "Diterima")}
                                      className={`${
                                        loading[key]
                                          ? "bg-gray-400 cursor-not-allowed"
                                          : "bg-green-500 hover:bg-green-600"
                                      } text-white text-xs px-2 py-1 rounded`}
                                      disabled={loading[key] || proposal.statusProposal === "Diterima"}
                                    >
                                      {loading[key] ? "..." : "Terima"}
                                    </button>
                                    <button
                                      onClick={() => handleProposalStatusUpdate(item._id, proposal._id, "Ditolak")}
                                      className={`${
                                        loading[key]
                                          ? "bg-gray-400 cursor-not-allowed"
                                          : "bg-red-500 hover:bg-red-600"
                                      } text-white text-xs px-2 py-1 rounded`}
                                      disabled={loading[key] || proposal.statusProposal === "Ditolak"}
                                    >
                                      {loading[key] ? "..." : "Tolak"}
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-2 text-right">
                    <span className="font-medium">Total Karbon: </span>
                    <span>{item.jumlahKarbon} Ton</span>
                  </div>
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