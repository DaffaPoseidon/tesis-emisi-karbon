// routes/whatsapp.ts
import express from "express";
import { getQRCodeHandler } from "../controllers/baileys.js";
import { validateToken, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// Endpoint to get the QR code
router.get("/qr-code", validateToken, adminOnly,getQRCodeHandler);

export default router;