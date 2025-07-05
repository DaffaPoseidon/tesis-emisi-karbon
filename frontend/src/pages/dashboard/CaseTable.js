import React, { useState } from "react";
import { format } from "date-fns";

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
      <h2 className="text-xl font-bold mb-4">Data Rekap Proyek</h2>

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
        <div className="space-y-8">
          {filteredCases.map((item) => (
            <div
              key={item._id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header proyek - informasi nama proyek dan penggugah */}
              <div
                className="bg-blue-50 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(item._id)}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`transform transition-transform ${
                      expandedCase === item._id ? "rotate-90" : ""
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{item.namaProyek}</h3>
                    {showUploaderColumn && item.penggugah ? (
                      <p className="text-sm text-gray-600">
                        Diajukan oleh: {item.penggugah.firstName}{" "}
                        {item.penggugah.lastName}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex space-x-2 items-center">
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">
                      Total Karbon:{" "}
                    </span>
                    <span className="font-bold text-blue-700">
                      {item.jumlahKarbon} Ton
                    </span>
                  </div>

                  {/* Status badge */}
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

                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    {/* Tombol download */}
                    {item.files && item.files.length > 0 && (
                      <div className="relative group">
                        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                          Download
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                          <div className="py-1">
                            {item.files.map((file, fileIndex) => (
                              <a
                                key={fileIndex}
                                href={`${process.env.REACT_APP_BACKEND_BASEURL}/api/cases/${item._id}/files/${fileIndex}`}
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

                    {/* Tombol edit & hapus (hanya untuk seller) */}
                    {showActionColumn && userRole === "seller" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item._id);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Hapus
                        </button>
                      </>
                    )}

                    {/* Tombol approve all untuk validator */}
                    {showApprovalColumn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveAllProposals(item._id);
                        }}
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
              </div>

              {/* Detail proyek - ditampilkan hanya jika expanded */}
              {expandedCase === item._id && (
                <div className="p-4 border-t border-gray-200">
                  {/* Informasi proyek */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                        Kepemilikan Lahan
                      </span>
                      <span className="font-medium">
                        {item.kepemilikanLahan}
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
                  {item.blockchainData &&
                    item.blockchainData.transactionHash && (
                      <div className="mb-6 p-4 bg-blue-50 rounded">
                        <h4 className="font-medium text-blue-700 mb-2">
                          Data Blockchain
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">
                              Transaction Hash:{" "}
                            </span>
                            <a
                              href={`${process.env.REACT_APP_BESU_EXPLORER_URL}/tx/${item.blockchainData.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {item.blockchainData.transactionHash.substring(
                                0,
                                10
                              )}
                              ...
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
                            <span>
                              {new Date(
                                item.blockchainData.issuedOn
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Timeline periode penyerapan karbon */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-4">
                      Periode Penyerapan Karbon
                    </h4>

                    {/* Timeline view untuk proposals */}
                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full">
                        <div className="grid grid-cols-1 gap-4">
                          {item.proposals && item.proposals.length > 0 ? (
                            item.proposals.map((proposal) => {
                              const key = `${item._id}-${proposal._id}`;
                              const isProcessing = loading[key];

                              return (
                                <div
                                  key={proposal._id}
                                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 flex justify-between"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                      <div
                                        className={`w-3 h-3 rounded-full mr-2 ${
                                          proposal.statusProposal === "Diterima"
                                            ? "bg-green-500"
                                            : proposal.statusProposal ===
                                              "Ditolak"
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
                                        }`}
                                      ></div>
                                      <span className="font-medium">
                                        {formatDate(proposal.tanggalMulai)} -{" "}
                                        {formatDate(proposal.tanggalSelesai)}
                                      </span>
                                    </div>

                                    <div className="ml-5 text-sm">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <span className="text-gray-600">
                                            Jumlah Karbon:{" "}
                                          </span>
                                          <span className="font-medium">
                                            {proposal.jumlahKarbon} Ton
                                          </span>
                                        </div>

                                        <div
                                          className={`px-2 py-1 rounded text-xs font-medium ${
                                            proposal.statusProposal ===
                                            "Diterima"
                                              ? "bg-green-100 text-green-800"
                                              : proposal.statusProposal ===
                                                "Ditolak"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-yellow-100 text-yellow-800"
                                          }`}
                                        >
                                          {proposal.statusProposal}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Tombol validasi (hanya untuk validator) */}
                                  {showApprovalColumn && (
                                    <div className="flex space-x-2 ml-4 items-center">
                                      <button
                                        onClick={() =>
                                          handleProposalStatusUpdate(
                                            item._id,
                                            proposal._id,
                                            "Diterima"
                                          )
                                        }
                                        className={`${
                                          isProcessing ||
                                          proposal.statusProposal === "Diterima"
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-green-500 hover:bg-green-600"
                                        } text-white px-3 py-1 rounded`}
                                        disabled={
                                          isProcessing ||
                                          proposal.statusProposal === "Diterima"
                                        }
                                      >
                                        {isProcessing ? "..." : "Terima"}
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleProposalStatusUpdate(
                                            item._id,
                                            proposal._id,
                                            "Ditolak"
                                          )
                                        }
                                        className={`${
                                          isProcessing ||
                                          proposal.statusProposal === "Ditolak"
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-red-500 hover:bg-red-600"
                                        } text-white px-3 py-1 rounded`}
                                        disabled={
                                          isProcessing ||
                                          proposal.statusProposal === "Ditolak"
                                        }
                                      >
                                        {isProcessing ? "..." : "Tolak"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              Tidak ada periode penyerapan karbon yang tersedia.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseTable;
