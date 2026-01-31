# EcoSync S4 - Deployment Guide

## 1. Prerequisites
- **Node.js** (v18+)
- **NPM** (v9+)
- **Supabase Account**
- **Vercel Account** (for hosting)

## 2. Infrastructure Setup (Supabase)

1.  **Create Project**: Go to [database.new](https://database.new) and create a new project "EcoSync".
2.  **Database**:
    -   Go to the **SQL Editor**.
    -   Run the setup script (see `supabase/schema.sql` if available, or create table `sensor_data` with columns `id, created_at, temperature, humidity, voc, pressure, particulate_matter, location_lat, location_lng`).
3.  **Authentication**:
    -   Enable **Email/Password** provider in Auth Settings.
    -   Disable "Confirm Email" for faster testing if needed.
4.  **API Keys**:
    -   Go to Project Settings -> API.
    -   Copy `Project URL` and `anon public` key.

## 3. Frontend & Backend Deployment (Vercel)

1.  **Connect Repo**: Link this GitHub repository to Vercel.
2.  **Build Settings**:
    -   Vercel automatically detects Vite (Frontend) and Python (Backend).
    -   Ensure `vercel.json` is present in the root.
3.  **Environment Variables**:
    -   Add the following variables in Vercel Project Settings:
        -   `VITE_SUPABASE_URL`: (Your Project URL)
        -   `VITE_SUPABASE_ANON_KEY`: (Your Safe Anon Key)

## 4. Hardware Deployment (ESP32)

1.  **Firmware**: Open `hardware/src/main.cpp` in PlatformIO.
2.  **Config**: Update `WiFiCreds.h` (or main.cpp config section) with your SSID/Password.
3.  **Endpoint**: Set the `serverName` to your Supabase REST endpoint (or Gateway API if using one).
4.  **Flash**: Connect ESP32 and run "Upload".

## 5. Verification

-   Open the Vercel URL.
-   **Login**: Create a new account.
-   **Dashboard**: You should see the Bio-Auth animation and then the Dashboard.
-   **Data**: As your ESP32 runs, data will appear in the "Live Metrics" charts.
