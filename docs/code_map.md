# Codebase Structure

## Root Directory
-   `DISCLAIMER.md`: Project usage warnings.
-   `docs/`: Technical documentation (deployment, implementation, features).
-   `frontend/`: The main React Application.
-   `hardware/`: ESP32 Firmware/Code.

## Frontend (`/frontend`)
The application is built with React (Vite) + TailwindCSS.

### `src/`
-   **`assets/`**: Static images (backgrounds, logos).
-   **`components/`**:
    -   `dashboard/`:
        -   `DashboardLayout.jsx`: Main wrapper (Sidebar + Content).
        -   `ProView.jsx`: Cloud-connected dashboard components.
        -   `LiteView.jsx`: Serial-connected offline dashboard.
        -   `Analytics.jsx`: Historical data charts.
    -   `common/`: Reusable UI buttons, cards, inputs.
-   **`contexts/`**:
    -   `AuthContext.jsx`: Handles user sessions (Login/Signup/Logout).
-   **`pages/`**:
    -   `LoginPage.jsx`: The Bio-Auth entry point.
    -   `LandingPage.jsx`: Public marketing page.
-   **`lib/`**:
    -   `supabase.js`: Supabase Client configuration.

## Hardware (`/hardware`)
-   `src/main.cpp`: Main Arduino/PlatformIO loop.
-   `lib/`: Sensor drivers.
