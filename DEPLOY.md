# Deployment Guide

The easiest way to host this for free is **Vercel**. It is optimized for the tech stack we used (Vite + React).

## Option 1: Zero-Config Deploy (Easiest)
You can deploy directly from your terminal if you have the Vercel CLI.

1.  **Run this command in your terminal:**
    ```bash
    npx vercel
    ```
2.  **Follow the prompts:**
    -   Log in with GitHub/Email.
    -   Set up and deploy? **Yes** (`Y`)
    -   Which scope? **(Select your account)**
    -   Link to existing project? **No** (`N`)
    -   Project Name? **cafe-games** (or press Enter)
    -   In which directory? **./** (Press Enter)
    -   Want to modify settings? **No** (`N`)

3.  Wait ~1 minute. It will give you a live URL (e.g., `https://cafe-games.vercel.app`).

## Option 2: Deploy via GitHub (Recommended for updates)
If you pushed this code to GitHub:

1.  Go to [Vercel.com](https://vercel.com) and sign up.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your **cafe-games** repository.
4.  Click **Deploy**.

## Post-Deployment
-   **Print QR Codes**: Generate a QR code pointing to your new Vercel URL and place it on tables.
-   **Staff Access**: Share the `/staff` URL (e.g., `https://cafe-games.vercel.app/staff`) only with your waiters.
