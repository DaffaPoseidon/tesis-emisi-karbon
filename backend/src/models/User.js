const mongoose = require("../configuration/dbConfig");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["superadmin", "validator", "seller", "buyer", "guest"],
    default: "guest",
  },
  cases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Case" }],
  walletAddress: String,
  balance: { type: Number, default: 1000000000 }, // Default 1 Milyar
  companyDetails: {
    name: String,
    address: String,
    phone: String,
    taxId: String,
    industry: String,
  },
  personalAddress: String,
  phoneNumber: String,
carbonCredits: [
  {
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
    },
    quantity: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    transactionId: String,
    transactionHash: String,
    blockNumber: Number,
    // Tambahkan field tokens untuk menyimpan token yang dimiliki
    tokens: [
      {
        tokenId: String,
        uniqueHash: String
      }
    ]
  },
],
  balance: {
    type: Number,
    default: 0,
  },

  // Riwayat transaksi
  transactionHistory: [
    {
      type: {
        type: String,
        enum: ["purchase", "deposit", "withdrawal"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      description: String,
      date: {
        type: Date,
        default: Date.now,
      },
      transactionId: String,
      blockchainData: {
        transactionHash: String,
        blockNumber: Number,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
