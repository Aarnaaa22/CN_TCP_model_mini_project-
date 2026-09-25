# TCP File Transfer Simulation — Backend

## Overview

This is the **Node.js / Express.js** backend for the *TCP-Based Reliable File Transfer and Error Recovery Simulation*.

It simulates how TCP reliably transfers a file when packets are lost or corrupted, including ACKs, timeouts, and retransmissions — all in real time via **Socket.IO**.

---

## Project Structure

```
backend/
├── server.js                   # Entry point (Express + Socket.IO)
├── package.json
├── .env.example
├── src/
│   ├── config/
│   │   └── simulationConfig.js # Default simulation settings
│   ├── models/
│   │   └── Packet.js           # Packet model & states
│   ├── services/
│   │   ├── checksumService.js  # SHA-256 checksum & corruption
│   │   ├── packetService.js    # File splitting & reassembly
│   │   └── transferService.js  # Core TCP simulation engine
│   ├── routes/
│   │   └── transfer.js         # REST API endpoints
│   └── socket/
│       └── socketHandler.js    # Socket.IO real-time bridge
└── test/
    └── test.js                 # Integration test (no server needed)
```

---

## How to Install & Run

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Start the server

```bash
npm start
```

or for development with auto-reload:

```bash
npm run dev
```

The server starts at **http://localhost:5000**

### 3. Run the integration test

```bash
npm test
```

This runs a simulation directly (no HTTP server needed) and prints a live event log demonstrating:
- Normal packet delivery
- Packet loss → timeout → retransmission
- Packet corruption → checksum failure → retransmission
- File reconstruction with checksum verification

---

## REST API Endpoints

| Method | Endpoint                        | Description                          |
|--------|---------------------------------|--------------------------------------|
| `POST` | `/api/transfer/start`           | Start a file transfer simulation     |
| `POST` | `/api/transfer/stop`            | Stop the running simulation          |
| `POST` | `/api/transfer/reset`           | Reset simulation state               |
| `GET`  | `/api/transfer/status`          | Get current status and statistics    |
| `GET`  | `/api/transfer/packets`         | Get all packet states                |
| `GET`  | `/api/transfer/config`          | Get current simulation config        |
| `POST` | `/api/transfer/config`          | Update simulation settings           |
| `POST` | `/api/transfer/inject-error`    | Manually force a packet to be lost or corrupted |

---

### POST `/api/transfer/start`

Upload a file and start the simulation.  
Use `multipart/form-data` with a field named `file`.

Optional: pass `errorInjections` as a JSON string field:
```json
[
  { "packetNumber": 3, "errorType": "LOST" },
  { "packetNumber": 6, "errorType": "CORRUPTED" }
]
```

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/transfer/start \
  -F "file=@myfile.txt" \
  -F 'errorInjections=[{"packetNumber":3,"errorType":"LOST"},{"packetNumber":6,"errorType":"CORRUPTED"}]'
```

---

### POST `/api/transfer/config`

Update simulation parameters:

```json
{
  "packetLossProbability":       0.15,
  "packetCorruptionProbability": 0.10,
  "transmissionDelay":           500,
  "timeoutDuration":             1500,
  "maxRetries":                  5,
  "packetSize":                  512
}
```

---

### POST `/api/transfer/inject-error`

Force a specific packet to be lost or corrupted (call before starting):

```json
{
  "packetNumber": 3,
  "errorType": "LOST"
}
```

---

## WebSocket (Socket.IO)

Connect to `http://localhost:5000` using Socket.IO.  
Listen for the `simulation_event` event:

```js
const socket = io('http://localhost:5000');

socket.on('simulation_event', (event) => {
  console.log(event.type, event);
});
```

---

## WebSocket Event Types

| Event Type           | Description                                         |
|----------------------|-----------------------------------------------------|
| `TRANSFER_STARTED`   | File transfer has begun                             |
| `PACKET_CREATED`     | A packet was created from the file                  |
| `PACKET_SENT`        | Server A sent the packet                            |
| `PACKET_LOST`        | Packet was dropped in transit                       |
| `PACKET_CORRUPTED`   | Packet arrived with corrupted data                  |
| `PACKET_RECEIVED`    | Server B received the packet intact                 |
| `CHECKSUM_FAILED`    | Server B detected a checksum mismatch               |
| `ACK_SENT`           | Server B sent an ACK to Server A                    |
| `ACK_RECEIVED`       | Server A received the ACK                           |
| `TIMEOUT`            | No ACK received; timeout triggered                  |
| `RETRANSMISSION`     | Server A is retransmitting the packet               |
| `FILE_REASSEMBLED`   | All packets received; file reconstructed            |
| `TRANSFER_COMPLETED` | Transfer finished with final statistics             |
| `TRANSFER_FAILED`    | Transfer failed (max retries exceeded or stopped)   |

---

## Example Event Payloads

**Packet Lost:**
```json
{
  "type": "PACKET_LOST",
  "packetNumber": 3,
  "sequenceNumber": 3,
  "retryCount": 0,
  "message": "Packet 3 was lost during transmission",
  "timestamp": 1727245340000
}
```

**Checksum Failure:**
```json
{
  "type": "CHECKSUM_FAILED",
  "packetNumber": 6,
  "expectedChecksum": "a3f9c2...",
  "receivedChecksum": "000000...",
  "message": "Server B: Checksum mismatch! Packet rejected.",
  "timestamp": 1727245342500
}
```

**Retransmission:**
```json
{
  "type": "RETRANSMISSION",
  "packetNumber": 3,
  "retryCount": 1,
  "message": "Timeout occurred. Retransmitting packet 3 (attempt 2)",
  "timestamp": 1727245343000
}
```

**Transfer Completed:**
```json
{
  "type": "TRANSFER_COMPLETED",
  "stats": {
    "totalPackets": 10,
    "successfulPackets": 10,
    "lostPackets": 1,
    "corruptedPackets": 1,
    "retransmissions": 2,
    "totalAttempts": 12,
    "transferTime": 8500,
    "originalFileSize": 5120,
    "reconstructedFileSize": 5120,
    "checksumVerified": true
  }
}
```

---

## Packet States

| State            | Meaning                                      |
|------------------|----------------------------------------------|
| `CREATED`        | Packet created from the file                 |
| `SENT`           | Sent by Server A                             |
| `IN_TRANSIT`     | Travelling across the network                |
| `LOST`           | Dropped — never reached Server B             |
| `CORRUPTED`      | Arrived but data was changed                 |
| `RECEIVED`       | Arrived intact at Server B                   |
| `ACKED`          | ACK sent by Server B                         |
| `TIMEOUT`        | ACK not received in time                     |
| `RETRANSMITTING` | Being retransmitted by Server A              |
| `COMPLETED`      | Successfully delivered and acknowledged      |

---

## How the Simulation Works

1. The uploaded file is split into fixed-size **packets** (512 bytes each by default).
2. Each packet gets a **sequence number**, **data payload**, and **SHA-256 checksum**.
3. Server A sends each packet one at a time (**Stop-and-Wait** protocol).
4. During transit, the simulation randomly (or via manual injection) decides if the packet is:
   - **Lost** → no ACK arrives → timeout fires → Server A retransmits
   - **Corrupted** → Server B detects checksum mismatch → no ACK → timeout → retransmit
   - **OK** → Server B sends ACK → Server A confirms and moves to the next packet
5. After all packets are successfully received, the file is **reassembled** in sequence order.
6. The reconstructed file's checksum is compared to the original to confirm integrity.
