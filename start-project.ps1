Write-Host "==================================================="
Write-Host "  Iniciando Rally de Certificaciones (MVP)"
Write-Host "==================================================="

Write-Host "[1/2] Iniciando el Backend (Flask) en puerto 5000..." -ForegroundColor Cyan
Start-Process "cmd.exe" -ArgumentList "/c cd rally-back && python app.py" -Title "Rally Backend"

Write-Host "[2/2] Iniciando el Frontend (Angular) en puerto 4200..." -ForegroundColor Cyan
Start-Process "cmd.exe" -ArgumentList "/c cd rally-app && npm start" -Title "Rally Frontend"

Write-Host ""
Write-Host "Los servicios se están ejecutando en ventanas separadas." -ForegroundColor Green
Write-Host "- Frontend: http://localhost:4200"
Write-Host "- Backend:  http://localhost:5000/health"
Write-Host ""
Read-Host -Prompt "Presiona Enter para salir de este script..."
