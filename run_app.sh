#!/bin/bash
echo "🚀 Starting EcoSync Pro System..."

# 1. Kill potential conflicts on backend port
echo "🧹 Cleaning up old processes..."
lsof -t -i :8000 | xargs kill -9 2>/dev/null

# 2. Start Backend
echo "🔙 Starting Backend..."
cd backend
# Use nohup to keep it running if terminal closes, or just background it
python3 start.py &
BACKEND_PID=$!
cd ..

# 3. Wait for Backend
echo "⏳ Waiting for Backend to be ready..."
sleep 5

# 4. Start Frontend (if not already running)
if ! lsof -i :5173 > /dev/null; then
    echo "🎨 Starting Frontend..."
    cd frontend
    npm run dev &
    cd ..
else
    echo "✅ Frontend already running on port 5173"
fi

# 5. Open Dashboard
echo "🌐 Opening Dashboard..."
open "http://localhost:5173/dashboard"

echo "---------------------------------------------------"
echo "✅ System is Live!"
echo "👉 Backend available at: http://localhost:8000"
echo "👉 Dashboard available at: http://localhost:5173"
echo "---------------------------------------------------"
echo "Press Ctrl+C to stop the backend."

# Keep script running to maintain backend process
wait $BACKEND_PID
