const multer = require("multer");
const path = require("path");
const Case = require("../models/Case");
const User = require("../models/User");
const mongoose = require("mongoose");
const Purchase = require("../models/Purchase");

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

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("-password") // Exclude password
      .populate({
        path: "carbonCredits.caseId",
        select:
          "namaProyek saranaPenyerapEmisi jumlahKarbon lembagaSertifikasi tanggalMulai tanggalSelesai",
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phoneNumber,
      personalAddress,
      companyDetails,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "First name and last name are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        phoneNumber,
        personalAddress,
        companyDetails,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: error.message });
  }
};

const processPurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caseId, quantity, totalPrice } = req.body;

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({ message: "Invalid case ID" });
    }

    // Validate inputs
    if (!quantity || quantity <= 0 || !totalPrice || totalPrice <= 0) {
      return res.status(400).json({ message: "Invalid quantity or price" });
    }

    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has enough balance
    if (user.balance < totalPrice) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Check if case exists and has enough carbon credits
    const carbonCase = await Case.findById(caseId);
    if (!carbonCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (carbonCase.jumlahKarbon < quantity) {
      return res
        .status(400)
        .json({ message: "Not enough carbon credits available" });
    }

    // Update user balance
    user.balance -= totalPrice;

    // Add carbon credits to user
    const transactionId = new mongoose.Types.ObjectId().toString();
    user.carbonCredits.push({
      caseId,
      quantity,
      purchaseDate: new Date(),
      transactionId,
    });

    // Update case carbon amount
    carbonCase.jumlahKarbon -= quantity;

    // Save changes
    await Promise.all([user.save(), carbonCase.save()]);

    // Create purchase record
    const purchase = new Purchase({
      buyer: userId,
      seller: carbonCase.penggugah,
      case: caseId,
      quantity,
      totalPrice,
      transactionId,
    });

    await purchase.save();

    res.status(200).json({
      message: "Purchase successful",
      purchase: {
        transactionId,
        case: carbonCase.namaProyek,
        quantity,
        totalPrice,
        remainingBalance: user.balance,
      },
    });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk memproses persetujuan validator
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusPengajuan, rejectionReason } = req.body;

    // Validasi status
    if (
      statusPengajuan &&
      !["Diajukan", "Diterima", "Ditolak"].includes(statusPengajuan)
    ) {
      return res.status(400).json({ message: "Status pengajuan tidak valid" });
    }

    // If status is "Ditolak", require a rejection reason
    if (statusPengajuan === "Ditolak" && !rejectionReason) {
      return res.status(400).json({
        message: "Reason for rejection is required.",
      });
    }

    // Find the case
    const carbonCase = await Case.findById(id);
    if (!carbonCase) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Update status
    carbonCase.statusPengajuan = statusPengajuan;

    // If rejected, add rejection reason
    if (statusPengajuan === "Ditolak") {
      carbonCase.rejectionReason = rejectionReason;
    }

    let blockchainSuccess = false;

    // Jika status Diterima, proses ke blockchain
    try {
      // Ambil alamat penerima
      const recipientAddress =
        carbonCase.penggugah.walletAddress ||
        process.env.DEFAULT_RECIPIENT_ADDRESS;

      if (!recipientAddress) {
        throw new Error("No recipient address available");
      }

      console.log(
        `Processing blockchain for case ${carbonCase.namaProyek} with recipient ${recipientAddress}`
      );

      // Debugging sebelum blockchain process
      const { debugSmartContract } = require("../services/blockchainService");
      await debugSmartContract();

      // Get submitter name instead of just ID
      const submitterName =
        carbonCase.penggugah.firstName && carbonCase.penggugah.lastName
          ? `${carbonCase.penggugah.firstName} ${carbonCase.penggugah.lastName}`
          : carbonCase.penggugah.username || "Unknown";

      // Proses ke blockchain dengan data lengkap
      const blockchainResult = await issueCarbonCertificate(recipientAddress, {
        namaProyek: carbonCase.namaProyek,
        luasTanah: carbonCase.luasTanah,
        saranaPenyerapEmisi: carbonCase.saranaPenyerapEmisi,
        lembagaSertifikasi: carbonCase.lembagaSertifikasi,
        kepemilikanLahan: carbonCase.kepemilikanLahan,
        jumlahKarbon: carbonCase.jumlahKarbon,
        tanggalMulai: carbonCase.tanggalMulai,
        tanggalSelesai: carbonCase.tanggalSelesai,
        penggugahName: submitterName, // Nama penggugah langsung
        statusPengajuan: carbonCase.statusPengajuan,
      });

      console.log("Blockchain result:", JSON.stringify(blockchainResult));

      if (blockchainResult.success) {
        console.log("Blockchain process successful, updating MongoDB document");

        // Verifikasi tokens
        if (!blockchainResult.tokens || blockchainResult.tokens.length === 0) {
          console.warn("Warning: No tokens returned from blockchain process");
        }

        // Simpan data blockchain tanpa ObjectId references
        carbonCase.blockchainData = {
          transactionHash: blockchainResult.transactionHash,
          blockNumber: blockchainResult.blockNumber,
          tokens: blockchainResult.tokens || [],
          issuedOn: blockchainResult.issuedOn || Date.now(),
          recipientAddress: recipientAddress,
          projectData: blockchainResult.projectData || {},
        };

        blockchainSuccess = true;
      } else {
        console.error("Blockchain process failed:", blockchainResult.error);
        return res.status(500).json({
          message: "Gagal memproses data ke blockchain",
          error: blockchainResult.error,
          details: blockchainResult.details,
        });
      }
    } catch (error) {
      console.error("Error dalam proses blockchain:", error);
      return res.status(500).json({
        message: "Gagal memproses data ke blockchain",
        error: error.message,
      });
    }

    // Simpan perubahan ke MongoDB
    const savedCase = await carbonCase.save();
    console.log(
      "Case saved to MongoDB with blockchain data:",
      savedCase.blockchainData ? "Yes" : "No"
    );

    res.status(200).json({
      message: `Status pengajuan diperbarui ke ${statusPengajuan}`,
      case: savedCase,
      blockchainSuccess,
    });
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
      return res.status(403).json({
        message: "Akses ditolak. Hanya seller yang dapat menambah data.",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "File harus diunggah." });
    }

    const {
      namaProyek,
      luasTanah,
      saranaPenyerapEmisi,
      lembagaSertifikasi,
      kepemilikanLahan,
      tanggalMulai,
      tanggalSelesai,
      jumlahKarbon,
    } = req.body;

    // Ambil jumlahKarbon yang valid jika berupa array
    let jumlahKarbonValue = jumlahKarbon;
    if (Array.isArray(jumlahKarbon)) {
      // Ambil nilai terakhir yang bukan string kosong
      jumlahKarbonValue = jumlahKarbon
        .reverse()
        .find((val) => val && val !== "");
    }

    // Log untuk debugging
    console.log("Data karbon yang diterima:", {
      jumlahKarbon: jumlahKarbonValue,
      tipe: typeof jumlahKarbonValue,
      nilai: Number(jumlahKarbonValue),
    });

    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalSelesai);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Format tanggal tidak valid." });
    }
    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ message: "Tanggal selesai harus setelah tanggal mulai." });
    }

    const uploadedFiles = req.files.map((file) => ({
      fileName: file.originalname,
      fileData: file.buffer,
    }));

    let carbonAmount;
    try {
      if (jumlahKarbonValue === undefined || jumlahKarbonValue === "") {
        throw new Error("Jumlah karbon tidak boleh kosong");
      }
      carbonAmount = parseInt(jumlahKarbonValue, 10);
      if (isNaN(carbonAmount)) {
        carbonAmount = parseFloat(jumlahKarbonValue);
      }
      if (isNaN(carbonAmount)) {
        throw new Error("Konversi jumlah karbon gagal");
      }
      if (carbonAmount <= 0) {
        throw new Error("Jumlah karbon harus lebih dari 0");
      }
    } catch (error) {
      console.error("Error konversi jumlah karbon:", error.message, {
        input: jumlahKarbonValue,
        tipe: typeof jumlahKarbonValue,
      });
      return res.status(400).json({
        message: "Jumlah karbon harus berupa angka positif.",
        detail: error.message,
      });
    }

    const newCase = new Case({
      namaProyek,
      luasTanah,
      saranaPenyerapEmisi,
      lembagaSertifikasi,
      kepemilikanLahan,
      tanggalMulai: startDate,
      tanggalSelesai: endDate,
      jumlahKarbon: carbonAmount,
      jumlahSertifikat: carbonAmount,
      penggugah: userId,
      penggugahName: `${req.user.firstName} ${req.user.lastName}`,
      files: uploadedFiles,
    });

    const savedCase = await newCase.save();

    res.status(201).json({
      message: "Data berhasil disimpan",
      case: savedCase,
    });
  } catch (error) {
    console.error("Error creating case:", error);
    res.status(500).json({ message: error.message });
  }
};

