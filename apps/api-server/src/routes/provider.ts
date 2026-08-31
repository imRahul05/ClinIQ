import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
  getProviderWorklistController,
  updateAvailabilityController,
  getPatientChartController,
} from "../controllers/provider.controller";

const router = Router();
router.use(authMiddleware);
router.use(requireRole("physician", "nurse", "care_coordinator", "admin"));

router.get("/worklist", getProviderWorklistController);
router.put("/availability", updateAvailabilityController);
router.post("/availability", updateAvailabilityController);
router.get("/chart/:patientId", getPatientChartController);

export default router;
