import express from "express";
import { validateToken } from '../middlewares/auth.js';
import { getHistoryProjectByProjectIdHandler } from "../controllers/history-project.js";
const router = express.Router();

router.get("/project/:id", validateToken, getHistoryProjectByProjectIdHandler);

export default router;
