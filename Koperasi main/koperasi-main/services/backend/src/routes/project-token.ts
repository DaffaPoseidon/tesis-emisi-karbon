import express from "express";
import * as projectTokenController from "../controllers/project-token.js";
import { adminOnly, validateToken } from "../middlewares/auth.js";
import validateResource from "../middlewares/validate.resource.js";
import { BuyTokenValidation } from "../validations/project-token.js";

const router = express.Router();

router.get("/", validateToken, adminOnly, projectTokenController.getAllTokenHandler);
router.get("/total-token", validateToken, projectTokenController.getTotalTokenHandler);
router.get("/project/:id", validateToken, projectTokenController.getTokenByIdProjectHandler);
router.get("/total-usage/:id", validateToken, projectTokenController.getTotalTokenUsageByIdProjectHandler);
router.get("/project/:id/user", validateToken, projectTokenController.getTokenProjectByUserHandler);
router.post("/buy-token", validateToken, validateResource(BuyTokenValidation), projectTokenController.buyTokenProjectHandler);
router.get("/usage-details", validateToken, projectTokenController.tokenUsageDetailsByIdUserHandler);
router.get("/total-token-rupiah", validateToken, projectTokenController.getTotalTokenRupiahByUserHandler);

export default router;
