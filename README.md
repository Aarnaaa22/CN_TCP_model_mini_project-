# TCP-Based Reliable File Transfer and Error Recovery Simulation

## Description
A network simulation in which Server A and Server B exchange files using TCP. During transmission, selected packets are simulated as lost or corrupted. The system detects the transmission error and demonstrates TCP's acknowledgement and retransmission mechanism to ensure that the complete file is successfully received.

## Features
- **File Transfer**: Simulates reliable file exchange between two servers (Server A and Server B) over TCP.
- **Error Simulation**: Intentionally simulates packet loss and corruption during data transmission.
- **Error Detection & Recovery**: Demonstrates TCP mechanisms (such as acknowledgements, timeouts, and retransmissions) to detect errors and recover lost or corrupted packets.
- **Reliable Delivery**: Ensures the complete and correct file is received at the destination despite network disruptions.
