import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
  createSoapNoteController,
  signEncounterController,
} from "../controllers/scribe.controller";

const router = Router();
router.use(authMiddleware);

router.post(
  "/notes",
  requireRole("physician", "nurse", "care_coordinator"),
  createSoapNoteController
);

router.post(
  "/signatures",
  requireRole("physician", "nurse"),
  signEncounterController
);

export default router;
