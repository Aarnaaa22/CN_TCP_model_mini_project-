import { useState, useEffect } from 'react';

// Retro CRT PC Monitor & Tower SVG Illustration Component (matching retro 90s PC sticker design)
function RetroPCMonitor({ type = 'sender', className = "w-16 h-16" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* PC Tower Base */}
      <rect x="15" y="60" width="70" height="28" rx="2" fill="#CBD5E1" stroke="#1E293B" strokeWidth="4" />
      <rect x="22" y="66" width="30" height="4" fill="#64748B" stroke="#1E293B" strokeWidth="2" />
      <rect x="22" y="74" width="8" height="6" fill="#475569" stroke="#1E293B" strokeWidth="1.5" />
      <circle cx="75" cy="74" r="3" fill="#22C55E" stroke="#1E293B" strokeWidth="1.5" />
      <rect x="62" y="72" width="6" height="6" fill="#2563EB" stroke="#1E293B" strokeWidth="1.5" />
      <rect x="15" y="85" width="70" height="3" fill="#94A3B8" />

      {/* CRT Monitor Case */}
      <rect x="18" y="10" width="64" height="48" rx="4" fill="#E2E8F0" stroke="#1E293B" strokeWidth="4" />
      <rect x="22" y="14" width="56" height="40" rx="3" fill="#94A3B8" stroke="#1E293B" strokeWidth="3" />

      {/* Screen Content Variants */}
      {type === 'sender' && (
        <g>
          <rect x="25" y="17" width="50" height="34" rx="2" fill="#2563EB" />
          <rect x="28" y="20" width="22" height="16" fill="#FFFDF5" stroke="#1E293B" strokeWidth="1.5" />
          <rect x="28" y="20" width="22" height="4" fill="#1D4ED8" />
          <rect x="36" y="26" width="24" height="18" fill="#FFFDF5" stroke="#1E293B" strokeWidth="1.5" />
          <rect x="36" y="26" width="24" height="4" fill="#2563EB" />
          <path d="M52 36 L58 42 L54 44 Z" fill="#1E293B" />
        </g>
      )}

      {type === 'receiver' && (
        <g>
          <rect x="25" y="17" width="50" height="34" rx="2" fill="#0284C7" />
          <rect x="29" y="21" width="42" height="26" fill="#080C16" stroke="#1E293B" strokeWidth="1.5" />
          <rect x="33" y="25" width="14" height="8" fill="#F97316" stroke="#FFF" strokeWidth="1" />
          <rect x="51" y="25" width="14" height="8" fill="#10B981" stroke="#FFF" strokeWidth="1" />
          <rect x="33" y="35" width="32" height="8" fill="#38BDF8" stroke="#FFF" strokeWidth="1" />
        </g>
      )}

      {type === 'bliss' && (
        <g>
          <rect x="25" y="17" width="50" height="34" rx="2" fill="#38BDF8" />
          <circle cx="35" cy="24" r="4" fill="#FFF" opacity="0.8" />
          <circle cx="55" cy="22" r="5" fill="#FFF" opacity="0.8" />
          <path d="M25 38 Q 45 28, 75 42 L75 51 L25 51 Z" fill="#22C55E" />
          <path d="M45 42 Q 60 34, 75 46 L75 51 L45 51 Z" fill="#15803D" />
        </g>
      )}

      {type === 'tictactoe' && (
        <g>
          <rect x="25" y="17" width="50" height="34" rx="2" fill="#080C16" />
          <line x1="41" y1="20" x2="41" y2="48" stroke="#FACC15" strokeWidth="2" />
          <line x1="57" y1="20" x2="57" y2="48" stroke="#FACC15" strokeWidth="2" />
          <line x1="28" y1="29" x2="72" y2="29" stroke="#FACC15" strokeWidth="2" />
          <line x1="28" y1="39" x2="72" y2="39" stroke="#FACC15" strokeWidth="2" />
          <path d="M31 23 L37 27 M37 23 L31 27" stroke="#EF4444" strokeWidth="2" />
          <circle cx="49" cy="25" r="3" fill="none" stroke="#38BDF8" strokeWidth="2" />
          <path d="M63 32 L69 36 M69 32 L63 36" stroke="#EF4444" strokeWidth="2" />
          <circle cx="34" cy="44" r="3" fill="none" stroke="#38BDF8" strokeWidth="2" />
        </g>
      )}

      {type === 'happy' && (
        <g>
          <rect x="25" y="17" width="50" height="34" rx="2" fill="#38BDF8" />
          <rect x="30" y="20" width="40" height="28" fill="#FFFDF5" stroke="#1E293B" strokeWidth="1.5" />
          <rect x="30" y="20" width="40" height="5" fill="#2563EB" />
          <rect x="38" y="30" width="4" height="4" fill="#1E293B" />
          <rect x="58" y="30" width="4" height="4" fill="#1E293B" />
          <path d="M42 39 Q 50 45, 58 39" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Ventilation & LED */}
      <rect x="68" y="52" width="10" height="2" fill="#64748B" />
      <circle cx="28" cy="53" r="1.5" fill="#22C55E" />
    </svg>
  );
}

