import express, { Request, Response } from "express";
import { ImageProvider } from "../ImageProvider";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
  const router = express.Router();

  // 1) GET /api/images?search=…
  router.get("/", async (req: Request, res: Response) => {
    const rawSearch = req.query.search;
    let searchTerm: string | undefined;
    if (typeof rawSearch === "string" && rawSearch.trim().length > 0) {
      searchTerm = rawSearch.trim();
    }

    try {
      const images = await imageProvider.getImages(searchTerm);
      res.json(images);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Unable to fetch images" });
    }
  });

  // 2) PATCH /api/images/:id
  router.patch(
    "/:id",
    express.json(),
    async (req: Request, res: Response) => {
      const imageId = req.params.id;
      const newName = req.body.name;

      if (typeof newName !== "string") {
        res.status(400).json({
          error: "Bad Request",
          message: "Request body must have a string 'name' field",
        });
        return;
      }

      const MAX_NAME_LENGTH = 100;
      if (newName.length > MAX_NAME_LENGTH) {
        res.status(422).json({
          error: "Unprocessable Entity",
          message: `Image name exceeds ${MAX_NAME_LENGTH} characters.`,
        });
        return;
      }

      try {
        const matchedCount = await imageProvider.updateImageName(imageId, newName);
        if (matchedCount === 0) {
          // either the id wasn’t a valid ObjectId or no document matched
          res.status(404).json({
            error: "Not Found",
            message: "Image does not exist",
          });
          return;
        }
        res.status(204).send(); 
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );

  app.use("/api/images", router);
}
