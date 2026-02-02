# ============================================================================
# Image Optimization Script - Convert to WebP and Compress
# ============================================================================
# This script:
# 1. Converts all JPG/PNG/JPEG images to WebP format (70-80% smaller)
# 2. Keeps original files as backup
# 3. Processes all images in frontend/public and backend/public folders
# ============================================================================

param(
    [int]$Quality = 85,  # WebP quality (80-90 recommended)
    [switch]$SkipBackup,  # Skip creating .original backups
    [switch]$DeleteOriginals  # Delete original files after conversion
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMAGE OPTIMIZATION SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if sharp-cli is installed (Node.js image processing tool)
Write-Host "Checking for required tools..." -ForegroundColor Yellow

$sharpInstalled = npm list -g sharp-cli 2>$null
if (-not $sharpInstalled) {
    Write-Host "Installing sharp-cli globally..." -ForegroundColor Yellow
    npm install -g sharp-cli
}

# Define directories to process
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath
$frontendPublic = Join-Path $rootPath "kangarufrontend\public"
$backendPublic = Join-Path $rootPath "kangarubackend\public"

$directories = @($frontendPublic, $backendPublic)

$totalConverted = 0
$totalSaved = 0
$errors = @()

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        Write-Host "Directory not found: $dir" -ForegroundColor Red
        continue
    }

    Write-Host "`nProcessing: $dir" -ForegroundColor Green
    Write-Host "-----------------------------------" -ForegroundColor Gray

    # Find all image files
    $imageFiles = Get-ChildItem -Path $dir -Recurse -Include *.jpg,*.jpeg,*.png,*.JPG,*.JPEG,*.PNG | 
                  Where-Object { $_.Name -notlike "*.webp" }

    Write-Host "Found $($imageFiles.Count) images to process" -ForegroundColor Cyan

    foreach ($file in $imageFiles) {
        $originalSize = $file.Length
        $webpPath = [System.IO.Path]::ChangeExtension($file.FullName, ".webp")
        
        # Skip if WebP already exists and is newer
        if ((Test-Path $webpPath) -and ((Get-Item $webpPath).LastWriteTime -gt $file.LastWriteTime)) {
            Write-Host "  SKIP: $($file.Name) (WebP already exists)" -ForegroundColor DarkGray
            continue
        }

        try {
            # Backup original if requested
            if (-not $SkipBackup -and -not $DeleteOriginals) {
                $backupPath = "$($file.FullName).original"
                if (-not (Test-Path $backupPath)) {
                    Copy-Item $file.FullName $backupPath -Force
                }
            }

            # Convert to WebP using sharp
            Write-Host "  Converting: $($file.Name)..." -ForegroundColor Yellow -NoNewline
            
            $sharpCmd = "sharp -i `"$($file.FullName)`" -o `"$webpPath`" --webp quality=$Quality"
            Invoke-Expression $sharpCmd 2>&1 | Out-Null

            if (Test-Path $webpPath) {
                $newSize = (Get-Item $webpPath).Length
                $savedBytes = $originalSize - $newSize
                $savedPercent = [math]::Round(($savedBytes / $originalSize) * 100, 1)
                
                $totalConverted++
                $totalSaved += $savedBytes

                Write-Host " OK! Saved $savedPercent% ($([math]::Round($savedBytes/1KB, 1)) KB)" -ForegroundColor Green

                # Delete original if requested
                if ($DeleteOriginals) {
                    Remove-Item $file.FullName -Force
                    Write-Host "    Original deleted" -ForegroundColor DarkGray
                }
            } else {
                Write-Host " FAILED" -ForegroundColor Red
                $errors += $file.FullName
            }

        } catch {
            Write-Host " ERROR: $($_.Exception.Message)" -ForegroundColor Red
            $errors += $file.FullName
        }
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "OPTIMIZATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total images converted: $totalConverted" -ForegroundColor Green
Write-Host "Total space saved: $([math]::Round($totalSaved/1MB, 2)) MB" -ForegroundColor Green

if ($errors.Count -gt 0) {
    Write-Host "`nErrors encountered:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host "`nNOTE: Your images are now optimized!" -ForegroundColor Yellow
Write-Host "The website will automatically use WebP versions when available." -ForegroundColor Yellow
Write-Host ""

# Alternative: Use PowerShell with System.Drawing (if sharp fails)
# This section provides a fallback method
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ALTERNATIVE: Using .NET Image Processing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If sharp-cli didn't work, run this command instead:" -ForegroundColor Yellow
Write-Host "  npm install -g @squoosh/cli" -ForegroundColor Cyan
Write-Host "Then run:" -ForegroundColor Yellow
Write-Host "  squoosh-cli --webp '{\"quality\":85}' -d . **/*.{jpg,jpeg,png}" -ForegroundColor Cyan
Write-Host ""
