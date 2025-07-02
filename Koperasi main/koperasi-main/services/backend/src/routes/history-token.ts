import express from "express";
import { validateToken } from '../middlewares/auth.js';
import { getHistoryTokenByUserIdandProjectIdHandler } from "../controllers/history-token.js";
const router = express.Router();

router.get("/project/:id", validateToken, getHistoryTokenByUserIdandProjectIdHandler);

export default router;
