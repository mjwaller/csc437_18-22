import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";

import { ValidRoutes } from "./common/ValidRoutes";
import { registerImageRoutes } from "./routes/imageRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { registerAuthRoutes } from "./routes/authRoutes";
import { CredentialsProvider } from "./CredentialsProvider";
import { verifyAuthToken } from "./middleware/verifyAuthToken";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const STATIC_DIR  = process.env.STATIC_DIR || "public";
const STATIC_PATH = path.resolve(process.cwd(), STATIC_DIR);
const INDEX_HTML  = path.join(STATIC_PATH, "index.html");
app.use(express.static(STATIC_DIR));

const mongoClient   = connectMongo();
const imageProvider = new ImageProvider(mongoClient);
const credsProvider = new CredentialsProvider(mongoClient);

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("Missing JWT_SECRET in .env");
}
app.locals.JWT_SECRET = jwtSecret

registerAuthRoutes(app, credsProvider);

app.use("/api/*", verifyAuthToken);

registerImageRoutes(app, imageProvider);

app.get(Object.values(ValidRoutes), (_req, res) => {
  res.sendFile(INDEX_HTML);
});

// 3) A simple API check
app.get("/api/hello", (_req, res) => {
  res.send("Hello, World");
});

// 4) “SPA fallback” routes: whenever the user browses to one of our front‐end paths, return index.html


// 5) Start listening
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await mongoClient.close();
  process.exit(0);
});
