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

// Store uploaded files in memory (no disk I/O needed for simulation)
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});

// Middleware wrapper to handle Multer upload errors gracefully
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File is too large. Maximum allowed size is 50MB.' });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    next();
  });
};

// POST /api/transfer/start
router.post('/start', handleUpload, async (req, res) => {
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

    // Include any pre-stored injections from /inject-error calls
    const pending = getPendingInjections();
    errorInjections = [...pending, ...errorInjections];

    const { buffer, originalname, size } = req.file;

    // Respond immediately - the simulation runs asynchronously
    res.json({
      success:     true,
      message:     `Transfer started for "${originalname}"`,
      fileName:    originalname,
      fileSize:    size,
      errorInjections,
    });

    // Start simulation in background
    startTransfer(buffer, originalname, errorInjections).catch(err => {
      console.error('[Transfer] Error during transfer:', err.message);
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/transfer/stop
router.post('/stop', (req, res) => {
  stopTransfer();
  res.json({ success: true, message: 'Transfer stopped.' });
});

// POST /api/transfer/reset
router.post('/reset', (req, res) => {
  resetTransfer();
  resetConfig();
  res.json({ success: true, message: 'Simulation reset to initial state.' });
});

// GET /api/transfer/status
router.get('/status', (req, res) => {
  res.json({ success: true, status: getStatus() });
});

// GET /api/transfer/packets
router.get('/packets', (req, res) => {
  res.json({ success: true, packets: getPackets() });
});

// GET /api/transfer/config
router.get('/config', (req, res) => {
  res.json({ success: true, config: getConfig() });
});

// POST /api/transfer/config
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
  
  const { simEvents } = require('../services/transferService');
  simEvents.emit('event', {
    type: 'CONFIG_UPDATED',
    timestamp: Date.now(),
    config: getConfig()
  });

  res.json({ success: true, message: 'Config updated.', config: getConfig() });
});

// POST /api/transfer/inject-error
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
