@echo off
echo ===================================================
echo   Iniciando Rally de Certificaciones (MVP)
echo ===================================================

echo [1/2] Iniciando el Backend (Flask) en puerto 5000...
start "Rally Backend" cmd /c "cd rally-back && python app.py"

echo [2/2] Iniciando el Frontend (Angular) en puerto 4200...
start "Rally Frontend" cmd /c "cd rally-app && npm start"

echo.
echo Los servicios se están ejecutando en ventanas separadas.
echo - Frontend: http://localhost:4200
echo - Backend:  http://localhost:5000/health
echo.
pause
