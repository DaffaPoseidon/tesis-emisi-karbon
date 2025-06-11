import React, { useState } from "react";

const CaseTable = ({ cases, onEdit, onDelete, refreshCases }) => {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const userId = user?._id;

  // Filter data berdasarkan role
  const filteredCases = 
    userRole === "user"
      ? cases.filter((caseItem) => caseItem.penggugah?._id === userId)
      : userRole === "validator" || userRole === "superadmin"
        ? cases.filter((caseItem) => 
            !caseItem.statusPengajuan || caseItem.statusPengajuan === "Diajukan"
          )
        : cases;

  const handleDelete = async (id) => {
    if (!onDelete) return;
    await onDelete(id);
    refreshCases?.();
  };
  
  // Fungsi update status pengajuan
  const handleStatusUpdate = async (id, newStatus) => {
    const token = localStorage.getItem("token");
    setLoading({...loading, [id]: true});
    setError(null);
    
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

      const data = await response.json();
      
      if (response.ok) {
        console.log(`Status berhasil diubah menjadi ${newStatus}`);
        if (newStatus === 'Diterima' && data.blockchain) {
          console.log('Sertifikat berhasil diterbitkan:', data.blockchain);
        }
        refreshCases?.();
      } else {
        setError(data.message || "Gagal mengubah status pengajuan");
        console.error("Gagal mengubah status pengajuan:", data.message);
      }
    } catch (error) {
      setError(error.message);
      console.error("Error:", error.message);
    } finally {
      setLoading({...loading, [id]: false});
    }
  };

  // Cek visibility kolom
  const showUploaderColumn = ["superadmin", "validator"].includes(userRole);
  const showActionColumn = ["superadmin", "validator", "user"].includes(userRole);
  const showApprovalColumn = ["superadmin", "validator"].includes(userRole);
  const showStatusColumn = userRole === "user";
  const showBlockchainColumn = userRole === "user" || userRole === "superadmin";

  return (
    <div className="bg-white shadow rounded p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Daftar Pengajuan</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">No</th>
            <th className="border border-gray-300 px-4 py-2">
              Luas Tanah (Ha)
            </th>
            <th className="border border-gray-300 px-4 py-2">Jenis Pohon</th>
            <th className="border border-gray-300 px-4 py-2">
              Lembaga Sertifikasi
            </th>
            <th className="border border-gray-300 px-4 py-2">
              Jumlah Karbon (Ton)
            </th>
            <th className="border border-gray-300 px-4 py-2">
              Metode Pengukuran
            </th>
            <th className="border border-gray-300 px-4 py-2">Jenis Tanah</th>
            <th className="border border-gray-300 px-4 py-2">
              Lokasi Geografis
            </th>
            <th className="border border-gray-300 px-4 py-2">
              Kepemilikan Lahan
            </th>

            {showUploaderColumn && (
              <th className="border border-gray-300 px-4 py-2">
                Akun Pengunggah
              </th>
            )}
            
            {/* Kolom status pengajuan untuk user */}
            {showStatusColumn && (
              <th className="border border-gray-300 px-4 py-2">
                Status Pengajuan
              </th>
            )}
            
            {/* Kolom data blockchain */}
            {showBlockchainColumn && (
              <th className="border border-gray-300 px-4 py-2">
                Data Blockchain
              </th>
            )}
            
            {/* Kolom penerimaan untuk validator/superadmin */}
            {showApprovalColumn && (
              <th className="border border-gray-300 px-4 py-2">
                Penerimaan
              </th>
            )}

            <th className="border border-gray-300 px-4 py-2">Download</th>

            {showActionColumn && (
              <th className="border border-gray-300 px-4 py-2">Aksi</th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredCases.map((item, index) => (
            <tr key={item._id}>
              <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2">
                {item.luasTanah}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.jenisPohon}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.lembagaSertifikasi}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.jumlahKarbon}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.metodePengukuran}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.jenisTanah}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.lokasiGeografis}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.kepemilikanLahan}
              </td>

              {showUploaderColumn && (
                <td className="border border-gray-300 px-4 py-2">
                  {item.penggugah
                    ? `${item.penggugah.firstName} ${item.penggugah.lastName}`
                    : "Tidak Diketahui"}
                </td>
              )}
              
              {/* Status pengajuan untuk user */}
              {showStatusColumn && (
                <td className="border border-gray-300 px-4 py-2">
                  {!item.statusPengajuan || item.statusPengajuan === "Diajukan" ? (
                    <span className="inline-block px-3 py-1 rounded bg-yellow-500 text-white">
                      Diajukan
                    </span>
                  ) : item.statusPengajuan === "Diterima" ? (
                    <span className="inline-block px-3 py-1 rounded bg-green-500 text-white">
                      Diterima
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded bg-red-500 text-white">
                      Ditolak
                    </span>
                  )}
                </td>
              )}
              
              {/* Data blockchain */}
{showBlockchainColumn && (
  <td className="border border-gray-300 px-4 py-2 text-sm">
    {item.blockchainData && item.blockchainData.transactionHash ? (
      <div className="flex flex-col space-y-1">
        <div>
          <span className="font-semibold">TX:</span>{" "}
          <a 
            href={`${process.env.REACT_APP_BESU_EXPLORER_URL}/tx/${item.blockchainData.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline truncate block max-w-[120px]"
          >
            {item.blockchainData.transactionHash.substring(0, 10)}...
          </a>
        </div>
        
        {/* Token count - versi baru */}
        {item.blockchainData.tokens && (
          <div>
            <span className="font-semibold">Tokens:</span>{" "}
            <span className="text-gray-600">
              {item.blockchainData.tokens.length} tokens
            </span>
          </div>
        )}
        
        {/* Token count - versi lama (kompatibilitas) */}
        {!item.blockchainData.tokens && item.blockchainData.tokenIds && (
          <div>
            <span className="font-semibold">Tokens:</span>{" "}
            <span className="text-gray-600">
              {item.blockchainData.tokenIds.length} tokens
            </span>
          </div>
        )}
        
        {/* Contoh hash token - versi baru */}
        {item.blockchainData.tokens && item.blockchainData.tokens.length > 0 && (
          <div>
            <span className="font-semibold">Sample Hash:</span>{" "}
            <span className="text-green-600 font-mono text-xs" 
                  title={item.blockchainData.tokens[0].uniqueHash}>
              {item.blockchainData.tokens[0].uniqueHash.substring(0, 8)}...
            </span>
          </div>
        )}
        
        <div>
          <span className="font-semibold">Block:</span>{" "}
          <span className="text-gray-600">
            {item.blockchainData.blockNumber}
          </span>
        </div>
      </div>
    ) : (
      <span className="text-gray-400">
        Belum tersimpan di blockchain
      </span>
    )}
  </td>
)}
              
              {/* Tombol penerimaan untuk validator/superadmin */}
              {showApprovalColumn && (
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(item._id, "Diterima")}
                      className={`${
                        loading[item._id] 
                          ? "bg-gray-400" 
                          : "bg-green-500 hover:bg-green-600"
                      } text-white px-3 py-1 rounded flex items-center justify-center`}
                      disabled={loading[item._id]}
                    >
                      {loading[item._id] ? (
                        <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : null}
                      Terima
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(item._id, "Ditolak")}
                      className={`${
                        loading[item._id] 
                          ? "bg-gray-400" 
                          : "bg-red-500 hover:bg-red-600"
                      } text-white px-3 py-1 rounded`}
                      disabled={loading[item._id]}
                    >
                      Tolak
                    </button>
                  </div>
                </td>
              )}

              <td className="border border-gray-300 px-4 py-2">
                {item.files.length > 0 ? (
                  <ul>
                    {item.files.map((file, index) => (
                      <li key={index}>
                        <a
                          href={`${process.env.REACT_APP_BACKEND_BASEURL}/api/cases/${item._id}/files/${index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          {file.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "Tidak ada file"
                )}
              </td>

              {showActionColumn && (
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </button>

                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CaseTable;