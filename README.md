# TCP-Based Reliable File Transfer and Error Recovery Simulation

A real-time network simulation visualizing how Server A and Server B exchange files using the Transmission Control Protocol (TCP). During transmission, selected packets are simulated as lost or corrupted. The system visually demonstrates TCP's error recovery mechanisms—such as acknowledgements (ACKs), timeouts, and retransmissions—to ensure the complete file is successfully reassembled at the destination.

## 🚀 Features
- **Real-Time Visualization**: An interactive React-based dashboard showcasing packets moving across a network.
- **Dynamic Configuration**: Adjust Packet Size, Transmission Delay, Timeout Duration, Packet Loss %, and Corruption % on the fly.
- **Error Injections**: Manually force specific packets to be LOST or CORRUPTED before or during the simulation.
- **Vercel Serverless Ready**: Completely stateless WebSocket architecture optimized to run as a single Vercel deployment (Monorepo setup).

## 🛠 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO.
- **Deployment**: Configured out-of-the-box for Vercel Serverless Functions + Vercel WebSockets.

---

## 💻 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/Slora123/CN_mini_project.git
cd CN_mini_project
```

### 2. Start the Backend
```bash
cd backend
npm install
npm run dev
```
The backend will run on `http://localhost:5000`.

### 3. Start the Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`. Open this URL in your browser.

---

## 🌐 Deploying to Vercel

This repository is configured as a Monorepo for Vercel. 
You can host **both** the frontend and the backend within the same Vercel project seamlessly.

1. Import the repository into Vercel.
2. Ensure the **Framework Preset** is set to `Vite`.
3. Set the **Root Directory** to `frontend`.
4. In the Vercel **Environment Variables**, add:
   - `VITE_API_URL` = `/api`
5. Vercel will automatically detect the `backend/vercel.json` and route all backend WebSocket and HTTP traffic appropriately using Serverless Functions.

*(Note: Ensure your Vercel project has WebSockets enabled if applicable, as it leverages the Vercel Functions WebSocket beta).*

---

## 📁 Architecture

- **`frontend/`**: Contains the Vite + React source code. State is managed via `useReducer` and interacts strictly via WebSocket events for accurate real-time feedback.
- **`backend/`**: Contains the Node.js + Socket.IO server. 
  - Uses `Buffer` logic to slice files into packets and reconstruct them.
  - Implements SHA-256 for checksum validation.
  - Simulation state binds securely to the active WebSocket session ensuring compatibility across ephemeral Serverless architectures.
