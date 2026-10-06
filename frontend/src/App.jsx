import { useReducer, useCallback, useState } from 'react';
import { useSocket }              from './hooks/useSocket';
import { simulationReducer, initialState } from './store/simulationStore';

import LandingPage         from './components/LandingPage';
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
  const [showLanding, setShowLanding]       = useState(true);

  const handleEvent = useCallback((event) => {
    dispatch({ event });
    setLastEventType(event.type);
    if (event.type === 'TRANSFER_COMPLETED') {
      setShowCompletion(true);
    }
  }, []);

  const { connected, emit } = useSocket(handleEvent);

  function fullReset() {
    dispatch({ event: { type: 'TRANSFER_FAILED', message: 'Reset by user' } });
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F4EA] text-[#1E293B] flex flex-col selection:bg-[#2563EB] selection:text-white">
      {/* Header with Back to Landing Page button */}
      <Header
        connected={connected}
        status={sim.status}
        onShowLanding={() => setShowLanding(true)}
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-4 flex flex-col gap-4">
        {!connected && (
          <div className="card retro-card bg-rose-100 border-3 border-rose-600 p-3 text-xs text-rose-900 font-['Press_Start_2P'] text-[9px] flex items-center gap-2">
            <span>⚠️</span>
            <span>BACKEND DISCONNECTED. ENSURE SERVER IS RUNNING ON PORT 5000.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr_320px] gap-4">
          <div className="flex flex-col gap-4">
            <ControlPanel
              status={sim.status}
              totalPackets={sim.totalPackets}
              onReset={fullReset}
              socketEmit={emit}
            />
          </div>

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

          <div className="flex flex-col gap-4">
            <ChecksumPanel event={sim.lastChecksumEvent} />
            <StatisticsPanel stats={sim.stats} totalPackets={sim.totalPackets} />
          </div>
        </div>

        <div className="h-80 w-full mt-2">
          <TransmissionLog events={sim.events} />
        </div>
      </main>
    </div>
  );
}
