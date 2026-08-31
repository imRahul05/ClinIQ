import { Router } from "express";
import { getSystemStatusController } from "../controllers/status.controller";

const router = Router();

/**
 * GET /api/status
 * Public, secure system status endpoint aggregating internal subsystems and 3rd-party AI feeds.
 */
router.get("/", getSystemStatusController);

export default router;
