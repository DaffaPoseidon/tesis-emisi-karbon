import express from "express";
import { createWalletHandler, deleteWalletByIdHandler, getTotalWalletSaldoByUserIdHandler, getWalletByIdHandler, getWalletSaldoByUserIdHandler, updateWalletByIdHandler } from "../controllers/wallet.js";
// import { validateToken } from '../middlewares/auth.js';
const router = express.Router();

router.post("/create", createWalletHandler);
router.get("/:id", getWalletByIdHandler);
router.get("/user/:id", getWalletSaldoByUserIdHandler);
router.get("/total/:id", getTotalWalletSaldoByUserIdHandler);
router.put("/:id", updateWalletByIdHandler);
router.delete("/:id", deleteWalletByIdHandler);

export default router;