import React, { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

const CaseForm = ({
  initialFormState,
  refreshCases,
  editMode,
  formData,
  setFormData,
  handleUpdate,
  setEditMode,
}) => {
  const [localFormData, setLocalFormData] = useState(initialFormState);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const [proposals, setProposals] = useState([]);
  const [lembagaOptions, setLembagaOptions] = useState([
    {
      value: "PT Surveyor Indonesia",
      label: "PT Surveyor Indonesia",
    },
    {
      value: "PT Anindya Wiraputra Konsult Divisi Lembaga Validasi/Verifikasi Gas Rumah Kaca (GRK) dan Nilai Ekonomi Karbon (NEK)",
      label: "PT Anindya Wiraputra Konsult Divisi Lembaga Validasi/Verifikasi Gas Rumah Kaca (GRK) dan Nilai Ekonomi Karbon (NEK)",
    },
    {
      value: "Balai Besar Standardisasi dan Pelayanan Jasa Industri Kulit, Karet, dan Plastik",
      label: "Balai Besar Standardisasi dan Pelayanan Jasa Industri Kulit, Karet, dan Plastik",
    },
    {
      value: "PT Abhipraya Bumi Lestari",
      label: "PT Abhipraya Bumi Lestari",
    },
    {
      value: "PT Mutuagung Lestari",
      label: "PT Mutuagung Lestari",
    },
    {
      value: "PT Superintending Company of Indonesia (PT SUCOFINDO) –SBU Sertifikasi dan Eco Framework (Sucofindo International Certification Services)",
      label: "PT Superintending Company of Indonesia (PT SUCOFINDO) –SBU Sertifikasi dan Eco Framework (Sucofindo International Certification Services)",
    },
    {
      value: "PT TUV NORD Indonesia",
      label: "PT TUV NORD Indonesia",
    },
    {
      value: "PT TUV Rheinland Indonesia",
      label: "PT TUV Rheinland Indonesia",
    },
    { value: "independen", label: "Independent Institute (Custom)" },
  ]);
  const [customLembaga, setCustomLembaga] = useState("");
  const [showCustomLembaga, setShowCustomLembaga] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for managing date picker modal
  const [selectedProposalIndex, setSelectedProposalIndex] = useState(null);
  const [datePickerType, setDatePickerType] = useState(null); // 'start' or 'end'
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (editMode) {
      setLocalFormData(formData);

      // Process proposals from server
      if (formData.proposals && formData.proposals.length > 0) {
        // Ensure each proposal has the correct format
        const processedProposals = formData.proposals.map((proposal) => ({
          ...proposal,
          // Ensure dates are Date objects
          tanggalMulai: new Date(proposal.tanggalMulai),
          tanggalSelesai: new Date(proposal.tanggalSelesai),
          // Ensure jumlahKarbon is a number
          jumlahKarbon: Number(proposal.jumlahKarbon),
          // Ensure ID is stored for existing proposals
          _id: proposal._id,
        }));

        setProposals(processedProposals);
      } else {
        setProposals([]);
      }

      // Check if certification institute is custom
      const isCustom = !lembagaOptions.find(
        (option) =>
          option.value === formData.lembagaSertifikasi &&
          option.value !== "independen"
      );

      setShowCustomLembaga(
        isCustom || formData.lembagaSertifikasi === "independen"
      );
      setCustomLembaga(isCustom ? formData.lembagaSertifikasi : "");
    } else {
      setLocalFormData(initialFormState);
      setProposals([]);
      setShowCustomLembaga(false);
      setCustomLembaga("");
      setShowModal(false);

      // Reset file input when exiting edit mode
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [editMode, formData, initialFormState, lembagaOptions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "lembagaSertifikasi") {
      const selectedValue = value;
      setShowCustomLembaga(selectedValue === "independen");

      setLocalFormData((prevData) => ({
        ...prevData,
        [name]: selectedValue !== "independen" ? selectedValue : customLembaga,
      }));
    } else {
      setLocalFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleCustomLembagaChange = (e) => {
    const value = e.target.value;
    setCustomLembaga(value);
    setLocalFormData((prevData) => ({
      ...prevData,
      lembagaSertifikasi: value,
    }));
  };

  const handleFileChange = (e) => {
    setLocalFormData((prevData) => ({
      ...prevData,
      file: e.target.files.length > 0 ? e.target.files : null,
    }));
    setShowModal(false);
  };

  // Function to add a new proposal
  const addProposal = () => {
    const newProposal = {
      tanggalMulai: new Date(),
      tanggalSelesai: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      jumlahKarbon: 0,
      statusProposal: "Diajukan",
    };

    setProposals([...proposals, newProposal]);
  };

  // Function to update proposal
  const updateProposal = (index, field, value) => {
    const proposal = proposals[index];

    // Check if proposal is already approved
    if (proposal._id && proposal.statusProposal === "DiTerima") {
      alert("Approved proposals cannot be modified");
      return;
    }

    const updatedProposals = [...proposals];
    updatedProposals[index][field] = value;

    // If proposal was previously rejected, mark as "has been edited"
    if (proposal._id && proposal.statusProposal === "Ditolak") {
      updatedProposals[index].hasBeenEdited = true; // Flag to mark proposal as edited
    }

    setProposals(updatedProposals);
  };

  // Function to remove proposal
  const removeProposal = (index) => {
    const proposal = proposals[index];

    // Check if proposal is already approved
    if (proposal._id && proposal.statusProposal === "Diterima") {
      alert("Approved proposals cannot be deleted");
      return;
    }

    const updatedProposals = [...proposals];
    updatedProposals.splice(index, 1);
    setProposals(updatedProposals);
  };

  // Function to open date picker
  const openDatePicker = (index, type) => {
    setSelectedProposalIndex(index);
    setDatePickerType(type);
    setShowDatePicker(true);
  };

  // Function to select a date
  const handleDaySelect = (date) => {
    if (!date) return;

    if (selectedProposalIndex !== null && datePickerType) {
      const updatedProposals = [...proposals];

      if (datePickerType === "start") {
        // If selecting start date
        updatedProposals[selectedProposalIndex].tanggalMulai = date;

        // If start date is greater than end date, update end date
        if (date > updatedProposals[selectedProposalIndex].tanggalSelesai) {
          updatedProposals[selectedProposalIndex].tanggalSelesai = date;
          // Notify user
          alert(
            "End Date has been automatically updated because Start Date was later"
          );
        }
      } else {
        // If selecting end date
        const tanggalMulai =
          updatedProposals[selectedProposalIndex].tanggalMulai;

        // Ensure end date is not before start date
        if (date < tanggalMulai) {
          alert(
            "End Date cannot be before or the same as Start Date"
          );
          // Keep using old end date
          return;
        }

        updatedProposals[selectedProposalIndex].tanggalSelesai = date;
      }

      setProposals(updatedProposals);
    }

    setShowDatePicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!localFormData.file) {
      setShowModal(true);
      return;
    }

    // Additional validation
    if (proposals.length === 0) {
      alert("Please add at least one carbon absorption period");
      return;
    }

    // Validate dates for all proposals
    for (let i = 0; i < proposals.length; i++) {
      const proposal = proposals[i];
      const tanggalMulai = new Date(proposal.tanggalMulai);
      const tanggalSelesai = new Date(proposal.tanggalSelesai);

      if (tanggalMulai >= tanggalSelesai) {
        alert(`Period #${i + 1}: End Date must be after Start Date`);
        return;
      }

      if (proposal.jumlahKarbon <= 0) {
        alert(`Period #${i + 1}: Carbon Amount must be greater than 0`);
        return;
      }
    }

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const penggugah = user ? user._id : "Unknown";

    // MAIN CHANGE: Send each period as a separate entry
    try {
      // Show loading status
      setIsSubmitting(true);

      // Save all periods one by one
      for (const proposal of proposals) {
        const formDataToSend = new FormData();

        // Add main project data
        Object.keys(localFormData).forEach((key) => {
          if (key === "file" && localFormData.file) {
            for (let i = 0; i < localFormData.file.length; i++) {
              formDataToSend.append("files", localFormData.file[i]);
            }
          } else if (key !== "file" && key !== "proposals") {
            formDataToSend.append(key, localFormData[key]);
          }
        });

        // Add period data with explicit conversion for jumlahKarbon
        formDataToSend.append(
          "tanggalMulai",
          proposal.tanggalMulai.toISOString()
        );
        formDataToSend.append(
          "tanggalSelesai",
          proposal.tanggalSelesai.toISOString()
        );

        // FIX: Ensure jumlahKarbon is always a valid number
        const carbonAmount = parseInt(proposal.jumlahKarbon, 10);
        if (isNaN(carbonAmount) || carbonAmount <= 0) {
          throw new Error(
            `Carbon amount for the period must be a positive number`
          );
        }
        formDataToSend.append("jumlahKarbon", carbonAmount.toString());

        formDataToSend.append("penggugah", penggugah);

        // Send to server
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/cases`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataToSend,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save data");
        }
      }

      alert("All period data has been successfully saved");
      setLocalFormData(initialFormState);
      setProposals([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (refreshCases) refreshCases();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setLocalFormData(initialFormState);
    setProposals([]);
    setEditMode(false);
    setShowModal(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "";
    return format(new Date(date), "dd/MM/yyyy");
  };

  return (
    <div>
      {/* Modal for empty file */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-red-500 text-lg font-bold">
              File must be uploaded!
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Modal for Date Picker */}
      {showDatePicker && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-medium mb-4">
              {datePickerType === "start"
                ? "Select Start Date"
                : "Select End Date"}
            </h3>
            <DayPicker
              mode="single"
              selected={
                datePickerType === "start"
                  ? proposals[selectedProposalIndex].tanggalMulai
                  : proposals[selectedProposalIndex].tanggalSelesai
              }
              onSelect={handleDaySelect}
              fromDate={
                datePickerType === "end"
                  ? proposals[selectedProposalIndex].tanggalMulai
                  : undefined
              }
              // Add this property to display dropdown selectors
              captionLayout="dropdown"
              // Add a wider year range (from 10 years ago to 20 years ahead)
              fromYear={new Date().getFullYear() - 10}
              toYear={new Date().getFullYear() + 20}
              // Additional styling for dropdown
              classNames={{
                caption_dropdowns: "flex justify-center space-x-1",
                caption_label: "hidden", // Hide default label
                dropdown:
                  "p-1 border border-gray-300 rounded bg-white cursor-pointer text-gray-700",
                dropdown_month: "mr-1",
                dropdown_year: "ml-1",
                vhidden: "hidden", // Hide unnecessary elements
              }}
              className="mx-auto"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded p-6 mb-4"
      >
        <h2 className="text-xl font-bold mb-4">
          {editMode ? "Edit Project" : "Add New Project"}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Project Name
            </label>
            <input
              type="text"
              name="namaProyek"
              placeholder="Project Name"
              value={localFormData.namaProyek || ""}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Land Area (Ha)
            </label>
            <input
              type="text"
              name="luasTanah"
              placeholder="Land Area (Ha)"
              value={localFormData.luasTanah || ""}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Emission Absorption Medium
            </label>
            <input
              type="text"
              name="saranaPenyerapEmisi"
              placeholder="Emission Absorption Medium"
              value={localFormData.saranaPenyerapEmisi || ""}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Land Ownership
            </label>
            <input
              type="text"
              name="kepemilikanLahan"
              placeholder="Land Ownership"
              value={localFormData.kepemilikanLahan || ""}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Certification Institute
            </label>
            <select
              name="lembagaSertifikasi"
              value={
                showCustomLembaga
                  ? "independen"
                  : localFormData.lembagaSertifikasi || ""
              }
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            >
              <option value="">Select Certification Institute</option>
              {lembagaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {showCustomLembaga && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Independent Institute Name
              </label>
              <input
                type="text"
                value={customLembaga}
                onChange={handleCustomLembagaChange}
                className="border border-gray-300 rounded p-2 w-full"
                placeholder="Enter certification institute name"
                required
              />
            </div>
          )}

          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Upload Supporting Documents
            </label>
            <input
              type="file"
              name="file"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
        </div>

        {/* Proposals Section */}
        <div className="mt-6 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">
              Carbon Absorption Period Data
            </h3>
            <button
              type="button"
              onClick={addProposal}
              className="bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Period
            </button>
          </div>

          {proposals.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-500">
                No period data yet. Click "Add Period" button to add.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal, index) => (
                <div
                  key={index}
                  className={`bg-gray-50 p-4 rounded border border-gray-200 relative ${
                    proposal._id && proposal.statusProposal === "Diterima"
                      ? "bg-green-50"
                      : proposal._id && proposal.statusProposal === "Ditolak"
                      ? "bg-red-50"
                      : "bg-gray-50"
                  }`}
                >
                  {proposal._id && proposal.statusProposal === "Diterima" && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl">
                      Approved - Cannot be modified
                    </div>
                  )}
                  {proposal._id && proposal.statusProposal === "Ditolak" && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl">
                      Rejected
                    </div>
                  )}
                  {/* Add indicator for resubmission */}
                  {proposal._id &&
                    proposal.statusProposal === "Ditolak" &&
                    proposal.hasBeenEdited && (
                      <div className="absolute top-6 right-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded-bl">
                        Will be resubmitted after update
                      </div>
                    )}

                  <button
                    type="button"
                    onClick={() => removeProposal(index)}
                    className={`absolute top-2 right-2 text-red-500 hover:text-red-700 ${
                      proposal._id && proposal.statusProposal === "Diterima"
                        ? "hidden"
                        : ""
                    }`}
                    disabled={
                      proposal._id && proposal.statusProposal === "Diterima"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Start Date
                      </label>
                      <button
                        type="button"
                        onClick={() => openDatePicker(index, "start")}
                        className="border border-gray-300 rounded p-2 w-full text-left bg-white"
                      >
                        {formatDate(proposal.tanggalMulai)}
                      </button>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        End Date
                      </label>
                      <button
                        type="button"
                        onClick={() => openDatePicker(index, "end")}
                        className="border border-gray-300 rounded p-2 w-full text-left bg-white"
                      >
                        {formatDate(proposal.tanggalSelesai)}
                      </button>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Carbon Amount (Tons){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={proposal.jumlahKarbon}
                        onChange={(e) =>
                          updateProposal(
                            index,
                            "jumlahKarbon",
                            Number(e.target.value)
                          )
                        }
                        className={`border ${
                          !proposal.jumlahKarbon || proposal.jumlahKarbon <= 0
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        } rounded p-2 w-full`}
                        min="1"
                        step="1"
                        required
                        placeholder="Enter carbon amount"
                      />
                      {(!proposal.jumlahKarbon ||
                        proposal.jumlahKarbon <= 0) && (
                        <p className="text-red-500 text-xs mt-1">
                          Carbon amount is required and must be greater than 0
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-3 bg-blue-50 rounded text-blue-700 font-medium">
                Total Carbon:{" "}
                {proposals.reduce((sum, p) => sum + Number(p.jumlahKarbon), 0)}{" "}
                Tons
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editMode ? "Update" : "Save"}
          </button>

          {editMode && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CaseForm;