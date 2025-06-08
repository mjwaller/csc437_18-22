// /packages/backend/src/middleware/verifyAuthToken.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Let TypeScript know `req.user` will exist after token verification.
declare module "express-serve-static-core" {
  interface Request {
    user?: { username: string };
  }
}

/**
 * Middleware that checks for a valid JWT in "Authorization: Bearer <token>".
 * If missing or invalid, responds 401 or 403. Otherwise attaches decoded payload to req.user.
 */
export function verifyAuthToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.get("Authorization");
  // Expect header: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).end();
    return;
  }

  // We stored secret in app.locals.JWT_SECRET
  const jwtSecret = req.app.locals.JWT_SECRET as string;
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).end();
      return;
    }
    // At this point, decoded should have { username: "...", iat: ..., exp: ... }
    req.user = decoded as { username: string };
    next();
  });
}
