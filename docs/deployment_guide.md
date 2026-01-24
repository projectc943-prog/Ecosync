# EcoSync S4 - Deployment Guide

## 1. Prerequisites
- **Node.js** (v18+)
- **NPM** (v9+)
- **Supabase Account**
- **Netlify Account** (optional, but recommended for hosting)

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

## 3. Frontend Deployment (Netlify)

1.  **Connect Repo**: Link this GitHub repository to Netlify.
2.  **Build Settings**:
    -   **Base directory**: `frontend`
    -   **Build command**: `npm run build`
    -   **Publish directory**: `dist`
3.  **Environment Variables**:
    -   Add the following variables in Netlify Site Settings:
        -   `VITE_SUPABASE_URL`: (Your Project URL)
        -   `VITE_SUPABASE_ANON_KEY`: (Your Safe Anon Key)

## 4. Hardware Deployment (ESP32)

1.  **Firmware**: Open `hardware/src/main.cpp` in PlatformIO.
2.  **Config**: Update `WiFiCreds.h` (or main.cpp config section) with your SSID/Password.
3.  **Endpoint**: Set the `serverName` to your Supabase REST endpoint (or Gateway API if using one).
4.  **Flash**: Connect ESP32 and run "Upload".

## 5. Verification

-   Open the Netlify URL.
-   **Login**: Create a new account.
-   **Dashboard**: You should see the Bio-Auth animation and then the Dashboard.
-   **Data**: As your ESP32 runs, data will appear in the "Live Metrics" charts.
