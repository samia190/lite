# ============================================================================
# CONVERT IMAGES TO WEBP - PowerShell Compatible
# ============================================================================
# Run this script from the images directory to convert all JPG/PNG to WebP
# ============================================================================

param(
    [string]$Path = ".",
    [int]$Quality = 85
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONVERTING IMAGES TO WEBP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$convertedCount = 0
$skippedCount = 0
$errorCount = 0

# Find all image files recursively
$images = Get-ChildItem -Path $Path -Recurse -Include *.jpg,*.jpeg,*.png,*.JPG,*.JPEG,*.PNG

Write-Host "Found $($images.Count) images to process" -ForegroundColor Yellow
Write-Host ""

foreach ($image in $images) {
    $webpPath = [System.IO.Path]::ChangeExtension($image.FullName, '.webp')
    
    # Skip if WebP already exists
    if (Test-Path $webpPath) {
        Write-Host "  SKIP: $($image.Name) (WebP exists)" -ForegroundColor DarkGray
        $skippedCount++
        continue
    }
    
    try {
        Write-Host "  Converting: $($image.Name)..." -ForegroundColor Yellow -NoNewline
        
        # Use npx to run squoosh-cli
        $result = npx @squoosh/cli --webp "{`"quality`":$Quality}" -d $image.DirectoryName $image.FullName 2>&1
        
        if (Test-Path $webpPath) {
            $originalSize = $image.Length
            $newSize = (Get-Item $webpPath).Length
            $saved = $originalSize - $newSize
            $percent = [math]::Round(($saved / $originalSize) * 100, 1)
            
            Write-Host " OK! Saved $percent%" -ForegroundColor Green
            $convertedCount++
        } else {
            Write-Host " FAILED" -ForegroundColor Red
            $errorCount++
        }
    }
    catch {
        Write-Host " ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONVERSION COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Converted: $convertedCount" -ForegroundColor Green
Write-Host "Skipped: $skippedCount" -ForegroundColor Yellow
Write-Host "Errors: $errorCount" -ForegroundColor Red
Write-Host ""

if ($convertedCount -gt 0) {
    Write-Host "✅ Your images are now optimized!" -ForegroundColor Green
    Write-Host "The website will automatically use WebP versions." -ForegroundColor Cyan
}
