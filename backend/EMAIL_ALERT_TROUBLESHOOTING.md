# Email Alert System - Troubleshooting Guide

## Current Status

### ✅ What's Working
- Alert detection and triggering (Temperature 20°C > Threshold 10°C)
- Alert database logging
- Recipient identification
- SMTP authentication (App Password is valid)

### ❌ Current Issue
**Gmail is blocking email delivery** with error `550-5.4.5`

## Root Cause

The Gmail account `sreekar092004@gmail.com` is experiencing one of these issues:

1. **Daily Sending Quota Exceeded** - Gmail limits sending to ~500 emails/day
2. **Suspicious Activity Detected** - Too many rapid email attempts
3. **Temporary Block** - Gmail's spam protection triggered

## Solutions

### Solution 1: Wait and Retry (Recommended)
Gmail blocks are usually temporary (1-24 hours).

**Steps:**
1. Wait 2-4 hours
2. Check backend logs for email status:
   ```bash
   # Look for these messages in backend terminal:
   # ✅ Email Alert SENT successfully
   # ❌ SMTP Error: 550-5.4.5
   ```
3. Alerts will automatically retry when new data comes in

### Solution 2: Use Alternative Email Account
Create a fresh Gmail account for alerts only.

**Steps:**
1. Create new Gmail account (e.g., `ecosync.alerts@gmail.com`)
2. Enable 2-Step Verification
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Update `backend/.env`:
   ```env
   EMAIL_USER=ecosync.alerts@gmail.com
   EMAIL_PASS=your-new-app-password-here
   ```
5. Restart backend server

### Solution 3: Use Different Email Service
Switch to a more reliable SMTP service.

**Options:**
- **SendGrid** - 100 free emails/day
- **Mailgun** - 5,000 free emails/month  
- **AWS SES** - 62,000 free emails/month

## Monitoring Email Status

### Check Backend Logs
The improved email system now shows detailed status:

```
📧 Connecting to Gmail SMTP for user@example.com...
🔐 Authenticating as sreekar092004@gmail.com...
📤 Sending alert email...
✅ Email Alert SENT successfully to user@example.com
```

Or if it fails:
```
❌ SMTP Error: 550-5.4.5 ...
💡 Gmail blocked the email. Possible reasons:
   - Daily sending quota exceeded
   - Suspicious activity detected
   - Try again in a few hours
```

### Check Database
Run this to see email status:
```bash
cd backend
python check_alerts_debug.py
```

Look for `Email Sent: True` or `Email Sent: False`

## Testing Email Functionality

### Test 1: Direct SMTP Test
```bash
cd backend
python test_smtp.py
```

**Expected Output (Success):**
```
✅ SUCCESS! Email sent successfully!
```

**Expected Output (Blocked):**
```
❌ SMTP Error: 550-5.4.5 ...
💡 Gmail blocked the email...
```

### Test 2: Trigger Real Alert
1. Open dashboard at http://localhost:5173
2. Set temperature threshold to 10°C in Settings
3. Wait for next sensor reading (every 3 seconds)
4. Check backend terminal for email status logs

## Current Configuration

**Email Account:** `sreekar092004@gmail.com`
**App Password:** `orzh vstq rnsp gpwi` (configured)
**SMTP Server:** `smtp.gmail.com:587`
**Authentication:** ✅ Working
**Email Delivery:** ❌ Blocked by Gmail (550 error)

## Recommended Action

**For immediate testing:** Wait 2-4 hours and try again

**For production use:** Create dedicated Gmail account for alerts (Solution 2)

## Code Improvements Made

1. ✅ Enhanced error logging with emojis for easy scanning
2. ✅ Added timeout (15 seconds) to prevent hanging
3. ✅ Return status (True/False) for database tracking
4. ✅ Specific error messages for different SMTP errors
5. ✅ Track `email_sent` status in Alert database records
6. ✅ Log success/failure count for multiple recipients

## Next Steps

1. **Wait** for Gmail block to clear (2-4 hours)
2. **Monitor** backend logs for email status
3. **Consider** creating dedicated alert email account
4. **Test** with `python test_smtp.py` before expecting alerts
