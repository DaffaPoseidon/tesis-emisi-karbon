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
      value: "ISPO (Indonesian Sustainable Palm Oil)",
      label: "ISPO (Indonesian Sustainable Palm Oil)",
    },
    {
      value: "RSPO (Roundtable on Sustainable Palm Oil)",
      label: "RSPO (Roundtable on Sustainable Palm Oil)",
    },
    {
      value: "FSC (Forest Stewardship Council)",
      label: "FSC (Forest Stewardship Council)",
    },
    {
      value: "PEFC (Programme for the Endorsement of Forest Certification)",
      label: "PEFC (Programme for the Endorsement of Forest Certification)",
    },
    {
      value: "SVLK (Sistem Verifikasi Legalitas Kayu)",
      label: "SVLK (Sistem Verifikasi Legalitas Kayu)",
    },
    {
      value: "ISCC (International Sustainability and Carbon Certification)",
      label: "ISCC (International Sustainability and Carbon Certification)",
    },
    { value: "independen", label: "Lembaga Independen (Isi Sendiri)" },
  ]);
  const [customLembaga, setCustomLembaga] = useState("");
  const [showCustomLembaga, setShowCustomLembaga] = useState(false);

  // State untuk mengelola modal date picker
  const [selectedProposalIndex, setSelectedProposalIndex] = useState(null);
  const [datePickerType, setDatePickerType] = useState(null); // 'start' atau 'end'
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (editMode) {
      setLocalFormData(formData);

      // Proses proposals dari server
      if (formData.proposals && formData.proposals.length > 0) {
        // Pastikan setiap proposal memiliki format yang benar
        const processedProposals = formData.proposals.map((proposal) => ({
          ...proposal,
          // Pastikan tanggal adalah objek Date
          tanggalMulai: new Date(proposal.tanggalMulai),
          tanggalSelesai: new Date(proposal.tanggalSelesai),
          // Pastikan jumlahKarbon adalah number
          jumlahKarbon: Number(proposal.jumlahKarbon),
          // Pastikan ID tersimpan untuk proposals yang sudah ada
          _id: proposal._id,
        }));

        setProposals(processedProposals);
      } else {
        setProposals([]);
      }

      // Cek jika lembaga sertifikasi adalah custom
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

      // Reset input file saat keluar dari edit mode
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

  // Fungsi untuk menambah proposal baru
  const addProposal = () => {
    const newProposal = {
      tanggalMulai: new Date(),
      tanggalSelesai: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari dari sekarang
      jumlahKarbon: 0,
      statusProposal: "Diajukan",
    };

    setProposals([...proposals, newProposal]);
  };

  // Fungsi untuk update proposal
  const updateProposal = (index, field, value) => {
    const proposal = proposals[index];

    // Cek jika proposal sudah disetujui
    if (proposal._id && proposal.statusProposal === "Diterima") {
      alert("Proposal yang sudah disetujui tidak dapat diubah");
      return;
    }

    const updatedProposals = [...proposals];
    updatedProposals[index][field] = value;
    setProposals(updatedProposals);
  };

  // Fungsi untuk menghapus proposal
  const removeProposal = (index) => {
    const proposal = proposals[index];

    // Cek jika proposal sudah disetujui
    if (proposal._id && proposal.statusProposal === "Diterima") {
      alert("Proposal yang sudah disetujui tidak dapat dihapus");
      return;
    }

    const updatedProposals = [...proposals];
    updatedProposals.splice(index, 1);
    setProposals(updatedProposals);
  };

  // Fungsi untuk membuka date picker
  const openDatePicker = (index, type) => {
    setSelectedProposalIndex(index);
    setDatePickerType(type);
    setShowDatePicker(true);
  };

  // Fungsi untuk memilih tanggal
  const handleDaySelect = (date) => {
    if (!date) return;

    if (selectedProposalIndex !== null && datePickerType) {
      const updatedProposals = [...proposals];

      if (datePickerType === "start") {
        // Jika memilih tanggal mulai
        updatedProposals[selectedProposalIndex].tanggalMulai = date;

        // Jika tanggal mulai lebih besar dari tanggal selesai, update tanggal selesai
        if (date > updatedProposals[selectedProposalIndex].tanggalSelesai) {
          updatedProposals[selectedProposalIndex].tanggalSelesai = date;
          // Beri notifikasi kepada user
          alert(
            "Tanggal Selesai telah diubah otomatis karena Tanggal Mulai lebih besar"
          );
        }
      } else {
        // Jika memilih tanggal selesai
        const tanggalMulai =
          updatedProposals[selectedProposalIndex].tanggalMulai;

        // Pastikan tanggal selesai tidak sebelum tanggal mulai
        if (date < tanggalMulai) {
          alert(
            "Tanggal Selesai tidak boleh sebelum atau sama dengan Tanggal Mulai"
          );
          // Tetap gunakan tanggal selesai lama
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

    // Validasi tambahan
    if (proposals.length === 0) {
      alert("Harap tambahkan minimal satu data periode penyerapan karbon");
      return;
    }

    // Validasi tanggal untuk semua proposal
    for (let i = 0; i < proposals.length; i++) {
      const proposal = proposals[i];
      const tanggalMulai = new Date(proposal.tanggalMulai);
      const tanggalSelesai = new Date(proposal.tanggalSelesai);

      if (tanggalMulai >= tanggalSelesai) {
        alert(`Periode #${i + 1}: Tanggal Selesai harus setelah Tanggal Mulai`);
        return;
      }

      if (proposal.jumlahKarbon <= 0) {
        alert(`Periode #${i + 1}: Jumlah Karbon harus lebih dari 0`);
        return;
      }
    }

    // Hitung total karbon
    const totalKarbon = proposals.reduce(
      (sum, proposal) => sum + Number(proposal.jumlahKarbon),
      0
    );

    // Buat data lengkap termasuk proposals
    const completeFormData = {
      ...localFormData,
      proposals: proposals,
      jumlahKarbon: totalKarbon,
    };

    if (editMode && handleUpdate) {
      await handleUpdate(completeFormData);
    } else {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const penggugah = user ? user._id : "Unknown";

      const formDataToSend = new FormData();

      // Tambahkan data utama
      Object.keys(completeFormData).forEach((key) => {
        if (key === "file" && completeFormData.file) {
          for (let i = 0; i < completeFormData.file.length; i++) {
            formDataToSend.append("files", completeFormData.file[i]);
          }
        } else if (key !== "file" && key !== "proposals") {
          formDataToSend.append(key, completeFormData[key]);
        }
      });

      // Tambahkan data proposals sebagai JSON string
      formDataToSend.append("proposals", JSON.stringify(proposals));

      formDataToSend.append("penggugah", penggugah);

      try {
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

        if (response.ok) {
          alert("Data berhasil disimpan");
          setLocalFormData(initialFormState);
          setProposals([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
          refreshCases();
        } else {
          const errorData = await response.json();
          alert(`Gagal menyimpan data: ${errorData.message}`);
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleCancel = () => {
    setLocalFormData(initialFormState);
    setProposals([]);
    setEditMode(false);
    setShowModal(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Format tanggal
  const formatDate = (date) => {
    if (!date) return "";
    return format(new Date(date), "dd/MM/yyyy");
  };

  return (
    <div>
      {/* Modal untuk file kosong */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-red-500 text-lg font-bold">
              File harus diunggah!
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

      {/* Modal untuk Date Picker */}
      {showDatePicker && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-medium mb-4">
              {datePickerType === "start"
                ? "Pilih Tanggal Mulai"
                : "Pilih Tanggal Selesai"}
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
              // Tambahkan property ini untuk menampilkan dropdown selectors
              captionLayout="dropdown"
              // Tambahkan range tahun yang lebih luas (dari 10 tahun lalu hingga 20 tahun ke depan)
              fromYear={new Date().getFullYear() - 10}
              toYear={new Date().getFullYear() + 20}
              // Styling tambahan untuk dropdown
              classNames={{
                caption_dropdowns: "flex justify-center space-x-1",
                caption_label: "hidden", // Sembunyikan label default
                dropdown:
                  "p-1 border border-gray-300 rounded bg-white cursor-pointer text-gray-700",
                dropdown_month: "mr-1",
                dropdown_year: "ml-1",
                vhidden: "hidden", // Sembunyikan elemen yang tidak perlu
              }}
              className="mx-auto"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
              >
                Batal
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
          {editMode ? "Edit Proyek" : "Tambah Proyek Baru"}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nama Proyek
            </label>
            <input
              type="text"
              name="namaProyek"
              placeholder="Nama Proyek"
              value={localFormData.namaProyek || ""}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Luas Tanah (Ha)
            </label>
            <input
              type="text"
              name="luasTanah"
              placeholder="Luas Tanah (Ha)"
              value={localFormData.luasTanah || ""}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Sarana Penyerap Emisi
            </label>
            <input
              type="text"
              name="saranaPenyerapEmisi"
              placeholder="Sarana Penyerap Emisi"
              value={localFormData.saranaPenyerapEmisi || ""}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Kepemilikan Lahan
            </label>
            <input
              type="text"
              name="kepemilikanLahan"
              placeholder="Kepemilikan Lahan"
              value={localFormData.kepemilikanLahan || ""}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Lembaga Sertifikasi
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
              <option value="">Pilih Lembaga Sertifikasi</option>
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
                Nama Lembaga Independen
              </label>
              <input
                type="text"
                value={customLembaga}
                onChange={handleCustomLembagaChange}
                className="border border-gray-300 rounded p-2 w-full"
                placeholder="Masukkan nama lembaga sertifikasi"
                required
              />
            </div>
          )}

          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Unggah Dokumen Pendukung
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

        {/* Bagian Proposal */}
        <div className="mt-6 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">
              Data Periode Penyerapan Karbon
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
              Tambah Periode
            </button>
          </div>

          {proposals.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-500">
                Belum ada data periode. Klik tombol "Tambah Periode" untuk
                menambahkan.
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
                      Disetujui - Tidak dapat diubah
                    </div>
                  )}
                  {proposal._id && proposal.statusProposal === "Ditolak" && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl">
                      Ditolak
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
                        Tanggal Mulai
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
                        Tanggal Selesai
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
                        Jumlah Karbon (Ton){" "}
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
                        placeholder="Masukkan jumlah karbon"
                      />
                      {(!proposal.jumlahKarbon ||
                        proposal.jumlahKarbon <= 0) && (
                        <p className="text-red-500 text-xs mt-1">
                          Jumlah karbon wajib diisi dan harus lebih dari 0
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-3 bg-blue-50 rounded text-blue-700 font-medium">
                Total Karbon:{" "}
                {proposals.reduce((sum, p) => sum + Number(p.jumlahKarbon), 0)}{" "}
                Ton
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editMode ? "Update" : "Simpan"}
          </button>

          {editMode && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CaseForm;
