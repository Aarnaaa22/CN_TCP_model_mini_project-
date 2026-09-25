/**
 * test.js
 *
 * Integration test for the TCP simulation backend.
 * Tests four scenarios:
 *   1. Normal successful packet delivery
 *   2. Lost packet → timeout → retransmission → ACK
 *   3. Corrupted packet → checksum failure → retransmission → ACK
 *   4. Complete file reconstruction with checksum verification
 *
 * Run with: node test/test.js
 * (Server must NOT be running — this test calls services directly.)
 */

const path = require('path');
const { updateConfig } = require('../src/config/simulationConfig');
const { startTransfer, simEvents, resetTransfer } = require('../src/services/transferService');

// ── ANSI colours for readable output ─────────────────────────────────────────
const C = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

// ── Config: fast timing for tests ────────────────────────────────────────────
updateConfig({
  transmissionDelay:           200,  // 200 ms
  timeoutDuration:             600,  // 600 ms
  packetLossProbability:       0,    // Disable random errors for predictable test
  packetCorruptionProbability: 0,    // We use manual injection instead
  packetSize:                  64,   // Small packets so a short file makes many
});

// ── Sample file content ───────────────────────────────────────────────────────
const sampleContent = `Hello from Server A!
This is a TCP simulation test file.
Line 3: Testing packet loss and corruption recovery.
Line 4: TCP retransmission makes reliable delivery possible.
Line 5: End of test file.
`;

const fileBuffer = Buffer.from(sampleContent, 'utf8');
const fileName   = 'test_file.txt';

// ── Event collector ───────────────────────────────────────────────────────────
const collectedEvents = [];

simEvents.on('event', (event) => {
  collectedEvents.push(event);

  const ts = new Date(event.timestamp).toISOString().slice(11, 23);
  const prefix = `  [${C.dim(ts)}]`;

  switch (event.type) {
    case 'TRANSFER_STARTED':
      console.log(`\n${C.bold(C.cyan('━━━ TRANSFER STARTED ━━━'))}`);
      console.log(`  File: ${event.fileName}  |  Packets: ${event.totalPackets}  |  Size: ${event.fileSize} bytes`);
      break;
    case 'PACKET_CREATED':
      console.log(`${prefix} ${C.dim('📦 CREATED')}  Packet ${event.packetNumber}/${event.totalPackets}  (${event.size} bytes, checksum: ${event.checksum.slice(0,8)}...)`);
      break;
    case 'PACKET_SENT':
      if (event.status === 'IN_TRANSIT') {
        console.log(`${prefix} ${C.cyan('→ IN TRANSIT')} Packet ${event.packetNumber}`);
      } else {
        console.log(`${prefix} ${C.cyan('▶ SENT')}       Packet ${event.packetNumber}`);
      }
      break;
    case 'PACKET_LOST':
      console.log(`${prefix} ${C.red('✗ LOST')}       Packet ${event.packetNumber}  (retry: ${event.retryCount})`);
      break;
    case 'PACKET_CORRUPTED':
      console.log(`${prefix} ${C.yellow('⚠ CORRUPTED')}  Packet ${event.packetNumber}  (retry: ${event.retryCount})`);
      break;
    case 'CHECKSUM_FAILED':
      console.log(`${prefix} ${C.red('✗ CHECKSUM FAIL')} expected: ${event.expectedChecksum.slice(0,8)}...  got: ${event.receivedChecksum.slice(0,8)}...`);
      break;
    case 'PACKET_RECEIVED':
      console.log(`${prefix} ${C.green('✓ RECEIVED')}   Packet ${event.packetNumber}`);
      break;
    case 'ACK_SENT':
      console.log(`${prefix} ${C.green('◀ ACK SENT')}   ACK ${event.ackNumber} (for packet ${event.packetNumber})`);
      break;
    case 'ACK_RECEIVED':
      console.log(`${prefix} ${C.green('✓ ACK RCVD')}   Packet ${event.packetNumber} confirmed`);
      break;
    case 'TIMEOUT':
      console.log(`${prefix} ${C.yellow('⏱ TIMEOUT')}    Packet ${event.packetNumber}  (waiting ${event.timeoutMs}ms)`);
      break;
    case 'RETRANSMISSION':
      console.log(`${prefix} ${C.yellow('↺ RETRANSMIT')} Packet ${event.packetNumber}  attempt #${event.retryCount}`);
      break;
    case 'FILE_REASSEMBLED':
      console.log(`\n${C.bold(C.cyan('━━━ FILE REASSEMBLED ━━━'))}`);
      console.log(`  Checksum match: ${event.checksumVerified ? C.green('YES ✓') : C.red('NO ✗')}`);
      break;
    case 'TRANSFER_COMPLETED':
      console.log(`\n${C.bold(C.green('━━━ TRANSFER COMPLETED ━━━'))}`);
      printStats(event.stats);
      break;
    case 'TRANSFER_FAILED':
      console.log(`\n${C.bold(C.red('━━━ TRANSFER FAILED ━━━'))}`);
      console.log(`  ${event.message}`);
      break;
  }
});

