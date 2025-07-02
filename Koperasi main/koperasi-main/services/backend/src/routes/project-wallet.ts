import express from "express";
import * as projectWalletController from "../controllers/project-wallet.js";
import { adminOnly, validateToken } from "../middlewares/auth.js";
import { uploadBuktiTransferMiddleware } from "../middlewares/history-project-wallet.js";
import validateResource from "../middlewares/validate.resource.js";
import { TransferSaldoProjectWalletValidation } from "../validations/project-wallet.js";

const router = express.Router();

router.get("/", validateToken, adminOnly, projectWalletController.getProjectWalletHandler);
router.get("/project/:id", validateToken, adminOnly, projectWalletController.getProjectWalletByProjectIdHandler);
router.post("/transfer-saldo", validateToken, adminOnly, uploadBuktiTransferMiddleware, validateResource(TransferSaldoProjectWalletValidation), projectWalletController.transferSaldoProjectHandler);

export default router;
