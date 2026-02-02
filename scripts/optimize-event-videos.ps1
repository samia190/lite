<#
Optimize Event Videos
- Place your raw videos in: kangarufrontend\public\image\new\
- Filenames should start with: event (e.g. "event 1.mp4", "event2.mov")
- Requires `ffmpeg` on PATH

What the script does for each matching file:
- Creates an H.264 MP4 optimized for streaming (faststart)
- Creates a WebM (VP9) fallback
- Extracts a poster image (JPEG + WebP)
- Emits an `attachments.json` manifest you can import into MongoDB or use with the Admin UI

Usage:
  .\optimize-event-videos.ps1 -Path "..\kangarufrontend\public\image\new" -WhatIf:$false

#>
[CmdletBinding()]
param(
    [string]$Path = "kangarufrontend\public\image\new",
    [switch]$WhatIf
)

function RunCmd($exe, $args) {
    $cmd = "$exe $args"
    Write-Host "Running: $cmd"
    if (-not $WhatIf) {
        $p = Start-Process -FilePath $exe -ArgumentList $args -NoNewWindow -Wait -PassThru
        if ($p.ExitCode -ne 0) { throw "Command failed: $cmd" }
    }
}

# Ensure ffmpeg exists
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error "ffmpeg is not found on PATH. Install ffmpeg and re-run the script."
    exit 2
}

$fullPath = Resolve-Path -Path $Path -ErrorAction SilentlyContinue
if (-not $fullPath) {
    Write-Error "Path not found: $Path"
    exit 2
}
$fullPath = $fullPath.Path

$patterns = @('*.mp4','*.mov','*.mkv','*.avi','*.webm')
$files = @()
foreach ($pat in $patterns) { $files += Get-ChildItem -Path $fullPath -Filter $pat -File -ErrorAction SilentlyContinue }

if ($files.Count -eq 0) { Write-Host "No video files found matching event* patterns in $fullPath"; exit 0 }

$manifest = @()

foreach ($f in $files) {
    if ($f.BaseName -notmatch '^event') { continue }
    $origName = $f.Name
    $base = $f.BaseName -replace '\s+', '-' -replace '[^A-Za-z0-9\-]', ''

    $outMp4 = Join-Path $fullPath "${base}-optimized.mp4"
    $outWebm = Join-Path $fullPath "${base}.webm"
    $posterJpg = Join-Path $fullPath "${base}-poster.jpg"
    $posterWebp = Join-Path $fullPath "${base}-poster.webp"

    Write-Host "\nProcessing: $origName -> $([IO.Path]::GetFileName($outMp4))"

    # MP4 (H.264) optimized for streaming
    $argsMp4 = "-y -i `"$($f.FullName)`" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart -vf \"scale='min(1280,iw)':'min(720,ih)'\" `"$outMp4`""
    RunCmd ffmpeg $argsMp4

    # WebM (VP9) fallback - optional, may be slower to encode
    $argsWebm = "-y -i `"$($f.FullName)`" -c:v libvpx-vp9 -crf 32 -b:v 0 -c:a libopus `"$outWebm`""
    RunCmd ffmpeg $argsWebm

    # Poster image (from the optimized MP4 if created, otherwise original)
    $srcForPoster = $outMp4
    if (-not (Test-Path $srcForPoster)) { $srcForPoster = $f.FullName }
    $argsPosterJpg = "-y -ss 00:00:01 -i `"$srcForPoster`" -vframes 1 -vf \"scale=640:-1\" `"$posterJpg`""
    RunCmd ffmpeg $argsPosterJpg

    # Poster WebP
    $argsPosterWebp = "-y -ss 00:00:01 -i `"$srcForPoster`" -vframes 1 -vf \"scale=640:-1\" `"$posterWebp`""
    RunCmd ffmpeg $argsPosterWebp

    # Add to manifest (use public relative URLs)
    $relMp4 = "/image/new/" + [IO.Path]::GetFileName($outMp4)
    $relWebm = "/image/new/" + [IO.Path]::GetFileName($outWebm)
    $relPoster = "/image/new/" + [IO.Path]::GetFileName($posterWebp)

    $entry = [PSCustomObject]@{
        originalName = $origName
        url = $relMp4
        webm = $relWebm
        poster = $relPoster
        mimeType = 'video/mp4'
        title = $base
        heading = ''
        description = ''
    }
    $manifest += $entry
}

# Write manifest JSON
$manifestPath = Join-Path $fullPath 'attachments.json'
$manifest | ConvertTo-Json -Depth 5 | Out-File -FilePath $manifestPath -Encoding utf8
Write-Host "\nWrote manifest to: $manifestPath"

Write-Host "\nDone. You can now either upload the created files via the Admin UI or import the attachments.json into MongoDB."
Write-Host "Example manual MongoDB update (mongo shell):"
Write-Host "-------------------------------"
Write-Host "const manifest = cat('$manifestPath')" 
Write-Host "const items = JSON.parse(manifest)"
Write-Host "items.forEach(i => db.contents.updateOne({ type: 'events' }, { $push: { attachments: { _id: ObjectId(), url: i.url, originalName: i.originalName, mimeType: i.mimeType } } }, { upsert: true }));"
Write-Host "-------------------------------"
