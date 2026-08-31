import { Router } from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth";
import {
  getAdminUsersController,
  getAdminProvidersController,
  getAdminEmployersController,
} from "../controllers/admin.controller";

const router = Router();
router.use(authMiddleware);
router.use(requireAdmin);

router.get("/users", getAdminUsersController);
router.get("/providers", getAdminProvidersController);
router.get("/employers", getAdminEmployersController);

export default router;
