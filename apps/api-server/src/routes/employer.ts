import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
  getEmployerOverviewController,
  getEmployerSavingsLedgerController,
  getEmployerHedisGapsController,
} from "../controllers/employer.controller";

const router = Router();
router.use(authMiddleware);
router.use(requireRole("employer_admin", "admin"));

router.get("/overview", getEmployerOverviewController);
router.get("/savings-ledger", getEmployerSavingsLedgerController);
router.get("/hedis-gaps", getEmployerHedisGapsController);

export default router;
