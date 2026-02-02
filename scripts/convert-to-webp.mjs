#!/usr/bin/env node
// Convert images to WebP format for better performance
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const imageDirs = ['images', 'header', 'downloads'];

/**
 * Convert image to WebP format
 */
async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ 
        quality: 85, // Good balance between quality and size
        effort: 6,   // Compression effort (0-6, higher = better compression)
      })
      .toFile(outputPath);
    
    const inputSize = fs.statSync(inputPath).size;
    const outputSize = fs.statSync(outputPath).size;
    const savings = ((inputSize - outputSize) / inputSize * 100).toFixed(2);
    
    console.log(`✅ Converted: ${path.basename(inputPath)} → ${path.basename(outputPath)} (${savings}% smaller)`);
    return true;
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error.message);
    return false;
  }
}

/**
 * Process all images in a directory
 */
async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory()) {
      // Recursively process subdirectories
      await processDirectory(fullPath);
    } else if (file.isFile()) {
      const ext = path.extname(file.name).toLowerCase();
      
      // Only process JPG, JPEG, PNG files
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const webpPath = fullPath.replace(/\\.(jpg|jpeg|png)$/i, '.webp');
        
        // Skip if WebP already exists and is newer
        if (fs.existsSync(webpPath)) {
          const originalStat = fs.statSync(fullPath);
          const webpStat = fs.statSync(webpPath);
          
          if (webpStat.mtime > originalStat.mtime) {
            console.log(`⏭️  Skipping (WebP exists and is newer): ${file.name}`);
            continue;
          }
        }
        
        await convertToWebP(fullPath, webpPath);
      }
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting WebP conversion...\n');
  
  for (const dir of imageDirs) {
    const fullPath = path.join(publicDir, dir);
    console.log(`📁 Processing: ${dir}/`);
    await processDirectory(fullPath);
    console.log('');
  }
  
  console.log('✨ WebP conversion complete!');
}

main().catch(console.error);
