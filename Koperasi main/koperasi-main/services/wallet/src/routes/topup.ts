import express from "express";
import { createTopupHandler, getTopupByIdHandler, getAllTopUpHandler, getWithdrawSaldoHandler, getTopupByUserIdHandler, accTopupHandler, rejectTopupHandler, withdrawSaldoHandler, accWithdrawSaldoHandler } from "../controllers/topup.js";
import { uploadBuktiMiddleware } from "../middlewares/topup.js";

const router = express.Router();

router.get("/", getAllTopUpHandler);
router.get("/withdraw", getWithdrawSaldoHandler);
router.post("/create", uploadBuktiMiddleware, createTopupHandler);
router.post("/withdraw", withdrawSaldoHandler);
router.get("/:id", getTopupByIdHandler);
router.get("/user/:id", getTopupByUserIdHandler);
router.put("/acc/:id", accTopupHandler);
router.put("/reject/:id", rejectTopupHandler);
router.put("/withdraw/:id", uploadBuktiMiddleware, accWithdrawSaldoHandler);
export default router;