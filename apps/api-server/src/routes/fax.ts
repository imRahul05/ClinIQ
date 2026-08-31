import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
  listFaxInboxController,
  ingestFaxController,
} from "../controllers/fax.controller";

const router = Router();
router.use(authMiddleware);
router.use(requireRole("nurse", "care_coordinator", "admin"));

router.get("/inbox", listFaxInboxController);
router.post("/", ingestFaxController);

export default router;
