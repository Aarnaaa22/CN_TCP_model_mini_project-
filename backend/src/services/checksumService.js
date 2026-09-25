/**
 * checksumService.js
 *
 * Provides checksum computation and verification for packets.
 *
 * In real TCP, a 16-bit checksum is used to detect errors.
 * Here we use Node's built-in crypto module to compute a simple SHA-256 hash.
 * This makes it easy to understand: if the hash of received data doesn't
 * match the original hash, the packet is corrupted.
 */

const crypto = require('crypto');

/**
 * Compute a SHA-256 checksum for a given data buffer or string.
 * @param {string|Buffer} data
 * @returns {string} - Hex-encoded checksum
 */
function computeChecksum(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify that the received data matches the expected checksum.
 * @param {string|Buffer} data      - Received data
 * @param {string} expectedChecksum - Original checksum computed by sender
 * @returns {boolean}
 */
function verifyChecksum(data, expectedChecksum) {
  const receivedChecksum = computeChecksum(data);
  return receivedChecksum === expectedChecksum;
}

/**
 * Simulate corruption by flipping a few bits in the data.
 * This produces a "corrupted" version of the payload that will fail checksum.
 * @param {string} base64Data - Original base64-encoded packet data
 * @returns {string} - Corrupted base64 string
 */
function corruptData(base64Data) {
  // Decode → flip a byte → re-encode
  const buf = Buffer.from(base64Data, 'base64');
  if (buf.length > 0) {
    // Flip bits in the first byte to simulate bit error
    buf[0] = buf[0] ^ 0xFF;
  }
  return buf.toString('base64');
}

module.exports = { computeChecksum, verifyChecksum, corruptData };
