@echo off
echo Starting NeuroHub with ML Integration...
echo.

echo Starting ML API Server...
start "ML API Server" cmd /k "cd /d %~dp0 && C:\Users\sujay\AppData\Local\Programs\Python\Python311\python.exe ml_api_server.py"

echo Waiting for ML API to start...
timeout /t 5 /nobreak > nul

echo Starting React Development Server...
start "React Dev Server" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo NeuroHub is starting up!
echo.
echo ML API Server: http://localhost:8000
echo React App: http://localhost:3000
echo ML Analysis Page: http://localhost:3000/ml-analysis
echo.
echo Press any key to exit this window...
pause > nul
