# Run backend and frontend in separate PowerShell windows for local development

# Start backend (nodemon) in a new PowerShell window
Start-Process -FilePath "powershell" -ArgumentList '-NoExit','-Command',"cd '$PWD\backend'; npm run dev"

# Start frontend (Vite) in a new PowerShell window
Start-Process -FilePath "powershell" -ArgumentList '-NoExit','-Command',"cd '$PWD\frontend'; npm run dev"

Write-Host 'Launched backend and frontend in separate PowerShell windows.'