const express = require("express");
const { 
  getUserProfile,
  updateUserProfile,
  processPurchase,
  createCase, 
  getAllCases, 
  updateCase, 
  upload, 
  getCase,
  getApprovedCases,
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

// Protected routes - require authentication
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateUserProfile);
router.post("/purchase", authenticateToken, processPurchase);

// Tambahkan isSellerMiddleware ke routes yang perlu dilindungi
router.post("/", authenticateToken, isSellerMiddleware, upload.array("files", 100), createCase); 
router.put("/:id", authenticateToken, isSellerMiddleware, upload.array("files", 100), updateCase);
router.delete("/:id", authenticateToken, isSellerMiddleware, deleteCase);

router.get("/:id", getCase);
router.get('/approved-cases', getApprovedCases);
router.get("/", getAllCases);
router.get("/:id/files/:fileIndex", getFileByIndex);
router.get("/:id/files", getFile);
router.patch("/:id/status", authenticateToken, updateStatus);
router.get("/certificate/:tokenId", getCertificateByTokenId);
router.get("/verify/:hash", verifyCertificate);

module.exports = router;
