import express from "express";
import {
  getTopupByUserIdHandler,
  payMemberHandler,
  payTopupHandler,
  accTopupHandler,
  withdrawSaldoHandler,
  accWithdrawSaldoHandler,
  paySimpananWajibHandler,
  accSimpananWajibHandler,
  getWithdrawSaldoHandler,
  getTopupByIdHandler,
  getTotalWalletSaldoByUserIdHandler,
  getTotalWalletSimpananWajibByUserIdHandler,
  getTotalWalletSimpananPokokByUserIdHandler,
  getBagianPemilikPelaksanaHandler,
  payBagianPemilikPelaksanaHandler,
  getKasKoperasiHandler,
  getAllTopupHandler,
  getWalletSaldoByUserIdHandler,
  updateWalletByIdHandler,
} from "../controllers/topup.js";
import { validateToken, adminOnly } from "../middlewares/auth.js";
import { uploadBuktiMiddleware } from "../middlewares/topup.js";
import validateResource from "../middlewares/validate.resource.js";
import { PayMemberValidation, PaySimpananWajibValidation, PayTopupValidation, WithdrawSaldoValidation } from "../validations/topup.js";
const router = express.Router();

router.get("/", validateToken, adminOnly, getAllTopupHandler);
router.get("/user", validateToken, getTopupByUserIdHandler);
router.get("/simpanan_pokok", validateToken, getTotalWalletSimpananPokokByUserIdHandler);
router.get("/simpanan_wajib", validateToken, getTotalWalletSimpananWajibByUserIdHandler);
router.get("/saldo", validateToken, adminOnly, getWithdrawSaldoHandler);
router.get("/saldo/user", validateToken, getTotalWalletSaldoByUserIdHandler);
router.get("/saldo/user/:id", validateToken, getWalletSaldoByUserIdHandler);
router.get("/kas-koperasi", validateToken, getKasKoperasiHandler);
router.get("/bagian-pemilik-pelaksana", validateToken, adminOnly, getBagianPemilikPelaksanaHandler);
router.get("/:id", validateToken, getTopupByIdHandler);
router.post("/pay-member", validateToken, uploadBuktiMiddleware, validateResource(PayMemberValidation), payMemberHandler);
router.post("/pay-topup", validateToken, uploadBuktiMiddleware, validateResource(PayTopupValidation), payTopupHandler);
router.post("/acc-topup", validateToken, adminOnly, accTopupHandler);
router.post("/withdraw", validateToken, validateResource(WithdrawSaldoValidation), withdrawSaldoHandler);
router.post("/acc-withdraw", validateToken, adminOnly, uploadBuktiMiddleware, accWithdrawSaldoHandler);
router.post("/pay-simpanan-wajib", validateToken, uploadBuktiMiddleware, validateResource(PaySimpananWajibValidation), paySimpananWajibHandler);
router.post("/acc-simpanan-wajib", validateToken, adminOnly, accSimpananWajibHandler);
router.post("/pay-bagian-pemilik-pelaksana", validateToken, adminOnly, uploadBuktiMiddleware, payBagianPemilikPelaksanaHandler);
router.put("/wallet/:id", validateToken, adminOnly, updateWalletByIdHandler);
export default router;
