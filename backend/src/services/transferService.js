/**
 * transferService.js
 *
 * This is the CORE of the TCP simulation.
 *
 * It manages the entire lifecycle of a file transfer from Server A (sender)
 * to Server B (receiver), including:
 *   - Packet transmission with configurable delays
 *   - Random and manual error injection (loss / corruption)
 *   - Checksum verification at the receiver
 *   - ACK / NACK signalling back to sender
 *   - Timeout detection and retransmission
 *   - File reassembly and final checksum verification
 *
 * How it works (TCP-like, simplified):
 *  1. Server A sends packet N → IN_TRANSIT
 *  2. We simulate transit: does it get lost? corrupted?
 *  3. If lost → no ACK arrives → timeout → retransmit
 *  4. If corrupted → Server B detects checksum mismatch → retransmit
 *  5. If received correctly → Server B sends ACK → Server A marks COMPLETED
 *  6. After all packets are COMPLETED → reassemble → verify → done
 */

const EventEmitter = require('events');
const { PACKET_STATES } = require('../models/Packet');
const { createPackets, applyErrorInjections, reassembleFile } = require('./packetService');
const { computeChecksum, verifyChecksum, corruptData } = require('./checksumService');
const { getConfig } = require('../config/simulationConfig');

// ─── Simulation State ────────────────────────────────────────────────────────

let simulationState = {
  isRunning:      false,
  isPaused:       false,
  packets:        [],             // Array of Packet objects
  fileName:       '',
  originalBuffer: null,           // Raw file buffer from upload
  originalChecksum: '',           // Checksum of the whole file
  startTime:      null,
  endTime:        null,
  errorInjections: [],            // Manual error injections

  // Statistics
  stats: {
    totalPackets:         0,
    successfulPackets:    0,
    lostPackets:          0,
    corruptedPackets:     0,
    retransmissions:      0,
    totalAttempts:        0,
    transferTime:         0,
    originalFileSize:     0,
    reconstructedFileSize:0,
    checksumVerified:     false,
  },
};

// Event emitter — the socket handler subscribes to this to push events
const simEvents = new EventEmitter();

// Reference to the active simulation loop (so we can cancel it)
let activeTimeouts = [];

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Sleep for `ms` milliseconds — used to simulate network delay */
function sleep(ms) {
  return new Promise(resolve => {
    const id = setTimeout(resolve, ms);
    activeTimeouts.push(id);
  });
}

/**
 * Emit a simulation event.
 * All events follow the same shape so the frontend can handle them uniformly.
 */
function emit(type, payload = {}) {
  const event = {
    type,
    timestamp: Date.now(),
    ...payload,
  };
  simEvents.emit('event', event);
}

/**
 * Decide the fate of a packet during transit.
 * Returns 'LOST', 'CORRUPTED', or 'OK'.
 *
 * Priority:
 *  1. Manual injection (forceLost / forceCorrupted) — deterministic demo
 *  2. Random probability — normal simulation
 *
 * Only applies on the FIRST attempt for forced errors (retries go through cleanly).
 */
function decideFate(packet, isRetry) {
  // On retransmissions, forced errors don't repeat (packet eventually succeeds)
  if (!isRetry) {
    if (packet.forceLost)      return 'LOST';
    if (packet.forceCorrupted) return 'CORRUPTED';
  }

  const config = getConfig();
  const rand   = Math.random();

  if (rand < config.packetLossProbability)                                     return 'LOST';
  if (rand < config.packetLossProbability + config.packetCorruptionProbability) return 'CORRUPTED';

  return 'OK';
}

// ─── Core Transmission Logic ─────────────────────────────────────────────────

/**
 * Transmit a single packet from Server A to Server B.
 * Handles loss, corruption, checksum verification, ACK, timeout, and retry.
 *
 * @param {Packet} packet
 * @param {boolean} isRetry  - true if this is a retransmission attempt
 * @returns {Promise<boolean>} - true if delivered successfully
 */
