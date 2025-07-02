import express from "express";
import { validateToken } from '../middlewares/auth.js';
import { getHistoryProjectWalletByProjectWalletIdHandler } from "../controllers/history-project-wallet.js";
const router = express.Router();

router.get("/project-wallet/:id", validateToken, getHistoryProjectWalletByProjectWalletIdHandler);

export default router;
