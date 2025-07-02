import express from "express";
import { getAllChartProjectByUserIdHandler, getChartProjectByIdHandler } from "../controllers/chart-project.js";
import { validateToken } from '../middlewares/auth.js';
const router = express.Router();

router.get("/user", validateToken,getAllChartProjectByUserIdHandler);
router.get("/:id", validateToken, getChartProjectByIdHandler);

export default router;
