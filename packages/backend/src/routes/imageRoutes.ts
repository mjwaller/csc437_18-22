import express, { Request, Response, NextFunction } from "express";
import { ImageProvider } from "../ImageProvider";
import { imageMiddlewareFactory, handleImageFileErrors } from "../middleware/imageUploadMiddleware";
import { verifyAuthToken } from "../middleware/verifyAuthToken";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
  const router = express.Router();

  // … your existing GET and PATCH handlers …

  // 3) File‐upload endpoint
  router.post(
    "/",
    imageMiddlewareFactory.single("image"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.file || typeof req.body.name !== "string") {
          res
            .status(400)
            .json({ error: "Bad Request", message: "Must include file + name" });
          return;              // ← void return here
        }
  
        const filename = req.file.filename;
        const name     = req.body.name;
        const author   = req.user!.username;
  
        await imageProvider.createImage(filename, name, author);
  
        res.status(201).end(); // ← still returns a Response, but *we don’t return it*
        return;                // ← now this handler returns void
      } catch (err) {
        next(err);             // ← returns void
      }
    }
  );
  

  // **mount the multer/MIME‐error handler** here
  router.use(handleImageFileErrors);

  // mount under /api/images and protect with JWT
  app.use("/api/images", verifyAuthToken, router);
}
