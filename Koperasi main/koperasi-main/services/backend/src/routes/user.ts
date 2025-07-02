import express from "express";
import { adminOnly, validateToken } from "../middlewares/auth.js";
import {
  accUpgradeUserToPlatinumHandler,
  countUserHandler,
  deleteUserByIdHandler,
  getAllUserHandler,
  getPhoneNumberAdminHandler,
  getUserByIdHandler,
  rejectUserByIdHandler,
  sendOtpHandler,
  updateUserByIdHandler,
  upgradeUserToPlatinumHandler,
  verifyOtpHandler,
} from "../controllers/user.js";
import { parseFormData, formDataParserMiddleware } from "../middlewares/auth.js";
import { uploadBuktiMiddleware } from "../middlewares/topup.js";
import validateResource from "../middlewares/validate.resource.js";
import { UpgradePlatinumValidation } from "../validations/user.js";

const router = express.Router();
router.get("/", validateToken, adminOnly, getAllUserHandler);
router.get("/count", validateToken, adminOnly, countUserHandler);
router.get("/phone-number", validateToken, getPhoneNumberAdminHandler);
router.get("/:id", validateToken, getUserByIdHandler);
router.put("/:id", validateToken, parseFormData, formDataParserMiddleware, updateUserByIdHandler);
router.delete("/:id", validateToken, adminOnly, deleteUserByIdHandler);
router.put("/reject/:id", validateToken, adminOnly, rejectUserByIdHandler);
router.post("/send-otp", validateToken, adminOnly, sendOtpHandler);
router.post("/verify-otp", validateToken, verifyOtpHandler);
router.post("/upgrade-platinum", validateToken, uploadBuktiMiddleware, validateResource(UpgradePlatinumValidation), upgradeUserToPlatinumHandler);
router.post("/acc-upgrade-platinum", validateToken, adminOnly, accUpgradeUserToPlatinumHandler);

export default router;
