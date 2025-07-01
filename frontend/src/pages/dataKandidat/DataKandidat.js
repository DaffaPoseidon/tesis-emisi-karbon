import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const DataKandidat = () => {
  const [cases, setCases] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [verificationHash, setVerificationHash] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const verifyHash = async () => {
    if (!verificationHash) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/certificates/verify/${verificationHash}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setVerificationResult(data);
    } catch (error) {
      console.error("Error verifying certificate:", error);
      setVerificationResult({
        isValid: false,
        error: error.message,
      });
    } finally {
      setVerifying(false);
    }
  };

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
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
        console.log("Semua data yang diterima:", data.cases);

        // Filter hanya cases dengan status Diterima
        const acceptedCases = data.cases.filter(
          (item) => item.statusPengajuan === "Diterima"
        );
        console.log("Kasus yang diterima:", acceptedCases);
        setCases(acceptedCases);

        // Buat daftar sertifikat dari token unik
        const allCertificates = [];

        for (const caseItem of acceptedCases) {
          console.log(
            "Memeriksa case:",
            caseItem._id,
            "blockchainData:",
            caseItem.blockchainData
          );

          // Periksa apakah memiliki tokens (struktur baru) atau tokenIds (struktur lama)
          if (
            caseItem.blockchainData &&
            caseItem.blockchainData.tokens &&
            caseItem.blockchainData.tokens.length > 0
          ) {
            // Format baru dengan uniqueHash
            console.log(
              "Format baru (tokens) ditemukan:",
              caseItem.blockchainData.tokens
            );
            for (const token of caseItem.blockchainData.tokens) {
              allCertificates.push({
                tokenId: token.tokenId,
                uniqueHash: token.uniqueHash,
                caseId: caseItem._id,
                luasTanah: caseItem.luasTanah,
                jenisPohon: caseItem.jenisPohon,
                lembagaSertifikasi: caseItem.lembagaSertifikasi,
                jumlahKarbon: "1", // Setiap sertifikat adalah 1 ton
                metodePengukuran: caseItem.metodePengukuran,
                jenisTanah: caseItem.jenisTanah,
                lokasiGeografis: caseItem.lokasiGeografis,
                kepemilikanLahan: caseItem.kepemilikanLahan,
                transactionHash: caseItem.blockchainData.transactionHash,
                blockNumber: caseItem.blockchainData.blockNumber,
                issuedOn: caseItem.blockchainData.issuedOn,
              });
            }
          } else if (
            caseItem.blockchainData &&
            caseItem.blockchainData.tokenIds &&
            caseItem.blockchainData.tokenIds.length > 0
          ) {
            // Format lama (kompatibilitas)
            console.log(
              "Format lama (tokenIds) ditemukan:",
              caseItem.blockchainData.tokenIds
            );
            for (const tokenId of caseItem.blockchainData.tokenIds) {
              allCertificates.push({
                tokenId,
                uniqueHash: null, // Tidak ada hash untuk format lama
                caseId: caseItem._id,
                luasTanah: caseItem.luasTanah,
                jenisPohon: caseItem.jenisPohon,
                lembagaSertifikasi: caseItem.lembagaSertifikasi,
                jumlahKarbon: "1", // Setiap sertifikat adalah 1 ton
                metodePengukuran: caseItem.metodePengukuran,
                jenisTanah: caseItem.jenisTanah,
                lokasiGeografis: caseItem.lokasiGeografis,
                kepemilikanLahan: caseItem.kepemilikanLahan,
                transactionHash: caseItem.blockchainData.transactionHash,
                blockNumber: caseItem.blockchainData.blockNumber,
                issuedOn: caseItem.blockchainData.issuedOn,
              });
            }
          } else if (caseItem.blockchainData) {
            // Jika blockchainData ada tapi tidak memiliki format yang diharapkan
            console.warn(
              "Case memiliki blockchainData tapi tidak memiliki tokens atau tokenIds:",
              caseItem._id
            );
            // Coba buat satu sertifikat berdasarkan jumlah karbon
            const carbonAmount = parseInt(caseItem.jumlahKarbon) || 1;
            for (let i = 0; i < carbonAmount; i++) {
              allCertificates.push({
                tokenId: `manual-${caseItem._id}-${i + 1}`,
                uniqueHash: null,
                caseId: caseItem._id,
                luasTanah: caseItem.luasTanah,
                jenisPohon: caseItem.jenisPohon,
                lembagaSertifikasi: caseItem.lembagaSertifikasi,
                jumlahKarbon: "1", // Setiap sertifikat adalah 1 ton
                metodePengukuran: caseItem.metodePengukuran,
                jenisTanah: caseItem.jenisTanah,
                lokasiGeografis: caseItem.lokasiGeografis,
                kepemilikanLahan: caseItem.kepemilikanLahan,
                transactionHash:
                  caseItem.blockchainData.transactionHash || "N/A",
                blockNumber: caseItem.blockchainData.blockNumber || "N/A",
                issuedOn:
                  caseItem.blockchainData.issuedOn || new Date().toISOString(),
              });
            }
          }
        }

        console.log("Total sertifikat yang dibuat:", allCertificates.length);
        setCertificates(allCertificates);
      } else {
        console.error("Gagal mengambil data:", await response.text());
        setError("Gagal mengambil data dari server");
      }
    } catch (error) {
      console.error("Error:", error.message);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleDownloadExcel = () => {
    // Mengubah data certificates untuk Excel
    const modifiedCertificates = certificates.map((cert, index) => ({
      Nomor: index + 1,
      "Token ID": cert.tokenId,
      "Unique Hash": cert.uniqueHash || "N/A",
      "Luas Tanah (Ha)": cert.luasTanah,
      "Jenis Pohon": cert.jenisPohon,
      "Lembaga Sertifikasi": cert.lembagaSertifikasi,
      "Jumlah Karbon (Ton)": cert.jumlahKarbon,
      "Metode Pengukuran": cert.metodePengukuran,
      "Jenis Tanah": cert.jenisTanah,
      "Lokasi Geografis": cert.lokasiGeografis,
      "Kepemilikan Lahan": cert.kepemilikanLahan,
      "Transaction Hash": cert.transactionHash,
      "Block Number": cert.blockNumber,
      "Issued On": cert.issuedOn
        ? new Date(cert.issuedOn).toLocaleString()
        : "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(modifiedCertificates);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sertifikat Karbon");
    XLSX.writeFile(wb, "sertifikat_karbon.xlsx");
  };

  const goToHome = () => {
    navigate("/");
  };

  // Fungsi untuk memformat hash agar lebih ringkas
  const formatHash = (hash) => {
    if (!hash) return "N/A";
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-700">
            Data Rekap Sertifikat Karbon
          </h1>
          <button
            onClick={goToHome}
            className="text-blue-500 hover:text-blue-700 font-bold text-lg"
          >
            Kembali ke Beranda
          </button>
        </div>

        <div className="mb-6 flex justify-end">
          <button
            onClick={handleDownloadExcel}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Download Sertifikat Dalam Excel
          </button>
        </div>

        <div className="bg-white shadow rounded p-6 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">Daftar Sertifikat Karbon</h2>
          <div className="bg-white shadow rounded p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Verifikasi Sertifikat</h2>
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hash Sertifikat
                </label>
                <input
                  type="text"
                  value={verificationHash}
                  onChange={(e) => setVerificationHash(e.target.value)}
                  placeholder="Masukkan hash unik sertifikat untuk verifikasi"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={verifyHash}
                disabled={!verificationHash || verifying}
                className={`px-4 py-2 rounded-md ${
                  !verificationHash || verifying
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                {verifying ? "Memverifikasi..." : "Verifikasi"}
              </button>
            </div>

            {verificationResult && (
              <div
                className={`mt-4 p-4 rounded-md ${
                  verificationResult.isValid
                    ? "bg-green-100 border border-green-400"
                    : "bg-red-100 border border-red-400"
                }`}
              >
                {verificationResult.isValid ? (
                  <div>
                    <p className="text-green-700 font-bold">
                      ✓ Sertifikat Valid
                    </p>
                    {verificationResult.certificate && (
                      <div className="mt-2">
                        <p>
                          <span className="font-semibold">Project ID:</span>{" "}
                          {verificationResult.certificate.projectId}
                        </p>
                        <p>
                          <span className="font-semibold">Issued On:</span>{" "}
                          {new Date(
                            verificationResult.certificate.issueDate
                          ).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-semibold">Carbon Amount:</span>{" "}
                          {verificationResult.certificate.carbonAmount} ton
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-700 font-bold">
                    ✗ Sertifikat Tidak Valid atau Tidak Ditemukan
                  </p>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="mt-2 text-gray-600">Memuat data sertifikat...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : (
            <>
              {cases.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Tidak ada data kasus yang disetujui.
                </div>
              ) : certificates.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Tidak ada sertifikat yang tersedia untuk kasus yang disetujui.
                </div>
              ) : (
                <table className="table-auto w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">No</th>
                      <th className="border border-gray-300 px-4 py-2">
                        Token ID
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Unique Hash
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Luas Tanah (Ha)
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Jenis Pohon
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Lembaga Sertifikasi
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Jumlah Karbon (Ton)
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Metode Pengukuran
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Jenis Tanah
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Lokasi Geografis
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Kepemilikan Lahan
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Data Blockchain
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert, index) => (
                      <tr key={cert.uniqueHash || cert.tokenId}>
                        <td className="border border-gray-300 px-4 py-2">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-xs">
                          {cert.tokenId}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 font-mono text-xs">
                          {cert.uniqueHash ? (
                            <span
                              className="text-green-600"
                              title={cert.uniqueHash}
                            >
                              {formatHash(cert.uniqueHash)}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {cert.luasTanah}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {cert.jenisPohon}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {cert.lembagaSertifikasi}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {cert.jumlahKarbon}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {cert.metodePengukuran}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {cert.jenisTanah}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {cert.lokasiGeografis}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {cert.kepemilikanLahan}
                        </td>
                        <div className="mb-4">
                          <h2 className="text-xl font-bold mb-2">
                            Sertifikat Karbon Terverifikasi
                          </h2>
                          <p className="text-gray-600">
                            Total Sertifikat: {certificates.length} dari{" "}
                            {cases.reduce(
                              (acc, curr) =>
                                acc + parseInt(curr.jumlahKarbon || 0),
                              0
                            )}{" "}
                            Total Emisi Karbon
                          </p>
                        </div>
                        <td className="border border-gray-300 px-4 py-2 text-xs">
                          <div>
                            <span className="font-semibold">TX:</span>{" "}
                            {cert.transactionHash &&
                            cert.transactionHash !== "N/A" ? (
                              <a
                                href={`${process.env.REACT_APP_BESU_EXPLORER_URL}/tx/${cert.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline truncate block max-w-[120px]"
                              >
                                {formatHash(cert.transactionHash)}
                              </a>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold">Block:</span>{" "}
                            <span className="text-gray-600">
                              {cert.blockNumber}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold">Date:</span>{" "}
                            <span className="text-gray-600">
                              {cert.issuedOn
                                ? new Date(cert.issuedOn).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {/* Debugging section - hilangkan di produksi */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-8 bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-bold mb-2">Debug Info:</h3>
            <div>
              <p>Cases count: {cases.length}</p>
              <p>Certificates count: {certificates.length}</p>
              <pre className="mt-2 bg-gray-200 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(
                  {
                    cases: cases.map((c) => ({
                      id: c._id,
                      status: c.statusPengajuan,
                      blockchain: c.blockchainData,
                    })),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataKandidat;
