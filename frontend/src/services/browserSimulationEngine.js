/**
 * browserSimulationEngine.js
 *
 * Full client-side TCP simulation engine.
 *
 * Runs entirely in the browser when the backend is offline, unreachable,
 * or when deployed to static hosts (like Vercel / Netlify / GitHub Pages).
 * Emits identical events to backend Socket.IO so all UI panels, packet grids,
 * network animations, and statistics update smoothly with zero backend crashes!
 */

let activeSimulationAbort = null;

async function computeSha256(buffer) {
  if (window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple checksum if subtle crypto is somehow unavailable
  let hash = 0;
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 5) - hash) + bytes[i];
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

function sleep(ms, abortSignal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Simulation aborted'));
      });
    }
  });
}

export function stopBrowserSimulation() {
  if (activeSimulationAbort) {
    activeSimulationAbort.abort();
    activeSimulationAbort = null;
  }
}

/**
 * Run a complete TCP transfer simulation directly in the browser.
 *
 * @param {File|Blob} file
 * @param {Array} errorInjections - [{ packetNumber, errorType }]
 * @param {Object} config - { transmissionDelay, timeoutDuration, packetLossProbability, packetCorruptionProbability, packetSize, maxRetries }
 * @param {Function} emitEvent - Callback to dispatch simulation events
 */
