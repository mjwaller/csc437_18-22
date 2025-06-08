// /packages/backend/src/routes/authRoutes.ts

import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CredentialsProvider } from "../CredentialsProvider";

// Define the shape of the JWT payload (we only need username for now)
interface IAuthTokenPayload {
  username: string;
}

/**
 * Generates a signed JWT that expires in 24h.
 * Wrap jwt.sign in a Promise so we can await it.
 */
function generateAuthToken(
  username: string,
  jwtSecret: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const payload: IAuthTokenPayload = { username };
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: "1d" }, // token valid for 1 day
      (err, token) => {
        if (err) reject(err);
        else resolve(token as string);
      }
    );
  });
}

/**
 * Call this function from index.ts to wire up /auth/register and /auth/login.
 */
export function registerAuthRoutes(
  app: express.Application,
  credsProvider: CredentialsProvider
): void {
  const router = express.Router();

  // ─── POST /auth/register ─────────────────────────────────────────────────────
  //
  // Expects JSON body: { username: string, password: string }
  //  • 400 Bad Request if missing fields
  //  • 409 Conflict if username already exists
  //  • 201 Created if registration succeeds
  //
  router.post(
    "/register",
    express.json(),
    async (req: Request, res: Response): Promise<void> => {
      const { username, password } = req.body;

      if (typeof username !== "string" || typeof password !== "string") {
        res.status(400).json({
          error: "Bad Request",
          message: "Missing username or password",
        });
        return; // <— stop here, returns Promise<void>
      }

      try {
        const success = await credsProvider.registerUser(username, password);
        if (!success) {
          res.status(409).json({
            error: "Conflict",
            message: "Username already taken",
          });
          return; // <— stop here, returns Promise<void>
        }
        // User inserted successfully
        res.status(201).end();
        return; // <— stop here
      } catch (err) {
        console.error("Error in /auth/register:", err);
        res
          .status(500)
          .json({ error: "Internal Server Error", message: "Registration failed" });
        return; // <— stop here
      }
    }
  );

  // ─── POST /auth/login ────────────────────────────────────────────────────────
  //
  // Expects JSON body: { username: string, password: string }
  //  • 400 Bad Request if missing fields
  //  • 401 Unauthorized if user not found or password mismatch
  //  • 200 OK + { token: "<jwt‐string>" } if credentials are valid
  //
  router.post(
    "/login",
    express.json(),
    async (req: Request, res: Response): Promise<void> => {
      const { username, password } = req.body;

      if (typeof username !== "string" || typeof password !== "string") {
        res.status(400).json({
          error: "Bad Request",
          message: "Missing username or password",
        });
        return; // <— stop here
      }

      try {
        const valid = await credsProvider.verifyUser(username, password);
        if (!valid) {
          res.status(401).json({
            error: "Unauthorized",
            message: "Incorrect username or password",
          });
          return; // <— stop here
        }

        // If valid, issue JWT. We read the secret from app.locals.JWT_SECRET (set in index.ts).
        const jwtSecret = req.app.locals.JWT_SECRET as string;
        const token = await generateAuthToken(username, jwtSecret);

        res.status(200).json({ token });
        return; // <— stop here
      } catch (err) {
        console.error("Error in /auth/login:", err);
        res
          .status(500)
          .json({ error: "Internal Server Error", message: "Login failed" });
        return; // <— stop here
      }
    }
  );

  // Mount this router under "/auth"
  app.use("/auth", router);
}
