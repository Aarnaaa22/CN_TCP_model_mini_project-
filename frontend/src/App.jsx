import { useReducer, useCallback, useState } from 'react';
import { useSocket }              from './hooks/useSocket';
import { simulationReducer, initialState } from './store/simulationStore';

import LandingPage         from './components/LandingPage';
import HandshakeSimulation from './components/HandshakeSimulation';
import OverviewPage        from './components/OverviewPage';
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
  
  // pageStage: 'landing' | 'handshake' | 'overview' | 'simulation'
  const [pageStage, setPageStage] = useState('landing');

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

  // Stage 1: Landing Page
  if (pageStage === 'landing') {
    return <LandingPage onStart={() => setPageStage('handshake')} />;
  }

  // Stage 2: Three-Way Handshake Simulation (Just after Landing Page)
  if (pageStage === 'handshake') {
    return (
      <HandshakeSimulation
        onProceedToOverview={() => setPageStage('overview')}
        onProceedToSimulation={() => setPageStage('simulation')}
        onBackToLanding={() => setPageStage('landing')}
      />
    );
  }

  // Stage 3: Overview & Concepts Page
  if (pageStage === 'overview') {
    return (
      <OverviewPage
        onLaunchSimulation={() => setPageStage('simulation')}
        onBackToLanding={() => setPageStage('landing')}
        onShowHandshake={() => setPageStage('handshake')}
      />
    );
  }

  // Stage 4: Live Interactive TCP Simulator Dashboard
  return (
    <div className="min-h-screen bg-[#F7F4EA] text-[#1E293B] flex flex-col selection:bg-[#2563EB] selection:text-white font-['Pixelify_Sans']">
      <Header
        connected={connected}
        status={sim.status}
        onShowLanding={() => setPageStage('landing')}
        onShowHandshake={() => setPageStage('handshake')}
        onShowOverview={() => setPageStage('overview')}
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-4 flex flex-col gap-4">
        {!connected && (
          <div className="card retro-card bg-amber-50 border-3 border-amber-600 p-2.5 text-xs text-amber-950 font-['Pixelify_Sans'] flex items-center justify-between gap-3 shadow-[3px_3px_0px_#1E293B]">
            <div className="flex items-center gap-2 font-bold text-xs">
              <span className="text-base select-none">⚡</span>
              <span>STANDALONE MODE ACTIVE: Backend offline. Full TCP simulation engine is running directly in your browser! (Start backend on port 5000 for live Socket.IO).</span>
            </div>
            <span className="text-[8px] font-['Press_Start_2P'] bg-amber-200 text-amber-900 px-2 py-1 rounded border border-amber-700 shrink-0">BROWSER-ENGINE</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr_320px] gap-4">
          <div className="flex flex-col gap-4">
            <ControlPanel
              status={sim.status}
              totalPackets={sim.totalPackets}
              onReset={fullReset}
              socketEmit={emit}
              connected={connected}
              onLocalEvent={handleEvent}
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
