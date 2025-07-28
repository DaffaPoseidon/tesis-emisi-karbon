import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const DashboardValidator = () => {
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [expandedCases, setExpandedCases] = useState({});
  const [expandedFiles, setExpandedFiles] = useState({});
  const navigate = useNavigate();

  // Fetch cases from the API
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
        // Filter cases for validator (only show Diajukan status)
        const validatorCases = data.cases
          .filter(
            (caseItem) =>
              !caseItem.statusPengajuan ||
              caseItem.statusPengajuan === "Diajukan"
          )
          .map((caseItem) => ({
            ...caseItem,
            // Tambahkan fallback jika pengunggah null/undefined
            pengunggahName: caseItem.pengunggah
              ? `${caseItem.pengunggah.firstName || ""} ${
                  caseItem.pengunggah.lastName || ""
                }`.trim()
              : "Unknown",
          }));

        console.log("Fetched cases:", validatorCases); // Debug
        setCases(validatorCases);
        setLoading(false);
        return true;
      } else {
        console.error("Failed to fetch data");
        setError("Failed to fetch data");
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
      setError(error.message);
      setLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Handle downloading all data as Excel
  const handleDownloadExcel = () => {
    // Format date for Excel
    const formatExcelDate = (dateStr) => {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleDateString("id-ID");
    };

    // Create Excel data
    const excelData = cases.map((caseItem, index) => {
      // Calculate total approved carbon
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
        Pengunggah: caseItem.pengunggah
          ? `${caseItem.pengunggah.firstName} ${caseItem.pengunggah.lastName}`
          : "N/A",
        "Email Pengunggah": caseItem.pengunggah
          ? caseItem.pengunggah.email
          : "N/A",
        "Tanggal Pengajuan": formatExcelDate(caseItem.createdAt),
        "Tanggal Update": formatExcelDate(caseItem.updatedAt),
      };
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Proyek Karbon");

    // Add separate worksheet for periods
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
            Pengunggah: caseItem.pengunggah
              ? `${caseItem.pengunggah.firstName} ${caseItem.pengunggah.lastName}`
              : "N/A",
          });
        });
      }
    });

    if (allPeriods.length > 0) {
      const periodsWs = XLSX.utils.json_to_sheet(allPeriods);
      XLSX.utils.book_append_sheet(wb, periodsWs, "Periode Penyerapan");
    }

    // Save Excel file
    const fileName = `Data_Proyek_Karbon_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Handle changing search query
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Toggle expanded view for files
  const toggleFiles = (id, e) => {
    e.stopPropagation(); // Prevent toggle expand
    setExpandedFiles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Download all files for a case
  const downloadAllFiles = async (caseItem, e) => {
    e.stopPropagation(); // Prevent toggle expand

    // If no files, show message
    if (!caseItem.files || caseItem.files.length === 0) {
      alert("No files available for download");
      return;
    }

    // Create download links for all files
    for (let i = 0; i < caseItem.files.length; i++) {
      const downloadUrl = `${process.env.REACT_APP_API_BASE_URL}/cases/${caseItem._id}/files/${i}`;
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = caseItem.files[i].fileName || `file-${i + 1}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Add small delay between downloads
      if (i < caseItem.files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  // Handle showing rejection form
  const handleShowRejectionForm = (caseId) => {
    setSelectedCaseId(caseId);
    setShowRejectionForm(true);
    setRejectionReason("");
  };

  // Handle rejection form cancel
  const handleRejectionCancel = () => {
    setShowRejectionForm(false);
    setSelectedCaseId(null);
    setRejectionReason("");
  };

  // Handle rejection submission
  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/${selectedCaseId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            statusPengajuan: "Ditolak",
            rejectionReason: rejectionReason,
          }),
        }
      );

      if (response.ok) {
        alert("Proposal has been rejected");
        fetchCases();
      } else {
        const data = await response.json();
        alert(`Failed to reject proposal: ${data.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setShowRejectionForm(false);
      setSelectedCaseId(null);
      setRejectionReason("");
    }
  };

  // Handle status update (approve)
  const handleStatusUpdate = async (id, newStatus) => {
    const token = localStorage.getItem("token");
    setProcessingIds((prev) => new Set([...prev, id]));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/cases/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            statusPengajuan: newStatus,
          }),
        }
      );

      if (response.ok) {
        alert("Proposal has been approved");
        await fetchCases();
      } else {
        const data = await response.json();
        alert(`Failed to approve proposal: ${data.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Navigate back to home
  const goToHome = () => {
    navigate("/");
  };

  // Filter cases based on search query
  const filteredCases = cases.filter((caseItem) =>
    caseItem.namaProyek.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-700 mb-1">
              Validator Dashboard
            </h1>
            <p className="text-gray-500">
              Review and validate carbon credit proposals
            </p>
          </div>
          <button
            onClick={goToHome}
            className="text-blue-500 hover:text-blue-700 font-bold text-lg"
          >
            Back to Home
          </button>
        </div>

        {/* Rejection Modal */}
        {showRejectionForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
              <h3 className="text-xl font-bold mb-4">Rejection Reason</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason why this proposal is being rejected:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                rows={4}
                placeholder="Enter rejection reason..."
              ></textarea>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleRejectionCancel}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search bar and Export Excel */}
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search by project name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-4 py-2 w-full sm:w-80 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleDownloadExcel}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Download All Data in Excel
          </button>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-white shadow rounded p-6 text-center">
            <p className="text-gray-500">
              No proposals to validate at this time.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredCases.map((item) => (
              <div
                key={item._id}
                className={`border-b border-gray-200 last:border-b-0 transition-colors ${
                  expandedCases[item._id]
                    ? "bg-gray-50"
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
                        Period:{" "}
                        {new Date(item.tanggalMulai).toLocaleDateString()} -{" "}
                        {new Date(item.tanggalSelesai).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Submitted by:{" "}
                        {item.pengunggah &&
                        typeof item.pengunggah === "object" ? (
                          <span className="font-medium">
                            {`${item.pengunggah.firstName || ""} ${
                              item.pengunggah.lastName || ""
                            }`.trim() || "Unknown"}
                          </span>
                        ) : (
                          <span className="italic text-gray-400">
                            Not Available
                          </span>
                        )}
                      </p>
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
                        {item.statusPengajuan === "Diterima"
                          ? "Approved"
                          : item.statusPengajuan === "Ditolak"
                          ? "Rejected"
                          : "Submitted"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="block text-sm text-gray-500">
                        Land Area
                      </span>
                      <span className="font-medium">
                        {item.luasTanah} Meter
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">
                        Absorption Method
                      </span>
                      <span className="font-medium">
                        {item.saranaPenyerapEmisi}
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">
                        Land Ownership
                      </span>
                      <span className="font-medium">
                        {item.kepemilikanLahan}
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">
                        Total Carbon
                      </span>
                      <span className="font-medium">
                        {item.jumlahKarbon} Tons
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {/* View Files button - modified for expandable view */}
                    {item.files && item.files.length > 0 && (
                      <button
                        onClick={(e) => toggleFiles(item._id, e)}
                        className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
                      >
                        {expandedFiles[item._id] ? "Hide Files" : "View Files"}
                      </button>
                    )}

                    {/* Approval buttons for validator */}
                    {item.statusPengajuan === "Diajukan" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(item._id, "Diterima")
                          }
                          className={`${
                            processingIds.has(item._id)
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600"
                          } text-white px-3 py-1 rounded text-sm`}
                          disabled={processingIds.has(item._id)}
                        >
                          {processingIds.has(item._id)
                            ? "Processing..."
                            : "Approve"}
                        </button>
                        <button
                          onClick={() => handleShowRejectionForm(item._id)}
                          className={`${
                            processingIds.has(item._id)
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          } text-white px-3 py-1 rounded text-sm`}
                          disabled={processingIds.has(item._id)}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* Show rejection reason if the case was rejected */}
                    {item.statusPengajuan === "Ditolak" &&
                      item.rejectionReason && (
                        <div className="w-full mt-2 p-3 bg-red-50 border border-red-200 rounded">
                          <h4 className="font-bold text-red-700 mb-1">
                            Rejection Reason:
                          </h4>
                          <p className="text-red-700">{item.rejectionReason}</p>
                        </div>
                      )}
                  </div>

                  {/* Expandable file view */}
                  {expandedFiles[item._id] &&
                    item.files &&
                    item.files.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                        <h4 className="font-medium mb-2">
                          Supporting Documents:
                        </h4>
                        <ul className="space-y-2">
                          {item.files.map((file, fileIndex) => (
                            <li key={fileIndex} className="flex items-center">
                              <a
                                href={`${process.env.REACT_APP_API_BASE_URL}/cases/${item._id}/files/${fileIndex}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 underline"
                              >
                                {file.fileName || `File ${fileIndex + 1}`}
                              </a>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={(e) => downloadAllFiles(item, e)}
                          className="mt-3 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Download All Files
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardValidator;
