---
description: How to deploy the TaskApp to Vercel and build for mobile
---

# Deployment Guide

## 1. Web Deployment (Vercel)

The easiest way to deploy the web version is using Vercel.

### Prerequisites
- A GitHub repository with your code.
- A Vercel account.
- A Supabase project.

### Steps
1.  **Push to GitHub**: Ensure your latest code is pushed to your repository.
2.  **Import to Vercel**:
    - Go to [vercel.com/new](https://vercel.com/new).
    - Select your repository.
3.  **Configure Environment Variables**:
    - Add the following variables from your `.env.local`:
        - `NEXT_PUBLIC_SUPABASE_URL`
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4.  **Deploy**: Click "Deploy".

## 2. Mobile Build (Capacitor)

To build the native Android and iOS apps.

### Prerequisites
- Android Studio (for Android).
- Xcode (for iOS, Mac only).

### Steps
1.  **Build the Web App**:
    ```bash
    npm run build
    ```
    *Note: This uses `next export` (via `output: 'export'` or `webDir: 'out'`) to generate static files.*

2.  **Sync with Capacitor**:
    ```bash
    npx cap sync
    ```
    *This copies the `out` folder to the native projects.*

3.  **Run on Device/Emulator**:
    - **Android**:
        ```bash
        npx cap open android
        ```
        *Wait for Android Studio to open, then click the "Run" (Play) button.*
    - **iOS**:
        ```bash
        npx cap open ios
        ```
        *Wait for Xcode to open, select your simulator/device, and click "Run".*

## Troubleshooting

### "Next.js Server Actions" on Mobile
Since the mobile app runs as a static site, Next.js Server Actions (used in `src/app/actions`) will **not work** directly if they rely on a Node.js server environment.
- **Solution**: For a fully offline-capable mobile app, you should interact with Supabase directly from the client (using `@supabase/supabase-js`) or ensure your API routes are deployed to a public URL (like your Vercel deployment) and your mobile app points to that URL.

### Assets Not Loading
Ensure `images: { unoptimized: true }` is in `next.config.ts` (already configured).
