/**
 * socketHandler.js
 *
 * Manages the Socket.IO connection between the backend and the frontend.
 *
 * When the frontend connects, it subscribes to all simulation events.
 * Every event emitted by transferService is forwarded to all connected clients
 * in real time — this is what drives the live visualization on the frontend.
 */

const { 
  simEvents, 
  startTransfer, 
  stopTransfer, 
  resetTransfer, 
  injectError 
} = require('../services/transferService');
const { updateConfig } = require('../config/simulationConfig');

/**
 * Attach Socket.IO handlers to the server.
 * @param {import('socket.io').Server} io - Socket.IO server instance
 */
function initSocketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Forward every simulation event to this client
    const forwardEvent = (event) => {
      socket.emit('simulation_event', event);
    };

    // Subscribe to simulation events
    simEvents.on('event', forwardEvent);

    // Event Handlers
    socket.on('start_transfer', (data) => {
      if (!data) return;
      const { fileBuffer, fileName, errorInjections } = data;
      startTransfer(Buffer.from(fileBuffer), fileName || 'file.txt', errorInjections || []).catch(err => {
        console.error('[Transfer] Error during transfer:', err.message);
      });
    });

    socket.on('stop_transfer', () => {
      stopTransfer();
    });
    socket.on('stop_simulation', () => {
      stopTransfer();
    });

    socket.on('reset_transfer', () => {
      resetTransfer();
    });
    socket.on('reset_simulation', () => {
      resetTransfer();
    });

    socket.on('update_config', (data) => {
      if (!data) return;
      if (typeof data === 'object') {
        updateConfig(data);
      }
    });

    socket.on('inject_error', (data) => {
      if (!data) return;
      const { packetNumber, errorType } = data;
      injectError(packetNumber, errorType);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      // Clean up listener to prevent memory leaks
      simEvents.off('event', forwardEvent);
    });
  });
}

module.exports = { initSocketHandler };
