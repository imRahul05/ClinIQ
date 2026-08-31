import { Router } from "express";
import { requireRole } from "../middleware/auth";
import {
  getEmployerOverviewController,
  getEmployerSavingsLedgerController,
  getEmployerHedisGapsController,
} from "../controllers/employer.controller";

const router = Router();
router.use(requireRole("employer_admin", "admin"));

router.get("/overview", getEmployerOverviewController);
router.get("/savings-ledger", getEmployerSavingsLedgerController);
router.get("/hedis-gaps", getEmployerHedisGapsController);

export default router;
