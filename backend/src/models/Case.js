const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  luasTanah: { type: String, required: true },
  jenisPohon: { type: String, required: true },
  lembagaSertifikasi: { type: String, required: true },
  jumlahKarbon: { type: String, required: true },
  metodePengukuran: { type: String, required: true },
  jenisTanah: { type: String, required: true },
  lokasiGeografis: { type: String, required: true },
  kepemilikanLahan: { type: String, required: true },
  penggugah: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    fileName: String,
    filePath: String
  }],
  // Field baru untuk status pengajuan
  statusPengajuan: {
    type: String,
    enum: ['Diajukan', 'Diterima', 'Ditolak'],
    default: 'Diajukan'
  },
  blockchainData: {
    issuedOn: Date,
    transactionHash: String,
    blockNumber: Number,
    tokenIds: [String],
    recipientAddress: String
  }
}, { timestamps: true });

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
