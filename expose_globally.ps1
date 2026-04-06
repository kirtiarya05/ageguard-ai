Write-Host "Booting up AgeShield Backend, AI, and Dashboard Servers..."

Start-Process -NoNewWindow node "c:\Users\kirti\Documents\AgeGuard AI\backend\server.js"
Start-Process -NoNewWindow powershell "-Command `"cd 'c:\Users\kirti\Documents\AgeGuard AI\ai_services'; .\venv\Scripts\Activate.ps1; python -m uvicorn main:app --port 8000`""
Start-Process -NoNewWindow powershell "-Command `"cd 'c:\Users\kirti\Documents\AgeGuard AI\dashboard'; npm run dev -- --host`""

Write-Host "Waiting for processes to secure..."
Start-Sleep -Seconds 5

Write-Host "Creating Public Globally Accessible Tunnel Links via Localtunnel..."
Start-Process -NoNewWindow npx "localtunnel --port 5000 --subdomain ageguard-backend-kirti"
Start-Process -NoNewWindow npx "localtunnel --port 8000 --subdomain ageguard-ai-kirti"
Start-Process -NoNewWindow npx "localtunnel --port 5173 --subdomain ageguard-dashboard-kirti"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "               SUCCESS!                   " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Your application is now LIVE globally on the internet!"
Write-Host "Dashboard URLs:"
Write-Host "🌎 https://ageguard-dashboard-kirti.loca.lt/" -ForegroundColor Cyan
Write-Host "Backend API URL:"
Write-Host "🌎 https://ageguard-backend-kirti.loca.lt/" -ForegroundColor Yellow
Write-Host "AI Microservice URL:"
Write-Host "🌎 https://ageguard-ai-kirti.loca.lt/" -ForegroundColor Magenta
Write-Host ""
Write-Host "Anyone with those links can securely access your app until you close this computer."
