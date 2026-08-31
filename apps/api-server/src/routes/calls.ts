import { Router } from "express";
import {
  createCallController,
  getCallController,
  updateCallController,
} from "../controllers/calls.controller";

const router = Router();

router.post("/", createCallController);
router.get("/:id", getCallController);
router.patch("/:id", updateCallController);

export default router;
