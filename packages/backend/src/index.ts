import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./ValidRoutes";



dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;

const STATIC_DIR = process.env.STATIC_DIR || "public";
const STATIC_PATH = path.resolve(process.cwd(), STATIC_DIR);
const INDEX_HTML  = path.join(STATIC_PATH, "index.html");

const app = express();

app.use(express.static(STATIC_DIR));

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get("/login", (_req: Request, res: Response) => {
    res.sendFile(INDEX_HTML);
  });

app.get(Object.values(ValidRoutes), (_req, res) => {
    res.sendFile(INDEX_HTML);
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


