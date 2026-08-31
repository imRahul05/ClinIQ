import type { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { logger } from "../lib/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error({ err, url: req.url, method: req.method }, "Unhandled API error");

  res.status(500).json({
    error: "Internal Server Error",
    message: config.isProduction ? "An unexpected error occurred." : err.message,
  });
}

