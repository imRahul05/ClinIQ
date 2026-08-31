import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  getPatientProfileController,
  getPatientLabsController,
  getPatientMedicationsController,
  getPatientConditionsController,
  getPatientCareGapsController,
} from "../controllers/patient.controller";

const router = Router();
router.use(authMiddleware);

router.get("/profile", getPatientProfileController);
router.get("/labs-and-vitals", getPatientLabsController);
router.get("/medications", getPatientMedicationsController);
router.get("/conditions", getPatientConditionsController);
router.get("/care-gaps", getPatientCareGapsController);

export default router;
