import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createCallController,
  getCallController,
  updateCallController,
} from "../controllers/calls.controller";

const router = Router();
router.use(authMiddleware);

router.post("/", createCallController);
router.get("/:id", getCallController);
router.patch("/:id", updateCallController);

export default router;
