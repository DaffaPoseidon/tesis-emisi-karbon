const Purchase = require("../models/Purchase");

// Endpoint untuk mendapatkan detail purchase berdasarkan ID
const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findById(id)
      .populate("buyer", "firstName lastName email")
      .populate("seller", "firstName lastName email")
      .populate("case", "namaProyek");
    
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    
    res.status(200).json(purchase);
  } catch (error) {
    console.error("Error fetching purchase:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPurchaseById
};