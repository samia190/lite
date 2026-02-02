Quick guide — optimize-event-videos.ps1

What it does
- Transcodes any files beginning with `event` found in `kangarufrontend/public/image/new`
- Produces: `*-optimized.mp4`, `*.webm`, `*-poster.jpg`, `*-poster.webp`
- Writes `attachments.json` containing entries for each processed video

Prerequisites
- Windows PowerShell
- `ffmpeg` available on PATH

Usage
Open PowerShell at the repo root and run:

```powershell
# dry-run (shows commands only)
.\scripts\optimize-event-videos.ps1 -Path "kangarufrontend\public\image\new" -WhatIf

# actually run
.\scripts\optimize-event-videos.ps1 -Path "kangarufrontend\public\image\new"
```

What to do after running
- Verify the generated files appear in `kangarufrontend/public/image/new`
- Upload them via Admin → Events → Upload Event Media (recommended)

Manual DB import example (mongo shell)
1. Copy the generated `attachments.json` file path printed by the script
2. In mongo shell (connected to your DB):

```js
// load manifest into client (adjust path)
var manifest = cat('path/to/attachments.json');
var items = JSON.parse(manifest);
items.forEach(function(i) {
  db.contents.updateOne(
    { type: 'events' },
    { $push: { attachments: { _id: ObjectId(), url: i.url, originalName: i.originalName, mimeType: i.mimeType } } },
    { upsert: true }
  );
});
```

If you want, I can prepare a DB update that sets the first event's `linkUrl` to the first generated video, or produce a small Node/Mongo script to apply the manifest automatically.
