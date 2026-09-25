/**
 * packetService.js
 *
 * Responsible for:
 * 1. Splitting a file buffer into fixed-size packets
 * 2. Computing checksums for each packet
 * 3. Tracking manual error injection per packet
 */

const { Packet, PACKET_STATES } = require('../models/Packet');
const { computeChecksum }       = require('./checksumService');
const { getConfig }             = require('../config/simulationConfig');

/**
 * Split a file buffer into an array of Packet objects.
 *
 * TCP breaks data into segments of a maximum segment size (MSS).
 * Here we use packetSize from config as our MSS.
 *
 * @param {Buffer} fileBuffer  - Raw file data
 * @param {string} fileName    - Original file name
 * @returns {Packet[]}         - Array of created packets in order
 */
function createPackets(fileBuffer, fileName) {
  const config      = getConfig();
  const chunkSize   = config.packetSize;  // bytes per packet
  const totalBytes  = fileBuffer.length;
  const totalPackets = Math.ceil(totalBytes / chunkSize);
  const packets     = [];

  for (let i = 0; i < totalPackets; i++) {
    const start  = i * chunkSize;
    const end    = Math.min(start + chunkSize, totalBytes);
    const chunk  = fileBuffer.slice(start, end);

    // Encode chunk as base64 so it can be safely transmitted as JSON
    const base64Data = chunk.toString('base64');

    // Compute checksum of the ORIGINAL chunk (used for integrity check)
    const checksum = computeChecksum(base64Data);

    const packet = new Packet(
      i + 1,          // sequenceNumber starts at 1
      base64Data,     // base64 encoded chunk
      checksum,
      chunk.length,
      totalPackets
    );

    packets.push(packet);
  }

  console.log(`[PacketService] File "${fileName}" split into ${totalPackets} packets`);
  return packets;
}

/**
 * Apply manual error injections to specific packets.
 * Called when the user provides forced-error config before starting.
 *
 * @param {Packet[]} packets
 * @param {Array<{packetNumber: number, errorType: 'LOST'|'CORRUPTED'}>} injections
 */
function applyErrorInjections(packets, injections) {
  if (!injections || injections.length === 0) return;

  injections.forEach(({ packetNumber, errorType }) => {
    const packet = packets.find(p => p.packetNumber === packetNumber);
    if (!packet) return;

    if (errorType === 'LOST') {
      packet.forceLost = true;
      console.log(`[PacketService] Packet ${packetNumber} flagged as FORCED LOST`);
    } else if (errorType === 'CORRUPTED') {
      packet.forceCorrupted = true;
      console.log(`[PacketService] Packet ${packetNumber} flagged as FORCED CORRUPTED`);
    }
  });
}

/**
 * Reconstruct the original file from completed packets.
 *
 * TCP reassembly: packets are placed back in sequence-number order,
 * then data is concatenated to form the complete file.
 *
 * @param {Packet[]} packets  - All packets (must all be COMPLETED)
 * @returns {Buffer}          - Reconstructed file as a Buffer
 */
function reassembleFile(packets) {
  // Sort by sequence number to ensure correct order
  const sorted = [...packets].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  // Decode each base64 chunk and concatenate
  const chunks = sorted.map(p => Buffer.from(p.data, 'base64'));
  return Buffer.concat(chunks);
}

module.exports = { createPackets, applyErrorInjections, reassembleFile };
