#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { spawn } from "node:child_process";

let _tinify = null;
let _ffmpegBin = process.env.FFMPEG_PATH || null;
let _ffmpegResolved = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const outBase = path.join(publicDir, ".optimized");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXTS = new Set([".mp4", ".webm", ".mov", ".mkv", ".avi"]);

const env = {
  // Images
  imageQuality: numberFromEnv("IMAGE_QUALITY", 80),
  webpQuality: numberFromEnv("WEBP_QUALITY", 80),

  // Videos
  videoCrf: numberFromEnv("VIDEO_CRF", 28),
  videoPreset: process.env.VIDEO_PRESET || "veryfast",
  videoMaxWidth: numberFromEnv("VIDEO_MAX_WIDTH", 1280),
  videoMaxHeight: numberFromEnv("VIDEO_MAX_HEIGHT", 720),
  videoMakeWebm: truthy(process.env.VIDEO_WEBM),
  videoAbr: truthy(process.env.VIDEO_ABR),

  // Optional TinyPNG
  tinifyKey: process.env.TINIFY_API_KEY || "",
};

function truthy(v) {
  return String(v || "").toLowerCase() === "1" || String(v || "").toLowerCase() === "true";
}

function numberFromEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === ".optimized") continue;
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

function sha1(buf) {
  return crypto.createHash("sha1").update(buf).digest("hex");
}

function relFromPublic(absPath) {
  return absPath.slice(publicDir.length + 1).replace(/\\/g, "/");
}

function outPathFor(relPath) {
  return path.join(outBase, relPath);
}

async function copyFile(srcAbs, destAbs) {
  await ensureDir(path.dirname(destAbs));
  await fs.copyFile(srcAbs, destAbs);
}

async function optimizeImage(absPath) {
  const rel = relFromPublic(absPath);
  const ext = path.extname(absPath).toLowerCase();
  const destAbs = outPathFor(rel);
  const destWebpAbs = outPathFor(rel.replace(new RegExp(`${escapeRegExp(ext)}$`, "i"), ".webp"));

  const input = await fs.readFile(absPath);
  const inputHash = sha1(input);

  // Skip if unchanged (hash stored in sidecar file)
  const hashFile = destAbs + ".sha1";
  if (await pathExists(hashFile)) {
    const prev = (await fs.readFile(hashFile, "utf8")).trim();
    if (prev === inputHash && (await pathExists(destAbs)) && (await pathExists(destWebpAbs))) {
      return { rel, changed: false };
    }
  }

  await ensureDir(path.dirname(destAbs));

  // Optional TinyPNG pass for JPG/PNG (reduces bytes further, but needs API key)
  const tinified = await maybeTinifyBuffer(input, ext);
  const baseBuffer = tinified || input;

  // For images we always produce:
  // 1) an optimized version in the original extension (for existing URLs)
  // 2) a .webp sibling (for <picture> / modern browsers)
  const img = sharp(baseBuffer, { failOn: "none" });

  if (ext === ".jpg" || ext === ".jpeg") {
    await img
      .jpeg({ quality: env.imageQuality, mozjpeg: true })
      .toFile(destAbs);
  } else if (ext === ".png") {
    await img
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(destAbs);
  } else if (ext === ".webp") {
    // Preserve webp but recompress to configured quality
    await img.webp({ quality: env.webpQuality }).toFile(destAbs);
  } else {
    await copyFile(absPath, destAbs);
  }

  // webp sibling
  await sharp(baseBuffer, { failOn: "none" }).webp({ quality: env.webpQuality }).toFile(destWebpAbs);

  await fs.writeFile(hashFile, inputHash, "utf8");
  return { rel, changed: true };
}