async function transmitPacket(packet, isRetry = false) {
  const config = getConfig();

  // Check if simulation was stopped
  if (!simulationState.isRunning) return false;

  // ── Step 1: Server A sends the packet ──────────────────────────────────────
  packet.setStatus(isRetry ? PACKET_STATES.RETRANSMITTING : PACKET_STATES.SENT);
  simulationState.stats.totalAttempts++;

  if (isRetry) {
    emit('RETRANSMISSION', {
      packetNumber:   packet.packetNumber,
      sequenceNumber: packet.sequenceNumber,
      retryCount:     packet.retryCount,
      message:        `Timeout occurred. Retransmitting packet ${packet.packetNumber} (attempt ${packet.retryCount + 1})`,
    });
  } else {
    emit('PACKET_SENT', {
      packetNumber:   packet.packetNumber,
      sequenceNumber: packet.sequenceNumber,
      checksum:       packet.checksum,
      size:           packet.size,
      retryCount:     packet.retryCount,
      message:        `Server A sent packet ${packet.packetNumber}`,
    });
  }

  // ── Step 2: Packet is now in transit ───────────────────────────────────────
  packet.setStatus(PACKET_STATES.IN_TRANSIT);
  emit('PACKET_SENT', {
    packetNumber:   packet.packetNumber,
    sequenceNumber: packet.sequenceNumber,
    status:         'IN_TRANSIT',
    retryCount:     packet.retryCount,
    message:        `Packet ${packet.packetNumber} is in transit...`,
  });

  // Simulate network delay
  await sleep(config.transmissionDelay);
  if (!simulationState.isRunning) return false;

  // ── Step 3: Determine packet fate during transit ───────────────────────────
  const fate = decideFate(packet, isRetry);

  // ── Step 4a: Packet LOST ───────────────────────────────────────────────────
  if (fate === 'LOST') {
    packet.setStatus(PACKET_STATES.LOST);
    simulationState.stats.lostPackets++;

    emit('PACKET_LOST', {
      packetNumber:   packet.packetNumber,
      sequenceNumber: packet.sequenceNumber,
      retryCount:     packet.retryCount,
      message:        `Packet ${packet.packetNumber} was lost during transmission`,
    });

    // Wait for timeout — in real TCP, sender waits for ACK until timer fires
    emit('TIMEOUT', {
      packetNumber:   packet.packetNumber,
      sequenceNumber: packet.sequenceNumber,
      retryCount:     packet.retryCount,
      timeoutMs:      config.timeoutDuration,
      message:        `Waiting ${config.timeoutDuration}ms for ACK from Server B...`,
    });

    await sleep(config.timeoutDuration);
    if (!simulationState.isRunning) return false;

    // Retry
    packet.retryCount++;
    simulationState.stats.retransmissions++;
    return false; // Signal caller to retry
  }

  // ── Step 4b: Packet CORRUPTED ──────────────────────────────────────────────
  if (fate === 'CORRUPTED') {
    // Simulate data corruption in transit
    const corruptedData = corruptData(packet.data);
    const receivedChecksum = computeChecksum(corruptedData);

    packet.setStatus(PACKET_STATES.CORRUPTED);
    simulationState.stats.corruptedPackets++;

    emit('PACKET_CORRUPTED', {
      packetNumber:   packet.packetNumber,
      sequenceNumber: packet.sequenceNumber,
      retryCount:     packet.retryCount,
      message:        `Packet ${packet.packetNumber} was corrupted during transmission`,
    });

    // Server B performs checksum verification and detects mismatch
    emit('CHECKSUM_FAILED', {
      packetNumber:     packet.packetNumber,
      sequenceNumber:   packet.sequenceNumber,
      expectedChecksum: packet.checksum,
      receivedChecksum: receivedChecksum,
      retryCount:       packet.retryCount,
      message:          `Server B: Checksum mismatch! Expected ${packet.checksum.slice(0,8)}... got ${receivedChecksum.slice(0,8)}... Packet rejected.`,
    });

    // Server B does NOT send ACK → sender detects via timeout
    await sleep(config.timeoutDuration);
    if (!simulationState.isRunning) return false;

    packet.retryCount++;
    simulationState.stats.retransmissions++;
    return false; // Signal caller to retry
  }

  // ── Step 4c: Packet received CORRECTLY ────────────────────────────────────
  packet.setStatus(PACKET_STATES.RECEIVED);

  emit('PACKET_RECEIVED', {
    packetNumber:   packet.packetNumber,
    sequenceNumber: packet.sequenceNumber,
    checksum:       packet.checksum,
    retryCount:     packet.retryCount,
    message:        `Server B received packet ${packet.packetNumber} intact`,
  });

  // Server B verifies checksum (should pass)
  const checksumOk = verifyChecksum(packet.data, packet.checksum);
  if (!checksumOk) {
    // This shouldn't happen in the OK path, but guard anyway
    packet.retryCount++;
    simulationState.stats.retransmissions++;
    return false;
  }

  // Server B sends ACK back to Server A
  // ACK number = sequenceNumber + 1 (TCP convention: next expected byte)
  const ackNumber = packet.sequenceNumber + 1;

  emit('ACK_SENT', {
    packetNumber:   packet.packetNumber,
    sequenceNumber: packet.sequenceNumber,
    ackNumber,
    retryCount:     packet.retryCount,
    message:        `Server B sent ACK ${ackNumber} for packet ${packet.packetNumber}`,
  });

  // Small delay for ACK to travel back
  await sleep(Math.floor(config.transmissionDelay / 2));
  if (!simulationState.isRunning) return false;

  // Server A receives ACK
  emit('ACK_RECEIVED', {
    packetNumber:   packet.packetNumber,
    sequenceNumber: packet.sequenceNumber,
    ackNumber,
    retryCount:     packet.retryCount,
    message:        `Server A received ACK ${ackNumber} — packet ${packet.packetNumber} confirmed`,
  });

  // Mark as fully completed
  packet.setStatus(PACKET_STATES.COMPLETED);
  simulationState.stats.successfulPackets++;

  return true; // Delivered successfully
}

