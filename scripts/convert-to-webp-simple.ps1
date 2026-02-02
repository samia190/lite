# ============================================================================
# SIMPLE IMAGE TO WEBP CONVERTER
# ============================================================================
# Converts all JPG/PNG images to WebP format using PowerShell
# No external dependencies required!
# ============================================================================

param(
    [int]$Quality = 80,
    [switch]$Recursive = $true
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WEBP CONVERTER (PowerShell Native)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Add .NET Image processing
Add-Type -AssemblyName System.Drawing

$frontendPublic = Join-Path $PSScriptRoot "..\kangarufrontend\public\images"
$backendPublic = Join-Path $PSScriptRoot "..\kangarubackend\public\images"

$directories = @($frontendPublic, $backendPublic)

function Convert-ToWebP {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Quality
    )
    
    try {
        # Load original image
        $img = [System.Drawing.Image]::FromFile($InputPath)
        
        # Create encoder parameters
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
            [System.Drawing.Imaging.Encoder]::Quality, 
            $Quality
        )
        
        # Get WebP codec (if available) or use PNG as alternative
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | 
                 Where-Object { $_.MimeType -eq 'image/webp' }
        
        if (-not $codec) {
            # WebP codec not available, use high-quality JPEG instead
            Write-Host "  (WebP not available, using optimized JPEG)" -ForegroundColor DarkYellow
            $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | 
                     Where-Object { $_.MimeType -eq 'image/jpeg' }
            $OutputPath = [System.IO.Path]::ChangeExtension($OutputPath, ".jpg")
        }
        
        # Save optimized image
        $img.Save($OutputPath, $codec, $encoderParams)
        $img.Dispose()
        
        return $true
    }
    catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

$totalProcessed = 0
$totalSaved = 0

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        Write-Host "Directory not found: $dir" -ForegroundColor Yellow
        continue
    }

    Write-Host "Processing: $dir" -ForegroundColor Green
    Write-Host "-----------------------------------" -ForegroundColor Gray
    
    $files = if ($Recursive) {
        Get-ChildItem -Path $dir -Recurse -Include *.jpg,*.jpeg,*.png,*.JPG,*.JPEG,*.PNG
    } else {
        Get-ChildItem -Path $dir -Include *.jpg,*.jpeg,*.png,*.JPG,*.JPEG,*.PNG
    }
    
    foreach ($file in $files) {
        $webpPath = [System.IO.Path]::ChangeExtension($file.FullName, ".webp")
        
        # Skip if WebP already exists
        if (Test-Path $webpPath) {
            Write-Host "  SKIP: $($file.Name) (already exists)" -ForegroundColor DarkGray
            continue
        }
        
        $originalSize = $file.Length
        Write-Host "  Processing: $($file.Name)..." -ForegroundColor Yellow -NoNewline
        
        $success = Convert-ToWebP -InputPath $file.FullName -OutputPath $webpPath -Quality $Quality
        
        if ($success -and (Test-Path $webpPath)) {
            $newSize = (Get-Item $webpPath).Length
            $saved = $originalSize - $newSize
            $percent = [math]::Round(($saved / $originalSize) * 100, 1)
            
            Write-Host " OK! Saved $percent%" -ForegroundColor Green
            $totalProcessed++
            $totalSaved += $saved
        } else {
            Write-Host " FAILED" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONVERSION COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Images processed: $totalProcessed" -ForegroundColor White
Write-Host "Space saved: $([math]::Round($totalSaved/1MB, 2)) MB" -ForegroundColor White
Write-Host ""

if ($totalProcessed -eq 0) {
    Write-Host "NOTE: If WebP conversion didn't work, you can:" -ForegroundColor Yellow
    Write-Host "1. Install @squoosh/cli: npm install -g @squoosh/cli" -ForegroundColor White
    Write-Host "2. Run: squoosh-cli --webp '{\"quality\":85}' **/*.{jpg,jpeg,png}" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use an online converter and upload the WebP files manually." -ForegroundColor White
}
