import express from "express";
import * as projectCategoryController from "../controllers/project-category.js";
import { adminOnly, validateToken } from "../middlewares/auth.js";
import validateResource from "../middlewares/validate.resource.js";
import { CreateProjectCategoryValidation, UpdateProjectCategoryValidation } from "../validations/project-category.js";

const router = express.Router();

router.post("/", validateToken, adminOnly, validateResource(CreateProjectCategoryValidation), projectCategoryController.createProjectCategoryHandler);
router.get("/", validateToken, projectCategoryController.getProjectCategoryHandler);
router.get("/:id", validateToken, projectCategoryController.getProjectCategoryByIdHandler);
router.put("/", validateToken, adminOnly, validateResource(UpdateProjectCategoryValidation), projectCategoryController.updateProjectCategoryByIdHandler);
router.delete("/", validateToken, adminOnly, projectCategoryController.deleteProjectCategoryByIdHandler);

export default router;