const getCase = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Fetching case with ID:", id);

    // Validasi ID
    if (!id || id === "undefined") {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    // Validasi bahwa ID adalah ObjectId yang valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Format ID tidak valid" });
    }

    const caseItem = await Case.findById(id).populate(
      "penggugah",
      "firstName lastName email walletAddress"
    );

    if (!caseItem) {
      return res.status(404).json({ message: "Case tidak ditemukan" });
    }

    res.json(caseItem);
  } catch (error) {
    console.error("Error fetching case:", error);
    res.status(500).json({ message: error.message });
  }
};

const getApprovedCases = async (req, res) => {
  try {
    console.log("Fetching approved cases...");

    // Ambil semua dokumen dengan status Diterima dan data blockchain
    const approvedCases = await Case.find({
      statusPengajuan: "Diterima",
      blockchainData: { $exists: true },
    }).populate("penggugah", "firstName lastName email walletAddress");

    console.log(`Found ${approvedCases.length} approved cases`);
    res.json(approvedCases);
  } catch (error) {
    console.error("Error fetching approved cases:", error);
    res.status(500).json({ message: error.message });
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

// Modifikasi pada fungsi updateCase

const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Cek apakah pengguna adalah pemilik case atau superadmin
    const existingCase = await Case.findById(id);
    if (!existingCase) {
      return res.status(404).json({ message: "Case tidak ditemukan" });
    }

    // Hanya pemilik atau superadmin yang dapat mengupdate
    if (
      existingCase.penggugah.toString() !== userId &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk mengupdate case ini",
      });
    }

    // Cek apakah case sudah disetujui
    if (existingCase.statusPengajuan === "Diterima") {
      return res.status(403).json({
        message: "Case yang sudah disetujui tidak dapat diubah",
      });
    }

    const {
      namaProyek,
      luasTanah,
      saranaPenyerapEmisi,
      lembagaSertifikasi,
      kepemilikanLahan,
    } = req.body;

    // Handle proposals secara khusus
    let proposals = existingCase.proposals; // Default gunakan proposals yang sudah ada

    if (req.body.proposals) {
      try {
        // Jika proposals dikirim sebagai string (JSON string), parse ke object
        if (typeof req.body.proposals === "string") {
          proposals = JSON.parse(req.body.proposals);
        } else {
          proposals = req.body.proposals;
        }

        // Pastikan semua proposal yang sudah diterima tidak diubah
        proposals = proposals.map((newProposal) => {
          // Cari proposal lama dengan ID yang sama
          const oldProposal = existingCase.proposals.find(
            (p) => p._id.toString() === newProposal._id
          );

          // Jika proposal lama sudah diterima, pertahankan status dan datanya
          if (oldProposal && oldProposal.statusProposal === "Diterima") {
            return oldProposal;
          }

          // Jika proposal baru dan tidak memiliki ID, tambahkan sebagai proposal baru
          if (!newProposal._id) {
            return {
              ...newProposal,
              statusProposal: "Diajukan",
              tanggalMulai: new Date(newProposal.tanggalMulai),
              tanggalSelesai: new Date(newProposal.tanggalSelesai),
              jumlahKarbon: Number(newProposal.jumlahKarbon),
            };
          }

          // Jika proposal ada dan belum diterima, update data
          return {
            ...newProposal,
            statusProposal: newProposal.statusProposal || "Diajukan",
            tanggalMulai: new Date(newProposal.tanggalMulai),
            tanggalSelesai: new Date(newProposal.tanggalSelesai),
            jumlahKarbon: Number(newProposal.jumlahKarbon),
          };
        });
      } catch (error) {
        console.error("Error processing proposals:", error);
        return res.status(400).json({
          message: "Format proposals tidak valid",
          error: error.message,
        });
      }
    }

    // Simpan file yang diunggah
    let files = existingCase.files;
    if (req.files && req.files.length > 0) {
      files = req.files.map((file) => ({
        fileName: file.originalname,
        fileData: file.buffer,
      }));
    }

    // Hitung total karbon dari proposal yang diterima atau diajukan
    const totalKarbon = proposals.reduce((sum, proposal) => {
      if (proposal.statusProposal !== "Ditolak") {
        return sum + Number(proposal.jumlahKarbon);
      }
      return sum;
    }, 0);

    // Update case
    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        namaProyek,
        luasTanah,
        saranaPenyerapEmisi,
        lembagaSertifikasi,
        kepemilikanLahan,
        proposals,
        files,
        jumlahKarbon: totalKarbon,
        jumlahSertifikat: totalKarbon,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Case berhasil diupdate",
      case: updatedCase,
    });
  } catch (error) {
    console.error("Error updating case:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengupdate case",
      error: error.message,
    });
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
    const { id, fileIndex } = req.params;

    const caseData = await Case.findById(id);

    if (!caseData) {
      console.log(`Case not found: ${id}`);
      return res.status(404).json({ message: "Kasus tidak ditemukan" });
    }

    if (!caseData.files || !caseData.files[fileIndex]) {
      console.log(`File at index ${fileIndex} not found for case ${id}`);
      return res.status(404).json({ message: "File tidak ditemukan" });
    }

    const file = caseData.files[fileIndex];

    // Tambahkan header untuk cache control
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    // Set Content-Type dan kirim file
    const contentType = file.contentType || "application/octet-stream";
    res.set("Content-Type", contentType);
    res.send(file.fileData);
  } catch (error) {
    console.error("Error fetching file:", error);
    res
      .status(500)
      .json({ message: "Error fetching file", error: error.message });
  }
};

const purchaseProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validasi role user
    if (userRole !== "buyer" && userRole !== "superadmin") {
      return res.status(403).json({
        message: "Akses ditolak. Hanya buyer yang dapat melakukan pembelian.",
      });
    }

    // Lanjutkan dengan proses pembelian
    const { productId, quantity, totalPrice } = req.body;

    // Validasi data pembelian
    if (!productId || !quantity || !totalPrice) {
      return res.status(400).json({
        message: "Data pembelian tidak lengkap.",
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
        purchaseDate: new Date(),
      },
    });
  } catch (error) {
    console.error("Error during purchase:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat melakukan pembelian.",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  processPurchase,
  createCase,
  getCase,
  getApprovedCases,
  getAllCases,
  updateCase,
  getFile, // Tambahkan fungsi getFile
  getFileByIndex,
  deleteCase, // Menambahkan fungsi delete
  upload,
  updateStatus,
  getCertificateByTokenId,
  verifyCertificate,
  purchaseProduct,
};
