import express from "express";
import { validateToken } from '../middlewares/auth.js';
import { getAllChartTokenByUserIdHandler, getChartTokenByUserIdandProjectIdHandler, getLastChartTokenByUserIdandProjectIdHandler } from "../controllers/chart-token.js";
const router = express.Router();

router.get("/user/project/:id/latest", validateToken, getLastChartTokenByUserIdandProjectIdHandler);
router.get("/user/project/:id", validateToken, getChartTokenByUserIdandProjectIdHandler);
router.get("/user", validateToken, getAllChartTokenByUserIdHandler);

export default router;
