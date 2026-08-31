import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import authRoutes from "./auth";
import callRoutes from "./calls";
import scribeRoutes from "./scribe";
import patientRoutes from "./patient";
import providerRoutes from "./provider";
import employerRoutes from "./employer";
import careGapsRoutes from "./careGaps";
import faxRoutes from "./fax";
import auditRoutes from "./audit";
import adminRoutes from "./admin";

const router = Router();

// Public routes
router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "ClinIQ API Server", timestamp: new Date().toISOString() });
});
router.use("/auth", authRoutes);

// Protected routes (centralized authentication barrier)
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

protectedRouter.use("/calls", callRoutes);
protectedRouter.use("/scribe", scribeRoutes);
protectedRouter.use("/patient", patientRoutes);
protectedRouter.use("/provider", providerRoutes);
protectedRouter.use("/employer", employerRoutes);
protectedRouter.use("/care-gaps", careGapsRoutes);
protectedRouter.use("/fax", faxRoutes);
protectedRouter.use("/audit", auditRoutes);
protectedRouter.use("/admin", adminRoutes);

router.use(protectedRouter);

export default router;
