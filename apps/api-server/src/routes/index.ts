import { Router } from "express";
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

router.use("/auth", authRoutes);
router.use("/calls", callRoutes);
router.use("/scribe", scribeRoutes);
router.use("/patient", patientRoutes);
router.use("/provider", providerRoutes);
router.use("/employer", employerRoutes);
router.use("/care-gaps", careGapsRoutes);
router.use("/fax", faxRoutes);
router.use("/audit", auditRoutes);
router.use("/admin", adminRoutes);

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "ClinIQ API Server", timestamp: new Date().toISOString() });
});

export default router;
