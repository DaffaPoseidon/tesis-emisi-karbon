import express from "express";
import {
  getAllTransactionHandler,
  getTransactionByProjectIdHandler,
  getTransactionByUserIdHandler,
} from "../controllers/transaction.js";
import { validateToken } from "../middlewares/auth.js";
const router = express.Router();

router.get("/", validateToken, getAllTransactionHandler);
router.get("/user", validateToken, getTransactionByUserIdHandler);
router.get("/project/:id", validateToken, getTransactionByProjectIdHandler);  
  
export default router;