export async function runBrowserSimulation(file, errorInjections = [], config = {}, emitEvent) {
  // Cancel any existing run
  stopBrowserSimulation();

  const abortController = new AbortController();
  activeSimulationAbort = abortController;
  const signal = abortController.signal;

  const delay = config.transmissionDelay || 1800;
  const timeout = config.timeoutDuration || 2500;
  const lossProb = config.packetLossProbability ?? 0;
  const crptProb = config.packetCorruptionProbability ?? 0;
  const packetSize = config.packetSize || 512;
  const maxRetries = config.maxRetries || 5;

  const arrayBuffer = await file.arrayBuffer();
  const totalBytes = arrayBuffer.byteLength;
  const totalPackets = Math.max(1, Math.ceil(totalBytes / packetSize));
  const fileName = file.name || 'sample.txt';
  const startTime = Date.now();

  const stats = {
    totalPackets,
    successfulPackets: 0,
    lostPackets: 0,
    corruptedPackets: 0,
    retransmissions: 0,
    totalAttempts: 0,
    transferTime: 0,
    originalFileSize: totalBytes,
    reconstructedFileSize: totalBytes,
    checksumVerified: true,
  };

  // Helper emit
  const emit = (type, payload = {}) => {
    emitEvent({
      type,
      timestamp: Date.now(),
      ...payload,
    });
  };

  try {
    // 1. Compute full file checksum
    const fullChecksum = await computeSha256(arrayBuffer);

    // 2. Prepare packets
    const packets = [];
    for (let i = 0; i < totalPackets; i++) {
      const start = i * packetSize;
      const end = Math.min(start + packetSize, totalBytes);
      const chunkBuffer = arrayBuffer.slice(start, end);
      const checksum = await computeSha256(chunkBuffer);

      const packetNumber = i + 1;
      const injection = errorInjections.find(inj => inj.packetNumber === packetNumber);

      packets.push({
        packetNumber,
        sequenceNumber: packetNumber,
        size: chunkBuffer.byteLength,
        checksum,
        forceLost: injection?.errorType === 'LOST',
        forceCorrupted: injection?.errorType === 'CORRUPTED',
        retryCount: 0,
      });
    }

    emit('TRANSFER_STARTED', {
      fileName,
      fileSize: totalBytes,
      totalPackets,
      config: {
        transmissionDelay: delay,
        timeoutDuration: timeout,
        packetLossProbability: lossProb,
        packetCorruptionProbability: crptProb,
        packetSize,
        maxRetries,
      },
    });

    // 3. Process each packet sequentially (TCP Stop-and-Wait / Sliding window simulation)
    for (const pkt of packets) {
      if (signal.aborted) return;

      emit('PACKET_CREATED', {
        packetNumber: pkt.packetNumber,
        sequenceNumber: pkt.sequenceNumber,
        checksum: pkt.checksum,
        size: pkt.size,
        totalPackets,
        message: `Packet ${pkt.packetNumber} created (${pkt.size} bytes)`,
      });

      let delivered = false;
      let isRetry = false;

      while (!delivered) {
        if (signal.aborted) return;

        if (pkt.retryCount >= maxRetries) {
          emit('TRANSFER_FAILED', {
            packetNumber: pkt.packetNumber,
            message: `Packet ${pkt.packetNumber} failed after ${maxRetries} retries. Transfer aborted.`,
          });
          return;
        }

        stats.totalAttempts++;

        if (isRetry) {
          emit('RETRANSMISSION', {
            packetNumber: pkt.packetNumber,
            sequenceNumber: pkt.sequenceNumber,
            retryCount: pkt.retryCount,
            message: `Timeout occurred. Retransmitting packet ${pkt.packetNumber} (attempt #${pkt.retryCount})`,
          });
        } else {
          emit('PACKET_SENT', {
            packetNumber: pkt.packetNumber,
            sequenceNumber: pkt.sequenceNumber,
            checksum: pkt.checksum,
            size: pkt.size,
            retryCount: pkt.retryCount,
            message: `Server A sent packet ${pkt.packetNumber}`,
          });
        }

        emit('PACKET_SENT', {
          packetNumber: pkt.packetNumber,
          sequenceNumber: pkt.sequenceNumber,
          status: 'IN_TRANSIT',
          retryCount: pkt.retryCount,
          message: `Packet ${pkt.packetNumber} is in transit...`,
        });

        await sleep(delay, signal);

        // Determine fate
        let fate = 'OK';
        if (!isRetry) {
          if (pkt.forceLost) fate = 'LOST';
          else if (pkt.forceCorrupted) fate = 'CORRUPTED';
        }

        if (fate === 'OK') {
          const rand = Math.random();
          if (rand < lossProb) fate = 'LOST';
          else if (rand < lossProb + crptProb) fate = 'CORRUPTED';
        }

        if (fate === 'LOST') {
          stats.lostPackets++;
          emit('PACKET_LOST', {
            packetNumber: pkt.packetNumber,
            sequenceNumber: pkt.sequenceNumber,
            retryCount: pkt.retryCount,
            message: `Packet ${pkt.packetNumber} was lost during transmission`,
          });

          emit('TIMEOUT', {
            packetNumber: pkt.packetNumber,
            sequenceNumber: pkt.sequenceNumber,
            retryCount: pkt.retryCount,
            timeoutMs: timeout,
            message: `Waiting ${timeout}ms for ACK from Server B...`,
          });

          await sleep(timeout, signal);
          pkt.retryCount++;
          stats.retransmissions++;
          isRetry = true;
          continue;
        }

        if (fate === 'CORRUPTED') {
          stats.corruptedPackets++;
          // Generate a flipped dummy checksum for visual verification
          const corruptedHash = 'ff' + pkt.checksum.slice(2);

          emit('PACKET_CORRUPTED', {
            packetNumber: pkt.packetNumber,
            sequenceNumber: pkt.sequenceNumber,
            retryCount: pkt.retryCount,
            message: `Packet ${pkt.packetNumber} was corrupted during transmission`,
          });

          emit('CHECKSUM_FAILED', {
            packetNumber: pkt.packetNumber,
            sequenceNumber: pkt.sequenceNumber,
            expectedChecksum: pkt.checksum,
            receivedChecksum: corruptedHash,
            retryCount: pkt.retryCount,
            message: `Server B: Checksum mismatch! Expected ${pkt.checksum.slice(0, 8)}... got ${corruptedHash.slice(0, 8)}... Packet rejected.`,
          });

          await sleep(timeout, signal);
          pkt.retryCount++;
          stats.retransmissions++;
          isRetry = true;
          continue;
        }

        // Received intact
        emit('PACKET_RECEIVED', {
          packetNumber: pkt.packetNumber,
          sequenceNumber: pkt.sequenceNumber,
          checksum: pkt.checksum,
          retryCount: pkt.retryCount,
          message: `Server B received packet ${pkt.packetNumber} intact`,
        });

        const ackNumber = pkt.sequenceNumber + 1;
        emit('ACK_SENT', {
          packetNumber: pkt.packetNumber,
          sequenceNumber: pkt.sequenceNumber,
          ackNumber,
          retryCount: pkt.retryCount,
          message: `Server B sent ACK ${ackNumber} for packet ${pkt.packetNumber}`,
        });

        await sleep(Math.floor(delay / 2), signal);

        emit('ACK_RECEIVED', {
          packetNumber: pkt.packetNumber,
          sequenceNumber: pkt.sequenceNumber,
          ackNumber,
          retryCount: pkt.retryCount,
          message: `Server A received ACK ${ackNumber} — packet ${pkt.packetNumber} confirmed`,
        });

        stats.successfulPackets++;
        delivered = true;
      }
    }

    if (signal.aborted) return;

    stats.transferTime = Date.now() - startTime;

    emit('FILE_REASSEMBLED', {
      checksumVerified: true,
      originalChecksum: fullChecksum,
      reconstructedChecksum: fullChecksum,
      message: 'All packets reassembled. Final checksum verified.',
    });

    emit('TRANSFER_COMPLETED', {
      fileName,
      stats,
      message: `File transfer completed successfully in ${stats.transferTime}ms.`,
    });

  } catch (err) {
    if (signal.aborted || err.message === 'Simulation aborted') {
      console.log('[BrowserSimulation] Stopped by user.');
    } else {
      console.error('[BrowserSimulation] Error:', err);
      emit('TRANSFER_FAILED', {
        message: err.message || 'Simulation encountered an unexpected error.',
      });
    }
  } finally {
    if (activeSimulationAbort === abortController) {
      activeSimulationAbort = null;
    }
  }
}
