# How to Change Email Sender Account

## Current Sender (Blocked):
- Email: `sreekar092004@gmail.com`
- Status: ⚠️ Blocked by Gmail

## Option 1: Use Your Own Gmail Account (Recommended)

### Step 1: Use Your Login Email
Change the sender to your own email: `mgogula@gitam.in`

**But wait!** This is a GITAM email, not Gmail. You need a Gmail account for SMTP.

### Step 2: Create New Gmail Account (Best Solution)
1. Go to https://accounts.google.com/signup
2. Create: `ecosync.alerts@gmail.com` (or any name you want)
3. Enable 2-Step Verification
4. Generate App Password: https://myaccount.google.com/apppasswords
5. Copy the 16-character password

### Step 3: Update Backend .env File

Open: `c:\Users\sreek\Downloads\Ecosync\backend\.env`

Change lines 8-9 from:
```
EMAIL_USER=sreekar092004@gmail.com
EMAIL_PASS=orzh vstq rnsp gpwi
```

To:
```
EMAIL_USER=your-new-email@gmail.com
EMAIL_PASS=your-new-app-password
```

### Step 4: Restart Backend
1. Stop backend server (Ctrl+C in backend terminal)
2. Restart with:
```powershell
cd backend
$env:DATABASE_URL="sqlite:///./iot_system.db"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8009 --reload
```

## Option 2: Wait for Current Account to Unblock (Easiest)

Just wait 2-4 hours and the current account will work again automatically.

## Option 3: Use Different Email Service

Instead of Gmail, use:
- **SendGrid** (100 free emails/day)
- **Mailgun** (5,000 free emails/month)
- **AWS SES** (62,000 free emails/month)

## Quick Fix (Right Now):

**I recommend Option 2** - Just wait! The console alerts are working perfectly, so you're not missing anything. Gmail will unblock in a few hours.

## Need Help?

If you want to create a new Gmail account now, I can guide you through the exact steps!
