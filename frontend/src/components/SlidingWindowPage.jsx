import { useState, useEffect, useRef } from 'react';

// Classic Retro Desktop Icons
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

function ServerRackIcon({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="10" width="72" height="82" rx="4" fill="#F1F5F9" stroke="#1E293B" strokeWidth="4" />
      <rect x="18" y="16" width="64" height="20" rx="2" fill="#CBD5E1" stroke="#1E293B" strokeWidth="3" />
      <circle cx="28" cy="26" r="3" fill="#22C55E" />
      <circle cx="36" cy="26" r="3" fill="#2563EB" />
      <line x1="46" y1="26" x2="74" y2="26" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
      <rect x="18" y="41" width="64" height="20" rx="2" fill="#CBD5E1" stroke="#1E293B" strokeWidth="3" />
      <circle cx="28" cy="51" r="3" fill="#22C55E" />
      <circle cx="36" cy="51" r="3" fill="#F59E0B" />
      <line x1="46" y1="51" x2="74" y2="51" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
      <rect x="18" y="66" width="64" height="20" rx="2" fill="#CBD5E1" stroke="#1E293B" strokeWidth="3" />
      <circle cx="28" cy="76" r="3" fill="#22C55E" />
      <circle cx="36" cy="76" r="3" fill="#EF4444" />
      <line x1="46" y1="76" x2="74" y2="76" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function SlidingWindowPage({ onBackToLanding, onBackToStopAndWait, onLaunchSimulator }) {
  // Simulator State
  const TOTAL_PACKETS = 16;
  const [windowSize, setWindowSize] = useState(4); // User can change manually: 1 to 8
  const [sndUna, setSndUna] = useState(0); // Oldest unacknowledged packet (Left edge of sender window)
  const [sndNxt, setSndNxt] = useState(0); // Next packet to be transmitted
  const [rcvNxt, setRcvNxt] = useState(0); // Next in-order packet expected by receiver
  
  // Array of packet statuses: 'untransmitted' | 'in_flight' | 'acked' | 'lost' | 'corrupted'
  const [packetStates, setPacketStates] = useState(
    Array(TOTAL_PACKETS).fill('untransmitted')
  );

  // Active in-flight animations
  const [inFlightPackets, setInFlightPackets] = useState([]);
  const [inFlightAcks, setInFlightAcks] = useState([]);

  // Controls & Error injection
  const [dropNext, setDropNext] = useState(false);
  const [corruptNext, setCorruptNext] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1800); // ms per step
  const [retransmissions, setRetransmissions] = useState(0);
  const [logs, setLogs] = useState([
    { id: 1, time: '00:00', text: 'SLIDING WINDOW ENGINE INITIALIZED. SENDER WINDOW SIZE = 4.', type: 'info' }
  ]);

  const autoRunTimerRef = useRef(null);
  const timeoutTimersRef = useRef({});

  // Append to terminal log
  function addLog(text, type = 'info') {
    const time = new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ id: Date.now() + Math.random(), time, text, type }, ...prev.slice(0, 19)]);
  }

  // Handle Manual Window Size Change
  function handleWindowSizeChange(newSize) {
    const clamped = Math.max(1, Math.min(8, newSize));
    setWindowSize(clamped);
    addLog(`MANUAL CONFIG: SENDER WINDOW SIZE SET TO ${clamped}. ${clamped === 1 ? '(STOP-AND-WAIT MODE ACTIVE)' : '(PIPELINING ACTIVE)'}`, 'sys');
  }

  // Transmit next available packet within the window
  function sendNextPacket() {
    // Check if window is full: sndNxt must be < sndUna + windowSize
    if (sndNxt >= sndUna + windowSize) {
      addLog(`WINDOW FULL! Cannot send PKT #${sndNxt}. Waiting for ACK #${sndUna + 1} to slide window.`, 'warn');
      return;
    }

    if (sndNxt >= TOTAL_PACKETS) {
      addLog('ALL PACKETS HAVE BEEN TRANSMITTED.', 'success');
      setIsAutoRunning(false);
      return;
    }

    const pktSeq = sndNxt;
    const isLost = dropNext;
    const isCorrupt = corruptNext;

    // Reset single-shot error injection flags
    if (dropNext) setDropNext(false);
    if (corruptNext) setCorruptNext(false);

    // Update state
    setSndNxt(prev => prev + 1);
    setPacketStates(prev => {
      const copy = [...prev];
      copy[pktSeq] = isLost ? 'lost' : isCorrupt ? 'corrupted' : 'in_flight';
      return copy;
    });

    const flightId = `${pktSeq}-${Date.now()}`;
    setInFlightPackets(prev => [...prev, { id: flightId, seq: pktSeq, isLost, isCorrupt }]);
    addLog(`[TX] Sent PKT #${pktSeq} [Size: 1460B] (Window: [${sndUna} .. ${Math.min(TOTAL_PACKETS - 1, sndUna + windowSize - 1)}])`, isLost ? 'lost' : isCorrupt ? 'corrupt' : 'tx');

    // Simulate Network Transit
    setTimeout(() => {
      // Remove from transit animation
      setInFlightPackets(prev => prev.filter(p => p.id !== flightId));

      if (isLost) {
        addLog(`[NETWORK] PKT #${pktSeq} DROPPED IN TRANSIT! Retransmission timer started.`, 'lost');
        scheduleRetransmission(pktSeq);
        return;
      }

      if (isCorrupt) {
        addLog(`[RX] PKT #${pktSeq} CORRUPTED (CRC Mismatch)! Receiver discarded packet.`, 'corrupt');
        scheduleRetransmission(pktSeq);
        return;
      }

      // Successful Arrival at Receiver
      handlePacketArrivalAtReceiver(pktSeq);
    }, 1200);
  }

  // Receiver processing & Cumulative ACK generation (Go-Back-N / TCP model)
  function handlePacketArrivalAtReceiver(pktSeq) {
    setRcvNxt(currentExpected => {
      let nextExpected = currentExpected;
      if (pktSeq === currentExpected) {
        // In-order packet arrived!
        nextExpected = currentExpected + 1;
        addLog(`[RX] In-order PKT #${pktSeq} accepted! Cumulative ACK #${nextExpected} generated.`, 'rx');
      } else if (pktSeq > currentExpected) {
        // Out-of-order packet arrived
        addLog(`[RX] Out-of-order PKT #${pktSeq} received (expected #${currentExpected}). Generating Duplicate ACK #${currentExpected}.`, 'warn');
      }

      // Send ACK back to sender
      const ackId = `ack-${nextExpected}-${Date.now()}`;
      setInFlightAcks(prev => [...prev, { id: ackId, ackNum: nextExpected }]);

      setTimeout(() => {
        setInFlightAcks(prev => prev.filter(a => a.id !== ackId));
        handleAckArrivalAtSender(nextExpected);
      }, 1000);

      return nextExpected;
    });
  }

  // Sender receives ACK -> Slides window!
  function handleAckArrivalAtSender(ackNum) {
    setSndUna(prevUna => {
      if (ackNum > prevUna) {
        const slideAmount = ackNum - prevUna;
        addLog(`[ACK] Received Cumulative ACK #${ackNum}! Window slides right by +${slideAmount} packets!`, 'success');

        // Mark all packets up to ackNum - 1 as ACKED
        setPacketStates(prevStates => {
          const updated = [...prevStates];
          for (let i = prevUna; i < ackNum; i++) {
            if (i < TOTAL_PACKETS) updated[i] = 'acked';
          }
          return updated;
        });

        // Clear retransmission timers for acknowledged packets
        for (let i = prevUna; i < ackNum; i++) {
          if (timeoutTimersRef.current[i]) {
            clearTimeout(timeoutTimersRef.current[i]);
            delete timeoutTimersRef.current[i];
          }
        }

        return ackNum;
      } else {
        addLog(`[ACK] Duplicate ACK #${ackNum} received (Fast Retransmit check).`, 'warn');
        return prevUna;
      }
    });
  }

  // Timeout & Go-Back-N Retransmission
  function scheduleRetransmission(pktSeq) {
    if (timeoutTimersRef.current[pktSeq]) clearTimeout(timeoutTimersRef.current[pktSeq]);

    timeoutTimersRef.current[pktSeq] = setTimeout(() => {
      addLog(`[TIMEOUT] RTO expired for PKT #${pktSeq}! Retransmitting from oldest unacked #${pktSeq}...`, 'lost');
      setRetransmissions(r => r + 1);
      
      // Reset sndNxt back to unacknowledged packet (Go-Back-N retransmission)
      setSndNxt(pktSeq);
      setPacketStates(prev => {
        const copy = [...prev];
        copy[pktSeq] = 'untransmitted';
        return copy;
      });
    }, 2800);
  }

  // Burst send: Fill available window
  function sendEntireWindow() {
    const availableSlots = (sndUna + windowSize) - sndNxt;
    if (availableSlots <= 0) {
      addLog(`Window currently full (${windowSize}/${windowSize} in flight). Cannot burst send.`, 'warn');
      return;
    }
    
    addLog(`Burst transmitting ${availableSlots} packets to fill window capacity...`, 'info');
    for (let i = 0; i < availableSlots; i++) {
      setTimeout(() => {
        sendNextPacket();
      }, i * 350);
    }
  }

  // Auto Run loop
  useEffect(() => {
    if (!isAutoRunning) {
      if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
      return;
    }

    autoRunTimerRef.current = setInterval(() => {
      sendNextPacket();
    }, simSpeed);

    return () => {
      if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    };
  }, [isAutoRunning, sndNxt, sndUna, windowSize, dropNext, corruptNext, simSpeed]);

  // Full reset
  function resetSimulation() {
    setIsAutoRunning(false);
    if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    Object.values(timeoutTimersRef.current).forEach(clearTimeout);
    timeoutTimersRef.current = {};
    
    setSndUna(0);
    setSndNxt(0);
    setRcvNxt(0);
    setPacketStates(Array(TOTAL_PACKETS).fill('untransmitted'));
    setInFlightPackets([]);
    setInFlightAcks([]);
    setDropNext(false);
    setCorruptNext(false);
    setRetransmissions(0);
    addLog('SIMULATOR RESET TO INITIAL STATE (WINDOW AT [0 .. ' + (windowSize - 1) + ']).', 'sys');
  }

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
      Object.values(timeoutTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  // Compute metrics
  const inFlightCount = Math.max(0, sndNxt - sndUna);
  const totalAcked = packetStates.filter(s => s === 'acked').length;
  const progressPercent = Math.round((totalAcked / TOTAL_PACKETS) * 100);
  
  // Theoretical efficiency formula: min(1, W / (1 + 2a))
  // Assuming typical a = 1.5 (T_prop / T_trans = 1.5 -> 1 + 2a = 4)
  const theoreticalEff = Math.min(100, Math.round((windowSize / 4) * 100));

  return (
    <div className="min-h-screen bg-[#F7F4EA] text-[#1E293B] font-['Pixelify_Sans'] selection:bg-[#2563EB] selection:text-white pb-14">

      {/* TOP RETRO NAVIGATION TASKBAR */}
      <header className="sticky top-0 z-50 bg-[#FFFDF5] border-b-3 border-[#1E293B] shadow-[0_4px_0px_rgba(30,41,59,0.15)] py-2.5 mb-8">
        <div className="max-w-[1280px] mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToLanding}>
            <MyComputerIcon className="w-8 h-8" />
            <div className="px-2.5 py-1 bg-[#2563EB] text-white font-['Press_Start_2P'] text-[9px] border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
              TCP_OS
            </div>
            <div className="font-['Press_Start_2P'] text-[10px] text-[#1E293B]">
              SLIDING WINDOW PROTOCOL MODULE
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3 font-['Press_Start_2P'] text-[8px] flex-wrap">
            <button
              onClick={onBackToLanding}
              className="px-2.5 py-1.5 hover:bg-[#E2E8F0] rounded border border-transparent transition-colors cursor-pointer text-[#475569]"
            >
              🏠 LANDING
            </button>
            <button
              onClick={onBackToStopAndWait}
              className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded border border-amber-700 transition-colors cursor-pointer font-bold"
            >
              ⏱️ STOP & WAIT
            </button>
            <a
              href="#sw-aim"
              className="px-2.5 py-1.5 hover:bg-[#E2E8F0] rounded border border-transparent transition-colors text-[#475569]"
            >
              📂 AIM & SPECS
            </a>
            <a
              href="#sw-theory"
              className="px-2.5 py-1.5 hover:bg-[#E2E8F0] rounded border border-transparent transition-colors text-[#475569]"
            >
              📘 THEORY & FORMULAS
            </a>
            <a
              href="#sw-sim"
              className="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#1D4ED8] rounded border border-blue-600 transition-colors cursor-pointer font-bold"
            >
              🪟 LIVE SIMULATOR
            </a>
            <button
              onClick={onLaunchSimulator}
              className="px-3 py-1.5 bg-[#5BA848] text-white rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] hover:bg-[#4D943B] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <span>S&W ENGINE</span>
              <span>▶</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 flex flex-col gap-10">

        {/* HERO BANNER OS WINDOW */}
        <section className="card retro-card overflow-hidden">
          <div className="retro-window-header">
            <div className="flex items-center gap-2">
              <span>🪟</span>
              <span>SYSTEM_OS_V2.0 :: SLIDING_WINDOW_MODULE.EXE</span>
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
                    ADVANCED FLOW CONTROL • PIPELINED TRANSMISSION
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1E293B] leading-tight font-['Pixelify_Sans']">
                  TCP <span className="text-[#2563EB] underline decoration-wavy decoration-[#F97316]">Sliding Window</span> Protocol
                </h1>
                <p className="text-base md:text-lg text-[#475569] max-w-[880px] leading-relaxed">
                  Learn why Stop-and-Wait wastes network bandwidth and how the Sliding Window Protocol maximizes channel throughput by allowing multiple outstanding packets in flight. Adjust window size dynamically and watch the window slide in real-time.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <MyComputerIcon className="w-12 h-12" />
                <ServerRackIcon className="w-12 h-12" />
              </div>
            </div>

            {/* Quick-Jump Section Anchor Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t-2 border-[#E2E8F0]">
              <a
                href="#sw-aim"
                className="btn-pixel bg-[#E2E8F0] hover:bg-slate-300 text-[#1E293B] py-2 px-3 text-[8px] shadow-[2px_2px_0px_#1E293B] flex items-center gap-2"
              >
                <span>1. AIM & OBJECTIVES</span>
                <span>📂</span>
              </a>
              <a
                href="#sw-theory"
                className="btn-pixel bg-[#E2E8F0] hover:bg-slate-300 text-[#1E293B] py-2 px-3 text-[8px] shadow-[2px_2px_0px_#1E293B] flex items-center gap-2"
              >
                <span>2. THEORY & EFFICIENCY FORMULA</span>
                <span>📘</span>
              </a>
              <a
                href="#sw-sim"
                className="btn-pixel bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2 px-4 text-[8px] shadow-[2px_2px_0px_#1E293B] flex items-center gap-2"
              >
                <span>3. LIVE SLIDING WINDOW SIMULATOR</span>
                <span>🪟</span>
              </a>
              <button
                onClick={onBackToStopAndWait}
                className="btn-pixel bg-amber-100 hover:bg-amber-200 text-amber-950 py-2 px-3 text-[8px] shadow-[2px_2px_0px_#1E293B] flex items-center gap-2 sm:ml-auto"
              >
                <span>◀ BACK TO STOP-AND-WAIT</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: AIM & OBJECTIVES OF SLIDING WINDOW                             */}
        {/* ========================================================================= */}
        <section className="card retro-card overflow-hidden" id="sw-aim">
          <div className="retro-window-header">
            <div className="flex items-center gap-2">
              <span>📂</span>
              <span>WINDOW_SW01 :: SLIDING_WINDOW_AIM_AND_SPECS.SYS</span>
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
                AIM & COMPARISON STUDY
              </div>
              <div className="text-xs font-['Press_Start_2P'] text-[#64748B]">
                MODULE :: PROTOCOL_UPGRADE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 items-stretch">
              
              {/* Text Aim Card */}
              <div className="bg-[#F8FAFC] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-6 flex flex-col justify-center gap-3">
                <h3 className="text-xl md:text-2xl font-bold text-[#1E293B] leading-snug font-['Pixelify_Sans']">
                  Eliminating Channel Inactivity via Pipelined Windowing.
                </h3>
                <p className="text-base text-[#475569] leading-relaxed">
                  In a pure <strong>Stop-and-Wait</strong> protocol, the sender transmits 1 packet and then becomes completely idle waiting for an ACK for an entire round-trip time (RTT). On high-bandwidth or high-latency channels (like satellite or cross-continental fiber), channel utilization is under 5%!
                </p>
                <p className="text-base text-[#475569] leading-relaxed">
                  The <strong>Sliding Window Protocol</strong> solves this bottleneck: the sender is allowed to transmit up to <strong>W packets</strong> without waiting for an individual ACK. As ACKs arrive back from the receiver, the window boundary slides forward to unlock subsequent packets.
                </p>
              </div>

              {/* Protocol Comparison Matrix */}
              <div className="bg-white border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg overflow-hidden flex flex-col">
                <div className="bg-[#2563EB] text-white font-['Press_Start_2P'] text-[9px] p-3 border-b-3 border-[#1E293B]">
                  STOP & WAIT VS SLIDING WINDOW
                </div>
                <table className="w-full text-left font-['Pixelify_Sans'] text-sm border-collapse flex-1">
                  <tbody>
                    <tr className="border-b-2 border-[#E2E8F0]">
                      <td className="p-3 font-bold text-[#2563EB] bg-[#F8FAFC] w-[35%] border-r-2 border-[#E2E8F0] font-['Press_Start_2P'] text-[8px]">Metric</td>
                      <td className="p-3 font-bold text-[#D97706] bg-amber-50/50 w-[30%] border-r-2 border-[#E2E8F0] font-['Press_Start_2P'] text-[8px]">Stop & Wait</td>
                      <td className="p-3 font-bold text-[#16A34A] bg-emerald-50/50 font-['Press_Start_2P'] text-[8px]">Sliding Window</td>
                    </tr>
                    <tr className="border-b-2 border-[#E2E8F0]">
                      <td className="p-2.5 font-bold text-[#1E293B] bg-[#F8FAFC] border-r-2 border-[#E2E8F0] font-['Press_Start_2P'] text-[8px]">Window Size (W)</td>
                      <td className="p-2.5 text-[#B45309] font-bold">W = 1</td>
                      <td className="p-2.5 text-[#15803D] font-bold">W = 1 to 65,535</td>
                    </tr>
                    <tr className="border-b-2 border-[#E2E8F0]">
                      <td className="p-2.5 font-bold text-[#1E293B] bg-[#F8FAFC] border-r-2 border-[#E2E8F0] font-['Press_Start_2P'] text-[8px]">Pipelining</td>
                      <td className="p-2.5 text-rose-700 font-bold">❌ Disabled</td>
                      <td className="p-2.5 text-emerald-700 font-bold">✅ Enabled</td>
                    </tr>
                    <tr className="border-b-2 border-[#E2E8F0]">
                      <td className="p-2.5 font-bold text-[#1E293B] bg-[#F8FAFC] border-r-2 border-[#E2E8F0] font-['Press_Start_2P'] text-[8px]">Efficiency (η)</td>
                      <td className="p-2.5 text-[#B45309] font-bold">1 / (1 + 2a)</td>
                      <td className="p-2.5 text-[#15803D] font-bold">min(1, W / (1 + 2a))</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#1E293B] bg-[#F8FAFC] border-r-2 border-[#E2E8F0] font-['Press_Start_2P'] text-[8px]">ACK Style</td>
                      <td className="p-2.5 text-[#1E293B]">1 ACK per packet</td>
                      <td className="p-2.5 text-[#1E293B]">Cumulative ACK</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: THEORY, EFFICIENCY FORMULA & WINDOW ANATOMY                     */}
        {/* ========================================================================= */}
        <section className="card retro-card overflow-hidden" id="sw-theory">
          <div className="retro-window-header">
            <div className="flex items-center gap-2">
              <span>📘</span>
              <span>WINDOW_SW02 :: SLIDING_WINDOW_THEORY_AND_ANALYSIS.EXE</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-min">_</div>
              <div className="retro-win-btn retro-win-btn-max">□</div>
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">

            <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB]">
              MATHEMATICAL MODEL & POINTER MECHANICS
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] font-['Pixelify_Sans']">
              Theoretical Efficiency & Sequence Number Spaces
            </h2>

            {/* 3 Theory Concept Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Efficiency Formula */}
              <div className="bg-white border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div>
                  <div className="font-['Press_Start_2P'] text-[8px] text-[#2563EB] mb-1">
                    EFFICIENCY FORMULA
                  </div>
                  <h3 className="text-xl font-bold text-[#1E293B] mb-2 font-['Pixelify_Sans']">
                    Channel Utilization (η)
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed mb-3">
                    Let T_trans be transmission time and T_prop be propagation delay. Defining parameter a = T_prop / T_trans:
                  </p>
                </div>
                <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-3 font-['VT323'] text-base text-[#1E293B] space-y-1">
                  <div className="text-[#2563EB] font-bold text-lg">η = min(1, W / (1 + 2a))</div>
                  <div className="text-[#D97706] font-bold">If W = 1: η = 1 / (1 + 2a) [Stop-and-Wait]</div>
                  <div className="text-[#16A34A] font-bold">Optimal Window W* = 1 + 2a (100% Efficiency)</div>
                </div>
              </div>

              {/* Card 2: 4 Zones of Sequence Space */}
              <div className="bg-white border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div>
                  <div className="font-['Press_Start_2P'] text-[8px] text-[#D97706] mb-1">
                    SENDER POINTERS
                  </div>
                  <h3 className="text-xl font-bold text-[#1E293B] mb-2 font-['Pixelify_Sans']">
                    SND.UNA vs SND.NXT
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed mb-3">
                    TCP divides the sequence space into four distinct functional zones bounded by window size $W$:
                  </p>
                </div>
                <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-3 font-['VT323'] text-sm text-[#1E293B] space-y-1">
                  <div className="text-[#16A34A] font-bold">1. &lt; SND.UNA: Sent & ACKed (Slid past)</div>
                  <div className="text-[#EA580C] font-bold">2. [SND.UNA .. SND.NXT): In-flight, unacked</div>
                  <div className="text-[#2563EB] font-bold">3. [SND.NXT .. SND.UNA+W): Ready in window</div>
                  <div className="text-[#64748B] font-bold">4. ≥ SND.UNA+W: Blocked outside window</div>
                </div>
              </div>

              {/* Card 3: Go-Back-N vs Selective Repeat */}
              <div className="bg-white border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div>
                  <div className="font-['Press_Start_2P'] text-[8px] text-[#16A34A] mb-1">
                    ERROR RECOVERY FLAVORS
                  </div>
                  <h3 className="text-xl font-bold text-[#1E293B] mb-2 font-['Pixelify_Sans']">
                    Go-Back-N vs Selective Repeat
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed mb-3">
                    How sliding window handles packet loss in the pipeline:
                  </p>
                </div>
                <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-3 font-['VT323'] text-base text-[#1E293B] space-y-1">
                  <div className="text-[#DC2626] font-bold">Go-Back-N (GBN): Discards out-of-order packets. Retransmits all W packets on loss.</div>
                  <div className="text-[#9333EA] font-bold">Selective Repeat (SR): Buffers out-of-order. Retransmits ONLY lost packet.</div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: LIVE INTERACTIVE SLIDING WINDOW SIMULATOR                      */}
        {/* ========================================================================= */}
        <section className="card retro-card overflow-hidden" id="sw-sim">
          <div className="retro-window-header bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#3B82F6]">
            <div className="flex items-center gap-2">
              <span>🪟</span>
              <span>WINDOW_SW03 :: LIVE_SLIDING_WINDOW_SIMULATION.EXE</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-min">_</div>
              <div className="retro-win-btn retro-win-btn-max">□</div>
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">

            {/* Top Toolbar: Manual Window Size Selector & Metrics */}
            <div className="bg-[#FFFDF5] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-wrap items-center justify-between gap-5">
              
              {/* MANUAL WINDOW SIZE CHANGER */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-['Press_Start_2P'] text-[9px] text-[#2563EB]">
                    CONFIGURE WINDOW SIZE (W):
                  </span>
                  <span className="text-xs font-bold bg-[#E0F2FE] border-2 border-[#1E293B] px-2 py-0.5 rounded font-['VT323'] text-lg">
                    W = {windowSize}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleWindowSizeChange(windowSize - 1)}
                    disabled={windowSize <= 1}
                    className="btn-pixel bg-[#E2E8F0] hover:bg-slate-300 disabled:opacity-40 text-xs py-1.5 px-3"
                  >
                    -
                  </button>

                  {/* Window Size Slider */}
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={windowSize}
                    onChange={(e) => handleWindowSizeChange(parseInt(e.target.value))}
                    className="w-40 sm:w-56 accent-[#2563EB] cursor-pointer"
                  />

                  <button
                    onClick={() => handleWindowSizeChange(windowSize + 1)}
                    disabled={windowSize >= 8}
                    className="btn-pixel bg-[#E2E8F0] hover:bg-slate-300 disabled:opacity-40 text-xs py-1.5 px-3"
                  >
                    +
                  </button>

                  {/* Mode Tag */}
                  <span className={`px-2.5 py-1 rounded border-2 font-['Press_Start_2P'] text-[7px] ${
                    windowSize === 1
                      ? 'bg-amber-100 text-amber-950 border-amber-800'
                      : 'bg-emerald-100 text-emerald-950 border-emerald-800'
                  }`}>
                    {windowSize === 1 ? '⚠️ STOP-AND-WAIT (W=1)' : `⚡ PIPELINED (W=${windowSize})`}
                  </span>
                </div>
              </div>

              {/* LIVE REAL-TIME METRICS DISPLAY */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-2 text-center min-w-[90px]">
                  <div className="text-[7px] font-['Press_Start_2P'] text-[#64748B]">IN FLIGHT</div>
                  <div className="text-lg font-bold font-['VT323'] text-[#2563EB]">{inFlightCount} / {windowSize}</div>
                </div>
                <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-2 text-center min-w-[90px]">
                  <div className="text-[7px] font-['Press_Start_2P'] text-[#64748B]">EFFICIENCY</div>
                  <div className="text-lg font-bold font-['VT323'] text-[#16A34A]">{theoreticalEff}%</div>
                </div>
                <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-2 text-center min-w-[90px]">
                  <div className="text-[7px] font-['Press_Start_2P'] text-[#64748B]">ACKED</div>
                  <div className="text-lg font-bold font-['VT323'] text-[#15803D]">{totalAcked} / {TOTAL_PACKETS}</div>
                </div>
                <div className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-2 text-center min-w-[90px]">
                  <div className="text-[7px] font-['Press_Start_2P'] text-[#64748B]">RETX</div>
                  <div className="text-lg font-bold font-['VT323'] text-[#EF4444]">{retransmissions}</div>
                </div>
              </div>

            </div>

            {/* VISUAL SLIDING WINDOW PACKET GRID & BRACKET */}
            <div className="bg-[#F8FAFC] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-col gap-4 relative overflow-hidden">
              
              <div className="flex justify-between items-center text-[8px] font-['Press_Start_2P'] text-[#1E293B]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
                  <span>SENDER PACKET SEQUENCE SPACE [0 .. {TOTAL_PACKETS - 1}]</span>
                </div>
                <div className="text-[#64748B]">
                  SND.UNA: #{sndUna} | SND.NXT: #{sndNxt} | RCV.NXT: #{rcvNxt}
                </div>
              </div>

              {/* PACKET BLOCKS GRID */}
              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-2 relative pt-8 pb-3">
                
                {/* Physical Sliding Window Bracket Indicator (Visual Highlight) */}
                <div
                  className="absolute top-0 h-6 border-b-4 border-l-4 border-r-4 border-[#2563EB] bg-[#2563EB]/10 transition-all duration-300 pointer-events-none flex items-center justify-center font-['Press_Start_2P'] text-[7px] text-[#1D4ED8] font-bold"
                  style={{
                    left: `${(sndUna / TOTAL_PACKETS) * 100}%`,
                    width: `${(Math.min(windowSize, TOTAL_PACKETS - sndUna) / TOTAL_PACKETS) * 100}%`,
                  }}
                >
                  [ WINDOW: W={windowSize} ]
                </div>

                {Array.from({ length: TOTAL_PACKETS }).map((_, idx) => {
                  const state = packetStates[idx];
                  const isInsideWindow = idx >= sndUna && idx < sndUna + windowSize;
                  const isSndUna = idx === sndUna;
                  const isSndNxt = idx === sndNxt;

                  let bgClass = "bg-slate-200 border-slate-400 text-slate-500";
                  let statusText = "OUT";

                  if (state === 'acked') {
                    bgClass = "bg-[#22C55E] border-[#15803D] text-white";
                    statusText = "ACK";
                  } else if (state === 'in_flight') {
                    bgClass = "bg-[#F97316] border-[#C2410C] text-white animate-pulse";
                    statusText = "FLY";
                  } else if (state === 'lost') {
                    bgClass = "bg-[#EF4444] border-[#991B1B] text-white";
                    statusText = "DROP";
                  } else if (state === 'corrupted') {
                    bgClass = "bg-[#A855F7] border-[#6B21A8] text-white";
                    statusText = "CRC";
                  } else if (isInsideWindow) {
                    bgClass = "bg-[#38BDF8] border-[#0284C7] text-white";
                    statusText = "READY";
                  }

                  return (
                    <div
                      key={idx}
                      className={`
                        h-16 rounded border-2 p-1 flex flex-col justify-between items-center transition-all shadow-[2px_2px_0px_#1E293B] relative
                        ${bgClass}
                        ${isInsideWindow ? 'ring-2 ring-[#2563EB] ring-offset-1 scale-102 z-10' : 'opacity-85'}
                      `}
                    >
                      <span className="font-['Press_Start_2P'] text-[8px] font-bold">#{idx}</span>
                      <span className="font-['VT323'] text-xs font-bold leading-none">{statusText}</span>

                      {/* Pointer Tags */}
                      {isSndUna && (
                        <div className="absolute -bottom-4 bg-[#2563EB] text-white text-[6px] font-['Press_Start_2P'] px-1 rounded border border-[#1E293B] shadow-[1px_1px_0px_#1E293B]">
                          UNA
                        </div>
                      )}
                      {isSndNxt && !isSndUna && (
                        <div className="absolute -bottom-4 bg-[#F97316] text-white text-[6px] font-['Press_Start_2P'] px-1 rounded border border-[#1E293B] shadow-[1px_1px_0px_#1E293B]">
                          NXT
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-[#CBD5E1] text-[10px] font-bold text-[#475569]">
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#22C55E] border border-black inline-block"></span> ACKed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#F97316] border border-black inline-block"></span> In Flight
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#38BDF8] border border-black inline-block"></span> Ready in Window
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-slate-200 border border-black inline-block"></span> Outside Window
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#EF4444] border border-black inline-block"></span> Lost
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#A855F7] border border-black inline-block"></span> Corrupted
                  </span>
                </div>

                <div className="font-['Press_Start_2P'] text-[8px] text-[#2563EB]">
                  PROGRESS: {progressPercent}%
                </div>
              </div>

            </div>

            {/* LIVE DUAL-TRACK TRANSMISSION WIRE (Sender A <---> Wire <---> Receiver B) */}
            <div className="bg-[#FFFDF5] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-col gap-5">
              
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-6 items-center">
                
                {/* SENDER NODE A */}
                <div className="bg-[#F8FAFC] border-3 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] rounded-lg p-3 text-center flex flex-col items-center gap-2">
                  <MyComputerIcon className="w-12 h-12" />
                  <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB]">SENDER A</div>
                  <div className="bg-white border-2 border-[#1E293B] rounded p-1.5 w-full font-['VT323'] text-sm">
                    <div>Window: [{sndUna} .. {Math.min(TOTAL_PACKETS - 1, sndUna + windowSize - 1)}]</div>
                    <div className="text-[#2563EB] font-bold">Outstanding: {inFlightCount} / {windowSize}</div>
                  </div>
                </div>

                {/* ANIMATED PIPELINE WIRE TRACKS */}
                <div className="flex flex-col gap-4">
                  
                  {/* DATA TRACK (Client -> Server) */}
                  <div className="relative h-12 flex flex-col justify-center">
                    <div className="flex justify-between items-center text-[7px] font-['Press_Start_2P'] text-[#475569] mb-1">
                      <span>DATA PIPELINE ▶</span>
                      <span>MAX PIPELINE: {windowSize} PACKETS</span>
                    </div>
                    <div className="h-4 bg-[#E2E8F0] rounded-full border-2 border-[#1E293B] overflow-hidden relative shadow-[inner_0_2px_4px_rgba(0,0,0,0.1)]">
                      <div className="wire-data w-full h-full"></div>
                    </div>

                    {/* In-Flight Packets Traveling Simultaneously */}
                    {inFlightPackets.map(pkt => (
                      <div
                        key={pkt.id}
                        className={`
                          absolute font-['Press_Start_2P'] text-[7px] text-white px-2.5 py-1 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] packet-traveling-right z-20 flex items-center gap-1
                          ${pkt.isLost ? 'bg-[#EF4444]' : pkt.isCorrupt ? 'bg-[#A855F7]' : 'bg-[#2563EB]'}
                        `}
                      >
                        <span>{pkt.isLost ? '💥' : pkt.isCorrupt ? '⚠️' : '📦'}</span>
                        <span>PKT #{pkt.seq}</span>
                      </div>
                    ))}
                  </div>

                  {/* ACK TRACK (Server -> Client) */}
                  <div className="relative h-12 flex flex-col justify-center">
                    <div className="flex justify-between items-center text-[7px] font-['Press_Start_2P'] text-[#475569] mb-1">
                      <span>◀ CUMULATIVE ACK RETURN</span>
                      <span>SLIDES SENDER WINDOW</span>
                    </div>
                    <div className="h-4 bg-[#E2E8F0] rounded-full border-2 border-[#1E293B] overflow-hidden relative shadow-[inner_0_2px_4px_rgba(0,0,0,0.1)]">
                      <div className="wire-ack w-full h-full"></div>
                    </div>

                    {/* In-Flight ACKs */}
                    {inFlightAcks.map(ack => (
                      <div
                        key={ack.id}
                        className="absolute font-['Press_Start_2P'] text-[7px] bg-[#F97316] text-[#0C101D] px-2.5 py-1 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] packet-traveling-left z-20 flex items-center gap-1 font-bold"
                      >
                        <span>📬</span>
                        <span>ACK #{ack.ackNum}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* RECEIVER NODE B */}
                <div className="bg-[#F8FAFC] border-3 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] rounded-lg p-3 text-center flex flex-col items-center gap-2">
                  <ServerRackIcon className="w-12 h-12" />
                  <div className="font-['Press_Start_2P'] text-[9px] text-[#F97316]">RECEIVER B</div>
                  <div className="bg-white border-2 border-[#1E293B] rounded p-1.5 w-full font-['VT323'] text-sm">
                    <div>Expected: #{rcvNxt}</div>
                    <div className="text-[#16A34A] font-bold">In-Order Buffer: OK</div>
                  </div>
                </div>

              </div>

              {/* ACTION TOOLBAR CONTROLS */}
              <div className="border-t-2 border-[#E2E8F0] pt-4 flex flex-wrap items-center justify-between gap-3">
                
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={sendNextPacket}
                    className="btn-pixel bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[8px] py-2.5 px-4 shadow-[2px_2px_0px_#1E293B]"
                  >
                    🚀 SEND NEXT IN WINDOW
                  </button>

                  <button
                    onClick={sendEntireWindow}
                    className="btn-pixel bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[8px] py-2.5 px-3.5 shadow-[2px_2px_0px_#1E293B]"
                  >
                    📦 SEND FULL WINDOW
                  </button>

                  <button
                    onClick={() => setIsAutoRunning(!isAutoRunning)}
                    className={`btn-pixel text-[8px] py-2.5 px-4 shadow-[2px_2px_0px_#1E293B] ${
                      isAutoRunning ? 'bg-[#EF4444] text-white' : 'bg-[#5BA848] text-white'
                    }`}
                  >
                    {isAutoRunning ? '⏸ PAUSE AUTO' : '⚡ AUTO RUN'}
                  </button>

                  <button
                    onClick={() => setDropNext(!dropNext)}
                    className={`btn-pixel text-[8px] py-2.5 px-3 shadow-[2px_2px_0px_#1E293B] ${
                      dropNext ? 'bg-[#EF4444] text-white animate-pulse' : 'bg-[#F1F5F9] text-rose-700'
                    }`}
                  >
                    {dropNext ? '💥 DROP ARMED' : '💥 DROP NEXT'}
                  </button>

                  <button
                    onClick={() => setCorruptNext(!corruptNext)}
                    className={`btn-pixel text-[8px] py-2.5 px-3 shadow-[2px_2px_0px_#1E293B] ${
                      corruptNext ? 'bg-[#A855F7] text-white animate-pulse' : 'bg-[#F1F5F9] text-purple-700'
                    }`}
                  >
                    {corruptNext ? '⚠️ CRC ARMED' : '⚠️ CORRUPT NEXT'}
                  </button>

                  <button
                    onClick={resetSimulation}
                    className="btn-pixel bg-[#E2E8F0] hover:bg-slate-300 text-[#1E293B] text-[8px] py-2.5 px-3 shadow-[2px_2px_0px_#1E293B]"
                  >
                    ↺ RESET
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-['Press_Start_2P'] text-[7px] text-[#64748B]">PACE:</span>
                  <select
                    value={simSpeed}
                    onChange={(e) => setSimSpeed(parseInt(e.target.value))}
                    className="font-['Press_Start_2P'] text-[8px] bg-white border-2 border-[#1E293B] rounded px-2 py-1"
                  >
                    <option value={2400}>SLOW (2.4s)</option>
                    <option value={1800}>NORMAL (1.8s)</option>
                    <option value={1000}>FAST (1.0s)</option>
                  </select>
                </div>

              </div>

            </div>

            {/* RETRO TERMINAL LOG */}
            <div className="bg-[#0F172A] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-4 font-['VT323'] text-sm text-[#F8FAFC]">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-['Press_Start_2P'] text-[8px]">
                  <span>📟</span>
                  <span>SLIDING WINDOW LIVE TRANSMISSION LOG</span>
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="text-[7px] font-['Press_Start_2P'] text-slate-400 hover:text-white"
                >
                  CLEAR
                </button>
              </div>

              <div className="h-40 overflow-y-auto space-y-1 pr-2">
                {logs.map(log => {
                  let color = "text-slate-300";
                  if (log.type === 'tx') color = "text-blue-400";
                  if (log.type === 'rx') color = "text-emerald-400";
                  if (log.type === 'success') color = "text-green-300 font-bold";
                  if (log.type === 'lost') color = "text-rose-400 font-bold";
                  if (log.type === 'corrupt') color = "text-purple-400 font-bold";
                  if (log.type === 'warn') color = "text-amber-300";
                  if (log.type === 'sys') color = "text-cyan-300";

                  return (
                    <div key={log.id} className="flex gap-2">
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span className={color}>{log.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center font-['Press_Start_2P'] text-[8px] text-[#64748B] pt-4 flex flex-col gap-2">
          <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={onBackToLanding} className="hover:text-[#2563EB] cursor-pointer">Landing</button>
            <button onClick={onBackToStopAndWait} className="hover:text-[#2563EB] cursor-pointer">Stop & Wait ⏱️</button>
            <a href="#sw-aim" className="hover:text-[#2563EB]">Aim</a>
            <a href="#sw-theory" className="hover:text-[#2563EB]">Theory</a>
            <a href="#sw-sim" className="hover:text-[#2563EB]">Sliding Window 🪟</a>
            <button onClick={onLaunchSimulator} className="hover:text-[#2563EB] cursor-pointer">Simulator ▶</button>
          </div>
          <div>Computer Networks Project — Sliding Window Protocol & Dynamic Flow Control</div>
        </footer>

      </main>

    </div>
  );
}
