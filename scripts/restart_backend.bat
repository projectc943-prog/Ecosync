@echo off
echo ========================================
echo   Restarting Backend with New Email
echo ========================================
echo.

echo [1/2] Stopping current backend server...
echo Please close the backend terminal window manually, then press any key...
pause > nul

echo.
echo [2/2] Starting backend with updated configuration...
cd backend
start "Ecosync Backend - NEW EMAIL" cmd /k "venv\Scripts\activate && set DATABASE_URL=sqlite:///./iot_system.db && python -m uvicorn app.main:app --host 127.0.0.1 --port 8009 --reload"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   Backend Restarted Successfully!
echo ========================================
echo.
echo New Email Configuration:
echo   Sender: projectc943@gmail.com
echo   Status: Active
echo.
echo Backend running at: http://127.0.0.1:8009
echo.
echo Alert emails will now be sent from projectc943@gmail.com
echo.
pause
