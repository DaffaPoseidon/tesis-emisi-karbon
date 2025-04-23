const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  luasTanah: { type: Number, required: true }, // Dalam hektar
  jenisPohon: { type: String, required: true }, // Array untuk beberapa jenis pohon
  lembagaSertifikasi: { type: String, required: true },
  jumlahKarbon: { type: Number, required: true }, // Dalam ton
  metodePengukuran: { type: String, required: true },
  jenisTanah: { type: String, required: true },
  lokasiGeografis: { type: Number, required: true },
  kepemilikanLahan: { type: String, required: true },
  penggugah: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referensi ke User
  // file: { type: Buffer, required: true },
  files: [
    {
      fileName: { type: String },
      fileData: { type: Buffer },
    }
  ],
  fileName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Case', caseSchema);
