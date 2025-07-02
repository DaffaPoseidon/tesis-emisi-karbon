import express from "express";
import { uploadMutationMiddleware } from "../middlewares/mutation.js";
import { createMutationHandler, getAllMutationHandler, getMutationByIdHandler, getMutationByProjectIdHandler } from "../controllers/mutation.js";
import { validateToken, adminOnly } from "../middlewares/auth.js";
import validateResource from "../middlewares/validate.resource.js";
import { CreateMutationValidation } from "../validations/mutation.js";
const router = express.Router();

router.post("/", validateToken, adminOnly, uploadMutationMiddleware, validateResource(CreateMutationValidation), createMutationHandler);
router.get("/", validateToken, getAllMutationHandler);
router.get("/:id", validateToken, getMutationByIdHandler);
router.get("/project/:id", validateToken, getMutationByProjectIdHandler);

export default router;