async function maybeTinifyBuffer(buffer, ext) {
  if (!env.tinifyKey) return null;
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") return null;

  // Lazy-load tinify only when needed (keeps local installs simpler)
  if (!_tinify) {
    const mod = await import("tinify");
    _tinify = mod.default || mod;
    _tinify.key = env.tinifyKey;
  }

  return new Promise((resolve) => {
    try {
      const source = _tinify.fromBuffer(buffer);
      source.toBuffer((err, out) => {
        if (err) {
          // Soft-fail: continue with sharp-only optimization
          resolve(null);
          return;
        }
        resolve(out);
      });
    } catch {
      resolve(null);
    }
  });
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runFfmpeg(args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    resolveFfmpeg()
      .then(() => {
        if (!_ffmpegBin) {
          reject(
            new Error(
              "ffmpeg is not available. Install ffmpeg or provide FFMPEG_PATH, or install ffmpeg-static (optional dependency)."
            )
          );
          return;
        }
        const child = spawn(_ffmpegBin, args, { stdio: "inherit", cwd });
        child.on("error", reject);
        child.on("exit", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`ffmpeg failed with exit code ${code}`));
        });
      })
      .catch(reject);
  });
}

async function resolveFfmpeg() {
  if (_ffmpegResolved) return;
  _ffmpegResolved = true;

  if (_ffmpegBin) return;

  try {
    const mod = await import("ffmpeg-static");
    const bin = mod.default || mod;
    if (bin) {
      _ffmpegBin = bin;
      return;
    }
  } catch {
    // ignore
  }

  // Fall back to system ffmpeg
  _ffmpegBin = "ffmpeg";
}

async function optimizeVideo(absPath) {
  const rel = relFromPublic(absPath);
  const ext = path.extname(absPath).toLowerCase();

  // Normalize output path to .mp4 (keeping folder + base name)
  const relNoExt = rel.replace(new RegExp(`${escapeRegExp(ext)}$`, "i"), "");
  const outMp4Rel = relNoExt + ".mp4";
  const outMp4Abs = outPathFor(outMp4Rel);

  const input = await fs.readFile(absPath);
  const inputHash = sha1(input);

  const hashFile = outMp4Abs + ".sha1";
  if (await pathExists(hashFile)) {
    const prev = (await fs.readFile(hashFile, "utf8")).trim();
    if (prev === inputHash && (await pathExists(outMp4Abs))) {
      return { rel, changed: false };
    }
  }

  await ensureDir(path.dirname(outMp4Abs));

  // H.264 MP4
  // - Scale down to max dimensions while preserving aspect ratio
  // - Use CRF for quality/size tradeoff
  const scaleFilter = `scale='min(${env.videoMaxWidth},iw)':'min(${env.videoMaxHeight},ih)':force_original_aspect_ratio=decrease`;

  try {
    await runFfmpeg([
      "-y",
      "-i",
      absPath,
      "-vf",
      scaleFilter,
      "-c:v",
      "libx264",
      "-preset",
      env.videoPreset,
      "-crf",
      String(env.videoCrf),
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      outMp4Abs,
    ]);
  } catch (e) {
    console.warn(`Skipping video optimization for ${rel}: ${e?.message || e}`);
    return { rel, changed: false, skipped: true };
  }

  if (env.videoMakeWebm) {
    const outWebmRel = relNoExt + ".webm";
    const outWebmAbs = outPathFor(outWebmRel);
    await ensureDir(path.dirname(outWebmAbs));

    await runFfmpeg([
      "-y",
      "-i",
      absPath,
      "-vf",
      scaleFilter,
      "-c:v",
      "libvpx-vp9",
      "-b:v",
      "0",
      "-crf",
      "33",
      "-c:a",
      "libopus",
      outWebmAbs,
    ]);
  }

  if (env.videoAbr) {
    // Generate HLS (ABR-ish) renditions into: public/.optimized/<relNoExt>.hls/
    const hlsDirRel = relNoExt + ".hls";
    const hlsDirAbs = outPathFor(hlsDirRel);
    await ensureDir(hlsDirAbs);

    const master = path.join(hlsDirAbs, "master.m3u8");

    // 3 ladders: 360p, 480p, 720p
    // Note: bitrates are conservative for broad networks.
    const ladders = [
      { name: "360p", w: 640, h: 360, vb: "800k", ab: "96k" },
      { name: "480p", w: 854, h: 480, vb: "1400k", ab: "128k" },
      { name: "720p", w: 1280, h: 720, vb: "2400k", ab: "128k" },
    ];

    // One-pass multi-variant HLS
    const filterParts = ladders
      .map((l, i) => `[0:v]scale=w=${l.w}:h=${l.h}:force_original_aspect_ratio=decrease,pad=w=${l.w}:h=${l.h}:x=(ow-iw)/2:y=(oh-ih)/2[v${i}]`)
      .join(";");

    const varStreamMap = ladders.map((_, i) => `v:${i},a:${i}`).join(" ");

    const args = [
      "-y",
      "-i",
      absPath,
      "-filter_complex",
      filterParts,
      ...ladders.flatMap((l, i) => [
        "-map",
        `[v${i}]`,
        "-map",
        "0:a?",
        "-c:v",
        "libx264",
        "-preset",
        env.videoPreset,
        "-crf",
        String(env.videoCrf),
        "-b:v",
        l.vb,
        "-maxrate",
        l.vb,
        "-bufsize",
        "2M",
        "-c:a",
        "aac",
        "-b:a",
        l.ab,
      ]),
      "-f",
      "hls",
      "-hls_time",
      "4",
      "-hls_playlist_type",
      "vod",
      "-hls_flags",
      "independent_segments",
      "-hls_segment_filename",
      path.join(hlsDirAbs, "%v", "seg_%03d.ts"),
      "-master_pl_name",
      path.basename(master),
      "-var_stream_map",
      varStreamMap,
      path.join(hlsDirAbs, "%v", "index.m3u8"),
    ];

    await runFfmpeg(args);
  }

  await fs.writeFile(hashFile, inputHash, "utf8");
  return { rel, changed: true };
}

