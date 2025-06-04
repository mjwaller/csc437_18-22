import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { ValidRoutes } from "./common/ValidRoutes";
import { registerImageRoutes } from "./routes/imageRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";

dotenv.config();
const PORT = process.env.PORT || 3000;
const STATIC_DIR  = process.env.STATIC_DIR || "public";
const STATIC_PATH = path.resolve(process.cwd(), STATIC_DIR);
const INDEX_HTML  = path.join(STATIC_PATH, "index.html");

const app = express();

// 1) Serve React’s compiled static files:
app.use(express.static(STATIC_DIR));

// 2) Set up Mongo + ImageProvider + your /api routes:
const mongoClient   = connectMongo();
const imageProvider = new ImageProvider(mongoClient);
registerImageRoutes(app, imageProvider);

// 3) A simple API check
app.get("/api/hello", (_req, res) => {
  res.send("Hello, World");
});

// 4) “SPA fallback” routes: whenever the user browses to one of our front‐end paths, return index.html
app.get(ValidRoutes.HOME,     (_req, res) => res.sendFile(INDEX_HTML));
app.get(ValidRoutes.LOGIN,    (_req, res) => res.sendFile(INDEX_HTML));
app.get(ValidRoutes.UPLOAD,   (_req, res) => res.sendFile(INDEX_HTML));
app.get(ValidRoutes.IMAGES_LIST, (_req, res) => res.sendFile(INDEX_HTML));
app.get(ValidRoutes.IMAGES,   (_req, res) => res.sendFile(INDEX_HTML));

// 5) Start listening
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await mongoClient.close();
  process.exit(0);
});
