import { Router } from "express";
import { db, users, providers, employers, organizations } from "@cliniq/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, requireAdmin, orgId } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);
router.use(requireAdmin);

// List organization users
router.get("/users", async (req, res) => {
  const currentOrgId = orgId(req);
  const staff = await db
    .select()
    .from(users)
    .where(eq(users.organizationId, currentOrgId));
  res.json({ users: staff });
});

// List organization providers
router.get("/providers", async (req, res) => {
  const currentOrgId = orgId(req);
  const providerList = await db
    .select()
    .from(providers)
    .where(eq(providers.organizationId, currentOrgId));
  res.json({ providers: providerList });
});

// List employers
router.get("/employers", async (req, res) => {
  const currentOrgId = orgId(req);
  const employerList = await db
    .select()
    .from(employers)
    .where(eq(employers.organizationId, currentOrgId));
  res.json({ employers: employerList });
});

export default router;
