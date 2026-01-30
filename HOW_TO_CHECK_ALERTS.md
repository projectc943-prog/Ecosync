# How to Check if Alerts Are Working

## Step 1: Open Your Backend Terminal

Look at the terminal window where you ran:
```
$env:DATABASE_URL="sqlite:///./iot_system.db"; python -m uvicorn app.main:app --host 127.0.0.1 --port 8009 --reload
```

## Step 2: What to Look For

### ✅ If Alerts ARE Working, You'll See:

```
================================================================================
🚨 CRITICAL ALERT - THRESHOLD VIOLATION DETECTED 🚨
================================================================================
Device: Sector Explorer (mgogula@gitam.in)
Location: 17.385, 78.4867
Time: 2026-01-30 09:28:00 UTC

VIOLATIONS:
  ⚠️  CRITICAL TEMP: 20.5°C (Limit: 10.0°C)

Recipients: mgogula@gitam.in
Dashboard: http://localhost:5173/dashboard?device=DASHBOARD_mgogula_gitam_in
================================================================================
```

### ⏳ If You Don't See Alerts Yet:

The alert appears every time new sensor data arrives (every 3 seconds) AND temperature > threshold.

**Possible reasons:**
1. Temperature is currently below 10°C (check dashboard)
2. No sensor data is being sent yet (dashboard not open)
3. Need to wait for next reading

## Step 3: Force an Alert (Testing)

### Option A: Open Dashboard
1. Go to http://localhost:5173
2. Login with your account
3. Dashboard will start sending sensor data every 3 seconds
4. Watch backend terminal for alert banner

### Option B: Check Current Data
Run this to see latest temperature:
```bash
cd backend
python check_alerts_debug.py
```

Look for:
- `Temperature: XX.X°C` (should be > 10°C)
- `CRITICAL TEMP` in recent alerts

## Step 4: Verify Alert Settings

Make sure your threshold is set correctly:

1. Open http://localhost:5173
2. Click Settings (gear icon)
3. Check "Max Temp (°C)" = 10
4. Click "SAVE CONFIG"

## Quick Verification Script

Run this to see if alerts are being triggered:

```bash
cd backend
python -c "from app.database import SessionLocal; from app.models import Alert; db = SessionLocal(); alerts = db.query(Alert).order_by(Alert.timestamp.desc()).limit(3).all(); print('Recent Alerts:'); [print(f'  {a.timestamp}: {a.message}') for a in alerts]; db.close()"
```

## What You Should See Right Now

Since your backend has been running for 19+ minutes:

1. **If dashboard is open**: Alerts should be appearing every 3 seconds in backend terminal
2. **If dashboard is closed**: No new sensor data = no new alerts

## To Test Right Now:

1. **Open** http://localhost:5173 in your browser
2. **Login** with your account  
3. **Go to Dashboard** page
4. **Watch backend terminal** - you should see alert banner within 3 seconds

## Expected Result:

Within 3 seconds of opening the dashboard, you'll see the big red alert banner in your backend terminal showing temperature violation.

---

**TL;DR:** 
1. Open dashboard in browser
2. Watch backend terminal
3. Alert appears within 3 seconds
