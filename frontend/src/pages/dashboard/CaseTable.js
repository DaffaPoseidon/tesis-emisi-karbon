import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import * as XLSX from "xlsx";

const CaseTable = ({
  cases,
  onEdit,
  onDelete,
  refreshCases,
  userRole = "seller",
}) => {
  const [expandedCase, setExpandedCase] = useState(null);
  const [expandedFiles, setExpandedFiles] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({});
  const [lastClickTime, setLastClickTime] = useState({});
  const [processingIds, setProcessingIds] = useState(new Set());

  // Filter cases for seller view
  const filteredCases = cases;

  const handleDownloadImage = (caseItem, e) => {
    e.stopPropagation();

    if (!caseItem.files || caseItem.files.length === 0) {
      alert("No images available for download");
      return;
    }

    window.open(
      `${process.env.REACT_APP_API_BASE_URL}/cases/${caseItem._id}/files/0`,
      "_blank"
    );
  };

  const downloadAllFiles = async (caseItem, e) => {
    e.stopPropagation();

    if (!caseItem.files || caseItem.files.length === 0) {
      alert("No files available for download");
      return;
    }

    for (let i = 0; i < caseItem.files.length; i++) {
      const downloadUrl = `${process.env.REACT_APP_API_BASE_URL}/cases/${caseItem._id}/files/${i}`;
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = caseItem.files[i].fileName || `file-${i + 1}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (i < caseItem.files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  const handleDownloadCaseExcel = (caseItem, e) => {
    e.stopPropagation();

    const formatExcelDate = (dateStr) => {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleDateString("id-ID");
    };

    const carbonCase = {
      "Project Name": caseItem.namaProyek,
      "Land Area (Ha)": caseItem.luasTanah,
      "Absorption Method": caseItem.saranaPenyerapEmisi,
      "Certification Institute": caseItem.lembagaSertifikasi,
      "Land Ownership": caseItem.kepemilikanLahan,
      "Total Carbon (Tons)": caseItem.jumlahKarbon,
      "Submission Status":
        caseItem.statusPengajuan === "Diajukan"
          ? "Submitted"
          : caseItem.statusPengajuan === "Diterima"
          ? "Approved"
          : "Rejected",
      Submitter: caseItem.pengunggah
        ? `${caseItem.pengunggah.firstName} ${caseItem.pengunggah.lastName}`
        : "N/A",
    };

    if (caseItem.blockchainData && caseItem.blockchainData.transactionHash) {
      carbonCase["Transaction Hash"] = caseItem.blockchainData.transactionHash;
      carbonCase["Block Number"] = caseItem.blockchainData.blockNumber;
      carbonCase["Tokens"] = caseItem.blockchainData.tokens
        ? caseItem.blockchainData.tokens.length
        : 0;
      carbonCase["Issued On"] = caseItem.blockchainData.issuedOn
        ? formatExcelDate(caseItem.blockchainData.issuedOn)
        : "N/A";
    }

    const proposalsData = caseItem.proposals
      ? caseItem.proposals.map((proposal) => ({
          "Start Date": formatExcelDate(proposal.tanggalMulai),
          "End Date": formatExcelDate(proposal.tanggalSelesai),
          "Carbon Amount (Tons)": proposal.jumlahKarbon,
          Status:
            proposal.statusProposal === "Diajukan"
              ? "Submitted"
              : proposal.statusProposal === "Diterima"
              ? "Approved"
              : "Rejected",
        }))
      : [];

    const ws = XLSX.utils.json_to_sheet([carbonCase]);
    const proposalsWs = XLSX.utils.json_to_sheet(proposalsData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Project Information");
    XLSX.utils.book_append_sheet(wb, proposalsWs, "Absorption Periods");

    const fileName = `Project_${caseItem.namaProyek.replace(/\s+/g, "_")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const toggleFiles = (id, e) => {
    e.stopPropagation();
    setExpandedFiles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async (id) => {
    if (!onDelete) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this data?"
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

  const toggleExpand = (id) => {
    if (expandedCase === id) {
      setExpandedCase(null);
    } else {
      setExpandedCase(id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy");
  };

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-bold mb-4">Carbon Absorption Period Data</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {filteredCases.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No period data available.
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
                      Period: {new Date(item.tanggalMulai).toLocaleDateString()}{" "}
                      - {new Date(item.tanggalSelesai).toLocaleDateString()}
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
                    <span className="font-medium">{item.luasTanah} Meter</span>
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
                      Carbon Amount
                    </span>
                    <span className="font-medium text-blue-700">
                      {item.jumlahKarbon} Tons
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">
                      Certification Institute
                    </span>
                    <span className="font-medium">
                      {item.lembagaSertifikasi}
                    </span>
                  </div>
                    <div>
    <span className="block text-sm text-gray-500">Submitter</span>
    <span className="font-medium">
      {item.pengunggah 
        ? `${item.pengunggah.firstName} ${item.pengunggah.lastName}`
        : "Unknown"}
    </span>
    {item.pengunggah?.email && (
      <span className="block text-sm text-gray-500">{item.pengunggah.email}</span>
    )}
  </div>
                </div>

                {/* Blockchain data if available */}
                {item.blockchainData && item.blockchainData.transactionHash && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">
                      Blockchain Data
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
                      <div>
                        <span className="font-medium">Tokens: </span>
                        <span>
                          {item.blockchainData.tokens
                            ? item.blockchainData.tokens.length
                            : 0}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Issued On: </span>
                        <span>
                          {item.blockchainData.issuedOn
                            ? new Date(
                                item.blockchainData.issuedOn
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons for actions */}
                <div className="flex flex-wrap gap-2">
                  {item.files && item.files.length > 0 && (
                    <button
                      onClick={(e) => toggleFiles(item._id, e)}
                      className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
                    >
                      {expandedFiles[item._id] ? "Hide Files" : "View Files"}
                    </button>
                  )}

                  {/* Edit/Delete buttons for seller */}
                  <>
                    <button
                      onClick={() => {
                        if (item.statusPengajuan === "Diterima") {
                          alert("Approved data cannot be edited");
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
                          alert("Approved data cannot be deleted");
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
                      Delete
                    </button>
                  </>

                  <button
                    onClick={(e) => handleDownloadCaseExcel(item, e)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Export Excel
                  </button>

                  {/* Only show Rejection Details button for rejected proposals */}
                  {item.statusPengajuan === "Ditolak" && (
                    <button
                      onClick={() => toggleExpand(item._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center"
                    >
                      {expandedCase === item._id ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          Hide Rejection Details
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                          Rejection Details
                        </>
                      )}
                    </button>
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

                {/* Rejection Details Expanded View */}
                {expandedCase === item._id &&
                  item.statusPengajuan === "Ditolak" && (
                    <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
                      <h4 className="font-medium text-red-700 mb-2">
                        Rejection Details:
                      </h4>

                      <div className="mb-3">
                        <span className="block text-sm font-medium text-red-800 mb-1">
                          Rejection Reason:
                        </span>
                        {item.rejectionReason ? (
                          <p className="text-red-700 bg-red-100 p-3 rounded">
                            {item.rejectionReason}
                          </p>
                        ) : (
                          <p className="text-red-500 italic">
                            No specific reason provided by validator.
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-red-700">
                        <div>
                          <span className="font-medium">Submission Date:</span>{" "}
                          {formatDate(item.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Rejection Date:</span>{" "}
                          {formatDate(item.updatedAt)}
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-red-800">
                        <p className="font-medium mb-1">What to do next:</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li>Review the rejection reason carefully</li>
                          <li>Make necessary changes to your submission</li>
                          <li>
                            Click the "Edit" button to update your proposal
                          </li>
                          <li>Submit the revised proposal for validation</li>
                        </ol>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseTable;
