const mongoose = require("../configuration/dbConfig");

const purchaseSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  case: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, default: "transfer" },
  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "completed" },
  transactionId: { type: String, required: true },
  purchaseDate: { type: Date, default: Date.now }
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;