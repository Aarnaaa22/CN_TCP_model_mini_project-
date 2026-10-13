# TCP-Based Reliable File Transfer and Error Recovery Simulation

A real-time network simulation visualizing how Server A and Server B exchange files using the Transmission Control Protocol (TCP). During transmission, selected packets are simulated as lost or corrupted. The system visually demonstrates TCP's error recovery mechanisms—such as acknowledgements (ACKs), timeouts, retransmissions, and SHA-256 checksum integrity verification—to ensure the complete file is successfully reassembled at the destination.

---

## 🚀 Key Features

- **Interactive Retro Simulation Dashboard**: Live animated visualization showing packet transit, packet drop, corruption, and ACK returns between Server A and Server B.
- **Dual-Engine Architecture (Zero-Failure Resiliency)**:
  - **Live Server Mode**: Connects to the Node.js Express + Socket.IO backend for real-time WebSocket event streaming.
  - **Standalone Browser Engine**: When deployed statically or if the backend is offline, the frontend automatically switches to a built-in browser simulation engine. **No "Failed to Fetch" errors!**
- **Dynamic Controls**:
  - Packet size adjustments (MSS slicing)
  - Transmission delay (animation pace)
  - Timeout duration
  - Random loss % and corruption % sliders
- **Deterministic Error Injection**:
  - Preset test scenarios: **Normal Transfer**, **Simulated Packet Loss**, **Simulated Data Corruption**.
  - Custom packet injection: Force specific packet numbers to be `LOST` or `CORRUPTED`.
- **Integrity Verification**: Real-time packet-level SHA-256 checksum computation and final reassembled file verification.

---

## 💻 How to Run Locally

### Option 1: One-Command Startup (Recommended)

From the project root directory:

```bash
# 1. Install all dependencies for both backend and frontend
npm run install:all

# 2. Run both Backend (Port 5000) and Frontend (Port 5173) together
npm run dev
```

Then open your browser at:
👉 **`http://localhost:5173`**

---

### Option 2: Running in Separate Terminals

#### Terminal 1 — Backend:
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

#### Terminal 2 — Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🧪 Run Backend Tests

To verify the TCP simulation engine logic and assertions:
```bash
npm test
```
*(Runs integration tests simulating packet delivery, forced loss, corruption recovery, and checksum verification).*

---

## 🌐 Deployment Guide

### Why Serverless Platforms (like Vercel) Fail with WebSockets:
- Vercel functions are **serverless / ephemeral**: they freeze and terminate immediately after an HTTP response is sent.
- A TCP simulation with Socket.IO requires **long-running timers (`sleep()`) and persistent WebSocket connections** that serverless lambdas do not support.
- **Our Solution**:
  1. The frontend now includes an autonomous **Browser Simulation Engine**. You can deploy the frontend to **Vercel**, **Netlify**, or **GitHub Pages**, and the entire simulation will run smoothly in standalone mode with full animations, checksums, and stats!
  2. For the full Node.js + WebSocket backend, deploy to **Render** or **Railway** (free persistent servers).

### Deploying Frontend to Vercel:
1. Import repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Deploy! It will run seamlessly in standalone mode with no backend crash.

### Deploying Backend to Render (Free Node.js + WebSockets):
1. In Render, click **New +** → **Web Service** → Connect your repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. In your frontend's Vercel settings, add environment variable:
   - `VITE_API_URL` = `https://<your-render-backend-url>.onrender.com`