function printStats(stats) {
  console.log('');
  console.log(`  Total Packets:    ${stats.totalPackets}`);
  console.log(`  Successful:       ${C.green(stats.successfulPackets)}`);
  console.log(`  Lost:             ${C.red(stats.lostPackets)}`);
  console.log(`  Corrupted:        ${C.yellow(stats.corruptedPackets)}`);
  console.log(`  Retransmissions:  ${stats.retransmissions}`);
  console.log(`  Total Attempts:   ${stats.totalAttempts}`);
  console.log(`  Transfer Time:    ${stats.transferTime} ms`);
  console.log(`  Original Size:    ${stats.originalFileSize} bytes`);
  console.log(`  Reconstructed:    ${stats.reconstructedFileSize} bytes`);
  console.log(`  Checksum OK:      ${stats.checksumVerified ? C.green('YES ✓') : C.red('NO ✗')}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Run the test
// ─────────────────────────────────────────────────────────────────────────────
async function runTest() {
  console.log(C.bold('\n══════════════════════════════════════════════════════'));
  console.log(C.bold(' TCP File Transfer Simulation — Backend Integration Test'));
  console.log(C.bold('══════════════════════════════════════════════════════\n'));

  console.log(`File content (${fileBuffer.length} bytes):\n`);
  console.log(C.dim('  ' + sampleContent.replace(/\n/g, '\n  ')));

  console.log(C.bold('\n── Error Injections ──'));
  console.log('  Packet 2 → FORCED LOST      (will timeout → retransmit → success)');
  console.log('  Packet 4 → FORCED CORRUPTED (checksum fail → retransmit → success)');

  // Manual error injections: demonstrates predictable errors for college demo
  const errorInjections = [
    { packetNumber: 2, errorType: 'LOST' },
    { packetNumber: 4, errorType: 'CORRUPTED' },
  ];

  await startTransfer(fileBuffer, fileName, errorInjections);

  // ── Assertions ─────────────────────────────────────────────────────────────
  console.log(C.bold('\n── Test Assertions ──'));

  const hasLost       = collectedEvents.some(e => e.type === 'PACKET_LOST');
  const hasCorrupted  = collectedEvents.some(e => e.type === 'CHECKSUM_FAILED');
  const hasTimeout    = collectedEvents.some(e => e.type === 'TIMEOUT');
  const hasRetransmit = collectedEvents.some(e => e.type === 'RETRANSMISSION');
  const hasCompleted  = collectedEvents.some(e => e.type === 'TRANSFER_COMPLETED');
  const checksumOk    = collectedEvents.find(e => e.type === 'FILE_REASSEMBLED')?.checksumVerified;

  const assert = (label, value) => {
    console.log(`  ${value ? C.green('✓ PASS') : C.red('✗ FAIL')}  ${label}`);
  };

  assert('Packet loss was simulated',           hasLost);
  assert('Packet corruption was simulated',     hasCorrupted);
  assert('Timeout was triggered',               hasTimeout);
  assert('Retransmission was triggered',        hasRetransmit);
  assert('Transfer completed successfully',     hasCompleted);
  assert('Reconstructed file checksum matches', checksumOk);

  const allPassed = hasLost && hasCorrupted && hasTimeout && hasRetransmit && hasCompleted && checksumOk;
  console.log('');
  console.log(allPassed
    ? C.bold(C.green('  ALL TESTS PASSED ✓'))
    : C.bold(C.red('  SOME TESTS FAILED ✗')));
  console.log('');
}

runTest().catch(err => {
  console.error(C.red('\nTest crashed: '), err);
  process.exit(1);
});
