/**
 * server.js
 *
 * Entry point for the TCP File Transfer Simulation backend.
 *
 * Sets up:
 *  - Express for REST API
 *  - Socket.IO for real-time event streaming to the frontend
 *  - CORS so the frontend (running on a different port) can communicate
 *  - Multer for file uploads
 */

const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');

const transferRoutes   = require('./src/routes/transfer');
const { initSocketHandler } = require('./src/socket/socketHandler');

const app    = express();
const server = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
// Attach Socket.IO to the same HTTP server.
// CORS is open for development — restrict to your frontend URL in production.
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/transfer', transferRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'TCP File Transfer Simulation Backend is running 🚀',
    version: '1.0.0',
    endpoints: {
      'POST /api/transfer/start':        'Start a file transfer simulation',
      'POST /api/transfer/stop':         'Stop the running simulation',
      'POST /api/transfer/reset':        'Reset simulation state',
      'GET  /api/transfer/status':       'Get current status and stats',
      'GET  /api/transfer/packets':      'Get all packet states',
      'GET  /api/transfer/config':       'Get current simulation config',
      'POST /api/transfer/config':       'Update simulation config',
      'POST /api/transfer/inject-error': 'Manually inject a packet error',
    },
    websocket: 'Connect to this server via Socket.IO and listen for "simulation_event"',
  });
});

// ── Socket.IO Handlers ────────────────────────────────────────────────────────
initSocketHandler(io);

// ── Start Server (Local/Render) or Export (Vercel) ──────────────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   TCP File Transfer Simulation — Backend               ║');
    console.log(`║   Server running at http://localhost:${PORT}              ║`);
    console.log('║   Socket.IO ready for real-time events                 ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
  });
}

module.exports = server;
