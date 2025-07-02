import express from "express";
import * as projectReportController from "../controllers/project-report.js";
import { adminOnly, validateToken } from "../middlewares/auth.js";
import { uploadLaporanMiddleware } from "../middlewares/project-report.js";
import validateResource from "../middlewares/validate.resource.js";
import { CreateProjectReportValidation } from "../validations/project-report.js";

const router = express.Router();

router.post("/", validateToken, adminOnly, validateResource(CreateProjectReportValidation), projectReportController.createProjectReportHandler);
router.get("/:id", validateToken, projectReportController.getProjectReportHandler);
router.get("/project/:id", validateToken, projectReportController.getProjectReportByProjectIdHandler);
router.get("/", validateToken, projectReportController.getAllProjectReportHandler);

export default router;
