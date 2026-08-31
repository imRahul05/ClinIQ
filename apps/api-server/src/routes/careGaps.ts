import { Router } from "express";
import { requireRole } from "../middleware/auth";
import {
  listCareGapsController,
  getCareGapByIdController,
  updateCareGapController,
} from "../controllers/careGaps.controller";

const router = Router();

router.get(
  "/",
  requireRole("physician", "nurse", "care_coordinator", "employer_admin", "admin"),
  listCareGapsController
);

router.get(
  "/:id",
  requireRole("physician", "nurse", "care_coordinator", "admin"),
  getCareGapByIdController
);

router.patch(
  "/:id",
  requireRole("physician", "nurse", "care_coordinator"),
  updateCareGapController
);

export default router;
