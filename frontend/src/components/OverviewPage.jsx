import { useState, useEffect } from 'react';
import ThreeWayHandshakeSection from './ThreeWayHandshakeSection';

// Classic Windows 95/98/XP Desktop SVG Icons
function MyComputerIcon({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="15" width="60" height="46" rx="3" fill="#E2E8F0" stroke="#1E293B" strokeWidth="4" />
      <rect x="25" y="20" width="50" height="36" fill="#2563EB" />
      <rect x="28" y="23" width="22" height="14" fill="#FFFDF5" stroke="#1E293B" strokeWidth="1.5" />
      <rect x="28" y="23" width="22" height="4" fill="#1D4ED8" />
      <rect x="15" y="65" width="70" height="20" rx="2" fill="#CBD5E1" stroke="#1E293B" strokeWidth="4" />
      <rect x="22" y="70" width="28" height="4" fill="#64748B" />
      <circle cx="72" cy="75" r="3" fill="#22C55E" />
    </svg>
  );
}

function NetworkGlobeIcon({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="38" fill="#0284C7" stroke="#1E293B" strokeWidth="4" />
      <ellipse cx="50" cy="50" rx="38" ry="16" fill="none" stroke="#FFF" strokeWidth="3" />
      <line x1="50" y1="12" x2="50" y2="88" stroke="#FFF" strokeWidth="3" />
      <line x1="12" y1="50" x2="88" y2="50" stroke="#FFF" strokeWidth="3" />
      <rect x="55" y="55" width="30" height="24" fill="#E2E8F0" stroke="#1E293B" strokeWidth="3" />
      <rect x="58" y="58" width="24" height="18" fill="#2563EB" />
    </svg>
  );
}

