# 🚀 Ecosync Local Development Setup

## Quick Start (Recommended)

### Option 1: Automated Startup (Easiest)
Simply double-click `start_local.bat` in the project root directory.

This will:
- ✅ Configure backend to use local SQLite database
- ✅ Start backend server on port 8009
- ✅ Start frontend server on port 5173
- ✅ Open your browser automatically

### Option 2: Manual Startup

#### Terminal 1 - Backend
```powershell
cd backend
# Use local SQLite instead of remote PostgreSQL
$env:DATABASE_URL="sqlite:///./iot_system.db"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8009 --reload
```

#### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```

Then open: http://localhost:5173

---

## 🔧 First Time Setup

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Git installed

### 1. Install Backend Dependencies
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```powershell
cd frontend
npm install
```

### 3. Run the Project
Use **Option 1** or **Option 2** from Quick Start above.

---

## 🐛 Troubleshooting "Failed to fetch" Error

This error occurs when the frontend can't connect to the backend. Here's how to fix it:

### ✅ Solution 1: Use SQLite for Local Development
The backend is configured to use a remote PostgreSQL database by default, which may not be accessible locally.

**Fix:** Set the environment variable to use local SQLite:
```powershell
$env:DATABASE_URL="sqlite:///./iot_system.db"
```

Or use the `start_local.bat` script which does this automatically.

### ✅ Solution 2: Check Backend is Running
1. Open http://127.0.0.1:8009 in your browser
2. You should see: `{"status":"active","service":"IoT Backend","timestamp":"..."}`
3. If not, check the backend terminal for errors

### ✅ Solution 3: Check Port Configuration
- Backend must run on port **8009** (configured in `frontend/.env`)
- Frontend runs on port **5173** (default Vite port)

### ✅ Solution 4: CORS Issues
If you see CORS errors in browser console:
1. Make sure backend is running on `127.0.0.1:8009`
2. Check `backend/app/main.py` has CORS middleware enabled (it does)

---

## 📁 Project Structure

```
Ecosync/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # Database models
│   │   ├── database.py      # Database configuration
│   │   └── routers/         # API endpoints
│   ├── requirements.txt     # Python dependencies
│   └── iot_system.db        # SQLite database (created on first run)
├── frontend/
│   ├── src/                 # React source code
│   ├── package.json         # Node dependencies
│   └── .env                 # Frontend configuration
└── start_local.bat          # Automated startup script
```

---

## 🔑 Environment Variables

### Backend (.env)
- `DATABASE_URL` - Database connection (use SQLite for local dev)
- `SECRET_KEY` - JWT secret key
- `EMAIL_USER` - Email for alerts
- `GEMINI_API_KEY` - Google Gemini API key

### Frontend (.env)
- `VITE_API_BASE_URL` - Backend API URL (http://localhost:8009)
- `VITE_WS_BASE_URL` - WebSocket URL (ws://localhost:8009)

---

## 🎯 Default Login Credentials

After first startup, an admin user is created:
- **Email:** admin@ecosync.local
- **Password:** admin123

You can create new users via the registration page.

---

## 💡 Tips

1. **Keep both terminals open** - Closing them stops the servers
2. **Auto-reload enabled** - Code changes trigger automatic restart
3. **Check logs** - Terminal output shows errors and requests
4. **Database reset** - Delete `backend/iot_system.db` to start fresh

---

## 🆘 Still Having Issues?

1. Check both terminal windows for error messages
2. Verify Python and Node.js are installed: `python --version` and `node --version`
3. Make sure ports 8009 and 5173 are not in use by other applications
4. Try deleting `backend/iot_system.db` and restarting

---

**Happy Coding! 🌱**
