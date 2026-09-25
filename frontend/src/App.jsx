/**
 * App.jsx — Root component.
 *
 * Wires together:
 *  - useSocket (real-time events from backend)
 *  - simulationReducer (central state)
 *  - All UI components
 *
 * Layout:
 *  Header
 *  ┌──────────────────────────────────────────────┐
 *  │  Control Panel  │  Network Diagram            │
 *  │                 │  Simulation Explanation      │
 *  │                 │  Checksum Panel              │
 *  └──────────────────────────────────────────────┘
 *  Packet Grid
 *  ┌──────────────────────────────────────────────┐
 *  │  Transmission Log  │  Statistics Panel        │
 *  └──────────────────────────────────────────────┘
 *  Completion overlay (modal)
 */

import { useReducer, useCallback, useState } from 'react';
import { useSocket }              from './hooks/useSocket';
import { simulationReducer, initialState, SIMULATION_STATUS } from './store/simulationStore';

import Header              from './components/Header';
import NetworkDiagram      from './components/NetworkDiagram';
import ControlPanel        from './components/ControlPanel';
import PacketGrid          from './components/PacketGrid';
import TransmissionLog     from './components/TransmissionLog';
import ChecksumPanel       from './components/ChecksumPanel';
import StatisticsPanel     from './components/StatisticsPanel';
import SimulationExplanation from './components/SimulationExplanation';
import CompletionPanel     from './components/CompletionPanel';

export default function App() {
  const [sim, dispatch]       = useReducer(simulationReducer, initialState);
  const [lastEventType, setLastEventType] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);

  // Handle incoming WebSocket events
  const handleEvent = useCallback((event) => {
    dispatch({ event });
    setLastEventType(event.type);
    if (event.type === 'TRANSFER_COMPLETED') {
      setShowCompletion(true);
    }
  }, []);

  const { connected, emit } = useSocket(handleEvent);

  function handleReset() {
    dispatch({ event: { type: '__RESET__' } });
    setLastEventType(null);
    setShowCompletion(false);
  }

  // Custom reset action that clears state
  function fullReset() {
    // We dispatch a synthetic reset by re-initializing
    dispatch({ event: { type: 'TRANSFER_FAILED', message: 'Reset by user' } });
    setTimeout(() => {
      window.location.reload(); // Simple full reset for college demo
    }, 100);
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 flex flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
      <Header connected={connected} status={sim.status} />

      {/* ── Main content ────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-4 flex flex-col gap-4">
        {/* ── Disconnected warning ─────────────────────────── */}
        {!connected && (
          <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-5 py-3 text-sm text-red-400 flex items-center gap-2">
            <span>⚠</span>
            <span>Backend disconnected. Make sure the backend server is running.</span>
          </div>
        )}

        {/* ── Main Layout: Naturally scrolling columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4">
          
          {/* LEFT COLUMN: Controls */}
          <div className="flex flex-col gap-4">
            <ControlPanel
              status={sim.status}
              totalPackets={sim.totalPackets}
              onReset={fullReset}
              socketEmit={emit}
            />
          </div>

          {/* CENTER COLUMN: Network + Packet Grid */}
          <div className="flex flex-col gap-4">
            <NetworkDiagram
              activePacket={sim.activePacket}
              status={sim.status}
              config={sim.config}
            />
            <SimulationExplanation
              explanation={sim.explanation}
              lastEventType={lastEventType}
            />
            <PacketGrid packets={sim.packets} />
            {showCompletion && (
              <CompletionPanel
                completion={sim.completion}
                onReset={() => { setShowCompletion(false); fullReset(); }}
                onClose={() => setShowCompletion(false)}
              />
            )}
          </div>

          {/* RIGHT COLUMN: Checksum + Statistics */}
          <div className="flex flex-col gap-4">
            <ChecksumPanel event={sim.lastChecksumEvent} />
            <StatisticsPanel stats={sim.stats} totalPackets={sim.totalPackets} />
          </div>

        </div>

        {/* ── Bottom Full-Width Log ── */}
        <div className="h-80 w-full mt-2">
          <TransmissionLog events={sim.events} />
        </div>
      </main>
    </div>
  );
}
