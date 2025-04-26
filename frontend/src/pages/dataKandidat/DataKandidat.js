import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const DataKandidat = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role; // Ambil role dari user (bisa undefined jika tidak ada user)

  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchCases = useCallback(async () => {
    const token = localStorage.getItem("token");
    // if (!token) {
    //   navigate('/login');
    //   return;
    // }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // if (response.status === 401 || response.status === 403) {
      //   console.error('Token invalid, redirecting to login');
      //   navigate('/login');
      //   return;
      // }

      const data = await response.json();
      setCases(data.cases);
    } catch (error) {
      console.error("Error fetching cases:", error.message);
    }
  }, [navigate]);

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
    XLSX.utils.book_append_sheet(wb, ws, "Data Pengajuan");
    XLSX.writeFile(wb, "data_pengajuan.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-700 mb-6">
            Data Rekap Perkara
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-blue-500 hover:text-blue-700 font-bold text-lg"
          >
            Kembali ke Beranda
          </button>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Cari berdasarkan nama penggugat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 w-full sm:w-80 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {["admin", "superadmin"].includes(userRole) && (
            <button
              onClick={handleDownloadExcel}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Download Semua Data Dalam Excel
            </button>
          )}
        </div>

        <div className="bg-white shadow rounded p-6 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">Daftar Data</h2>
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
                {["admin", "superadmin"].includes(userRole) && (
                  <th className="border border-gray-300 px-4 py-2">Download</th>
                )}
              </tr>
            </thead>
            <tbody>
              {cases
                .filter((caseItem) =>
                  caseItem.kepemilikanLahan
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((caseItem, index) => (
                  <tr key={caseItem._id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {caseItem.luasTanah}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {caseItem.jenisPohon}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {caseItem.lembagaSertifikasi}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {caseItem.jumlahKarbon}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {caseItem.metodePengukuran}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {caseItem.jenisTanah}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {caseItem.lokasiGeografis}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {caseItem.kepemilikanLahan}
                    </td>
                    {["admin", "superadmin"].includes(userRole) && (
                      <td className="border border-gray-300 px-4 py-2">
                        {caseItem.files.length > 0 ? (
                          <ul>
                            {caseItem.files.map((file, index) => (
                              <li key={index}>
                                <a
                                  href={`${process.env.REACT_APP_BACKEND_BASEURL}/api/cases/${caseItem._id}/files/${index}`}
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
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataKandidat;
