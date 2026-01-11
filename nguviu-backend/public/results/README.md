# Results PDF Storage

This directory stores uploaded PDF result slips.

## File Naming Convention:
- Format: `result-{timestamp}-{random}.pdf`
- Example: `result-1704123456789-abc123.pdf`

## Security:
- Only PDF files accepted
- Max file size: 10MB
- Server validates file type
- Automatic cleanup on errors

## Access:
- Students access via: `http://localhost:5000/results/filename.pdf`
- Protected by authentication in routes
- Only own results visible to students

## Cleanup:
PDF files are permanent unless manually deleted or result is deleted from database.

**Do not delete this directory!**
