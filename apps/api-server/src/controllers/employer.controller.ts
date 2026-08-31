import type { Request, Response } from "express";
import { orgId } from "../middleware/auth";
import {
  getEmployerOverview,
  getEmployerSavingsLedger,
  getEmployerHedisGaps,
} from "../domain/employer.domain";

/**
 * Handle GET /api/employer/overview
 */
export async function getEmployerOverviewController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);
  const employerId = req.user?.employerId || (req.query.employerId as string);

  const overview = await getEmployerOverview(currentOrgId, employerId);
  res.json(overview);
}

/**
 * Handle GET /api/employer/savings-ledger
 */
export async function getEmployerSavingsLedgerController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);
  const employerId = req.user?.employerId || (req.query.employerId as string);

  const ledger = await getEmployerSavingsLedger(currentOrgId, employerId);
  res.json(ledger);
}

/**
 * Handle GET /api/employer/hedis-gaps
 */
export async function getEmployerHedisGapsController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);

  const gaps = await getEmployerHedisGaps(currentOrgId);
  res.json(gaps);
}
