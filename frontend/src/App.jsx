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

  const { connected } = useSocket(handleEvent);

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
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* ── Header ──────────────────────────────────────────── */}
      <Header connected={connected} status={sim.status} />

      {/* ── Main content ────────────────────────────────────── */}
      <main className="max-w-screen-2xl mx-auto px-4 py-5 flex flex-col gap-4">

        {/* ── Disconnected warning ─────────────────────────── */}
        {!connected && (
          <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-5 py-3 text-sm text-red-400 flex items-center gap-2">
            <span>⚠</span>
            <span>Backend disconnected. Make sure the backend server is running on <code className="font-mono">localhost:5000</code>.</span>
          </div>
        )}

        {/* ── Row 1: Control Panel + Network + Side panels ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-4">

          {/* Control Panel */}
          <ControlPanel
            status={sim.status}
            totalPackets={sim.totalPackets}
            onReset={fullReset}
          />

          {/* Centre column: Network + Explanation */}
          <div className="flex flex-col gap-4">
            <NetworkDiagram
              activePacket={sim.activePacket}
              status={sim.status}
            />
            <SimulationExplanation
              explanation={sim.explanation}
              lastEventType={lastEventType}
            />
          </div>

          {/* Right column: Checksum + small stats */}
          <div className="flex flex-col gap-4">
            <ChecksumPanel event={sim.lastChecksumEvent} />

            {/* Mini stat badges */}
            <div className="card card-glow p-4">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">Quick Stats</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: 'Packets',  v: sim.stats?.totalPackets   ?? sim.totalPackets ?? 0, c: 'text-white' },
                  { l: 'Delivered',v: sim.stats?.successfulPackets ?? 0, c: 'text-green-400' },
                  { l: 'Lost',     v: sim.stats?.lostPackets    ?? 0, c: 'text-red-400' },
                  { l: 'Retrans.', v: sim.stats?.retransmissions ?? 0, c: 'text-purple-400' },
                ].map(({ l, v, c }) => (
                  <div key={l} className="bg-navy-700/50 rounded-lg p-2 text-center">
                    <div className={`text-lg font-bold font-mono ${c}`}>{v}</div>
                    <div className="text-[10px] text-slate-600">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Packet Grid ─────────────────────────────── */}
        <PacketGrid packets={sim.packets} />

        {/* ── Row 3: Log + Statistics ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
          <TransmissionLog events={sim.events} />
          <StatisticsPanel stats={sim.stats} totalPackets={sim.totalPackets} />
        </div>
      </main>

      {/* ── Completion Modal ──────────────────────────────────── */}
      {showCompletion && (
        <CompletionPanel
          completion={sim.completion}
          onReset={() => { setShowCompletion(false); fullReset(); }}
        />
      )}
    </div>
  );
}
