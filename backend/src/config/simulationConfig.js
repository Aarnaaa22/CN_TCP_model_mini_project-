/**
 * simulationConfig.js
 * 
 * Holds the default settings for the TCP simulation.
 * These can be changed at runtime via the /api/transfer/config endpoint.
 */

const defaultConfig = {
  // Probability that a packet is "lost" during transit (0.0 to 1.0)
  packetLossProbability: 0.15,      // 15%

  // Probability that a packet arrives "corrupted" (0.0 to 1.0)
  packetCorruptionProbability: 0.10, // 10%

  // Delay (in ms) between sending each packet — simulates network latency
  transmissionDelay: 500,           // 500 ms

  // How long the sender waits for an ACK before assuming the packet was lost
  timeoutDuration: 1500,            // 1500 ms

  // Maximum number of retransmission attempts before giving up on a packet
  maxRetries: 5,

  // Maximum packet payload size in bytes
  packetSize: 512,                   // 512 bytes per packet
};

// Live config — the simulation reads from this object at runtime
let currentConfig = { ...defaultConfig };

/**
 * Update the current simulation config with partial values.
 * @param {Object} updates - Key-value pairs to update
 */
function updateConfig(updates) {
  currentConfig = { ...currentConfig, ...updates };
}

/**
 * Reset config back to defaults.
 */
function resetConfig() {
  currentConfig = { ...defaultConfig };
}

/**
 * Get the current active config.
 * @returns {Object}
 */
function getConfig() {
  return { ...currentConfig };
}

module.exports = { getConfig, updateConfig, resetConfig, defaultConfig };
