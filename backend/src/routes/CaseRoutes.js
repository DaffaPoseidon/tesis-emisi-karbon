const express = require("express");
const { 
  createCase, 
  getAllCases, 
  updateCase, 
  upload, 
  getCase,
  getFile,
  getFileByIndex,
  deleteCase,
  updateStatus,
  getCertificateByTokenId,
  verifyCertificate
} = require('../controller/CaseController');

const { authenticateToken } = require("../utils/authMiddleware");
const isSellerMiddleware = require('../middleware/isSellerMiddleware'); // Tambahkan import

const router = express.Router();

// Tambahkan isSellerMiddleware ke routes yang perlu dilindungi
router.post("/", authenticateToken, isSellerMiddleware, upload.array("files", 100), createCase); 
router.put("/:id", authenticateToken, isSellerMiddleware, upload.array("files", 100), updateCase);
router.delete("/:id", authenticateToken, isSellerMiddleware, deleteCase);

// Routes lainnya yang tidak perlu isSellerMiddleware
router.get("/:id", getCase);
router.get("/", getAllCases);
router.get("/:id/files/:fileIndex", getFileByIndex);
router.get("/:id/files", getFile);
router.patch("/:id/status", authenticateToken, updateStatus);
router.get("/certificate/:tokenId", getCertificateByTokenId);
router.get("/verify/:hash", verifyCertificate);

module.exports = router;
