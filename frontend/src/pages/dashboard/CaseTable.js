import React from "react";

const CaseTable = ({ cases, onEdit, onDelete, refreshCases }) => {
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

  // Fungsi baru untuk update status pengajuan
  const handleStatusUpdate = async (id, newStatus) => {
    const token = localStorage.getItem("token");
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
        console.log(`Status berhasil diubah menjadi ${newStatus}`);
        refreshCases?.();
      } else {
        console.error("Gagal mengubah status pengajuan");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  // Cek visibility kolom
  const showUploaderColumn = ["superadmin", "validator"].includes(userRole);
  const showActionColumn = ["superadmin", "validator", "user"].includes(
    userRole
  );
  const showApprovalColumn = ["superadmin", "validator"].includes(userRole);
  const showStatusColumn = userRole === "user"

  return (
    <div className="bg-white shadow rounded p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Daftar Pengajuan</h2>
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
              
              {/* Tombol penerimaan untuk validator/superadmin */}
              {showApprovalColumn && (
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(item._id, "Diterima")}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Terima
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(item._id, "Ditolak")}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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

// import React from "react";

// const CaseTable = ({ cases, onEdit, onDelete, refreshCases }) => {

//   const user = JSON.parse(localStorage.getItem("user"));
//   const userRole = user?.role;

//   const handleDelete = async (id) => {
//     if (!onDelete) return;

//     await onDelete(id);
//     if (refreshCases) {
//       refreshCases();
//     } else {
//       console.error("refreshCases is not defined");
//     }
//   };

//   return (
//     <div className="bg-white shadow rounded p-6 overflow-x-auto">
//       <h2 className="text-xl font-bold mb-4">Daftar Pengajuan</h2>
//       <table className="table-auto w-full border-collapse border border-gray-300">
//         <thead>
//           <tr>
//             <th className="border border-gray-300 px-4 py-2">No</th>
//             <th className="border border-gray-300 px-4 py-2">
//               Luas Tanah (Ha)
//             </th>
//             <th className="border border-gray-300 px-4 py-2">Jenis Pohon</th>
//             <th className="border border-gray-300 px-4 py-2">
//               Lembaga Sertifikasi
//             </th>
//             <th className="border border-gray-300 px-4 py-2">
//               Jumlah Karbon (Ton)
//             </th>
//             <th className="border border-gray-300 px-4 py-2">
//               Metode Pengukuran
//             </th>
//             <th className="border border-gray-300 px-4 py-2">Jenis Tanah</th>
//             <th className="border border-gray-300 px-4 py-2">
//               Lokasi Geografis
//             </th>
//             <th className="border border-gray-300 px-4 py-2">
//               Kepemilikan Lahan
//             </th>
//             {["user"].includes(userRole) && "superadmin" (
//               <th className="border border-gray-300 px-4 py-2">
//                 Akun Pengunggah
//               </th>
//             )}
//             <th className="border border-gray-300 px-4 py-2">Download</th>
//             {["user"].includes(userRole) && "superadmin" (
//               <th className="border border-gray-300 px-4 py-2">Aksi</th>
//             )}
//           </tr>
//         </thead>
//         <tbody>
//           {cases.map((item, index) => (
//             <tr key={item._id}>
//               <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
//               <td className="border border-gray-300 px-4 py-2">
//                 {item.luasTanah}
//               </td>
//               <td className="border border-gray-300 px-4 py-2">
//                 {item.jenisPohon}
//               </td>
//               <td className="border border-gray-300 px-4 py-2">
//                 {item.lembagaSertifikasi}
//               </td>
//               <td className="border border-gray-300 px-4 py-2">
//                 {item.jumlahKarbon}
//               </td>
//               <td className="border border-gray-300 px-4 py-2">
//                 {item.metodePengukuran}
//               </td>
//               <td className="border border-gray-300 px-4 py-2">
//                 {item.jenisTanah}
//               </td>
//               <td className="border border-gray-300 px-4 py-2">
//                 {item.lokasiGeografis}
//               </td>
//               <td className="border border-gray-300 px-4 py-2">
//                 {item.kepemilikanLahan}
//               </td>
//               {["user"].includes(userRole) && "superadmin" (
//                 <td className="border border-gray-300 px-4 py-2">
//                   {item.penggugah
//                     ? `${item.penggugah.firstName} ${item.penggugah.lastName}`
//                     : "Tidak Diketahui"}
//                 </td>
//               )}
//               <td className="border border-gray-300 px-4 py-2">
//                 {item.files.length > 0 ? (
//                   <ul>
//                     {item.files.map((file, index) => (
//                       <li key={index}>
//                         <a
//                           href={`${process.env.REACT_APP_BACKEND_BASEURL}/api/cases/${item._id}/files/${index}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-500 underline"
//                         >
//                           {file.fileName}
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   "Tidak ada file"
//                 )}
//               </td>
//               {["user"].includes(userRole) && "superadmin" (
//                 <td className="border border-gray-300 px-4 py-2">
//                   <button
//                     className="bg-yellow-500 text-white px-4 py-2 rounded"
//                     onClick={() => onEdit(item)}
//                   >
//                     Edit
//                   </button>
//                   {userRole === "user" && "superadmin" (
//                     <button
//                       className="bg-red-500 text-white px-4 py-2 rounded ml-2"
//                       onClick={() => handleDelete(item._id)}
//                     >
//                       Delete
//                     </button>
//                   )}
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default CaseTable;
