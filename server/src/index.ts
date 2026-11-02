import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import * as fs from "fs";

import { manifestRouter } from "./routes/manifest";
import { mediaRouter } from "./routes/media";
import { syncRouter } from "./routes/sync";
import { aiRouter } from "./routes/ai";
import { thumbnailsRouter } from "./routes/thumbnails";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Middleware
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "danhmus-api", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/manifest", manifestRouter);
app.use("/api/media", mediaRouter);
app.use("/api/sync", syncRouter);
app.use("/api/ai", aiRouter);
app.use("/api/thumbnails", thumbnailsRouter);

// Serve static thumbnails folder if exists
const thumbDir = path.join(process.cwd(), "..", "public", "thumbnails");
if (fs.existsSync(thumbDir)) {
  app.use("/thumbnails", express.static(thumbDir));
}

app.listen(PORT, () => {
  console.log(`[Danh'Mus API] Server running at http://localhost:${PORT}`);
  console.log(`[Danh'Mus API] Memes dir: ${process.env.MEMES_DIR || "../memes"}`);
  console.log(`[Danh'Mus API] Data dir:  ${process.env.MEME_DATA_DIR || "../data"}`);
});

export default app;