export default function OverviewPage({ onLaunchSimulation, onBackToLanding }) {
  const [seq, setSeq] = useState(7719);
  const [ack, setAck] = useState(7419);
  const [animKey, setAnimKey] = useState(0);

  function manualPulseSegment() {
    setSeq(prev => prev + 1460);
    setAck(prev => prev + 1460);
    setAnimKey(prev => prev + 1);
  }

  // Auto-pulse packet stream animation every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      manualPulseSegment();
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F4EA] text-[#1E293B] font-['Pixelify_Sans'] selection:bg-[#2563EB] selection:text-white pb-12">

      {/* TOP RETRO OS TASKBAR / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#FFFDF5] border-b-3 border-[#1E293B] shadow-[0_4px_0px_rgba(30,41,59,0.15)] py-2.5 mb-8">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToLanding}>
            <RetroPCMonitor type="happy" className="w-9 h-9" />
            <div className="px-2.5 py-1 bg-[#2563EB] text-white font-['Press_Start_2P'] text-[9px] border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
              TCP_OS
            </div>
            <div className="font-['Press_Start_2P'] text-[10px] text-[#1E293B]">
              FLOW & ERROR CONTROL
            </div>
          </div>

          <nav className="flex items-center gap-3 font-['Press_Start_2P'] text-[8px]">
            <button
              onClick={onBackToLanding}
              className="px-2.5 py-1.5 hover:bg-[#E2E8F0] rounded border border-transparent transition-colors cursor-pointer text-[#475569]"
            >
              LANDING
            </button>
            <a
              href="#objective"
              className="px-2.5 py-1.5 hover:bg-[#E2E8F0] rounded border border-transparent transition-colors text-[#475569]"
            >
              AIM & SPECS
            </a>
            <a
              href="#concepts"
              className="px-2.5 py-1.5 hover:bg-[#E2E8F0] rounded border border-transparent transition-colors text-[#475569]"
            >
              CONCEPTS
            </a>
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

      <main className="max-w-[1200px] mx-auto px-4 flex flex-col gap-10">

        {/* HERO OS WINDOW */}
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

          <div className="p-6 md:p-8 flex flex-col gap-6">

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-[#E0F2FE] border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] px-3 py-1.5 rounded w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-ping"></span>
                <span className="font-['Press_Start_2P'] text-[9px] text-[#0369A1]">
                  COMPUTER NETWORKS • TCP PROTOCOL
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1E293B] leading-tight font-['Pixelify_Sans']">
                TCP <span className="text-[#2563EB] underline decoration-wavy decoration-[#F97316]">Flow & Error</span> Control
              </h1>
              <RetroPCMonitor type="bliss" className="w-16 h-16 hidden md:block pixel-float" />
            </div>

            <p className="text-base md:text-lg text-[#475569] max-w-[850px] leading-relaxed font-['Pixelify_Sans']">
              Visualize how Transmission Control Protocol (TCP) manages data flow, prevents receiver buffer overflow, 
              and guarantees 100% reliable packet delivery using sequence numbers, ACKs, checksums, and adaptive retransmissions.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 my-2">
              <button
                onClick={onLaunchSimulation}
                className="btn-pixel btn-pixel-primary py-3.5 px-6 text-xs flex items-center gap-2 shadow-[4px_4px_0px_#1E293B]"
              >
                <span>EXPLORE SIMULATOR</span>
                <span>▶</span>
              </button>
              <a
                href="#objective"
                className="btn-pixel btn-pixel-secondary py-3.5 px-6 text-xs flex items-center gap-2 shadow-[4px_4px_0px_#1E293B]"
              >
                <span>LEARN HOW TCP WORKS</span>
                <span>📜</span>
              </a>
            </div>

            {/* CRT TOPOLOGY LIVE PREVIEW STAGE WITH RETRO PC MONITORS */}
            <div className="bg-[#0D1222] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-col gap-4 relative overflow-hidden">

              {/* CRT Scanline Overlay Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-60 z-10"></div>

              {/* Status Bar */}
              <div className="flex justify-between items-center border-b border-[#233054] pb-3 font-['Press_Start_2P'] text-[8px]">
                <div className="flex items-center gap-2 text-[#38BDF8]">
                  <span className="animate-pulse">■</span>
                  <span>LIVE PACKET STREAM TOPOLOGY</span>
                </div>
                <div className="bg-[#064E3B] text-[#34D399] border border-[#059669] px-2.5 py-1 rounded shadow-[1px_1px_0px_#000]">
                  TRANSMITTING
                </div>
              </div>

              {/* Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-[210px_1fr_210px] gap-6 items-center py-2">
                
                {/* Sender Node with Retro PC Illustration */}
                <div className="bg-[#18223D] border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] rounded p-3 text-center flex flex-col items-center gap-2 relative">
                  <span className="absolute -top-3 left-3 text-xs">📡</span>
                  <RetroPCMonitor type="sender" className="w-16 h-16 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]" />
                  <div className="bg-[#080C16] border border-[#1E293B] rounded p-2 w-full">
                    <div className="font-['Press_Start_2P'] text-[8px] text-[#38BDF8] mb-1">SENDER</div>
                    <div className="font-['VT323'] text-xl font-bold text-[#60A5FA]">
                      SEQ #{seq}
                    </div>
                  </div>
                  <div className="font-['Press_Start_2P'] text-[7px] text-[#94A3B8]">
                    SERVER A [CWND 64K]
                  </div>
                </div>

                {/* Wire Channels & Moving Packets */}
                <div className="flex flex-col gap-5 py-2">
                  
                  {/* Data Track */}
                  <div className="relative h-9 flex flex-col justify-center">
                    <div className="flex justify-between items-center text-[7px] font-['Press_Start_2P'] text-[#94A3B8] mb-1">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#2563EB] inline-block"></span>
                        DATA STREAM
                      </span>
                      <span>TCP SEGMENT ▶</span>
                    </div>
                    <div className="h-2.5 bg-[#1E293B] rounded border border-[#233054] overflow-hidden relative">
                      <div className="wire-data w-full h-full"></div>
                    </div>
                    <div 
                      key={`data-${animKey}`}
                      className="absolute left-0 top-3 font-['Press_Start_2P'] text-[7px] bg-[#2563EB] text-white px-2 py-1 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#000] packet-traveling-right"
                    >
                      DATA #{seq} [1460B]
                    </div>
                  </div>

                  {/* ACK Track */}
                  <div className="relative h-9 flex flex-col justify-center">
                    <div className="flex justify-between items-center text-[7px] font-['Press_Start_2P'] text-[#94A3B8] mb-1">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#F97316] inline-block"></span>
                        ACK RETURN
                      </span>
                      <span>◀ ACKNOWLEDGEMENT</span>
                    </div>
                    <div className="h-2.5 bg-[#1E293B] rounded border border-[#233054] overflow-hidden relative">
                      <div className="wire-ack w-full h-full"></div>
                    </div>
                    <div 
                      key={`ack-${animKey}`}
                      className="absolute right-0 top-3 font-['Press_Start_2P'] text-[7px] bg-[#F97316] text-[#0C101D] px-2 py-1 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#000] packet-traveling-left"
                    >
                      ACK #{ack}
                    </div>
                  </div>

                </div>

                {/* Receiver Node with Retro PC Illustration */}
                <div className="bg-[#18223D] border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] rounded p-3 text-center flex flex-col items-center gap-2 relative">
                  <span className="absolute -top-3 right-3 text-xs">📬</span>
                  <RetroPCMonitor type="receiver" className="w-16 h-16 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]" />
                  <div className="bg-[#080C16] border border-[#1E293B] rounded p-2 w-full">
                    <div className="font-['Press_Start_2P'] text-[8px] text-[#F97316] mb-1">RECEIVER</div>
                    <div className="font-['VT323'] text-xl font-bold text-[#F97316]">
                      ACK #{ack}
                    </div>
                  </div>
                  <div className="font-['Press_Start_2P'] text-[7px] text-[#94A3B8]">
                    SERVER B [RCV_BUFF]
                  </div>
                </div>

              </div>

              {/* Bottom Control Bar */}
              <div className="border-t border-[#233054] pt-3 flex flex-wrap justify-between items-center gap-3">
                <div className="flex flex-wrap gap-3 text-[11px] text-[#94A3B8] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#2563EB] border border-black inline-block"></span> In Transit
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#F97316] border border-black inline-block"></span> ACK Return
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#10B981] border border-black inline-block"></span> Received
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#EF4444] border border-black inline-block"></span> Loss / Retx
                  </span>
                </div>
                <button
                  onClick={manualPulseSegment}
                  className="bg-[#1E293B] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#0C101D] border-2 border-[#38BDF8] font-['Press_Start_2P'] text-[8px] px-3.5 py-2 rounded cursor-pointer transition-colors shadow-[2px_2px_0px_#000]"
                >
                  ⚡ TRANSMIT NEXT SEGMENT
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* AIM & OBJECTIVE SECTION */}
        <section className="card retro-card overflow-hidden" id="objective">
          <div className="retro-window-header">
            <div className="flex items-center gap-2">
              <span>💻</span>
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
              <RetroPCMonitor type="tictactoe" className="w-12 h-12 hidden sm:block" />
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

        {/* CONCEPTS SECTION */}
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
                  <RetroPCMonitor type="sender" className="w-6 h-6" />
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
                  <div className="bg-[#0C101D] border-2 border-[#1E293B] rounded p-3 font-['VT323'] text-base text-[#94A3B8]">
                    <div className="text-[#38BDF8]">RCV_WND: 65,535 bytes</div>
                    <div className="text-[#34D399]">CWND: min(CWND, RCV_WND)</div>
                    <div className="text-[#FACC15]">Buffer Status: 0% Overflow</div>
                  </div>
                </div>
              </div>

              {/* Module 2 */}
              <div className="bg-white border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="bg-[#1E293B] text-white font-['Press_Start_2P'] text-[8px] p-2.5 border-b-3 border-[#1E293B] flex justify-between items-center">
                  <span>MODULE: 02</span>
                  <RetroPCMonitor type="tictactoe" className="w-6 h-6" />
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
                  <div className="bg-[#0C101D] border-2 border-[#1E293B] rounded p-3 font-['VT323'] text-base text-[#94A3B8]">
                    <div className="text-[#EF4444]">CRC Mismatch: Corrupt Packet</div>
                    <div className="text-[#FB923C]">Duplicate ACKs: 3 Received</div>
                    <div className="text-[#A855F7]">Fast Retransmit: Segment Resent</div>
                  </div>
                </div>
              </div>

              {/* Module 3 */}
              <div className="bg-white border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="bg-[#1E293B] text-white font-['Press_Start_2P'] text-[8px] p-2.5 border-b-3 border-[#1E293B] flex justify-between items-center">
                  <span>MODULE: 03</span>
                  <RetroPCMonitor type="receiver" className="w-6 h-6" />
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
                  <div className="bg-[#0C101D] border-2 border-[#1E293B] rounded p-3 font-['VT323'] text-base text-[#94A3B8]">
                    <div className="text-[#60A5FA]">SND.NXT: 7719 [MSS: 512B]</div>
                    <div className="text-[#FB923C]">RCV.NXT: 7419 (Cumulative)</div>
                    <div className="text-[#34D399]">RTT: 24.5ms (Adaptive)</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* CTA DIALOGUE WINDOW */}
        <section className="card retro-card overflow-hidden text-center max-w-[900px] mx-auto w-full my-4">
          <div className="retro-window-header bg-[#0F172A]">
            <div className="flex items-center gap-2">
              <span>🖥️</span>
              <span>SYSTEM_DIALOGUE :: LAUNCH_SIMULATOR.EXE</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-8 md:p-10 flex flex-col items-center gap-4">
            <RetroPCMonitor type="happy" className="w-20 h-20 pixel-float" />
            <div className="font-['Press_Start_2P'] text-[10px] text-[#2563EB]">
              READY TO TEST TCP SIMULATION?
            </div>
            <h2 className="text-3xl font-bold text-[#1E293B] font-['Pixelify_Sans']">
              Ready to see TCP in action?
            </h2>
            <p className="text-base text-[#475569] max-w-[650px] leading-relaxed font-['Pixelify_Sans']">
              Launch the full interactive simulator to experiment with packet loss, delay jitter, checksum corruption, and sliding window flow control.
            </p>
            <button
              onClick={onLaunchSimulation}
              className="btn-pixel btn-pixel-primary py-4 px-8 text-sm flex items-center gap-3 mt-2 shadow-[4px_4px_0px_#1E293B]"
            >
              <span>LAUNCH SIMULATOR</span>
              <span>▶</span>
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center font-['Press_Start_2P'] text-[8px] text-[#64748B] pt-4 flex flex-col gap-2">
          <div className="flex justify-center gap-4">
            <button onClick={onBackToLanding} className="hover:text-[#2563EB] cursor-pointer">Landing</button>
            <a href="#objective" className="hover:text-[#2563EB]">Aim</a>
            <a href="#concepts" className="hover:text-[#2563EB]">Concepts</a>
            <button onClick={onLaunchSimulation} className="hover:text-[#2563EB] cursor-pointer">Simulator ▶</button>
          </div>
          <div>Computer Networks Project — TCP Flow & Error Control Simulator</div>
        </footer>

      </main>

    </div>
  );
}
