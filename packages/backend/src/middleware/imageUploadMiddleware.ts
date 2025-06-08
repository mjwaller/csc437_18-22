// packages/backend/src/imageUploadMiddleware.ts

import { Request, Response, NextFunction } from "express";
import multer from "multer";

export class ImageFormatError extends Error {}


function getUploadDirFromEnv(): string {
  const dir = process.env.IMAGE_UPLOAD_DIR;
  if (!dir) {
    throw new Error("Missing IMAGE_UPLOAD_DIR in environment");
  }
  return dir;
}


const storageEngine = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = getUploadDirFromEnv();
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    let ext: string;
    if (file.mimetype === "image/png") {
      ext = "png";
    } else if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      ext = "jpg";
    } else {
      // unsupported format
      return cb(new ImageFormatError("Unsupported image type"), "");
    }

    const uniqueName =
      Date.now().toString() +
      "-" +
      Math.round(Math.random() * 1e9).toString() +
      "." +
      ext;
    cb(null, uniqueName);
  },
});

export const imageMiddlewareFactory = multer({
  storage: storageEngine,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024,
  },
});

export function handleImageFileErrors(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
    res.status(400).json({ error: "Bad Request", message: err.message });
    return;
  }
  next(err);
}