/**
 * Send one packet with automatic retry on failure.
 * This implements TCP's retransmission loop.
 *
 * @param {Packet} packet
 */
async function sendWithRetry(packet) {
  const config   = getConfig();
  let delivered  = false;
  let isRetry    = false;

  emit('PACKET_CREATED', {
    packetNumber:   packet.packetNumber,
    sequenceNumber: packet.sequenceNumber,
    checksum:       packet.checksum,
    size:           packet.size,
    totalPackets:   packet.totalPackets,
    message:        `Packet ${packet.packetNumber} created (${packet.size} bytes)`,
  });

  while (!delivered && simulationState.isRunning) {
    if (packet.retryCount >= config.maxRetries) {
      // Give up — TCP would close the connection here
      packet.setStatus(PACKET_STATES.LOST);
      emit('TRANSFER_FAILED', {
        packetNumber: packet.packetNumber,
        message:      `Packet ${packet.packetNumber} failed after ${config.maxRetries} retries. Transfer aborted.`,
      });
      simulationState.isRunning = false;
      return;
    }

    delivered = await transmitPacket(packet, isRetry);
    isRetry   = true; // All subsequent attempts are retransmissions
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Start a new file transfer simulation.
 *
 * @param {Buffer} fileBuffer     - Raw file content
 * @param {string} fileName       - Original filename
 * @param {Array}  errorInjections - Manual error specs [{packetNumber, errorType}]
 */
async function startTransfer(fileBuffer, fileName, errorInjections = []) {
  if (simulationState.isRunning) {
    throw new Error('A simulation is already running. Stop it first.');
  }

  // Clear previous timeouts
  activeTimeouts.forEach(id => clearTimeout(id));
  activeTimeouts = [];

  // Build packets
  const packets = createPackets(fileBuffer, fileName);

  // Apply manual error injections
  applyErrorInjections(packets, errorInjections);

  // Set up state
  simulationState = {
    isRunning:        true,
    isPaused:         false,
    packets,
    fileName,
    originalBuffer:   fileBuffer,
    originalChecksum: computeChecksum(fileBuffer),
    startTime:        Date.now(),
    endTime:          null,
    errorInjections,
    stats: {
      totalPackets:          packets.length,
      successfulPackets:     0,
      lostPackets:           0,
      corruptedPackets:      0,
      retransmissions:       0,
      totalAttempts:         0,
      transferTime:          0,
      originalFileSize:      fileBuffer.length,
      reconstructedFileSize: 0,
      checksumVerified:      false,
    },
  };

  emit('TRANSFER_STARTED', {
    fileName,
    totalPackets:    packets.length,
    fileSize:        fileBuffer.length,
    originalChecksum: simulationState.originalChecksum,
    config:          getConfig(),
    message:         `Transfer started: ${fileName} → ${packets.length} packets`,
  });

  // ── Send packets one by one (Stop-and-Wait style) ──────────────────────────
  // In real TCP, a sliding window allows multiple packets in flight.
  // Here we use Stop-and-Wait for simplicity and clear visualization.
  for (const packet of packets) {
    if (!simulationState.isRunning) break;
    await sendWithRetry(packet);
  }

  if (!simulationState.isRunning) return; // Stopped externally

  // ── File Reassembly ────────────────────────────────────────────────────────
  // All packets received → reconstruct the file in sequence-number order
  const reconstructed = reassembleFile(packets);
  const reconstructedChecksum = computeChecksum(reconstructed);
  const checksumVerified = reconstructedChecksum === simulationState.originalChecksum;

  simulationState.endTime = Date.now();
  simulationState.isRunning = false;
  simulationState.stats.transferTime = simulationState.endTime - simulationState.startTime;
  simulationState.stats.reconstructedFileSize = reconstructed.length;
  simulationState.stats.checksumVerified = checksumVerified;

  emit('FILE_REASSEMBLED', {
    totalPackets:           packets.length,
    originalChecksum:       simulationState.originalChecksum,
    reconstructedChecksum,
    checksumVerified,
    message: checksumVerified
      ? 'File reassembled successfully. Checksums match ✓'
      : 'File reassembled but checksums do NOT match ✗',
  });

  emit('TRANSFER_COMPLETED', {
    fileName,
    stats: simulationState.stats,
    checksumVerified,
    message: `Transfer complete! ${simulationState.stats.successfulPackets}/${simulationState.stats.totalPackets} packets delivered in ${simulationState.stats.transferTime}ms`,
  });
}

/**
 * Stop the currently running simulation immediately.
 */
function stopTransfer() {
  simulationState.isRunning = false;
  activeTimeouts.forEach(id => clearTimeout(id));
  activeTimeouts = [];
  emit('TRANSFER_FAILED', { message: 'Transfer stopped by user.' });
}

/**
 * Reset all simulation state (call after stop or completion).
 */
function resetTransfer() {
  simulationState = {
    isRunning:        false,
    isPaused:         false,
    packets:          [],
    fileName:         '',
    originalBuffer:   null,
    originalChecksum: '',
    startTime:        null,
    endTime:          null,
    errorInjections:  [],
    stats: {
      totalPackets: 0, successfulPackets: 0, lostPackets: 0,
      corruptedPackets: 0, retransmissions: 0, totalAttempts: 0,
      transferTime: 0, originalFileSize: 0, reconstructedFileSize: 0,
      checksumVerified: false,
    },
  };
  activeTimeouts.forEach(id => clearTimeout(id));
  activeTimeouts = [];
}

/**
 * Store error injections before the transfer is started.
 * Used by POST /api/transfer/inject-error endpoint.
 */
function injectError(packetNumber, errorType) {
  // If simulation is already running, apply immediately to the packet
  if (simulationState.isRunning) {
    const packet = simulationState.packets.find(p => p.packetNumber === packetNumber);
    if (packet && packet.status === PACKET_STATES.CREATED) {
      if (errorType === 'LOST')      packet.forceLost      = true;
      if (errorType === 'CORRUPTED') packet.forceCorrupted = true;
    }
  } else {
    // Store for when transfer starts
    const existing = simulationState.errorInjections.find(e => e.packetNumber === packetNumber);
    if (existing) {
      existing.errorType = errorType;
    } else {
      simulationState.errorInjections.push({ packetNumber, errorType });
    }
  }
}

/**
 * Get current transfer status and stats.
 */
function getStatus() {
  return {
    isRunning:       simulationState.isRunning,
    fileName:        simulationState.fileName,
    startTime:       simulationState.startTime,
    endTime:         simulationState.endTime,
    stats:           simulationState.stats,
    errorInjections: simulationState.errorInjections,
  };
}

/**
 * Get all packets and their current states.
 */
function getPackets() {
  return simulationState.packets.map(p => p.toJSON());
}

/**
 * Get pending error injections (before transfer starts).
 */
function getPendingInjections() {
  return simulationState.errorInjections;
}

module.exports = {
  simEvents,
  startTransfer,
  stopTransfer,
  resetTransfer,
  injectError,
  getStatus,
  getPackets,
  getPendingInjections,
};
