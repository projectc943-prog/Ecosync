# How Multi-User Email Alerts Work in Ecosync

## 🎯 **Your Question:**
"If there are 2-3 users with the same location, do they all get email alerts?"

## ✅ **Answer: YES! The system has a "Geofencing" feature**

---

## 📧 **How Email Alerts Are Sent:**

The system sends emails to **3 types of recipients**:

### 1. **Primary User** (Always gets email)
- The user who is currently logged in and viewing the dashboard
- In your case: `mgogula@gitam.in`

### 2. **Admin/Fallback** (From alert settings)
- The email configured in alert settings
- Currently: `mgogula@gitam.in` (same as primary)

### 3. **Nearby Users** (Geofencing - 50km radius)
- **ALL users within 50km of the alert location**
- This is the "Sentinel Broadcast" feature

---

## 🗺️ **Geofencing Logic:**

```
IF alert triggered at location (17.385, 78.487):
    1. Find ALL users in database
    2. Check each user's saved location
    3. Calculate distance from alert location
    4. IF distance <= 50km:
          → Add user to email recipients
```

---

## 👥 **For Multiple Users at Same Location:**

**Scenario:** 3 users all set location to "Doddaballapura"

| User | Email | Location | Distance | Gets Email? |
|------|-------|----------|----------|-------------|
| User 1 | mgogula@gitam.in | Doddaballapura | 0 km | ✅ YES |
| User 2 | skunthal@gitam.in | Doddaballapura | 0 km | ✅ YES |
| User 3 | another@gitam.in | Doddaballapura | 0 km | ✅ YES |

**All 3 users get the same email alert!**

---

## 🔧 **How to Set This Up:**

### Step 1: Other Users Must Register
Each user needs to:
1. Go to http://localhost:5173
2. Click "REQUEST NODE ACCESS"
3. Register with their email
4. **IMPORTANT:** Set their location during registration

### Step 2: Set Location Coordinates
During registration, users must provide:
- Location name: "Doddaballapura"
- Latitude: 17.385 (or similar)
- Longitude: 78.487 (or similar)

### Step 3: System Automatically Detects
When alert triggers:
- System checks ALL users in database
- Finds users within 50km radius
- Sends email to ALL nearby users

---

## 📊 **Current Status:**

**Users in Database:** 1
- Email: `mgogula@gitam.in`
- Location: Doddaballapura
- Coordinates: Not set ⚠️

**Problem:** Location coordinates are not set!

---

## ⚠️ **Why Other Users Don't Get Emails:**

1. **They're not in the database** - They need to register first
2. **Location not set** - Even if registered, they need location coordinates

---

## ✅ **How to Fix:**

### Option 1: Add Users Manually
I can create accounts for the other 2 users with location coordinates.

Tell me:
- Email 1: `____________@gitam.in`
- Email 2: `____________@gitam.in`
- Location: Same as yours (Doddaballapura)

### Option 2: They Register Themselves
1. Each user goes to http://localhost:5173
2. Clicks "REQUEST NODE ACCESS"
3. Fills in details **including location**
4. System automatically includes them in geofencing

---

## 🎯 **Summary:**

**Current:** Only you get emails (1 user in database)

**After adding 2 more users with same location:**
- User 1 (mgogula@gitam.in) → ✅ Gets email
- User 2 (skunthal@gitam.in) → ✅ Gets email  
- User 3 (another@gitam.in) → ✅ Gets email

**All users within 50km get the same alert email automatically!**

---

## 💡 **Want Me to Add the Other Users?**

Just tell me their email addresses and I'll create accounts for them with the same location as yours!
