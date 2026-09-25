/**
 * simulationStore.js
 *
 * Central state reducer for the simulation.
 * All Socket.IO events flow through here → components read from this state.
 *
 * Using React useReducer pattern — no external library needed.
 */

export const SIMULATION_STATUS = {
  IDLE:      'IDLE',
  RUNNING:   'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED:    'FAILED',
};

export const initialState = {
  status:      SIMULATION_STATUS.IDLE,
  fileName:    '',
  fileSize:    0,
  totalPackets: 0,

  // Map of packetNumber → packet state object
  packets: {},

  // Chronological list of all events for the log
  events: [],

  // Latest checksum event (for ChecksumPanel)
  lastChecksumEvent: null,

  // Latest active packet in network diagram
  activePacket: null,    // { packetNumber, state: 'traveling'|'lost'|'corrupted'|'ack' }

  // Final statistics
  stats: null,

  // Explanation text shown in SimulationExplanation panel
  explanation: 'Upload a file and press Start Transfer to begin the simulation.',

  // Completion data
  completion: null,
};

export function simulationReducer(state, action) {
  const { event } = action;
  const pNum = event?.packetNumber;

  // Helper: merge fields into a specific packet
  function updatePacket(updates) {
    if (!pNum) return state.packets;
    return {
      ...state.packets,
      [pNum]: { ...(state.packets[pNum] || {}), ...updates, packetNumber: pNum },
    };
  }

  // Helper: append event to log
  function appendEvent(label, color = 'cyan') {
    return [
      ...state.events,
      {
        id:        Date.now() + Math.random(),
        timestamp: event.timestamp || Date.now(),
        label,
        color,
        raw:       event,
      },
    ];
  }

  switch (event.type) {

    case 'TRANSFER_STARTED':
      return {
        ...initialState,
        status:      SIMULATION_STATUS.RUNNING,
        fileName:    event.fileName || '',
        fileSize:    event.fileSize || 0,
        totalPackets: event.totalPackets || 0,
        config:      event.config || null,
        events:      appendEvent(`Transfer started — ${event.totalPackets} packets`, 'cyan'),
        explanation: `Server A is preparing to send "${event.fileName}" to Server B. The file has been split into ${event.totalPackets} packets.`,
      };

    case 'CONFIG_UPDATED':
      return {
        ...state,
        config: { ...state.config, ...event.config }
      };

    case 'PACKET_CREATED':
      return {
        ...state,
        packets: updatePacket({ status: 'CREATED', size: event.size, checksum: event.checksum, retryCount: 0 }),
        events:  appendEvent(`Packet ${pNum} created (${event.size} B)`, 'slate'),
      };

    case 'PACKET_SENT':
      if (event.status === 'IN_TRANSIT') {
        return {
          ...state,
          packets:      updatePacket({ status: 'IN_TRANSIT' }),
          activePacket: { packetNumber: pNum, state: 'traveling', retryCount: event.retryCount },
          events:       appendEvent(`Packet ${pNum} → in transit`, 'blue'),
          explanation:  `Packet ${pNum} is travelling from Server A through the network toward Server B.`,
        };
      }
      return {
        ...state,
        packets: updatePacket({ status: 'SENT', retryCount: event.retryCount }),
        events:  appendEvent(`Packet ${pNum} sent by Server A`, 'blue'),
      };

    case 'PACKET_LOST':
      return {
        ...state,
        packets:      updatePacket({ status: 'LOST', retryCount: event.retryCount }),
        activePacket: { packetNumber: pNum, state: 'lost' },
        events:       appendEvent(`Packet ${pNum} LOST in transit`, 'red'),
        explanation:  `Packet ${pNum} was lost in the network. Server B never received it, so no ACK was sent back to Server A.`,
      };

    case 'PACKET_CORRUPTED':
      return {
        ...state,
        packets:      updatePacket({ status: 'CORRUPTED', retryCount: event.retryCount }),
        activePacket: { packetNumber: pNum, state: 'corrupted' },
        events:       appendEvent(`Packet ${pNum} CORRUPTED during transit`, 'amber'),
        explanation:  `Packet ${pNum} arrived at Server B but its data was corrupted in transit. Server B will verify the checksum and reject it.`,
      };

    case 'CHECKSUM_FAILED':
      return {
        ...state,
        lastChecksumEvent: event,
        events: appendEvent(`Checksum FAILED for Packet ${pNum} — expected ${event.expectedChecksum?.slice(0,8)}…`, 'red'),
        explanation: `Server B detected a checksum mismatch for Packet ${pNum}. The received data doesn't match the original. TCP will retransmit.`,
      };

    case 'PACKET_RECEIVED':
      return {
        ...state,
        packets:      updatePacket({ status: 'RECEIVED' }),
        activePacket: { packetNumber: pNum, state: 'received' },
        events:       appendEvent(`Packet ${pNum} received intact by Server B`, 'green'),
        lastChecksumEvent: {
          type: 'CHECKSUM_OK',
          packetNumber: pNum,
          checksum: event.checksum,
        },
        explanation:  `Packet ${pNum} arrived at Server B successfully. Checksum verified ✓. Server B will now send an ACK.`,
      };

    case 'ACK_SENT':
      return {
        ...state,
        packets:      updatePacket({ status: 'ACKED' }),
        activePacket: { packetNumber: pNum, state: 'ack', ackNumber: event.ackNumber },
        events:       appendEvent(`ACK ${event.ackNumber} sent by Server B for Packet ${pNum}`, 'green'),
        explanation:  `Server B sent ACK ${event.ackNumber} to Server A, confirming Packet ${pNum} was received correctly.`,
      };

    case 'ACK_RECEIVED':
      return {
        ...state,
        packets: updatePacket({ status: 'COMPLETED' }),
        events:  appendEvent(`ACK ${event.ackNumber} received by Server A — Packet ${pNum} confirmed`, 'green'),
        explanation: `Server A received ACK ${event.ackNumber}. Packet ${pNum} is fully acknowledged. Moving to next packet.`,
      };

    case 'TIMEOUT':
      return {
        ...state,
        packets: updatePacket({ status: 'TIMEOUT' }),
        events:  appendEvent(`TIMEOUT waiting for ACK — Packet ${pNum}`, 'amber'),
        explanation: `Server A waited ${event.timeoutMs}ms but received no ACK for Packet ${pNum}. TCP's timeout mechanism will now trigger a retransmission.`,
      };

    case 'RETRANSMISSION':
      return {
        ...state,
        packets:      updatePacket({ status: 'RETRANSMITTING', retryCount: event.retryCount }),
        activePacket: { packetNumber: pNum, state: 'retransmitting', retryCount: event.retryCount },
        events:       appendEvent(`Retransmitting Packet ${pNum} (attempt ${event.retryCount})`, 'purple'),
        explanation:  `Server A is retransmitting Packet ${pNum} for the ${event.retryCount}${ordinal(event.retryCount)} time. This is TCP's reliability mechanism in action.`,
      };

    case 'FILE_REASSEMBLED':
      return {
        ...state,
        activePacket: null,
        events: appendEvent(
          `File reassembled — checksum ${event.checksumVerified ? 'VERIFIED ✓' : 'FAILED ✗'}`,
          event.checksumVerified ? 'green' : 'red'
        ),
        explanation: event.checksumVerified
          ? 'All packets have been received in order. The file has been reassembled at Server B and the final checksum matches the original.'
          : 'File reassembled but the final checksum does NOT match. Something went wrong.',
      };

    case 'TRANSFER_COMPLETED':
      return {
        ...state,
        status:      SIMULATION_STATUS.COMPLETED,
        stats:       event.stats,
        activePacket: null,
        completion:  event,
        events:      appendEvent(`Transfer COMPLETED in ${event.stats?.transferTime}ms`, 'green'),
        explanation: 'All packets have been acknowledged and the file has been reconstructed successfully at Server B. The transfer is complete.',
      };

    case 'TRANSFER_FAILED':
      return {
        ...state,
        status:      SIMULATION_STATUS.FAILED,
        activePacket: null,
        events:      appendEvent(`Transfer FAILED: ${event.message}`, 'red'),
        explanation: `The transfer failed: ${event.message}`,
      };

    case '__RESET__':
      return initialState;

    default:
      return state;
  }
}

function ordinal(n) {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}
