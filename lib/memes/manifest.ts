import * as fs from "fs";
import * as path from "path";
import { MuseumManifest } from "./types";

const DATA_DIR = process.env.MEME_DATA_DIR || path.join(process.cwd(), "data");
const MANIFEST_PATH = path.join(DATA_DIR, "manifest.json");
const BACKUP_DIR = path.join(DATA_DIR, "metadata-backup");

export function getManifestPath(): string {
  return MANIFEST_PATH;
}

export function loadManifest(): MuseumManifest {
  try {
    if (!fs.existsSync(MANIFEST_PATH)) {
      return {
        version: "2.0",
        lastSyncedAt: new Date().toISOString(),
        totalCount: 0,
        imageCount: 0,
        videoCount: 0,
        aiCuratedCount: 0,
        artworks: [],
      };
    }

    const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
    const parsed = JSON.parse(raw) as MuseumManifest;
    if (!Array.isArray(parsed.artworks)) {
      parsed.artworks = [];
    }
    return parsed;
  } catch (error) {
    console.error("[Manifest] Error reading manifest.json:", error);
    return {
      version: "2.0",
      lastSyncedAt: new Date().toISOString(),
      totalCount: 0,
      imageCount: 0,
      videoCount: 0,
      aiCuratedCount: 0,
      artworks: [],
    };
  }
}

export function saveManifest(manifest: MuseumManifest, createBackup = false): void {
  // Ensure directories exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Optional backup
  if (createBackup && fs.existsSync(MANIFEST_PATH)) {
    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(BACKUP_DIR, `manifest-${timestamp}.json`);
      fs.copyFileSync(MANIFEST_PATH, backupPath);

      // Keep only last 5 backups
      const files = fs.readdirSync(BACKUP_DIR).sort();
      if (files.length > 5) {
        for (let i = 0; i < files.length - 5; i++) {
          fs.unlinkSync(path.join(BACKUP_DIR, files[i]));
        }
      }
    } catch (e) {
      console.warn("[Manifest] Could not create backup snapshot:", e);
    }
  }

  // Atomic write
  const tempPath = path.join(DATA_DIR, `manifest-${Date.now()}.tmp`);
  const data = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(tempPath, data, "utf-8");
  fs.renameSync(tempPath, MANIFEST_PATH);
}
