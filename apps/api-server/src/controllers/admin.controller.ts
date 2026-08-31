import type { Request, Response } from "express";
import { orgId } from "../middleware/auth";
import { parsePaginationParams } from "../lib/pagination";
import {
  getAdminUsers,
  getAdminProviders,
  getAdminEmployers,
} from "../domain/admin.domain";

/**
 * Handle GET /api/admin/users
 */
export async function getAdminUsersController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);
  const pagination = parsePaginationParams(req.query as Record<string, unknown>);

  const result = await getAdminUsers(currentOrgId, pagination);
  res.json(result);
}

/**
 * Handle GET /api/admin/providers
 */
export async function getAdminProvidersController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);
  const pagination = parsePaginationParams(req.query as Record<string, unknown>);

  const result = await getAdminProviders(currentOrgId, pagination);
  res.json(result);
}

/**
 * Handle GET /api/admin/employers
 */
export async function getAdminEmployersController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);
  const pagination = parsePaginationParams(req.query as Record<string, unknown>);

  const result = await getAdminEmployers(currentOrgId, pagination);
  res.json(result);
}
