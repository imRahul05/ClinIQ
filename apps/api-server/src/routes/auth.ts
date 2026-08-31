import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  loginController,
  registerController,
  exchangeController,
  getMeController,
} from "../controllers/auth.controller";

const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/exchange", exchangeController);
router.get("/me", authMiddleware, getMeController);

export default router;
