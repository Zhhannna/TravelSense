#!/usr/bin/env bash
set -e
echo "============================================================"
echo " TravelSense+ — Setup (Mac/Linux)"
echo "============================================================"

cd backend

echo "[1/4] Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "[2/4] Installing Python dependencies..."
pip install -r requirements.txt

echo "[3/4] Copying .env (SQLite — no database setup needed)..."
[ -f .env ] || cp .env.example .env

echo "[4/4] Done!"
echo ""
echo "Start the backend:"
echo "  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "Start the frontend (in a second terminal):"
echo "  cd frontend && npm install && npm run dev"
echo ""
echo "API docs:  http://localhost:8000/docs"
echo "Frontend:  http://localhost:5173"
