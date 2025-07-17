import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import * as XLSX from "xlsx";

const CaseTable = ({ cases, onEdit, onDelete, refreshCases }) => {
  const [expandedCase, setExpandedCase] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({});
  const [lastClickTime, setLastClickTime] = useState({});
  const [processingIds, setProcessingIds] = useState(new Set());
  const [showFileMenu, setShowFileMenu] = useState(null);
  const userRole = JSON.parse(localStorage.getItem("user"))?.role;

  // Filter cases based on user role
  const filteredCases = userRole === "validator" || userRole === "superadmin"
    ? cases
    : cases.filter(
        (caseItem) =>
            !caseItem.statusPengajuan || caseItem.statusPengajuan === "Diajukan"
        );

  const handleDownloadImage = (caseItem, e) => {
    e.stopPropagation(); // Prevent toggle expand

    // If no files, show message
    if (!caseItem.files || caseItem.files.length === 0) {
      alert("No images available for download");
      return;
    }

    // Open download link for first file (image)
    window.open(
      `${process.env.REACT_APP_API_BASE_URL}/cases/${caseItem._id}/files/0`,
      "_blank"
    );
  };

  const handleDownloadCaseExcel = (caseItem, e) => {
    e.stopPropagation(); // Prevent toggle expand

    // Format date for Excel
    const formatExcelDate = (dateStr) => {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleDateString("id-ID");
    };

    // Project data for Excel
    const caseData = {
      "Project Name": caseItem.namaProyek,
      "Land Area (Ha)": caseItem.luasTanah,
      "Absorption Method": caseItem.saranaPenyerapEmisi,
      "Certification Institute": caseItem.lembagaSertifikasi,
      "Land Ownership": caseItem.kepemilikanLahan,
      "Total Carbon (Tons)": caseItem.jumlahKarbon,
      "Submission Status": caseItem.statusPengajuan === "Diajukan" 
        ? "Submitted" 
        : caseItem.statusPengajuan === "Diterima" 
        ? "Approved" 
        : "Rejected",
      "Submitter": caseItem.penggugah
        ? `${caseItem.penggugah.firstName} ${caseItem.penggugah.lastName}`
        : "N/A",
    };

    // Blockchain data if available
    if (caseItem.blockchainData && caseItem.blockchainData.transactionHash) {
      caseData["Transaction Hash"] = caseItem.blockchainData.transactionHash;
      caseData["Block Number"] = caseItem.blockchainData.blockNumber;
      caseData["Tokens"] = caseItem.blockchainData.tokens
        ? caseItem.blockchainData.tokens.length
        : 0;
      caseData["Issued On"] = caseItem.blockchainData.issuedOn
        ? formatExcelDate(caseItem.blockchainData.issuedOn)
        : "N/A";
    }

    // Project proposals data
    const proposalsData = caseItem.proposals
      ? caseItem.proposals.map((proposal) => ({
          "Start Date": formatExcelDate(proposal.tanggalMulai),
          "End Date": formatExcelDate(proposal.tanggalSelesai),
          "Carbon Amount (Tons)": proposal.jumlahKarbon,
          "Status": proposal.statusProposal === "Diajukan" 
            ? "Submitted" 
            : proposal.statusProposal === "Diterima" 
            ? "Approved" 
            : "Rejected",
        }))
      : [];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet([caseData]);
    const proposalsWs = XLSX.utils.json_to_sheet(proposalsData);

    // Create workbook and add worksheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Project Information");
    XLSX.utils.book_append_sheet(wb, proposalsWs, "Absorption Periods");

    // Save file
    const fileName = `Project_${caseItem.namaProyek.replace(/\s+/g, "_")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Function to show file menu
  const handleShowFileMenu = (e) => {
    e.stopPropagation(); // Prevent toggle expand
    // No need to do anything as dropdown appears on hover
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

  // Toggle expanded view
  const toggleExpand = (id) => {
    if (expandedCase === id) {
      setExpandedCase(null);
    } else {
      setExpandedCase(id);
    }
  };

  // Function to update submission status
  const handleStatusUpdate = async (id, newStatus) => {
    const now = Date.now();
    if (lastClickTime[id] && now - lastClickTime[id] < 2000) {
      console.log("Clicked too quickly, please wait...");
      return;
    }

    setLastClickTime((prev) => ({ ...prev, [id]: now }));

    // If ID is already being processed, do nothing
    if (processingIds.has(id)) return;

    const token = localStorage.getItem("token");

    // Add ID to processing list
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
          body: JSON.stringify({ 
            statusPengajuan: newStatus 
          }),
        }
      );

      if (response.ok) {
        console.log(`Case status ${id} updated to ${newStatus}`);
        if (refreshCases) {
          await refreshCases();
        }
      } else {
        const data = await response.json();
        setError(data.message);
        console.error("Failed to change submission status:", data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError(error.message);
    } finally {
      // Remove ID from processing list
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

  // Function to update individual proposal status
  const handleProposalStatusUpdate = async (caseId, proposalId, newStatus) => {
    // Verify to avoid double-click
    const key = `${caseId}-${proposalId}`;
    const now = Date.now();
    if (lastClickTime[key] && now - lastClickTime[key] < 2000) {
      console.log("Clicked too quickly, please wait...");
      return;
    }

    setLastClickTime((prev) => ({ ...prev, [key]: now }));

    // If already being processed, do nothing
    if (processingIds.has(key)) return;

    const token = localStorage.getItem("token");

    // Add to processing list
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
        console.log(`Proposal status ${proposalId} updated to ${newStatus}`);

        // Show success notification
        if (newStatus === "Diterima") {
          alert(
            `Proposal successfully approved${
              data.blockchainSuccess
                ? " and carbon tokens successfully issued"
                : ""
            }`
          );
        } else {
          alert(`Proposal successfully rejected`);
        }

        if (refreshCases) {
          await refreshCases();
        }
      } else {
        setError(data.message);
        console.error("Failed to change proposal status:", data.message);
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating proposal status:", error);
      setError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      // Remove from processing list
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

  // Handler for approving all proposals at once
  const handleApproveAllProposals = async (caseId) => {
    if (!window.confirm("Are you sure you want to approve all proposals?")) {
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
        console.log(`All proposals for case ${caseId} have been approved`);
        if (refreshCases) {
          await refreshCases();
        }
      } else {
        const data = await response.json();
        setError(data.message);
        console.error("Failed to approve all proposals:", data.message);
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

  // Check column visibility
  const showUploaderColumn = ["superadmin", "validator"].includes(userRole);
  const showActionColumn = ["superadmin", "validator", "seller"].includes(
    userRole
  );
  const showApprovalColumn = ["superadmin", "validator"].includes(userRole);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy");
  };

  // Updated view with vertical format
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
                      Period:{" "}
                      {new Date(item.tanggalMulai).toLocaleDateString()} -{" "}
                      {new Date(item.tanggalSelesai).toLocaleDateString()}
                    </p>
                    {showUploaderColumn && item.penggugah ? (
                      <p className="text-sm text-gray-600">
                        Submitted by: {item.penggugah.firstName}{" "}
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
                    <div className="relative inline-block">
                      <button
                        onClick={handleShowFileMenu}
                        onMouseEnter={() => setShowFileMenu(item._id)}
                        onMouseLeave={() => setShowFileMenu(null)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        View Files
                      </button>
                      {showFileMenu === item._id && (
                        <div
                          className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                          onMouseEnter={() => setShowFileMenu(item._id)}
                          onMouseLeave={() => setShowFileMenu(null)}
                        >
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
                      )}
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
                                "Approved data cannot be edited"
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
                                "Approved data cannot be deleted"
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
                          Delete
                        </button>
                      </>
                    )}

                  {/* Approval buttons for validator */}
                  {showApprovalColumn &&
                    (userRole === "validator" || userRole === "superadmin") &&
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
                          {loading[item._id] ? "Processing..." : "Approve"}
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
                          {loading[item._id] ? "Processing..." : "Reject"}
                        </button>
                      </>
                    )}

                  <button
                    onClick={(e) => handleDownloadCaseExcel(item, e)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Export Excel
                  </button>
                </div>

                {/* Expand/collapse button */}
                <button
                  onClick={() => toggleExpand(item._id)}
                  className="mt-4 text-blue-500 hover:text-blue-700 text-sm flex items-center"
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
                      Hide Details
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
                      Show Details
                    </>
                  )}
                </button>
              </div>

              {/* Expanded details */}
              {expandedCase === item._id && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <h4 className="font-medium text-sm mb-2">
                    Additional Details
                  </h4>
                  {/* You can add more details here */}
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