import express from "express";
import {
  acceptProjectHandler,
  approveProjectHandler,
  checkProjectFundingOpenedHandler,
  completingProjectHandler,
  countProjectHandler,
  createProjectHandler,
  getAllProjectHandler,
  getDokumenProspektusByIdHandler,
  getKeteranganReviseProjectByIdHandler,
  getProjectByIdHandler,
  getProjectByUserIdHandler,
  getUserHaveTokenInProjectHandler,
  publishProjectHandler,
  rejectProjectHandler,
  reviseProjectHandler,
  shareProfitHandler,
  totalProfitHandler,
  updateProjectHandler,
} from "../controllers/project.js";
import validateResource from "../middlewares/validate.resource.js";
import { CreateProjectValidation, UpdateProjectValidation } from "../validations/project.js";
import { uploadDokumenProspektusMiddleware, uploadMiddleware, uploadUpdateProjectMiddleware } from "../middlewares/project.js";
import { adminOnly, platinumOnly, validateToken } from "../middlewares/auth.js";
import { AgreementMiddleware } from "../middlewares/agreement-letter.js";
import { createAgreementLetterHandler, getAgreementLetterByProjectIdHandler, getAllAgreementLetterHandler } from "../controllers/agreement-letter.js";

const router = express.Router();

router.post("/", validateToken, uploadMiddleware, validateResource(CreateProjectValidation), createProjectHandler);
router.get("/count", validateToken, adminOnly, countProjectHandler);
router.get("/", validateToken, platinumOnly, getAllProjectHandler);
router.get("/user", validateToken, getProjectByUserIdHandler);
router.get("/check-funding", validateToken, adminOnly, checkProjectFundingOpenedHandler);
router.put("/update", validateToken, uploadUpdateProjectMiddleware, validateResource(UpdateProjectValidation), updateProjectHandler);
router.post("/agreement-letter", validateToken, AgreementMiddleware, createAgreementLetterHandler);
router.get("/agreement-letter", validateToken, adminOnly, getAllAgreementLetterHandler);
router.get("/:id/agreement-letter", validateToken, getAgreementLetterByProjectIdHandler);
router.put("/publish", validateToken, adminOnly, uploadDokumenProspektusMiddleware, publishProjectHandler);
router.put("/accept", validateToken, adminOnly, acceptProjectHandler);
router.put("/complete", validateToken, adminOnly, completingProjectHandler);
router.put("/share-profit", validateToken, adminOnly, shareProfitHandler);
router.get("/:id/user", validateToken, getUserHaveTokenInProjectHandler);
router.get("/:id", validateToken, getProjectByIdHandler);
router.put("/approve/:id", validateToken, adminOnly, approveProjectHandler);
router.put("/revise/:id", validateToken, adminOnly, reviseProjectHandler);
router.put("/reject/:id", validateToken, adminOnly, rejectProjectHandler);
router.get("/keterangan-revisi/:id", validateToken, getKeteranganReviseProjectByIdHandler);
router.get("/:id/dokumen-prospektus", validateToken, getDokumenProspektusByIdHandler);
router.get("/total-profit/:id", validateToken, adminOnly, totalProfitHandler);

export default router;
