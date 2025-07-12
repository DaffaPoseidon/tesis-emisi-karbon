const mongoose = require("mongoose");

// Skema untuk proposal (data karbon per periode)
// const proposalSchema = new mongoose.Schema({
//   tanggalMulai: { type: Date, required: true },
//   tanggalSelesai: { type: Date, required: true },
//   jumlahKarbon: { type: Number, required: true },
//   statusProposal: {
//     type: String,
//     enum: ["Diajukan", "Diterima", "Ditolak"],
//     default: "Diajukan",
//   },
// });

const caseSchema = new mongoose.Schema(
  {
    // Data proyek
    namaProyek: { type: String, required: true },
    luasTanah: { type: String, required: true },
    saranaPenyerapEmisi: { type: String, required: true },
    lembagaSertifikasi: { type: String, required: true },
    kepemilikanLahan: { type: String, required: true },

    tanggalMulai: { type: Date, required: true },
    tanggalSelesai: { type: Date, required: true },
    jumlahKarbon: { type: Number, required: true },

    jumlahSertifikat: { type: Number }, // Sama dengan jumlahKarbon

    // Referensi penggugah dan validasi
    penggugah: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // File lampiran
    files: [
      {
        fileName: String,
        fileData: Buffer,
      },
    ],

    // Status pengajuan keseluruhan proyek
    statusPengajuan: {
      type: String,
      enum: ["Diajukan", "Diterima", "Ditolak"],
      default: "Diajukan",
    },

    // Data blockchain
    blockchainData: {
      issuedOn: Date,
      transactionHash: String,
      blockNumber: Number,
      tokens: [
        {
          tokenId: String,
          uniqueHash: String,
        },
      ],
      recipientAddress: String,
    },
  },
  { timestamps: true }
);

const Case = mongoose.model("Case", caseSchema);

module.exports = Case;
