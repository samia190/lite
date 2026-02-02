/**
 * CONVERT ALL IMAGES TO WEBP - Using Sharp (Reliable)
 * 
 * This script converts all JPG/PNG images to WebP format
 * using the sharp library which is more stable than squoosh-cli
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const IMAGE_DIR = path.join(__dirname, '../kangarufrontend/public/images');
const WEBP_QUALITY = 85;
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

let convertedCount = 0;
let skippedCount = 0;
let errorCount = 0;

console.log('\n========================================');
console.log('CONVERTING IMAGES TO WEBP');
console.log('========================================\n');

/**
 * Get all image files recursively
 */
function getAllImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllImageFiles(filePath, fileList);
    } else {
      const ext = path.extname(file);
      if (IMAGE_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * Convert single image to WebP
 */
async function convertToWebP(imagePath) {
  const webpPath = imagePath.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/, '.webp');
  
  // Skip if WebP already exists
  if (fs.existsSync(webpPath)) {
    console.log(`  SKIP: ${path.basename(imagePath)} (WebP exists)`);
    skippedCount++;
    return;
  }
  
  try {
    process.stdout.write(`  Converting: ${path.basename(imagePath)}...`);
    
    // Get original size
    const originalStats = fs.statSync(imagePath);
    const originalSize = originalStats.size;
    
    // Convert to WebP
    await sharp(imagePath)
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);
    
    // Get new size
    const webpStats = fs.statSync(webpPath);
    const webpSize = webpStats.size;
    const saved = originalSize - webpSize;
    const percent = ((saved / originalSize) * 100).toFixed(1);
    
    console.log(` OK! Saved ${percent}%`);
    convertedCount++;
  } catch (error) {
    console.log(` ERROR: ${error.message}`);
    errorCount++;
  }
}

/**
 * Main conversion process
 */
async function main() {
  try {
    // Check if image directory exists
    if (!fs.existsSync(IMAGE_DIR)) {
      console.error(`❌ Image directory not found: ${IMAGE_DIR}`);
      process.exit(1);
    }
    
    // Get all images
    const images = getAllImageFiles(IMAGE_DIR);
    console.log(`Found ${images.length} images to process\n`);
    
    // Convert each image
    for (const imagePath of images) {
      await convertToWebP(imagePath);
    }
    
    // Summary
    console.log('\n========================================');
    console.log('CONVERSION COMPLETE');
    console.log('========================================');
    console.log(`Converted: ${convertedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}\n`);
    
    if (convertedCount > 0) {
      console.log('✅ Your images are now optimized!');
      console.log('The website will automatically use WebP versions.\n');
    }
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run the conversion
main();
