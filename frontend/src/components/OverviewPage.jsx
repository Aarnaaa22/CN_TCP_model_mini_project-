import { useState, useEffect } from 'react';

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
              <span>●</span>
              <span>SYSTEM_OS_V2.0 :: PROTOCOL_OVERVIEW.EXE</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-min">_</div>
              <div className="retro-win-btn retro-win-btn-max">□</div>
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">

            <div className="inline-flex items-center gap-2 bg-[#E0F2FE] border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] px-3 py-1.5 rounded w-fit">
              <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-ping"></span>
              <span className="font-['Press_Start_2P'] text-[9px] text-[#0369A1]">
                COMPUTER NETWORKS • TCP PROTOCOL
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1E293B] leading-tight">
              TCP <span className="text-[#2563EB] underline decoration-wavy decoration-[#F97316]">Flow & Error</span> Control
            </h1>

            <p className="text-base md:text-lg text-[#475569] max-w-[850px] leading-relaxed">
              Visualize how Transmission Control Protocol (TCP) manages data flow, prevents receiver buffer overflow, 
              and guarantees 100% reliable packet delivery using sequence numbers, ACKs, checksums, and adaptive retransmissions.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 my-2">
              <button
                onClick={onLaunchSimulation}
                className="btn-pixel btn-pixel-primary py-3 px-6 text-xs flex items-center gap-2"
              >
                <span>EXPLORE SIMULATOR</span>
                <span>▶</span>
              </button>
              <a
                href="#objective"
                className="btn-pixel btn-pixel-secondary py-3 px-6 text-xs flex items-center gap-2"
              >
                <span>LEARN HOW TCP WORKS</span>
                <span>📜</span>
              </a>
            </div>

            {/* CRT TOPOLOGY LIVE PREVIEW STAGE */}
            <div className="bg-[#0D1222] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-col gap-4 relative overflow-hidden">

              {/* CRT Scanline Overlay Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-60 z-10"></div>

              {/* Status Bar */}
              <div className="flex justify-between items-center border-b border-[#233054] pb-3 font-['Press_Start_2P'] text-[8px]">
                <div className="flex items-center gap-2 text-[#38BDF8]">
                  <span className="animate-pulse">■</span>
                  <span>LIVE PACKET STREAM TOPOLOGY</span>
                </div>
                <div className="bg-[#064E3B] text-[#34D399] border border-[#059669] px-2 py-1 rounded">
                  TRANSMITTING
                </div>
              </div>

              {/* Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_180px] gap-6 items-center py-2">
                
                {/* Sender Node */}
                <div className="bg-[#18223D] border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] rounded p-3 text-center relative">
                  <span className="absolute -top-3 left-3 text-xs">📡</span>
                  <div className="bg-[#080C16] border border-[#1E293B] rounded p-2 mb-2">
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
                    <div className="h-2 bg-[#1E293B] rounded border border-[#233054] overflow-hidden relative">
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
                    <div className="h-2 bg-[#1E293B] rounded border border-[#233054] overflow-hidden relative">
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

                {/* Receiver Node */}
                <div className="bg-[#18223D] border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] rounded p-3 text-center relative">
                  <span className="absolute -top-3 right-3 text-xs">📬</span>
                  <div className="bg-[#080C16] border border-[#1E293B] rounded p-2 mb-2">
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
                  className="bg-[#1E293B] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#0C101D] border-2 border-[#38BDF8] font-['Press_Start_2P'] text-[8px] px-3 py-1.5 rounded cursor-pointer transition-colors"
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
              <span>●</span>
              <span>WINDOW_02 :: AIM_AND_OBJECTIVE.SYS</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-min">_</div>
              <div className="retro-win-btn retro-win-btn-max">□</div>
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">

            <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB]">
              PROJECT AIM & OBJECTIVES
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 items-stretch">
              
              {/* Text Card */}
              <div className="bg-[#F8FAFC] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-6 flex flex-col justify-center gap-3">
                <h3 className="text-xl md:text-2xl font-bold text-[#1E293B] leading-snug">
                  Make TCP's reliability mechanisms visible, not just theoretical.
                </h3>
                <p className="text-base text-[#475569] leading-relaxed">
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
              <span>●</span>
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

            <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B]">
              Core Reliability & Flow Mechanisms
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Module 1 */}
              <div className="bg-white border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div className="bg-[#1E293B] text-white font-['Press_Start_2P'] text-[8px] p-2.5 border-b-3 border-[#1E293B] flex justify-between">
                  <span>MODULE: 01</span>
                  <span>BUFFER_MGMT</span>
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                  <div>
                    <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB] mb-1">
                      FLOW CONTROL
                    </div>
                    <h3 className="text-xl font-bold text-[#1E293B] mb-2">Regulated Delivery</h3>
                    <p className="text-sm text-[#475569] leading-relaxed">
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
                <div className="bg-[#1E293B] text-white font-['Press_Start_2P'] text-[8px] p-2.5 border-b-3 border-[#1E293B] flex justify-between">
                  <span>MODULE: 02</span>
                  <span>RELIABILITY_ENG</span>
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                  <div>
                    <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB] mb-1">
                      ERROR CONTROL
                    </div>
                    <h3 className="text-xl font-bold text-[#1E293B] mb-2">Checksum & Retransmit</h3>
                    <p className="text-sm text-[#475569] leading-relaxed">
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
                <div className="bg-[#1E293B] text-white font-['Press_Start_2P'] text-[8px] p-2.5 border-b-3 border-[#1E293B] flex justify-between">
                  <span>MODULE: 03</span>
                  <span>PACKET_STREAM</span>
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                  <div>
                    <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB] mb-1">
                      DATA TRANSMISSION
                    </div>
                    <h3 className="text-xl font-bold text-[#1E293B] mb-2">Packets In Motion</h3>
                    <p className="text-sm text-[#475569] leading-relaxed">
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
              <span>●</span>
              <span>SYSTEM_DIALOGUE :: LAUNCH_SIMULATOR.EXE</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-8 md:p-10 flex flex-col items-center gap-4">
            <div className="font-['Press_Start_2P'] text-[10px] text-[#2563EB]">
              READY TO TEST TCP SIMULATION?
            </div>
            <h2 className="text-3xl font-bold text-[#1E293B]">
              Ready to see TCP in action?
            </h2>
            <p className="text-base text-[#475569] max-w-[650px] leading-relaxed">
              Launch the full interactive simulator to experiment with packet loss, delay jitter, checksum corruption, and sliding window flow control.
            </p>
            <button
              onClick={onLaunchSimulation}
              className="btn-pixel btn-pixel-primary py-4 px-8 text-sm flex items-center gap-3 mt-2"
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
