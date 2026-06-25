import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

/**
 * Routes that do NOT require a token. Everything else is protected at the
 * gateway. (These mirror the auth service's public endpoints, plus the
 * gateway's own health check.)
 */
const PUBLIC_PATHS = new Set<string>([
  "/health",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
]);

interface AccessPayload {
  sub: string;
  email: string;
  role: string;
}

function unauthorized(res: Response, code: string, message: string): void {
  res.status(401).json({ success: false, error: { code, message } });
}

/**
 * Builds the gateway auth guard. For protected paths it verifies the JWT and
 * forwards the caller's identity to downstream services as X-User-* headers,
 * so services can trust the gateway without re-parsing the token.
 */
export function createGatewayAuth(secret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (PUBLIC_PATHS.has(req.path)) {
      next();
      return;
    }

    const header = req.headers.authorization;
    const token =
      header && header.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) {
      unauthorized(res, "AUTH_REQUIRED", "Missing bearer token");
      return;
    }

    try {
      const payload = jwt.verify(token, secret) as AccessPayload;
      // Strip any client-supplied identity headers, then set the trusted ones.
      req.headers["x-user-id"] = payload.sub;
      req.headers["x-user-email"] = payload.email;
      req.headers["x-user-role"] = payload.role;
      next();
    } catch {
      unauthorized(res, "AUTH_INVALID", "Invalid or expired token");
    }
  };
}
