#!/bin/bash

# Exit on error
set -e

echo "========================================"
echo "  Starting Ecosync Project Locally"
echo "========================================"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Backend Setup
if [ ! -d "backend/venv" ]; then
    echo "[INFO] Creating backend virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    echo "[INFO] Installing backend dependencies..."
    pip install -r requirements.txt
    cd ..
else
    echo "[INFO] Backend virtual environment exists."
fi

# Frontend Setup
if [ ! -d "frontend/node_modules" ]; then
    echo "[INFO] Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
else
    echo "[INFO] Frontend dependencies already installed."
fi

echo "[1/3] Configuring backend for local SQLite database..."
cd backend

# Create .env file for development
cat <<EOF > .env
DATABASE_URL=sqlite:///./iot_system.db
SECRET_KEY=local-dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EMAIL_USER=sreekar092004@gmail.com
EMAIL_PASS=orzh vstq rnsp gpwi
GEMINI_API_KEY=AIzaSyDcpyUQnn24R_jxjRveR0Mpvl8eofaK1iM
EOF

cd ..

echo "[2/3] Starting Backend Server on port 8009..."
# Using osascript to open new terminal windows on macOS if possible, otherwise run in background
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Create the start command for backend
    BACKEND_CMD="cd '$SCRIPT_DIR/backend' && source venv/bin/activate && export DATABASE_URL='sqlite:///./iot_system.db' && python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8009 --reload"
    
    # Create the start command for frontend
    FRONTEND_CMD="cd '$SCRIPT_DIR/frontend' && npm run dev"
    
    echo "Opening new terminals for backend and frontend..."
    
    osascript -e "tell application \"Terminal\" to do script \"$BACKEND_CMD\""
    osascript -e "tell application \"Terminal\" to do script \"$FRONTEND_CMD\""
    
    echo "Wait a few seconds for servers to start..."
    sleep 5
    open "http://localhost:5173"
else
    echo "[WARNING] This script is optimized for macOS. On other systems, please refer to the README."
fi

echo "========================================"
echo "  Servers Starting..."
echo "========================================"
echo "Backend:  http://127.0.0.1:8009"
echo "Frontend: http://localhost:5173"
echo ""
