const mongoose = require('mongoose');

// Skema untuk proposal (data karbon per periode)
const proposalSchema = new mongoose.Schema({
  tanggalMulai: { type: Date, required: true },
  tanggalSelesai: { type: Date, required: true },
  jumlahKarbon: { type: Number, required: true },
  statusProposal: {
    type: String,
    enum: ['Diajukan', 'Diterima', 'Ditolak'],
    default: 'Diajukan'
  }
});

const caseSchema = new mongoose.Schema({
  // Data proyek
  namaProyek: { type: String, required: true },
  luasTanah: { type: String, required: true },
  saranaPenyerapEmisi: { type: String, required: true },
  lembagaSertifikasi: { type: String, required: true },
  kepemilikanLahan: { type: String, required: true },
  
  // Kumpulan proposal (data karbon per periode)
  proposals: [proposalSchema],
  
  // Jumlah total karbon dan sertifikat
  jumlahKarbon: { type: Number }, // Total dari semua proposal
  jumlahSertifikat: { type: Number }, // Sama dengan jumlahKarbon
  
  // Referensi penggugah dan validasi
  penggugah: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // File lampiran
  files: [{
    fileName: String,
    fileData: Buffer
  }],
  
  // Status pengajuan keseluruhan proyek
  statusPengajuan: {
    type: String,
    enum: ['Diajukan', 'Diterima', 'Ditolak'],
    default: 'Diajukan'
  },
  
  // Data blockchain
  blockchainData: {
    issuedOn: Date,
    transactionHash: String,
    blockNumber: Number,
    tokens: [{
      tokenId: String,
      uniqueHash: String,
      proposalId: String // Referensi ke proposal yang terkait
    }],
    recipientAddress: String
  }
}, { timestamps: true });

// Middleware untuk menghitung jumlahKarbon total sebelum save
caseSchema.pre('save', function(next) {
  // Hitung total karbon dari semua proposal
  if (this.proposals && this.proposals.length > 0) {
    this.jumlahKarbon = this.proposals.reduce((total, proposal) => {
      // Hanya hitung proposal yang diterima atau masih diajukan
      if (proposal.statusProposal !== 'Ditolak') {
        return total + proposal.jumlahKarbon;
      }
      return total;
    }, 0);
    
    // Isi jumlahSertifikat sama dengan jumlahKarbon
    this.jumlahSertifikat = this.jumlahKarbon;
  }
  next();
});

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;