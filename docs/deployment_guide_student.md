# Student Deployment Guide: EcoSync S4 (Zero Cost, No Credit Card)

This guide shows you how to deploy the entire project for free using **Hugging Face Spaces** (Backend) and **Vercel** (Frontend). Neither platform requires a credit card.

## 1. Backend Deployment (Hugging Face Spaces)
*Best for: Docker/Python apps. Generous free tier.*

1.  **Sign Up**: Go to [huggingface.co](https://huggingface.co/) and create an account.
2.  **Create Space**:
    *   Click **New Space**.
    *   **Space Name**: `ecosync-backend` (or similar).
    *   **License**: `MIT`.
    *   **SDK**: Select **Docker**.
    *   **Template**: `Blank`.
    *   **Visibility**: `Public` or `Private`.
    *   Click **Create Space**.
3.  **Upload Code**:
    *   You have two options:
        *   **Option A (Easy)**: Use the "Files" tab on Hugging Face and upload your `backend/` folder contents + `Dockerfile` manually (or via git command line shown on screen).
        *   **Option B (Sync with GitHub)**: In "Settings" -> "Git/Docker", connect your GitHub repository.
4.  **Important Docker Config**:
    *   Ensure your `Dockerfile` is at the **Root** of the Space.
    *   If you synced your whole repo, the `Dockerfile` is inside `backend/`. You may need to change the "Docker Root Directory" in Settings to `backend/`.
5.  **Get URL**:
    *   Once built (takes ~2 mins), your API URL will be: `https://YOUR_USERNAME-ecosync-backend.hf.space`.
    *   **Copy this URL**.

## 2. Frontend Deployment (Vercel)
*Best for: React/Vite apps. Easiest setup.*

1.  **Sign Up**: Go to [vercel.com](https://vercel.com/) and login with authorized GitHub.
2.  **Add New Project**:
    *   Click **Add New...** -> **Project**.
    *   **Import** your `EcoSync_S4_Project` repository from GitHub.
3.  **Configure Project**:
    *   **Framework Preset**: It should auto-detect `Vite`.
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Environment Variables**:
        *   Key: `VITE_API_BASE_URL`
        *   Value: `https://YOUR_USERNAME-ecosync-backend.hf.space` (The URL from Step 1).
    *   Click **Deploy**.
4.  **Done**:
    *   Vercel will give you a live URL (e.g., `https://ecosync-s4.vercel.app`).

## 3. Database Note (Important)
*   The system uses **SQLite**, which is a file (`iot_system.db`).
*   On free platforms like Hugging Face, the file system is **ephemeral**. This means if the server restarts (which happens after 48h of inactivity or new deploys), **the database resets**.
*   **For Demos**: This is perfect. Just create a new account before your presentation.
*   **For Persistence**: If you need permanent data, consider connecting a free **Neon (Postgres)** database later.

## Troubleshooting
*   **Backend 404?**: Make sure `VITE_API_BASE_URL` has no trailing slash (e.g., `...hf.space`, not `...hf.space/`).
*   **Build Fail?**: Check that you selected `frontend` as the Root Directory in Vercel.
