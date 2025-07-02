import express from "express";
import * as wilayahController from "../controllers/wilayah.js";

const router = express.Router();

router.get("/provinces", wilayahController.getProvincesHandler);
router.get("/regencies/:province_code", wilayahController.getRegenciesHandler);
router.get("/districts/:regency_code", wilayahController.getDistrictHandler);
router.get("/villages/:district_code", wilayahController.getVillagesHandler);

export default router;