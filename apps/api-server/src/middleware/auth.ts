import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface UserClaims {
  userId: string;
  email: string;
  role: "patient" | "physician" | "nurse" | "care_coordinator" | "employer_admin" | "admin";
  organizationId: string;
  patientId?: string;
  providerId?: string;
  employerId?: string;
  isAdmin?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserClaims;
    }
  }
}

export function signUserToken(claims: UserClaims): string {
  return jwt.sign(claims, config.jwt.secret, { expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"] });
}



export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized: Token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as UserClaims;
    req.user = decoded;
    next();
  } catch {

    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (req.user.isAdmin || allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({ error: "Forbidden: Insufficient privileges for this role" });
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.user.role === "admin" || req.user.isAdmin) {
    next();
    return;
  }

  res.status(403).json({ error: "Forbidden: Admin access required" });
}

export function orgId(req: Request): string {
  if (!req.user?.organizationId) {
    throw new Error("Organization ID not found on authenticated request");
  }
  return req.user.organizationId;
}
