import express from "express";
import * as authController from "../controllers/auth.js";
import validateResource from "../middlewares/validate.resource.js";
import { RegisterValidation } from "../validations/auth.js";
import { parseFormData, formDataParserMiddleware, validateToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", parseFormData, formDataParserMiddleware, validateResource(RegisterValidation), authController.register);
router.post("/login", authController.login);
router.post("/logout", validateToken, authController.logout);

export default router;
