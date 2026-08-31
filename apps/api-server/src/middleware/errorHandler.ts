import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import type { APIErrorCode, APIErrorEnvelope } from "@cliniq/api-spec";
import { config } from "../config";
import { logger } from "../lib/logger";

export function sendErrorResponse(
  res: Response,
  statusCode: number,
  code: APIErrorCode | string,
  message: string,
  details?: Record<string, unknown>
): void {
  const payload: APIErrorEnvelope = {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  res.status(statusCode).json(payload);
}

export function sendValidationError(
  res: Response,
  zodError: ZodError,
  message = "Invalid request payload format or parameters"
): void {
  sendErrorResponse(
    res,
    422,
    "VALIDATION_ERROR",
    message,
    zodError.format() as unknown as Record<string, unknown>
  );
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error({ err, url: req.url, method: req.method }, "Unhandled API error");

  if (err instanceof ZodError) {
    sendValidationError(res, err);
    return;
  }

  sendErrorResponse(
    res,
    500,
    "INTERNAL_SERVER_ERROR",
    config.isProduction ? "An unexpected error occurred." : err.message
  );
}
