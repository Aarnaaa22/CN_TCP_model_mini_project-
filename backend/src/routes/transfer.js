/**
 * transfer.js  (Route handlers)
 *
 * REST API endpoints for controlling the TCP file transfer simulation.
 *
 * All endpoints are prefixed with /api/transfer (see server.js).
 */

const express = require('express');
const multer  = require('multer');
const router  = express.Router();

const {
  startTransfer,
  stopTransfer,
  resetTransfer,
  injectError,
  getStatus,
  getPackets,
  getPendingInjections,
} = require('../services/transferService');

const { getConfig, updateConfig, resetConfig } = require('../config/simulationConfig');

// ── Multer: store uploaded files in memory (no disk I/O needed for simulation)
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transfer/start
// Start a new file transfer simulation.
// Body: multipart/form-data with field "file"
// Optional JSON field "errorInjections": [{ packetNumber, errorType }]
// ─────────────────────────────────────────────────────────────────────────────
router.post('/start', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Parse optional manual error injections
    let errorInjections = [];
    if (req.body.errorInjections) {
      try {
        errorInjections = JSON.parse(req.body.errorInjections);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid errorInjections JSON.' });
      }
    }

    // Also include any pre-stored injections from /inject-error calls
    const pending = getPendingInjections();
    errorInjections = [...pending, ...errorInjections];

    const { buffer, originalname, size } = req.file;

    // Respond immediately — the simulation runs asynchronously
    res.json({
      success:     true,
      message:     `Transfer started for "${originalname}"`,
      fileName:    originalname,
      fileSize:    size,
      errorInjections,
    });

    // Start the simulation in the background (don't await — runs async)
    startTransfer(buffer, originalname, errorInjections).catch(err => {
      console.error('[Transfer] Error during transfer:', err.message);
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transfer/stop
// Stop the currently running simulation.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/stop', (req, res) => {
  stopTransfer();
  res.json({ success: true, message: 'Transfer stopped.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transfer/reset
// Reset the simulation state so a new transfer can be started.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/reset', (req, res) => {
  resetTransfer();
  resetConfig();
  res.json({ success: true, message: 'Simulation reset to initial state.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transfer/status
// Get the current simulation status and statistics.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/status', (req, res) => {
  res.json({ success: true, status: getStatus() });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transfer/packets
// Get all packets and their current state.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/packets', (req, res) => {
  res.json({ success: true, packets: getPackets() });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transfer/config
// Get current simulation config.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/config', (req, res) => {
  res.json({ success: true, config: getConfig() });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transfer/config
// Update simulation settings before starting.
//
// Body (JSON):
// {
//   "packetLossProbability":       0.2,
//   "packetCorruptionProbability": 0.1,
//   "transmissionDelay":           300,
//   "timeoutDuration":             1000,
//   "maxRetries":                  5,
//   "packetSize":                  512
// }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/config', (req, res) => {
  const allowed = [
    'packetLossProbability',
    'packetCorruptionProbability',
    'transmissionDelay',
    'timeoutDuration',
    'maxRetries',
    'packetSize',
  ];

  const updates = {};
  allowed.forEach(key => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  updateConfig(updates);
  res.json({ success: true, message: 'Config updated.', config: getConfig() });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transfer/inject-error
// Manually mark a specific packet as LOST or CORRUPTED.
//
// Body (JSON):
// {
//   "packetNumber": 3,
//   "errorType": "LOST"     // or "CORRUPTED"
// }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/inject-error', (req, res) => {
  const { packetNumber, errorType } = req.body;

  if (!packetNumber || !['LOST', 'CORRUPTED'].includes(errorType)) {
    return res.status(400).json({
      success: false,
      message: 'Provide packetNumber (number) and errorType ("LOST" or "CORRUPTED").',
    });
  }

  injectError(Number(packetNumber), errorType);
  res.json({
    success: true,
    message: `Packet ${packetNumber} will be ${errorType}.`,
  });
});

module.exports = router;
