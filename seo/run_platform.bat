@echo off
echo ===================================================
echo   Starting SEO & Business Growth Platform...
echo ===================================================

:: Start Backend
echo Starting Python Backend...
start "SEO Platform - Backend" cmd /k "cd backend && if not exist ..\.venv\Scripts\python.exe (echo Creating venv at ..\.venv with Python 3.12... && py -3.12 -m venv ..\.venv) && echo Installing backend requirements... && ..\.venv\Scripts\python.exe -m pip install --upgrade pip && ..\.venv\Scripts\python.exe -m pip install -r requirements.txt && echo Starting backend... && ..\.venv\Scripts\python.exe app.py"

:: Start ML Service
echo Starting ML Service (FastAPI)...
start "SEO Platform - ML Service" cmd /k "cd ml_service && if not exist ..\.venv-ml\Scripts\python.exe (echo Creating venv at ..\.venv-ml with Python 3.12... && py -3.12 -m venv ..\.venv-ml) && echo Installing ML service requirements... && ..\.venv-ml\Scripts\python.exe -m pip install --upgrade pip && ..\.venv-ml\Scripts\python.exe -m pip install -r requirements.txt && echo Starting ML service on http://127.0.0.1:8000 ... && ..\.venv-ml\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

:: Start Frontend
echo Starting React Frontend...
start "SEO Platform - Frontend" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo   System running! 
echo   Backend: http://127.0.0.1:5000
echo   Frontend: http://localhost:5173
echo ===================================================
pause
