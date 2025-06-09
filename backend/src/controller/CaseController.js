const multer = require("multer");
const path = require("path");
const Case = require("../models/Case");
const User = require("../models/User");

// Konfigurasi multer untuk menyimpan file di memori
const storage = multer.memoryStorage(); // Gunakan penyimpanan memori
const upload = multer({ storage }); // Buat instance multer dengan penyimpanan memori

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
  "Access-Control-Allow-Headers, Content-Type, Authorization",
  "Access-Control-Allow-Methods": "*",
  "Content-Type": "application/json",
};

const createCase = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      luasTanah,
      jenisPohon,
      lembagaSertifikasi,
      jumlahKarbon,
      metodePengukuran,
      jenisTanah,
      lokasiGeografis,
      kepemilikanLahan,
    } = req.body;

    // Simpan semua file yang diunggah
    const uploadedFiles = req.files.map((file) => ({
      fileName: file.originalname,
      fileData: file.buffer,
    }));

    const newCase = new Case({
      luasTanah,
      jenisPohon,
      lembagaSertifikasi,
      jumlahKarbon,
      metodePengukuran,
      jenisTanah,
      lokasiGeografis,
      kepemilikanLahan,
      penggugah: userId, // Simpan ID user yang mengunggah kasus
      files: uploadedFiles, // Simpan banyak file,
      statusPengajuan: "Diajukan" // Default status pengajuan
      // file: req.file ? req.file.buffer : null,
      // fileName: req.file ? req.file.originalname : null,
    });

    const savedCase = await newCase.save();
    res.status(201).json(savedCase);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Gagal menambahkan data", error: error.message });
  }
};

const getAllCases = async (req, res) => {
  try {
    const { page = 1, filter = "" } = req.query;
    const query = filter ? { status: filter } : {};

    const cases = await Case.find(query)
      .populate("penggugah", "firstName lastName email role") // ✅ Populate data user
      .sort({ createdAt: 1 }) // Urutkan berdasarkan waktu input (ascending)
      .skip((page - 1) * 10000)
      .limit(10000);

    res.status(200).json({ cases });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mendapatkan data", error: error.message });
  }
};

const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // ✅ Ambil ID pengguna yang sedang login

    console.log("🚀 ~ updateCase ~ id:", id);
    console.log("Data diterima untuk update:", req.body);

    if (req.file) {
      console.log("File diterima untuk update:", req.file.originalname);
    }

    // Data yang akan diperbarui
    const updatedData = {
      ...req.body, // Data dari form
      penggugah: userId, // ✅ Simpan user yang mengupdate kasus
    };

    // Jika ada file yang diunggah, proses sebagai array
    if (req.files && req.files.length > 0) {
      updatedData.files = req.files.map((file) => ({
        fileName: file.originalname,
        fileData: file.buffer,
      }));
    }

    // if (req.file) {
    //   updatedData.file = req.file.buffer;
    //   updatedData.fileName = req.file.originalname;
    // }

    // Update case
    const updatedCase = await Case.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedCase) {
      return res.status(404).json({ message: "Data tidak ditemukan." });
    }

    // ✅ Pastikan daftar kasus pada User juga diperbarui
    await User.findByIdAndUpdate(userId, {
      $addToSet: { cases: updatedCase._id },
    });

    console.log("Data berhasil diperbarui:", updatedCase);
    res
      .status(200)
      .json({ message: "Data berhasil diperbarui", case: updatedCase });
  } catch (error) {
    console.error("Gagal memperbarui data:", error.message);
    res
      .status(500)
      .json({ message: "Gagal memperbarui data", error: error.message });
  }
};

const getFile = async (req, res) => {
  try {
    const { id } = req.params;
    const caseData = await Case.findById(id);

    if (!caseData || !caseData.file || !caseData.fileName) {
      return res.status(404).json({ message: "File tidak ditemukan." });
    }

    // Kirim file untuk diunduh
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${caseData.fileName}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(caseData.file);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data", error: error.message });
  }
};

const getFileByIndex = async (req, res) => {
  try {
    const { caseId, fileIndex } = req.params;
    const caseData = await Case.findById(caseId);

    if (!caseData || !caseData.files[fileIndex]) {
      return res.status(404).json({ message: "Data tidak ditemukan." });
    }

    const file = caseData.files[fileIndex]; // Ambil file berdasarkan indeks
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.fileName}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(file.fileData); // Kirim file dalam bentuk buffer
  } catch (err) {
    console.error("Error fetching file:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCase = await Case.findByIdAndDelete(id);

    if (!deletedCase) {
      return res.status(404).json({ message: "Data tidak ditemukan." });
    }

    res
      .status(200)
      .json({ message: "Data berhasil dihapus", case: deletedCase });
  } catch (error) {
    console.error("Gagal menghapus data:", error.message);
    res
      .status(500)
      .json({ message: "Gagal menghapus data", error: error.message });
  }
};

// Tambahkan fungsi baru untuk update status pengajuan
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusPengajuan } = req.body;
    
    // Validasi status
    if (!['Diajukan', 'Diterima', 'Ditolak'].includes(statusPengajuan)) {
      return res.status(400).json({ message: "Status pengajuan tidak valid" });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      { statusPengajuan },
      { new: true }
    ).populate('penggugah');

    if (!updatedCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    res.status(200).json({
      message: "Status pengajuan berhasil diperbarui",
      case: updatedCase
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCase,
  getAllCases,
  updateCase,
  getFile, // Tambahkan fungsi getFile
  getFileByIndex,
  deleteCase, // Menambahkan fungsi delete
  upload,
  updateStatus
};