async function main() {
  const start = Date.now();
  await ensureDir(outBase);

  const sourceRoots = [
    path.join(publicDir, "images"),
    path.join(publicDir, "header"),
    path.join(publicDir, "downloads"),
  ].filter((p) => p);

  const existingRoots = [];
  for (const r of sourceRoots) {
    if (await pathExists(r)) existingRoots.push(r);
  }

  if (existingRoots.length === 0) {
    console.log("No public media folders found; nothing to optimize.");
    return;
  }

  const allFiles = [];
  for (const r of existingRoots) {
    allFiles.push(...(await walk(r)));
  }

  const results = {
    images: { processed: 0, changed: 0 },
    videos: { processed: 0, changed: 0 },
    skipped: 0,
    skippedVideos: 0,
  };

  for (const f of allFiles) {
    const ext = path.extname(f).toLowerCase();
    if (IMAGE_EXTS.has(ext)) {
      results.images.processed++;
      const r = await optimizeImage(f);
      if (r.changed) results.images.changed++;
    } else if (VIDEO_EXTS.has(ext)) {
      results.videos.processed++;
      const r = await optimizeVideo(f);
      if (r.changed) results.videos.changed++;
      if (r.skipped) results.skippedVideos++;
    } else {
      results.skipped++;
    }
  }

  const ms = Date.now() - start;
  console.log("Media optimization complete:");
  console.log(`- Images: ${results.images.processed} processed, ${results.images.changed} changed`);
  console.log(`- Videos: ${results.videos.processed} processed, ${results.videos.changed} changed`);
  if (results.skippedVideos) console.log(`- Videos skipped (no ffmpeg): ${results.skippedVideos}`);
  console.log(`- Skipped: ${results.skipped}`);
  console.log(`- Output: ${outBase}`);
  console.log(`- Time: ${(ms / 1000).toFixed(1)}s`);

  console.log("\nTip: set env vars to tune:");
  console.log("- IMAGE_QUALITY=80 WEBP_QUALITY=80");
  console.log("- VIDEO_CRF=28 VIDEO_PRESET=veryfast VIDEO_MAX_WIDTH=1280 VIDEO_MAX_HEIGHT=720");
  console.log("- VIDEO_WEBM=1 (optional) VIDEO_ABR=1 (optional, generates HLS playlists)");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
