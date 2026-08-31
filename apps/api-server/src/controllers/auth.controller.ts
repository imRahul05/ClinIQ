import type { Request, Response } from "express";
import {
  LoginSchema,
  RegisterPatientSchema,
  TokenExchangeSchema,
} from "@cliniq/api-spec";
import {
  loginUser,
  registerPatient,
  exchangeMedplumToken,
} from "../domain/auth.domain";
import { sendErrorResponse, sendValidationError } from "../middleware/errorHandler";

/**
 * Handle POST /api/auth/login
 */
export async function loginController(req: Request, res: Response): Promise<void> {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error, "Invalid login credentials format");
    return;
  }

  const result = await loginUser(parseResult.data);
  if (!result) {
    sendErrorResponse(res, 401, "AUTHENTICATION_REQUIRED", "Invalid email or password");
    return;
  }

  res.json(result);
}

/**
 * Handle POST /api/auth/register
 */
export async function registerController(req: Request, res: Response): Promise<void> {
  const parseResult = RegisterPatientSchema.safeParse(req.body);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error, "Invalid registration data");
    return;
  }

  const { result, error } = await registerPatient(parseResult.data);
  if (error) {
    sendErrorResponse(res, error.status, error.status === 400 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR", error.message);
    return;
  }

  if (!result) {
    sendErrorResponse(res, 500, "INTERNAL_SERVER_ERROR", "Failed to register patient");
    return;
  }

  res.status(201).json(result);
}

/**
 * Handle POST /api/auth/exchange
 */
export async function exchangeController(req: Request, res: Response): Promise<void> {
  let tokenToVerify: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    tokenToVerify = authHeader.split(" ")[1];
  } else {
    const parseResult = TokenExchangeSchema.safeParse(req.body);
    if (parseResult.success) {
      tokenToVerify = parseResult.data.token;
    }
  }

  if (!tokenToVerify) {
    sendErrorResponse(
      res,
      400,
      "BAD_REQUEST",
      "Missing Medplum token in Authorization header or body payload"
    );
    return;
  }

  const result = await exchangeMedplumToken(tokenToVerify);
  if (!result) {
    sendErrorResponse(
      res,
      401,
      "AUTHENTICATION_REQUIRED",
      "Unauthorized: Invalid or expired Medplum token"
    );
    return;
  }

  res.json(result);
}

/**
 * Handle GET /api/auth/me
 */
export function getMeController(req: Request, res: Response): void {
  if (!req.user) {
    sendErrorResponse(res, 401, "AUTHENTICATION_REQUIRED", "Unauthorized");
    return;
  }

  res.json({ user: req.user });
}
