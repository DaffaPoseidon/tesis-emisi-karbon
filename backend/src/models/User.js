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
      caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },
      quantity: Number,
      purchaseDate: Date,
      transactionId: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
