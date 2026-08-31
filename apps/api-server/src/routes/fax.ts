import { Router } from "express";
import { requireRole } from "../middleware/auth";
import {
  listFaxInboxController,
  ingestFaxController,
} from "../controllers/fax.controller";

const router = Router();
router.use(requireRole("nurse", "care_coordinator", "admin"));

router.get("/inbox", listFaxInboxController);
router.post("/", ingestFaxController);

export default router;
