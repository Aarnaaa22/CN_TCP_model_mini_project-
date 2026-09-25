/**
 * Packet.js
 *
 * Defines the Packet model used throughout the TCP simulation.
 *
 * In real TCP, data is broken into "segments". Here, we call them "packets"
 * for simplicity. Each packet carries a chunk of file data, a sequence number
 * (to ensure ordering), and a checksum (to verify integrity).
 */

// All possible states a packet can be in during simulation
const PACKET_STATES = {
  CREATED:        'CREATED',       // Packet has been created by the sender
  SENT:           'SENT',          // Packet has been sent by Server A
  IN_TRANSIT:     'IN_TRANSIT',    // Packet is travelling through the network
  LOST:           'LOST',          // Packet was dropped (simulated loss)
  CORRUPTED:      'CORRUPTED',     // Packet arrived but data was corrupted
  RECEIVED:       'RECEIVED',      // Packet arrived intact at Server B
  ACKED:          'ACKED',         // Server B sent an ACK; Server A confirmed
  TIMEOUT:        'TIMEOUT',       // No ACK received within timeout window
  RETRANSMITTING: 'RETRANSMITTING',// Sender is retransmitting this packet
  COMPLETED:      'COMPLETED',     // Packet fully delivered and acknowledged
};

class Packet {
  /**
   * @param {number} sequenceNumber  - Position of this packet in the stream
   * @param {string|Buffer} data     - The actual chunk of file data (as base64 string)
   * @param {string} checksum        - CRC/hash of the original data
   * @param {number} size            - Byte size of the data chunk
   * @param {number} totalPackets    - Total number of packets in this transfer
   */
  constructor(sequenceNumber, data, checksum, size, totalPackets) {
    this.sequenceNumber = sequenceNumber;    // e.g. 1, 2, 3 ...
    this.packetNumber   = sequenceNumber;    // Alias for readability in UI
    this.data           = data;              // Base64-encoded chunk of file
    this.checksum       = checksum;          // Expected checksum (SHA-256 hash)
    this.size           = size;              // Byte size of this chunk
    this.totalPackets   = totalPackets;      // Total packets in the file transfer
    this.status         = PACKET_STATES.CREATED;
    this.retryCount     = 0;                 // How many times it has been retransmitted
    this.createdAt      = Date.now();
    this.sentAt         = null;
    this.receivedAt     = null;
    this.ackedAt        = null;

    // Flags set by error injection or random simulation
    this.forceLost      = false;             // Force this packet to be lost
    this.forceCorrupted = false;             // Force this packet to be corrupted
  }

  /**
   * Update packet status and record timestamps.
   * @param {string} newStatus
   */
  setStatus(newStatus) {
    this.status = newStatus;

    if (newStatus === PACKET_STATES.SENT || newStatus === PACKET_STATES.RETRANSMITTING) {
      this.sentAt = Date.now();
    }
    if (newStatus === PACKET_STATES.RECEIVED) {
      this.receivedAt = Date.now();
    }
    if (newStatus === PACKET_STATES.ACKED || newStatus === PACKET_STATES.COMPLETED) {
      this.ackedAt = Date.now();
    }
  }

  /**
   * Returns a clean summary of the packet for the frontend.
   */
  toJSON() {
    return {
      sequenceNumber: this.sequenceNumber,
      packetNumber:   this.packetNumber,
      size:           this.size,
      checksum:       this.checksum,
      status:         this.status,
      retryCount:     this.retryCount,
      createdAt:      this.createdAt,
      sentAt:         this.sentAt,
      receivedAt:     this.receivedAt,
      ackedAt:        this.ackedAt,
      forceLost:      this.forceLost,
      forceCorrupted: this.forceCorrupted,
      // We do NOT send raw data to keep the event payload small
    };
  }
}

module.exports = { Packet, PACKET_STATES };
