Write-Host "Starting processes..."
Start-Process -WindowStyle Hidden node "c:\Users\kirti\Documents\AgeGuard AI\backend\server.js"
Start-Process -WindowStyle Hidden powershell "-Command `"cd 'c:\Users\kirti\Documents\AgeGuard AI\ai_services'; .\venv\Scripts\Activate.ps1; python -m uvicorn main:app --port 8000`""
Start-Process -WindowStyle Hidden powershell "-Command `"cd 'c:\Users\kirti\Documents\AgeGuard AI\dashboard'; npm run dev -- --host`""

Start-Sleep -Seconds 4

Start-Process -WindowStyle Hidden npx "-y localtunnel --port 5000 --subdomain ageguard-backend-kirti"
Start-Process -WindowStyle Hidden npx "-y localtunnel --port 8000 --subdomain ageguard-ai-kirti"
Start-Process -WindowStyle Hidden npx "-y localtunnel --port 5173 --subdomain ageguard-dashboard-kirti"

Write-Host "DONE"
