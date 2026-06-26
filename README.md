# LG webOS Smart TV Remote

A modern, offline-capable Progressive Web App (PWA) to control your LG webOS Smart TV from your phone or PC over the local network. 

## Features

- **No Internet Required:** Works completely offline on your local network (LAN) as a PWA. Add it to your home screen!
- **PIN Pairing:** Securely pairs with your TV without needing to enable "LG Connect Apps" unauthenticated mode.
- **Full Mouse & Keyboard:** Features a precise touchpad and intercepts your physical PC/Phone keyboard for typing directly on your TV.
- **Volume & Media:** Draggable volume slider, media transport controls, and channel switching.
- **App Launcher:** Automatically fetches all installed apps on your TV and displays them in a scrollable, glassmorphic UI.

## Getting Started

1. **Install Dependencies**
   Run `npm install` in both `frontend/` and `backend/` directories.

2. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm run dev -- --host
   ```
   *Note: Using `--host` exposes the web app on your local IP address so you can open it on your phone.*

4. **Pair your TV**
   - Open the web app.
   - Wait for your LG TV to be discovered automatically, or enter its IP address manually.
   - Click your TV. Your TV will display a PIN code.
   - Enter the PIN code into the web app.

Enjoy your new remote!
