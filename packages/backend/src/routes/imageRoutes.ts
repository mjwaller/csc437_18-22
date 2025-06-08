import express, { Request, Response, NextFunction } from "express";
import { ImageProvider } from "../ImageProvider";
import { imageMiddlewareFactory, handleImageFileErrors } from "../middleware/imageUploadMiddleware";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
  console.log("🖼️ Mounting image routes");

  const router = express.Router();

  // GET /api/images?search=foo
  router.get("/", async (req: Request, res: Response) => {
    const raw = req.query.search;
    const searchTerm = (typeof raw === "string" && raw.trim()) ? raw.trim() : undefined;

    try {
      const images = await imageProvider.getAllImages(searchTerm);
      res.json(images);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Unable to fetch images" });
    }
  });

  // PATCH /api/images/:id
  router.patch(
    "/:id",
    express.json(),
    async (req: Request, res: Response) => {
      const imageId = req.params.id;
      const newName = req.body.name;
      if (typeof newName !== "string") {
        res.status(400).json({ error: "Bad Request", message: "Missing or invalid name" });
        return;
      }
      if (newName.length > 100) {
        res.status(422).json({ error: "Unprocessable Entity", message: "Name too long" });
        return;
      }
      try {
        const count = await imageProvider.updateImageName(imageId, newName);
        if (count === 0) {
          res.status(404).json({ error: "Not Found", message: "Image not found" });
          return;
        }
        res.status(204).end();
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  // POST /api/images  (file upload + metadata)
  router.post(
    "/",
    imageMiddlewareFactory.single("image"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.file || typeof req.body.name !== "string") {
          res.status(400).json({ error: "Bad Request", message: "Must include image file and name" });
          return;
        }
        const filename = req.file.filename;
        const name     = req.body.name;
        const author   = req.user!.username;    // verifyAuthToken has already run

        await imageProvider.createImage(filename, name, author);

        res.status(201).end();
      } catch (err) {
        next(err);
      }
    }
  );

  // multer / format‐error handler
  router.use(handleImageFileErrors);

  // mount under /api/images
  app.use("/api/images", router);
}
