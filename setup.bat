@echo off
echo ============================================================
echo  TravelSense+ — Setup (Windows)
echo ============================================================

cd backend

echo [1/4] Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

echo [2/4] Installing Python dependencies...
pip install -r requirements.txt

echo [3/4] Copying .env (SQLite — no database setup needed)...
if not exist .env (
    copy .env.example .env
)

echo [4/4] Done! Start the backend with:
echo   cd backend
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload
echo.
echo Then in a second terminal start the frontend:
echo   cd frontend
echo   npm install
echo   npm run dev
echo.
echo API docs:  http://localhost:8000/docs
echo Frontend:  http://localhost:5173
pause
