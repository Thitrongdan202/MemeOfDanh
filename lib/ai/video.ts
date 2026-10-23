import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execFileSync } from "child_process";

export interface VideoKeyframe {
  buffer: Buffer;
  mimeType: string;
  frameIndex: number;
  label: string;
}

/**
 * Resolves the path to the installed FFmpeg binary.
 * Uses static path resolution to prevent webpack dynamic-require warnings in Next.js.
 */
function getFFmpegPath(): string {
  const binaryName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const platform = `${process.platform}-${process.arch}`;
  const candidatePaths = [
    path.join(process.cwd(), "node_modules", "@ffmpeg-installer", platform, binaryName),
    path.join(process.cwd(), "node_modules", "@ffmpeg-installer", "win32-x64", binaryName),
    path.join(process.cwd(), "node_modules", "@ffmpeg-installer", "darwin-x64", binaryName),
    path.join(process.cwd(), "node_modules", "@ffmpeg-installer", "linux-x64", binaryName),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return "ffmpeg";
}

/**
 * Extracts representative keyframes distributed across the video timeline.
 * Captures beginning, middle, and late scenes to observe action progression.
 */
export async function extractVideoKeyframes(
  videoPath: string,
  maxFrames = 4
): Promise<VideoKeyframe[]> {
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Tệp video không tồn tại: ${videoPath}`);
  }

  const ffmpegPath = getFFmpegPath();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "meme-video-frames-"));

  try {
    const outputPattern = path.join(tmpDir, "frame_%02d.jpg");
    // Extract maxFrames distributed evenly using fps filter
    // fps=0.5 captures 1 frame every 2 seconds, limited to maxFrames
    execFileSync(
      ffmpegPath,
      [
        "-y",
        "-v",
        "error",
        "-i",
        videoPath,
        "-vf",
        "fps=0.5,scale=1280:-1",
        "-vframes",
        String(maxFrames),
        outputPattern,
      ],
      { timeout: 30000 }
    );

    const frameFiles = fs
      .readdirSync(tmpDir)
      .filter((f) => f.endsWith(".jpg"))
      .sort();

    if (frameFiles.length === 0) {
      throw new Error("Không thể trích xuất khung hình nào từ video (video rỗng hoặc codec không hỗ trợ).");
    }

    const keyframes: VideoKeyframe[] = [];
    const labels = ["Đầu video", "Diễn biến 1", "Diễn biến 2", "Kết thúc / Cao trào"];

    for (let i = 0; i < frameFiles.length; i++) {
      const framePath = path.join(tmpDir, frameFiles[i]);
      const buffer = fs.readFileSync(framePath);
      keyframes.push({
        buffer,
        mimeType: "image/jpeg",
        frameIndex: i + 1,
        label: labels[i] || `Khung hình ${i + 1}`,
      });
    }

    return keyframes;
  } catch (err: any) {
    throw new Error(`Lỗi giải mã video qua FFmpeg (${path.basename(videoPath)}): ${err?.message || err}`);
  } finally {
    try {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    } catch {
      // ignore cleanup errors
    }
  }
}
