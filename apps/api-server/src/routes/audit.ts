import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { getAuditLogsController } from "../controllers/audit.controller";

const router = Router();
router.use(requireAdmin);

router.get("/logs", getAuditLogsController);

export default router;
