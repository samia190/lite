# Quick Script to Move Images from Backend to Frontend
# This fixes the Render deployment issue where backend images are missing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Image Migration Script - Backend to Frontend" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backendImages = "nguviu-backend\public\images"
$frontendImages = "nguviu-frontend\public\images"

# Check if source exists
if (-Not (Test-Path $backendImages)) {
    Write-Host "ERROR: Backend images folder not found at: $backendImages" -ForegroundColor Red
    Write-Host "Please ensure you're running this from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Create frontend images directory if it doesn't exist
if (-Not (Test-Path $frontendImages)) {
    Write-Host "Creating frontend images directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $frontendImages -Force | Out-Null
}

# Count images in backend
$imageCount = (Get-ChildItem -Path $backendImages -Recurse -File -Include *.jpg,*.jpeg,*.png,*.gif,*.webp,*.svg).Count
Write-Host "Found $imageCount images in backend folder" -ForegroundColor Green

if ($imageCount -eq 0) {
    Write-Host "`nWARNING: No images found in backend folder!" -ForegroundColor Red
    Write-Host "This might be why your Render deployment is slow - images are missing!" -ForegroundColor Yellow
    exit 1
}

# Copy images
Write-Host "`nCopying images to frontend..." -ForegroundColor Yellow
try {
    Copy-Item -Path "$backendImages\*" -Destination $frontendImages -Recurse -Force
    Write-Host "✓ Images copied successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to copy images - $_" -ForegroundColor Red
    exit 1
}

# Verify copy
$copiedCount = (Get-ChildItem -Path $frontendImages -Recurse -File -Include *.jpg,*.jpeg,*.png,*.gif,*.webp,*.svg).Count
Write-Host "✓ Verified: $copiedCount images in frontend folder" -ForegroundColor Green

# Calculate total size
$totalSize = (Get-ChildItem -Path $frontendImages -Recurse -File | Measure-Object -Property Length -Sum).Sum
$sizeInMB = [math]::Round($totalSize / 1MB, 2)
Write-Host "✓ Total image size: $sizeInMB MB" -ForegroundColor Green

if ($sizeInMB -gt 50) {
    Write-Host "`nWARNING: Image folder is quite large ($sizeInMB MB)" -ForegroundColor Yellow
    Write-Host "Consider running the image optimization script to reduce size:" -ForegroundColor Yellow
    Write-Host "  cd nguviu-frontend" -ForegroundColor Cyan
    Write-Host "  npm run optimize:images" -ForegroundColor Cyan
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Migration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Commit the changes:" -ForegroundColor White
Write-Host "   git add nguviu-frontend/public/images/" -ForegroundColor Cyan
Write-Host "   git commit -m 'Move images to frontend for CDN delivery'" -ForegroundColor Cyan
Write-Host "`n2. Deploy to Render:" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor Cyan
Write-Host "`n3. Images will now be served from the frontend CDN" -ForegroundColor White
Write-Host "   (Much faster than backend serving!)" -ForegroundColor Green
Write-Host "`n4. Optional - Optimize images for faster loading:" -ForegroundColor White
Write-Host "   cd nguviu-frontend && npm run optimize:images" -ForegroundColor Cyan
Write-Host ""
