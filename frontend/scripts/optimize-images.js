#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUT_DIR = path.join(PUBLIC_DIR, '_optimized');

const widths = [320, 640, 900, 1200];

async function walk(dir) {
  let files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files = files.concat(await walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function optimize() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const all = await walk(PUBLIC_DIR);
  const images = all.filter(f => /\.(jpe?g|png|webp)$/i.test(f) && !f.includes('_optimized'));

  console.log(`Found ${images.length} images to optimize.`);

  for (const img of images) {
    const rel = path.relative(PUBLIC_DIR, img);
    const name = path.basename(img, path.extname(img));
    const subdir = path.dirname(rel);
    const destDir = path.join(OUT_DIR, subdir);
    await fs.mkdir(destDir, { recursive: true });

    for (const w of widths) {
      const outWebp = path.join(destDir, `${name}-${w}.webp`);
      try {
        await sharp(img).resize({ width: w }).webp({ quality: 80 }).toFile(outWebp);
        console.log(`Wrote ${outWebp}`);
      } catch (err) {
        console.warn(`Failed to process ${img} @${w}px:`, err.message);
      }
    }
  }

  console.log('Optimization complete. Optimized images are in public/_optimized');
}

optimize().catch(err => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});