function RecycleBinIcon({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 30 L30 85 L70 85 L75 30 Z" fill="#E2E8F0" stroke="#1E293B" strokeWidth="4" />
      <rect x="20" y="20" width="60" height="10" rx="2" fill="#94A3B8" stroke="#1E293B" strokeWidth="4" />
      <rect x="42" y="14" width="16" height="6" fill="#64748B" stroke="#1E293B" strokeWidth="2" />
      <path d="M40 45 L50 35 L60 45 M50 35 L50 65" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function FolderIcon({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 25 L40 25 L50 35 L85 35 L85 75 L15 75 Z" fill="#FACC15" stroke="#1E293B" strokeWidth="4" />
      <path d="M15 35 L85 35 L85 75 L15 75 Z" fill="#EAB308" stroke="#1E293B" strokeWidth="3" />
    </svg>
  );
}

function CDRomIcon({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="45" width="70" height="35" rx="3" fill="#CBD5E1" stroke="#1E293B" strokeWidth="4" />
      <rect x="25" y="55" width="40" height="6" fill="#64748B" />
      <circle cx="73" cy="62" r="3" fill="#22C55E" />
      <circle cx="50" cy="35" r="24" fill="#E2E8F0" stroke="#1E293B" strokeWidth="3" />
      <circle cx="50" cy="35" r="8" fill="#38BDF8" stroke="#1E293B" strokeWidth="2" />
    </svg>
  );
}

export default function OverviewPage({ onLaunchSimulation, onBackToLanding, onProceedToSlidingWindow, initialSection = null }) {
  const [seq, setSeq] = useState(7719);
  const [ack, setAck] = useState(7419);
  const [animKey, setAnimKey] = useState(0);

  function manualPulseSegment() {
    setSeq(prev => prev + 1460);
    setAck(prev => prev + 1460);
    setAnimKey(prev => prev + 1);
  }

  // Auto-pulse packet stream animation every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      manualPulseSegment();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Handle smooth scroll when navigating to initialSection
  useEffect(() => {
    if (initialSection) {
      setTimeout(() => {
        const el = document.getElementById(initialSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [initialSection]);

  return (
    <div className="min-h-screen bg-[#F7F4EA] text-[#1E293B] font-['Pixelify_Sans'] selection:bg-[#2563EB] selection:text-white pb-12">

      {/* TOP RETRO OS TASKBAR / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#FFFDF5] border-b-3 border-[#1E293B] shadow-[0_4px_0px_rgba(30,41,59,0.15)] py-2.5 mb-8">
        <div className="max-w-[1240px] mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToLanding}>
            <MyComputerIcon className="w-8 h-8" />
            <div className="px-2.5 py-1 bg-[#2563EB] text-white font-['Press_Start_2P'] text-[9px] border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
              TCP_OS
            </div>
            <div className="font-['Press_Start_2P'] text-[10px] text-[#1E293B]">
              FLOW & ERROR CONTROL
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3 font-['Press_Start_2P'] text-[8px] flex-wrap">
            <button
              onClick={onBackToLanding}
              className="px-2.5 py-1.5 hover:bg-[#E2E8F0] rounded border border-transparent transition-colors cursor-pointer text-[#475569]"
            >
              🏠 LANDING
            </button>
            <a
              href="#handshake"
              className="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#1D4ED8] rounded border border-blue-600 transition-colors cursor-pointer font-bold"
            >
              🤝 3-WAY HANDSHAKE
            </a>
            <a
              href="#objective"
              className="px-2.5 py-1.5 hover:bg-[#E2E8F0] rounded border border-transparent transition-colors text-[#475569]"
            >
              📂 AIM & SPECS
            </a>
            <a
              href="#concepts"
              className="px-2.5 py-1.5 hover:bg-[#E2E8F0] rounded border border-transparent transition-colors text-[#475569]"
            >
              📘 THEORY & CONCEPTS
            </a>
            {onProceedToSlidingWindow && (
              <button
                onClick={onProceedToSlidingWindow}
                className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-950 rounded border border-purple-600 transition-colors cursor-pointer font-bold"
              >
                🪟 SLIDING WINDOW
              </button>
            )}
            <button
              onClick={onLaunchSimulation}
              className="px-3 py-1.5 bg-[#5BA848] text-white rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] hover:bg-[#4D943B] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <span>SIMULATOR</span>
              <span>▶</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-4 flex flex-col gap-10">

        {/* HERO OS PROTOCOL BANNER */}
        <section className="card retro-card overflow-hidden">
          <div className="retro-window-header">
            <div className="flex items-center gap-2">
              <span>🖥️</span>
              <span>SYSTEM_OS_V2.0 :: PROTOCOL_OVERVIEW.EXE</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-min">_</div>
              <div className="retro-win-btn retro-win-btn-max">□</div>
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 bg-[#E0F2FE] border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] px-3 py-1 rounded w-fit">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-ping"></span>
                  <span className="font-['Press_Start_2P'] text-[9px] text-[#0369A1]">
                    COMPUTER NETWORKS • TCP PROTOCOL SUITE
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1E293B] leading-tight font-['Pixelify_Sans']">
                  TCP <span className="text-[#2563EB] underline decoration-wavy decoration-[#F97316]">Flow & Error</span> Control
                </h1>
                <p className="text-base md:text-lg text-[#475569] max-w-[850px] leading-relaxed font-['Pixelify_Sans']">
                  Explore how Transmission Control Protocol (TCP) ensures zero packet loss, avoids receiver buffer overflow, 
                  and synchronizes sequence numbers from initial connection establishment to real-time file transfer.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <NetworkGlobeIcon className="w-12 h-12" />
                <CDRomIcon className="w-12 h-12" />
                <RecycleBinIcon className="w-12 h-12" />
              </div>
            </div>

            {/* Quick-Jump Section Anchor Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t-2 border-[#E2E8F0]">
              <a
                href="#handshake"
                className="btn-pixel bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 px-4 text-[9px] shadow-[3px_3px_0px_#1E293B] flex items-center gap-2"
              >
                <span>1. THREE-WAY HANDSHAKE</span>
                <span>🤝</span>
              </a>
              <a
                href="#objective"
                className="btn-pixel bg-[#E2E8F0] hover:bg-slate-300 text-[#1E293B] py-2.5 px-4 text-[9px] shadow-[3px_3px_0px_#1E293B] flex items-center gap-2"
              >
                <span>2. AIM & SPECS</span>
                <span>📂</span>
              </a>
              <a
                href="#concepts"
                className="btn-pixel bg-[#E2E8F0] hover:bg-slate-300 text-[#1E293B] py-2.5 px-4 text-[9px] shadow-[3px_3px_0px_#1E293B] flex items-center gap-2"
              >
                <span>3. THEORY & CONCEPTS</span>
                <span>📘</span>
              </a>
              {onProceedToSlidingWindow && (
                <button
                  onClick={onProceedToSlidingWindow}
                  className="btn-pixel bg-purple-100 hover:bg-purple-200 text-purple-950 py-2.5 px-4 text-[9px] shadow-[3px_3px_0px_#1E293B] flex items-center gap-2 font-bold"
                >
                  <span>4. SLIDING WINDOW</span>
                  <span>🪟</span>
                </button>
              )}
              <button
                onClick={onLaunchSimulation}
                className="btn-pixel btn-pixel-primary py-2.5 px-5 text-[9px] shadow-[3px_3px_0px_#1E293B] flex items-center gap-2 sm:ml-auto"
              >
                <span>LAUNCH SIMULATOR</span>
                <span>▶</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: THREE-WAY HANDSHAKE (Just after Landing Page, before Aim/Theory) */}
        {/* ========================================================================= */}
        <ThreeWayHandshakeSection
          onProceedToAim={() => {
            const el = document.getElementById('objective');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* ========================================================================= */}
        {/* SECTION 2: AIM & OBJECTIVE SECTION                                        */}
        {/* ========================================================================= */}
        <section className="card retro-card overflow-hidden" id="objective">
          <div className="retro-window-header">
            <div className="flex items-center gap-2">
              <span>📂</span>
              <span>WINDOW_02 :: AIM_AND_OBJECTIVE.SYS</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-min">_</div>
              <div className="retro-win-btn retro-win-btn-max">□</div>
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">

            <div className="flex items-center justify-between">
              <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB]">
                PROJECT AIM & OBJECTIVES
              </div>
              <FolderIcon className="w-10 h-10 hidden sm:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 items-stretch">
              
              {/* Text Card */}
              <div className="bg-[#F8FAFC] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-6 flex flex-col justify-center gap-3">
                <h3 className="text-xl md:text-2xl font-bold text-[#1E293B] leading-snug font-['Pixelify_Sans']">
                  Make TCP's reliability mechanisms visible, not just theoretical.
                </h3>
                <p className="text-base text-[#475569] leading-relaxed font-['Pixelify_Sans']">
                  Textbooks describe flow control and error control in abstract formulas — window sizes, sequence numbers, checksum calculations, and RTO retransmission timers. 
                  This interactive simulation turns those concepts into live animated events: watch a sender and receiver exchange real file packets over an imperfect network, one acknowledgement at a time.
                </p>
              </div>

              {/* Specification Table */}
              <div className="bg-white border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg overflow-hidden flex flex-col">
                <div className="bg-[#2563EB] text-white font-['Press_Start_2P'] text-[9px] p-3 border-b-3 border-[#1E293B]">
                  SPECIFICATION MATRIX
                </div>
                <table className="w-full text-left font-['Pixelify_Sans'] text-sm border-collapse flex-1">
                  <tbody>
                    <tr className="border-b-2 border-[#E2E8F0]">
                      <td className="p-3 font-bold text-[#2563EB] bg-[#F8FAFC] w-[40%] border-r-2 border-[#E2E8F0] font-['Press_Start_2P'] text-[9px]">Course</td>
                      <td className="p-3 text-[#1E293B] font-bold">Computer Networks</td>
                    </tr>
                    <tr className="border-b-2 border-[#E2E8F0]">
                      <td className="p-3 font-bold text-[#2563EB] bg-[#F8FAFC] border-r-2 border-[#E2E8F0] font-['Press_Start_2P'] text-[9px]">Focus</td>
                      <td className="p-3 text-[#1E293B] font-bold">TCP Flow & Error Control</td>
                    </tr>
                    <tr className="border-b-2 border-[#E2E8F0]">
                      <td className="p-3 font-bold text-[#2563EB] bg-[#F8FAFC] border-r-2 border-[#E2E8F0] font-['Press_Start_2P'] text-[9px]">Demonstrates</td>
                      <td className="p-3 text-[#1E293B] font-bold">Sliding Window, ACK, Retransmit</td>
                    </tr>
                    <tr className="border-b-2 border-[#E2E8F0]">
                      <td className="p-3 font-bold text-[#2563EB] bg-[#F8FAFC] border-r-2 border-[#E2E8F0] font-['Press_Start_2P'] text-[9px]">Network Model</td>
                      <td className="p-3 text-[#1E293B] font-bold">Packet Loss / Corruption / Delay</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#2563EB] bg-[#F8FAFC] border-r-2 border-[#E2E8F0] font-['Press_Start_2P'] text-[9px]">Interaction</td>
                      <td className="p-3 text-[#1E293B] font-bold">Interactive Real-Time Simulation</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: CONCEPTS & THEORY SECTION                                      */}
        {/* ========================================================================= */}
        <section className="card retro-card overflow-hidden" id="concepts">
          <div className="retro-window-header">
            <div className="flex items-center gap-2">
              <span>🕹️</span>
              <span>WINDOW_03 :: UNDERSTAND_TCP_CONCEPTS.EXE</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-min">_</div>
              <div className="retro-win-btn retro-win-btn-max">□</div>
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">

            <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB]">
              UNDERSTAND TCP THROUGH SIMULATION
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] font-['Pixelify_Sans']">
              Core Reliability & Flow Mechanisms
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Module 1 */}
              <div className="bg-white border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="bg-[#1E293B] text-white font-['Press_Start_2P'] text-[8px] p-2.5 border-b-3 border-[#1E293B] flex justify-between items-center">
                  <span>MODULE: 01</span>
                  <MyComputerIcon className="w-6 h-6" />
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                  <div>
                    <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB] mb-1">
                      FLOW CONTROL
                    </div>
                    <h3 className="text-xl font-bold text-[#1E293B] mb-2 font-['Pixelify_Sans']">Regulated Delivery</h3>
                    <p className="text-sm text-[#475569] leading-relaxed font-['Pixelify_Sans']">
                      TCP regulates packet transmission based on the receiver's available buffer capacity (`RCV_WND`) to prevent congestion and buffer overflow.
                    </p>
                  </div>
                  <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-3 font-['VT323'] text-base text-[#1E293B]">
                    <div className="text-[#2563EB] font-bold">RCV_WND: 65,535 bytes</div>
                    <div className="text-[#16A34A] font-bold">CWND: min(CWND, RCV_WND)</div>
                    <div className="text-[#D97706] font-bold">Buffer Status: 0% Overflow</div>
                  </div>
                </div>
              </div>

              {/* Module 2 */}
              <div className="bg-white border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="bg-[#1E293B] text-white font-['Press_Start_2P'] text-[8px] p-2.5 border-b-3 border-[#1E293B] flex justify-between items-center">
                  <span>MODULE: 02</span>
                  <NetworkGlobeIcon className="w-6 h-6" />
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                  <div>
                    <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB] mb-1">
                      ERROR CONTROL
                    </div>
                    <h3 className="text-xl font-bold text-[#1E293B] mb-2 font-['Pixelify_Sans']">Checksum & Retransmit</h3>
                    <p className="text-sm text-[#475569] leading-relaxed font-['Pixelify_Sans']">
                      Detect corrupted data using 16-bit internet checksums. Automatically retransmit lost packets upon timeout (RTO) or duplicate ACKs.
                    </p>
                  </div>
                  <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-3 font-['VT323'] text-base text-[#1E293B]">
                    <div className="text-[#DC2626] font-bold">CRC Mismatch: Corrupt Packet</div>
                    <div className="text-[#EA580C] font-bold">Duplicate ACKs: 3 Received</div>
                    <div className="text-[#9333EA] font-bold">Fast Retransmit: Segment Resent</div>
                  </div>
                </div>
              </div>

              {/* Module 3 */}
              <div className="bg-white border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="bg-[#1E293B] text-white font-['Press_Start_2P'] text-[8px] p-2.5 border-b-3 border-[#1E293B] flex justify-between items-center">
                  <span>MODULE: 03</span>
                  <CDRomIcon className="w-6 h-6" />
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                  <div>
                    <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB] mb-1">
                      DATA TRANSMISSION
                    </div>
                    <h3 className="text-xl font-bold text-[#1E293B] mb-2 font-['Pixelify_Sans']">Packets In Motion</h3>
                    <p className="text-sm text-[#475569] leading-relaxed font-['Pixelify_Sans']">
                      Trace data payload fragmentation into distinct TCP segments, tracking `SND.NXT` and `RCV.NXT` sequence pointers live in action.
                    </p>
                  </div>
                  <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-3 font-['VT323'] text-base text-[#1E293B]">
                    <div className="text-[#2563EB] font-bold">SND.NXT: 7719 [MSS: 512B]</div>
                    <div className="text-[#EA580C] font-bold">RCV.NXT: 7419 (Cumulative)</div>
                    <div className="text-[#16A34A] font-bold">RTT: 24.5ms (Adaptive)</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: DATA STREAM TOPOLOGY PREVIEW & LAUNCH SIMULATOR                */}
        {/* ========================================================================= */}
        <section className="card retro-card overflow-hidden" id="stream-topology">
          <div className="retro-window-header">
            <div className="flex items-center gap-2">
              <span>📡</span>
              <span>WINDOW_04 :: LIVE_DATA_STREAM_TOPOLOGY.SYS</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-min">_</div>
              <div className="retro-win-btn retro-win-btn-max">□</div>
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">

            <div className="flex items-center justify-between">
              <div>
                <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB] mb-1">
                  POST-HANDSHAKE PHASE: DATA STREAMING
                </div>
                <h2 className="text-2xl font-bold text-[#1E293B] font-['Pixelify_Sans']">
                  Sliding Window File Transfer Topology
                </h2>
              </div>
              <NetworkGlobeIcon className="w-10 h-10 hidden sm:block" />
            </div>

            {/* LIGHT RETRO WINDOWS TOPOLOGY LIVE PREVIEW STAGE */}
            <div className="bg-[#F8FAFC] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-col gap-4 relative overflow-hidden">

              {/* Status Bar Header */}
              <div className="flex justify-between items-center bg-[#E2E8F0] border-2 border-[#1E293B] p-2.5 rounded font-['Press_Start_2P'] text-[8px] shadow-[2px_2px_0px_#1E293B]">
                <div className="flex items-center gap-2 text-[#1E293B]">
                  <span className="text-[#2563EB] animate-pulse">■</span>
                  <span>LIVE PACKET STREAM TOPOLOGY</span>
                </div>
                <div className="bg-[#5BA848] text-white border-2 border-[#1E293B] px-2.5 py-1 rounded shadow-[1px_1px_0px_#1E293B]">
                  TRANSMITTING
                </div>
              </div>

              {/* Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-[210px_1fr_210px] gap-6 items-center py-2">
                
                {/* Sender Node */}
                <div className="bg-[#FFFDF5] border-3 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] rounded-lg p-3 text-center flex flex-col items-center gap-2 relative">
                  <span className="absolute -top-3 left-3 text-xs">📡</span>
                  <MyComputerIcon className="w-14 h-14" />
                  <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-2 w-full">
                    <div className="font-['Press_Start_2P'] text-[8px] text-[#2563EB] mb-1">SENDER</div>
                    <div className="font-['VT323'] text-2xl font-bold text-[#1D4ED8]">
                      SEQ #{seq}
                    </div>
                  </div>
                  <div className="font-['Press_Start_2P'] text-[7px] text-[#64748B]">
                    SERVER A [CWND 64K]
                  </div>
                </div>

                {/* Wire Channels & Moving Packets */}
                <div className="flex flex-col gap-5 py-2">
                  
                  {/* Data Track */}
                  <div className="relative h-10 flex flex-col justify-center">
                    <div className="flex justify-between items-center text-[7px] font-['Press_Start_2P'] text-[#475569] mb-1">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#2563EB] inline-block"></span>
                        DATA STREAM
                      </span>
                      <span>TCP SEGMENT ▶</span>
                    </div>
                    <div className="h-3 bg-[#E2E8F0] rounded border-2 border-[#1E293B] overflow-hidden relative shadow-[inner_1px_1px_0px_#000]">
                      <div className="wire-data w-full h-full"></div>
                    </div>
                    <div 
                      key={`data-${animKey}`}
                      className="absolute left-0 top-3.5 font-['Press_Start_2P'] text-[7px] bg-[#2563EB] text-white px-2 py-1 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] packet-traveling-right z-20"
                    >
                      DATA #{seq} [1460B]
                    </div>
                  </div>

                  {/* ACK Track */}
                  <div className="relative h-10 flex flex-col justify-center">
                    <div className="flex justify-between items-center text-[7px] font-['Press_Start_2P'] text-[#475569] mb-1">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#F97316] inline-block"></span>
                        ACK RETURN
                      </span>
                      <span>◀ ACKNOWLEDGEMENT</span>
                    </div>
                    <div className="h-3 bg-[#E2E8F0] rounded border-2 border-[#1E293B] overflow-hidden relative shadow-[inner_1px_1px_0px_#000]">
                      <div className="wire-ack w-full h-full"></div>
                    </div>
                    <div 
                      key={`ack-${animKey}`}
                      className="absolute right-0 top-3.5 font-['Press_Start_2P'] text-[7px] bg-[#F97316] text-[#0C101D] px-2 py-1 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] packet-traveling-left z-20"
                    >
                      ACK #{ack}
                    </div>
                  </div>

                </div>

                {/* Receiver Node */}
                <div className="bg-[#FFFDF5] border-3 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] rounded-lg p-3 text-center flex flex-col items-center gap-2 relative">
                  <span className="absolute -top-3 right-3 text-xs">📬</span>
                  <NetworkGlobeIcon className="w-14 h-14" />
                  <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-2 w-full">
                    <div className="font-['Press_Start_2P'] text-[8px] text-[#F97316] mb-1">RECEIVER</div>
                    <div className="font-['VT323'] text-2xl font-bold text-[#C2410C]">
                      ACK #{ack}
                    </div>
                  </div>
                  <div className="font-['Press_Start_2P'] text-[7px] text-[#64748B]">
                    SERVER B [RCV_BUFF]
                  </div>
                </div>

              </div>

              {/* Bottom Control Bar */}
              <div className="border-t-2 border-[#E2E8F0] pt-3 flex flex-wrap justify-between items-center gap-3">
                <div className="flex flex-wrap gap-3 text-[11px] text-[#475569] font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#2563EB] border border-black inline-block"></span> In Transit
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#F97316] border border-black inline-block"></span> ACK Return
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#5BA848] border border-black inline-block"></span> Received
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#EF4444] border border-black inline-block"></span> Loss / Retx
                  </span>
                </div>
                <button
                  onClick={manualPulseSegment}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-2 border-[#1E293B] font-['Press_Start_2P'] text-[8px] px-3.5 py-2 rounded cursor-pointer transition-transform shadow-[2px_2px_0px_#1E293B] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  ⚡ TRANSMIT NEXT SEGMENT
                </button>
              </div>

            </div>

            {/* Launch CTA Box */}
            <div className="bg-[#FFFDF5] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-6 sm:p-8 flex flex-col items-center text-center gap-3 mt-2">
              <MyComputerIcon className="w-14 h-14 pixel-float" />
              <div className="font-['Press_Start_2P'] text-[10px] text-[#2563EB]">
                INTERACTIVE LAB EXPERIMENT
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-['Pixelify_Sans']">
                Ready to experiment with real TCP packets?
              </h3>
              <p className="text-base text-[#475569] max-w-[650px] leading-relaxed">
                Launch the full interactive simulator to adjust window size, inject checksum corruption, simulate packet drop loss, and watch TCP error recovery in real time.
              </p>
              <button
                onClick={onLaunchSimulation}
                className="btn-pixel btn-pixel-primary py-3.5 px-8 text-xs flex items-center gap-3 mt-2 shadow-[4px_4px_0px_#1E293B]"
              >
                <span>LAUNCH SIMULATOR</span>
                <span>▶</span>
              </button>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: PROCEED TO SLIDING WINDOW PROTOCOL                             */}
        {/* ========================================================================= */}
        <section className="card retro-card overflow-hidden" id="sliding-window-cta">
          <div className="retro-window-header bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#7C3AED]">
            <div className="flex items-center gap-2">
              <span>🪟</span>
              <span>WINDOW_05 :: SLIDING_WINDOW_PROTOCOL_UPGRADE.EXE</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-min">_</div>
              <div className="retro-win-btn retro-win-btn-max">□</div>
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-[#FAF5FF]">
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 bg-[#DBEAFE] border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] px-3 py-1 rounded w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-ping"></span>
                <span className="font-['Press_Start_2P'] text-[8px] text-[#1E40AF]">
                  NEXT PROTOCOL EVOLUTION: PIPELINING
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-['Pixelify_Sans']">
                Proceed to Sliding Window Protocol
              </h3>
              <p className="text-base text-[#475569] max-w-[700px] leading-relaxed">
                Stop-and-Wait only allows 1 packet at a time, severely limiting throughput. Upgrade to the <strong>Sliding Window Protocol</strong> to explore its dedicated <strong>Aim & Objectives</strong>, <strong>Efficiency Formulas (η = min(1, W/(1+2a)))</strong>, and an interactive <strong>Pipelined Simulator</strong> where you can manually adjust window size (W=1 to 8) and watch the window bracket slide in real time!
              </p>
            </div>

            <button
              onClick={onProceedToSlidingWindow}
              className="btn-pixel bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-4 px-6 text-xs flex items-center gap-3 shadow-[4px_4px_0px_#1E293B] shrink-0 active:translate-x-1 active:translate-y-1"
            >
              <span>PROCEED TO SLIDING WINDOW</span>
              <span>➔</span>
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center font-['Press_Start_2P'] text-[8px] text-[#64748B] pt-4 flex flex-col gap-2">
          <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={onBackToLanding} className="hover:text-[#2563EB] cursor-pointer">Landing</button>
            <a href="#handshake" className="hover:text-[#2563EB]">Handshake 🤝</a>
            <a href="#objective" className="hover:text-[#2563EB]">Aim</a>
            <a href="#concepts" className="hover:text-[#2563EB]">Concepts</a>
            {onProceedToSlidingWindow && (
              <button onClick={onProceedToSlidingWindow} className="hover:text-[#7C3AED] cursor-pointer">Sliding Window 🪟</button>
            )}
            <button onClick={onLaunchSimulation} className="hover:text-[#2563EB] cursor-pointer">Simulator ▶</button>
          </div>
          <div>Computer Networks Project — TCP Flow & Error Control Simulator</div>
        </footer>

      </main>

    </div>
  );
}
