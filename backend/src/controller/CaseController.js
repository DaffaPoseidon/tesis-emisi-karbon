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

// blockchain
const { issueCarbonCertificate } = require("../services/blockchainService");
const fs = require("fs");

// Fungsi untuk memproses persetujuan validator
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusPengajuan } = req.body;

    // Validasi status
    if (!["Diajukan", "Diterima", "Ditolak"].includes(statusPengajuan)) {
      return res.status(400).json({ message: "Status pengajuan tidak valid" });
    }

    // Ambil data kasus
    const caseData = await Case.findById(id).populate("penggugah");
    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Update status pengajuan
    caseData.statusPengajuan = statusPengajuan;

    // Jika status "Diterima", kirim data ke blockchain
    if (statusPengajuan === "Diterima") {
      try {
        // Alamat penerima (bisa dari user.walletAddress jika ada, atau gunakan default)
        const recipientAddress = process.env.DEFAULT_RECIPIENT_ADDRESS;

        // Jumlah karbon dalam ton
        const carbonAmount = parseInt(caseData.jumlahKarbon);

        // Gunakan ID kasus sebagai projectId
        const projectId = caseData._id.toString();

        console.log(
          `Status: ${statusPengajuan}, Carbon Amount: ${carbonAmount}, Project ID: ${projectId}`
        );
        console.log(`Recipient Address: ${recipientAddress}`);

        // Tambahkan timeout untuk memastikan transaksi diproses
        console.log("Menunggu transaksi blockchain...");
        const blockchainResult = await issueCarbonCertificate(
          recipientAddress,
          carbonAmount,
          projectId
        );

        // Logging detail untuk debugging
        console.log(
          "Hasil blockchain:",
          JSON.stringify(blockchainResult, null, 2)
        );

        if (blockchainResult.success) {
          // Tambahkan pemeriksaan token yang lebih robust
          if (blockchainResult.tokens && blockchainResult.tokens.length > 0) {
            console.log(
              `${blockchainResult.tokens.length} token berhasil dibuat`
            );

            // Simpan hasil blockchain ke data kasus
            caseData.blockchainData = {
              issuedOn: new Date(),
              transactionHash: blockchainResult.transactionHash,
              blockNumber: blockchainResult.blockNumber,
              tokens: blockchainResult.tokens, // Array yang berisi tokenId dan uniqueHash
              recipientAddress: recipientAddress,
            };

            // Simpan perubahan ke database
            await caseData.save();

            // Kirim response ke client dengan data lengkap
            return res.status(200).json({
              message: `Status pengajuan diperbarui dan ${carbonAmount} sertifikat karbon telah diterbitkan di blockchain`,
              case: caseData,
              blockchain: blockchainResult,
            });
          } else {
            console.error(
              "Tidak ada token yang dibuat meskipun transaksi berhasil!"
            );
            return res.status(500).json({
              message:
                "Transaksi blockchain berhasil tetapi tidak ada token yang dibuat",
              blockchainResult,
            });
          }
        } else {
          console.error("Transaksi blockchain gagal:", blockchainResult.error);
          return res.status(500).json({
            message: "Gagal menerbitkan sertifikat di blockchain",
            error: blockchainResult.error,
          });
        }
      } catch (error) {
        console.error("Error dalam proses blockchain:", error);
        return res.status(500).json({
          message: "Terjadi kesalahan saat memproses blockchain",
          error: error.message,
        });
      }
    } else {
      // Jika status bukan "Diterima", cukup simpan perubahan status
      await caseData.save();

      return res.status(200).json({
        message: "Status pengajuan berhasil diperbarui",
        case: caseData,
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({ message: error.message });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const { uniqueHash } = req.params;

    if (!uniqueHash) {
      return res.status(400).json({ message: "Hash unik tidak diberikan" });
    }

    const { verifyCertificate } = require("../services/blockchainService");
    const verificationResult = await verifyCertificate(uniqueHash);

    if (verificationResult.success && verificationResult.isValid) {
      // Jika hash valid, ambil data sertifikat lengkap
      const { getCertificateByHash } = require("../services/blockchainService");
      const certificateDetails = await getCertificateByHash(uniqueHash);

      // Cari data case terkait di MongoDB
      const caseData = await Case.findOne({
        "blockchainData.tokens.uniqueHash": uniqueHash,
      });

      res.status(200).json({
        message: "Sertifikat terverifikasi dan valid",
        isValid: true,
        certificate: certificateDetails,
        caseData: caseData,
      });
    } else if (verificationResult.success) {
      res.status(200).json({
        message: "Sertifikat tidak valid atau tidak ditemukan",
        isValid: false,
      });
    } else {
      res.status(500).json({
        message: "Gagal memverifikasi sertifikat",
        error: verificationResult.error,
      });
    }
  } catch (error) {
    console.error("Error verifying certificate:", error);
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mendapatkan detail sertifikat berdasarkan tokenId
const getCertificateByTokenId = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { getCertificateDetails } = require("../services/blockchainService");

    const certificateDetails = await getCertificateDetails(tokenId);

    if (certificateDetails.success) {
      res.status(200).json({
        message: "Certificate details retrieved successfully",
        certificate: certificateDetails,
      });
    } else {
      res.status(404).json({
        message: "Failed to retrieve certificate details",
        error: certificateDetails.error,
      });
    }
  } catch (error) {
    console.error("Error getting certificate details:", error);
    res.status(500).json({ message: error.message });
  }
};

const createCase = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== "seller" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Hanya seller yang dapat menambahkan data" });
    }

    // Validasi apakah ada file yang diunggah
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "File harus diunggah." });
    }

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
      penggugah: userId,
      files: uploadedFiles,
      statusPengajuan: "Diajukan",
    });

    await newCase.save();
    console.log("Case saved with files:", uploadedFiles.length);

    res
      .status(201)
      .json({ message: "Data berhasil ditambahkan", case: newCase });
  } catch (error) {
    console.error("Error creating case:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server", error: error.message });
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

    if (!caseData || !caseData.files || !caseData.files[fileIndex]) {
      return res.status(404).json({ message: "File tidak ditemukan." });
    }

    const file = caseData.files[fileIndex]; // Ambil file berdasarkan indeks

    // Atur header response untuk gambar
    const mimeType = getMimeType(file.fileName);
    res.setHeader("Content-Type", mimeType);

    // Kirim file dalam bentuk buffer
    res.send(file.fileData);
  } catch (err) {
    console.error("Error fetching file:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Fungsi untuk menentukan MIME type berdasarkan ekstensi file
const getMimeType = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  return mimeTypes[ext] || "application/octet-stream";
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

const purchaseProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Validasi role user
    if (userRole !== 'buyer' && userRole !== 'superadmin') {
      return res.status(403).json({
        message: "Akses ditolak. Hanya buyer yang dapat melakukan pembelian."
      });
    }
    
    // Lanjutkan dengan proses pembelian
    const { productId, quantity, totalPrice } = req.body;
    
    // Validasi data pembelian
    if (!productId || !quantity || !totalPrice) {
      return res.status(400).json({
        message: "Data pembelian tidak lengkap."
      });
    }
    
    // Implementasi logika pembelian
    // ...
    
    res.status(200).json({
      message: "Pembelian berhasil",
      data: {
        productId,
        quantity,
        totalPrice,
        purchaseDate: new Date()
      }
    });
  } catch (error) {
    console.error("Error during purchase:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat melakukan pembelian."
    });
  }
};

module.exports = {
  createCase,
  getAllCases,
  updateCase,
  getFile, // Tambahkan fungsi getFile
  getFileByIndex,
  getMimeType,
  deleteCase, // Menambahkan fungsi delete
  upload,
  updateStatus,
  getCertificateByTokenId,
  verifyCertificate,
  purchaseProduct,
};
