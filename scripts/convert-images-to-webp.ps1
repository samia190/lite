# PowerShell Script to Convert Images to WebP Format
# This will significantly reduce image file sizes (60-80% smaller)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Image to WebP Converter for KANGARU GIRLS School" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if sharp-cli is installed
Write-Host "Checking for sharp-cli..." -ForegroundColor Yellow
$sharpInstalled = npm list -g sharp-cli 2>$null
if (-not $sharpInstalled) {
    Write-Host "Installing sharp-cli globally..." -ForegroundColor Yellow
    npm install -g sharp-cli
}

# Define directories to process
$imageDirectories = @(
    "kangarufrontend\public\images\students",
    "kangarufrontend\public\images\gallery"
)

$totalConverted = 0
$totalSaved = 0

foreach ($dir in $imageDirectories) {
    $fullPath = Join-Path $PSScriptRoot "..\$dir"
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "Directory not found: $fullPath" -ForegroundColor Red
        continue
    }
    
    Write-Host "`nProcessing directory: $dir" -ForegroundColor Green
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Get all JPG and PNG files
    $images = Get-ChildItem -Path $fullPath -Include *.jpg,*.JPG,*.jpeg,*.JPEG,*.png,*.PNG -Recurse
    
    foreach ($image in $images) {
        $webpPath = [System.IO.Path]::ChangeExtension($image.FullName, ".webp")
        
        # Skip if WebP already exists and is newer
        if ((Test-Path $webpPath) -and ((Get-Item $webpPath).LastWriteTime -gt $image.LastWriteTime)) {
            Write-Host "  ⏭️  Skipping (WebP exists): $($image.Name)" -ForegroundColor Gray
            continue
        }
        
        try {
            $originalSize = $image.Length
            
            # Convert using sharp-cli
            Write-Host "  🔄 Converting: $($image.Name)" -ForegroundColor Cyan
            
            # Run sharp-cli to convert
            $sharpCmd = "npx sharp-cli -i `"$($image.FullName)`" -o `"$webpPath`" -f webp -q 80"
            Invoke-Expression $sharpCmd | Out-Null
            
            if (Test-Path $webpPath) {
                $newSize = (Get-Item $webpPath).Length
                $savedBytes = $originalSize - $newSize
                $percentSaved = [math]::Round(($savedBytes / $originalSize) * 100, 1)
                
                Write-Host "  ✅ Created: $([System.IO.Path]::GetFileName($webpPath))" -ForegroundColor Green
                Write-Host "     Size: $([math]::Round($originalSize/1KB, 1))KB → $([math]::Round($newSize/1KB, 1))KB (saved $percentSaved%)" -ForegroundColor White
                
                $totalConverted++
                $totalSaved += $savedBytes
            }
        }
        catch {
            Write-Host "  ❌ Failed: $($image.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Conversion Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Total images converted: $totalConverted" -ForegroundColor White
Write-Host "Total space saved: $([math]::Round($totalSaved/1MB, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your code to use .webp extensions" -ForegroundColor White
Write-Host "2. Test images load correctly in the browser" -ForegroundColor White
Write-Host "3. Optionally delete original .JPG files to save space" -ForegroundColor White
Write-Host "4. Deploy to Render" -ForegroundColor White
Write-Host ""
