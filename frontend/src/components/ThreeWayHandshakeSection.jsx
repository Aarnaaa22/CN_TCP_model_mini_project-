import { useState, useEffect, useRef } from 'react';

// Retro CRT Client PC SVG Icon
function ClientPCIcon({ className = "w-14 h-14" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* CRT Monitor Housing */}
      <rect x="18" y="12" width="64" height="50" rx="4" fill="#E2E8F0" stroke="#1E293B" strokeWidth="4" />
      {/* Blue CRT Screen */}
      <rect x="24" y="18" width="52" height="38" rx="2" fill="#2563EB" />
      {/* Screen Glare Highlight */}
      <path d="M26 20 L55 20 L45 54 L26 54 Z" fill="white" fillOpacity="0.15" />
      {/* Retro Terminal Prompt on screen */}
      <rect x="28" y="24" width="22" height="14" fill="#FFFDF5" stroke="#1E293B" strokeWidth="1.5" />
      <rect x="28" y="24" width="22" height="4" fill="#1D4ED8" />
      <line x1="31" y1="32" x2="45" y2="32" stroke="#2563EB" strokeWidth="1.5" />
      {/* Monitor Stand */}
      <rect x="42" y="62" width="16" height="8" fill="#94A3B8" stroke="#1E293B" strokeWidth="3" />
      <rect x="32" y="70" width="36" height="5" rx="1" fill="#CBD5E1" stroke="#1E293B" strokeWidth="3" />
      {/* Desktop CPU Tower Base */}
      <rect x="12" y="75" width="76" height="18" rx="2" fill="#CBD5E1" stroke="#1E293B" strokeWidth="4" />
      {/* Floppy Drive Slot */}
      <rect x="18" y="80" width="28" height="3" fill="#64748B" />
      <circle cx="50" cy="81.5" r="1.5" fill="#1E293B" />
      {/* Power Button & Green LED */}
      <circle cx="72" cy="82" r="3" fill="#22C55E" />
      <circle cx="80" cy="82" r="2.5" fill="#3B82F6" />
    </svg>
  );
}

// Retro Server Rack SVG Icon
function ServerRackIcon({ className = "w-14 h-14" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Server Cabinet Frame */}
      <rect x="14" y="10" width="72" height="82" rx="4" fill="#F1F5F9" stroke="#1E293B" strokeWidth="4" />
      
      {/* Server Tray 1 */}
      <rect x="18" y="16" width="64" height="20" rx="2" fill="#CBD5E1" stroke="#1E293B" strokeWidth="3" />
      <circle cx="28" cy="26" r="3" fill="#22C55E" />
      <circle cx="36" cy="26" r="3" fill="#2563EB" />
      <line x1="46" y1="26" x2="74" y2="26" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

      {/* Server Tray 2 */}
      <rect x="18" y="41" width="64" height="20" rx="2" fill="#CBD5E1" stroke="#1E293B" strokeWidth="3" />
      <circle cx="28" cy="51" r="3" fill="#22C55E" />
      <circle cx="36" cy="51" r="3" fill="#F59E0B" />
      <line x1="46" y1="51" x2="74" y2="51" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

      {/* Server Tray 3 */}
      <rect x="18" y="66" width="64" height="20" rx="2" fill="#CBD5E1" stroke="#1E293B" strokeWidth="3" />
      <circle cx="28" cy="76" r="3" fill="#22C55E" />
      <circle cx="36" cy="76" r="3" fill="#EF4444" />
      <line x1="46" y1="76" x2="74" y2="76" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function ThreeWayHandshakeSection({ onProceedToAim }) {
  const [clientISN, setClientISN] = useState(1000);
  const [serverISN, setServerISN] = useState(5000);
  const [step, setStep] = useState(0); // 0 = Idle, 1 = SYN, 2 = SYN-ACK, 3 = ACK, 4 = Established
  const [isPlaying, setIsPlaying] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef(null);

  const stepsData = [
    {
      num: 0,
      title: "Connection Inactive (Pre-Handshake)",
      tag: "IDLE / LISTEN",
      tagBg: "bg-slate-200 text-slate-800 border-slate-700",
      direction: "none",
      clientState: "CLOSED",
      clientColor: "bg-slate-200 text-slate-800 border-slate-700",
      clientBubble: "Standing by. Click 'Step 1: SYN' or 'Auto Play' to begin!",
      serverState: "LISTEN",
      serverColor: "bg-amber-100 text-amber-900 border-amber-700",
      serverBubble: "Socket open on port 80. Passively listening for connections...",
      packetName: "NO PACKET ON WIRE",
      seq: "—",
      ack: "—",
      flags: { SYN: 0, ACK: 0 },
      plainEnglish: "Before data can transfer, TCP endpoints must synchronize. Server B is listening for connection requests. Client A has not yet sent any packet.",
      whyItMatters: "TCP is connection-oriented: it guarantees zero data loss by strictly establishing mutual state before transmitting real user bytes."
    },
    {
      num: 1,
      title: "Step 1 of 3: Client Sends SYN (Synchronize)",
      tag: "STEP 1: SYN",
      tagBg: "bg-blue-100 text-blue-900 border-blue-700 animate-pulse",
      direction: "right", // Client -> Server
      clientState: "SYN_SENT",
      clientColor: "bg-blue-100 text-blue-900 border-blue-700",
      clientBubble: `Sending SYN packet! My starting sequence number is ${clientISN}.`,
      serverState: "LISTEN (Receiving)",
      serverColor: "bg-amber-100 text-amber-900 border-amber-700",
      serverBubble: `Received SYN request with SEQ=${clientISN}! Preparing response...`,
      packetName: `SYN [SEQ=${clientISN}, ACK=0]`,
      seq: clientISN,
      ack: 0,
      flags: { SYN: 1, ACK: 0 },
      plainEnglish: `Client A wants to talk. It generates Initial Sequence Number (ISN_c = ${clientISN}) and sets SYN=1. It tells Server B: "Hello! Let's connect. My byte stream starts at ${clientISN}."`,
      whyItMatters: "SYN consumes 1 sequence number space even though it contains 0 bytes of payload. Sequence numbers are randomized to prevent old duplicate packets from interfering."
    },
    {
      num: 2,
      title: "Step 2 of 3: Server Responds with SYN-ACK",
      tag: "STEP 2: SYN-ACK",
      tagBg: "bg-amber-100 text-amber-900 border-amber-700 animate-pulse",
      direction: "left", // Server -> Client
      clientState: "SYN_SENT (Receiving)",
      clientColor: "bg-blue-100 text-blue-900 border-blue-700",
      clientBubble: `Received SYN-ACK! Server acknowledged my SEQ with ACK=${clientISN + 1}!`,
      serverState: "SYN_RCVD",
      serverColor: "bg-amber-200 text-amber-950 border-amber-800",
      serverBubble: `Sending SYN-ACK! ACK=${clientISN + 1}, my ISN is ${serverISN}.`,
      packetName: `SYN-ACK [SEQ=${serverISN}, ACK=${clientISN + 1}]`,
      seq: serverISN,
      ack: clientISN + 1,
      flags: { SYN: 1, ACK: 1 },
      plainEnglish: `Server B accepts. It sends back SYN=1 (its own connection request) and ACK=1 (acknowledging Client's SYN). ACK=${clientISN + 1} means "I got your byte ${clientISN}; I expect ${clientISN + 1} next."`,
      whyItMatters: "Piggybacking: Combining the ACK for Client's SYN and Server's own SYN into one packet saves a full round-trip time (RTT) and reduces network congestion."
    },
    {
      num: 3,
      title: "Step 3 of 3: Client Acknowledges with ACK",
      tag: "STEP 3: ACK",
      tagBg: "bg-emerald-100 text-emerald-900 border-emerald-700 animate-pulse",
      direction: "right", // Client -> Server
      clientState: "ESTABLISHED",
      clientColor: "bg-emerald-200 text-emerald-950 border-emerald-800",
      clientBubble: `Sending ACK=${serverISN + 1}! Connection is open on my side!`,
      serverState: "SYN_RCVD (Receiving)",
      serverColor: "bg-amber-200 text-amber-950 border-amber-800",
      serverBubble: `Received ACK=${serverISN + 1}! Both sides synchronized!`,
      packetName: `ACK [SEQ=${clientISN + 1}, ACK=${serverISN + 1}]`,
      seq: clientISN + 1,
      ack: serverISN + 1,
      flags: { SYN: 0, ACK: 1 },
      plainEnglish: `Client A acknowledges Server B's SYN by sending ACK=${serverISN + 1}. Client transitions to ESTABLISHED. When Server receives this ACK, Server also enters ESTABLISHED.`,
      whyItMatters: "Why 3 steps instead of 2? If it were only 2 steps, Server B would never know if Client A received its SYN-ACK. If SYN-ACK were lost, Server would stay half-open waiting forever."
    },
    {
      num: 4,
      title: "Connection ESTABLISHED (Full Duplex Ready)",
      tag: "🤝 ESTABLISHED",
      tagBg: "bg-emerald-600 text-white border-emerald-900 shadow-[2px_2px_0px_#1E293B]",
      direction: "both",
      clientState: "ESTABLISHED",
      clientColor: "bg-emerald-200 text-emerald-950 border-emerald-800",
      clientBubble: "Connection ACTIVE! Full duplex channel ready for file packets.",
      serverState: "ESTABLISHED",
      serverColor: "bg-emerald-200 text-emerald-950 border-emerald-800",
      serverBubble: "Connection ACTIVE! Ready to receive and verify checksums.",
      packetName: "🤝 3-WAY HANDSHAKE COMPLETE — READY FOR DATA",
      seq: clientISN + 1,
      ack: serverISN + 1,
      flags: { SYN: 0, ACK: 1 },
      plainEnglish: "Handshake completed successfully! Both endpoints have negotiated initial sequence numbers, window buffers, and verified 2-way reachability. The system can now transmit user data with guaranteed reliability.",
      whyItMatters: "Now that sequence pointers (SND.NXT and RCV.NXT) are aligned, TCP can detect any lost segment, calculate 16-bit checksums, and perform sliding window flow control."
    }
  ];

  const current = stepsData[step];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setStep(prev => {
        if (prev >= 4) {
          setIsPlaying(false);
          return 4;
        }
        setAnimKey(k => k + 1);
        return prev + 1;
      });
    }, 2800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  function handleNext() {
    if (step < 4) {
      setStep(s => s + 1);
      setAnimKey(k => k + 1);
    }
  }

  function handlePrev() {
    if (step > 0) {
      setStep(s => s - 1);
      setIsPlaying(false);
      setAnimKey(k => k + 1);
    }
  }

  function handleReset() {
    setStep(0);
    setIsPlaying(false);
    setAnimKey(k => k + 1);
  }

  function handleRandomize() {
    const r1 = Math.floor(Math.random() * 4000) + 1000;
    const r2 = Math.floor(Math.random() * 4000) + 5000;
    setClientISN(r1);
    setServerISN(r2);
    setStep(0);
    setIsPlaying(false);
    setAnimKey(k => k + 1);
  }

  function handleStepClick(targetStep) {
    setStep(targetStep);
    setIsPlaying(false);
    setAnimKey(k => k + 1);
  }

  return (
    <section className="card retro-card overflow-hidden" id="handshake">
      
      {/* RETRO WINDOW HEADER */}
      <div className="retro-window-header">
        <div className="flex items-center gap-2">
          <span>🤝</span>
          <span>WINDOW_01 :: TCP_THREE_WAY_HANDSHAKE.SYS</span>
        </div>
        <div className="retro-window-controls">
          <div className="retro-win-btn retro-win-btn-min">_</div>
          <div className="retro-win-btn retro-win-btn-max">□</div>
          <div className="retro-win-btn retro-win-btn-close">X</div>
        </div>
      </div>

      <div className="p-5 sm:p-7 flex flex-col gap-6">

        {/* HERO TITLE & INTRO BANNER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#E2E8F0] pb-5">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 bg-[#E0F2FE] border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] px-3 py-1 rounded w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-ping"></span>
              <span className="font-['Press_Start_2P'] text-[8px] text-[#0369A1]">
                CONNECTION ESTABLISHMENT PHASE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1E293B] font-['Pixelify_Sans']">
              TCP <span className="text-[#2563EB] underline decoration-wavy decoration-[#F97316]">Three-Way Handshake</span>
            </h2>
            <p className="text-sm sm:text-base text-[#475569] max-w-[780px] leading-relaxed">
              Before data packets can travel, TCP guarantees 100% reliable two-way communication by synchronizing sequence numbers in 3 simple steps: <strong>SYN ➔ SYN-ACK ➔ ACK</strong>.
            </p>
          </div>

          {/* ISN Sequence Number Monitor */}
          <div className="bg-[#FFFDF5] border-3 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] rounded-lg p-3 shrink-0 flex flex-col gap-1.5 min-w-[210px]">
            <div className="font-['Press_Start_2P'] text-[7px] text-[#64748B] flex items-center justify-between">
              <span>NEGOTIATED ISNs</span>
              <button
                onClick={handleRandomize}
                title="Randomize Initial Sequence Numbers"
                className="hover:text-[#2563EB] underline cursor-pointer text-[7px]"
              >
                🎲 RANDOM
              </button>
            </div>
            <div className="flex justify-between items-center text-xs font-['VT323'] bg-[#F1F5F9] border border-[#CBD5E1] p-1.5 rounded">
              <span className="text-[#2563EB] font-bold text-base">Client ISN: #{clientISN}</span>
              <span className="text-[#D97706] font-bold text-base">Server ISN: #{serverISN}</span>
            </div>
            <div className="text-[7px] font-['Press_Start_2P'] text-[#64748B] text-center">
              SYN bit consumes +1 SEQ space
            </div>
          </div>
        </div>

        {/* STEP PROGRESS TABS (Clickable interactive stepper) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {[
            { s: 0, label: "0: IDLE" },
            { s: 1, label: "1: SYN ➔" },
            { s: 2, label: "2: ◀ SYN-ACK" },
            { s: 3, label: "3: ACK ➔" },
            { s: 4, label: "4: 🤝 CONNECTED" },
          ].map(item => {
            const isCurrent = step === item.s;
            const isCompleted = step > item.s && item.s > 0;
            return (
              <button
                key={item.s}
                onClick={() => handleStepClick(item.s)}
                className={`
                  px-3 py-1.5 rounded border-2 border-[#1E293B] font-['Press_Start_2P'] text-[8px] transition-all cursor-pointer shadow-[2px_2px_0px_#1E293B]
                  ${isCurrent
                    ? 'bg-[#2563EB] text-white scale-105 shadow-[3px_3px_0px_#1E293B]'
                    : isCompleted
                    ? 'bg-[#5BA848] text-white hover:bg-[#4E933D]'
                    : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* MAIN INTERACTIVE HANDSHAKE STAGE (Retro Visual Wire & Nodes) */}
        <div className="bg-[#F8FAFC] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 sm:p-6 flex flex-col gap-5 relative overflow-hidden">
          
          {/* Stage Status Header */}
          <div className="flex flex-wrap justify-between items-center gap-3 bg-[#E2E8F0] border-2 border-[#1E293B] p-2.5 rounded font-['Press_Start_2P'] text-[8px] shadow-[2px_2px_0px_#1E293B]">
            <div className="flex items-center gap-2 text-[#1E293B]">
              <span className="text-[#2563EB] animate-pulse">■</span>
              <span>CURRENT STATUS: {current.title}</span>
            </div>
            <div className={`px-2.5 py-1 rounded border-2 font-bold ${current.tagBg}`}>
              {current.tag}
            </div>
          </div>

          {/* NODES & WIRE TRANSMISSION DIAGRAM */}
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_240px] gap-6 items-center py-3">
            
            {/* CLIENT A NODE */}
            <div className="bg-[#FFFDF5] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-4 text-center flex flex-col items-center gap-2.5 relative">
              <span className="absolute -top-3 left-3 text-sm">💻</span>
              <ClientPCIcon className="w-16 h-16 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]" />
              
              <div className="w-full">
                <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB] mb-1">
                  CLIENT A
                </div>
                <div className="text-[8px] font-['Press_Start_2P'] text-[#64748B]">
                  [PORT 49152]
                </div>
              </div>

              {/* State Badge */}
              <div className="w-full flex flex-col gap-1">
                <div className="text-[7px] font-['Press_Start_2P'] text-[#64748B]">TCP STATE:</div>
                <div className={`px-2 py-1 rounded border-2 font-['Press_Start_2P'] text-[8px] font-bold ${current.clientColor}`}>
                  {current.clientState}
                </div>
              </div>

              {/* Speech Bubble */}
              <div className="w-full bg-[#FEF3C7] border-2 border-[#1E293B] rounded p-2 text-[10px] text-amber-950 font-bold leading-tight shadow-[2px_2px_0px_#1E293B] min-h-[46px] flex items-center justify-center">
                "{current.clientBubble}"
              </div>
            </div>

            {/* MIDDLE WIRE & PACKET TRANSMISSION TRACK */}
            <div className="flex flex-col gap-4 py-2">
              
              {/* Direction Indicator */}
              <div className="flex justify-between items-center text-[8px] font-['Press_Start_2P'] text-[#475569] px-2">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 inline-block ${current.direction === 'right' ? 'bg-[#2563EB] animate-ping' : 'bg-slate-400'}`}></span>
                  CLIENT ➔ SERVER
                </span>
                <span className="text-[9px] font-bold text-[#1E293B]">
                  {current.direction === 'right' ? 'PACKET MOVING ▶' : current.direction === 'left' ? '◀ PACKET MOVING' : current.direction === 'both' ? '🤝 ESTABLISHED' : 'STANDBY'}
                </span>
                <span className="flex items-center gap-1">
                  SERVER ➔ CLIENT
                  <span className={`w-2 h-2 inline-block ${current.direction === 'left' ? 'bg-[#F97316] animate-ping' : 'bg-slate-400'}`}></span>
                </span>
              </div>

              {/* Transmission Wire Cable */}
              <div className="relative h-14 flex items-center justify-center">
                <div className="w-full h-4 bg-[#E2E8F0] rounded-full border-2 border-[#1E293B] overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]">
                  {current.direction === 'right' && (
                    <div className="wire-data w-full h-full" />
                  )}
                  {current.direction === 'left' && (
                    <div className="wire-ack w-full h-full" />
                  )}
                  {current.direction === 'both' && (
                    <div className="w-full h-full bg-[#22C55E] opacity-75" />
                  )}
                  {current.direction === 'none' && (
                    <div className="w-full h-full bg-slate-300" />
                  )}
                </div>

                {/* ANIMATED PACKET BADGE (Moving on wire) */}
                {current.direction === 'right' && (
                  <div
                    key={`pkt-r-${animKey}`}
                    className="absolute font-['Press_Start_2P'] text-[8px] bg-[#2563EB] text-white px-3 py-1.5 rounded border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] packet-traveling-right z-20 flex items-center gap-1.5"
                  >
                    <span>📦</span>
                    <span>{current.packetName}</span>
                  </div>
                )}

                {current.direction === 'left' && (
                  <div
                    key={`pkt-l-${animKey}`}
                    className="absolute font-['Press_Start_2P'] text-[8px] bg-[#F97316] text-white px-3 py-1.5 rounded border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] packet-traveling-left z-20 flex items-center gap-1.5"
                  >
                    <span>📦</span>
                    <span>{current.packetName}</span>
                  </div>
                )}

                {current.direction === 'both' && (
                  <div className="absolute font-['Press_Start_2P'] text-[9px] bg-[#16A34A] text-white px-4 py-2 rounded-lg border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] z-20 animate-bounce flex items-center gap-2">
                    <span>🤝</span>
                    <span>CONNECTION ACTIVE — READY!</span>
                  </div>
                )}

                {current.direction === 'none' && (
                  <div className="absolute font-['Press_Start_2P'] text-[7px] bg-slate-200 text-slate-700 px-3 py-1 rounded border border-[#1E293B] z-20">
                    [ WIRE IDLE ]
                  </div>
                )}
              </div>

              {/* Live Header Flags Bar */}
              <div className="bg-[#FFFDF5] border-2 border-[#1E293B] rounded p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-[2px_2px_0px_#1E293B]">
                <div className="flex items-center gap-2">
                  <span className="font-['Press_Start_2P'] text-[7px] text-[#64748B]">TCP FLAGS:</span>
                  <span className={`px-2 py-0.5 rounded border text-[8px] font-['Press_Start_2P'] ${current.flags.SYN ? 'bg-blue-600 text-white border-blue-900' : 'bg-slate-100 text-slate-400 border-slate-300'}`}>
                    SYN={current.flags.SYN}
                  </span>
                  <span className={`px-2 py-0.5 rounded border text-[8px] font-['Press_Start_2P'] ${current.flags.ACK ? 'bg-amber-600 text-white border-amber-900' : 'bg-slate-100 text-slate-400 border-slate-300'}`}>
                    ACK={current.flags.ACK}
                  </span>
                </div>

                <div className="font-['VT323'] text-lg text-[#1E293B] flex items-center gap-3">
                  <span className="text-[#2563EB] font-bold">SEQ: {current.seq}</span>
                  <span className="text-[#D97706] font-bold">ACK: {current.ack}</span>
                </div>
              </div>

            </div>

            {/* SERVER B NODE */}
            <div className="bg-[#FFFDF5] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-4 text-center flex flex-col items-center gap-2.5 relative">
              <span className="absolute -top-3 right-3 text-sm">🗄️</span>
              <ServerRackIcon className="w-16 h-16 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]" />
              
              <div className="w-full">
                <div className="font-['Press_Start_2P'] text-[9px] text-[#D97706] mb-1">
                  SERVER B
                </div>
                <div className="text-[8px] font-['Press_Start_2P'] text-[#64748B]">
                  [PORT 80 (HTTP)]
                </div>
              </div>

              {/* State Badge */}
              <div className="w-full flex flex-col gap-1">
                <div className="text-[7px] font-['Press_Start_2P'] text-[#64748B]">TCP STATE:</div>
                <div className={`px-2 py-1 rounded border-2 font-['Press_Start_2P'] text-[8px] font-bold ${current.serverColor}`}>
                  {current.serverState}
                </div>
              </div>

              {/* Speech Bubble */}
              <div className="w-full bg-[#FEF3C7] border-2 border-[#1E293B] rounded p-2 text-[10px] text-amber-950 font-bold leading-tight shadow-[2px_2px_0px_#1E293B] min-h-[46px] flex items-center justify-center">
                "{current.serverBubble}"
              </div>
            </div>

          </div>

          {/* INTERACTIVE CONTROLS TOOLBAR */}
          <div className="border-t-2 border-[#CBD5E1] pt-3 flex flex-wrap justify-between items-center gap-3">
            
            {/* Step Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                disabled={step === 0}
                onClick={handlePrev}
                className="btn-pixel bg-[#E2E8F0] hover:bg-slate-300 disabled:opacity-40 text-[#1E293B] text-[8px] py-2 px-3 shadow-[2px_2px_0px_#1E293B] cursor-pointer"
              >
                ◀ PREV
              </button>

              <button
                disabled={step === 4}
                onClick={handleNext}
                className="btn-pixel bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white text-[8px] py-2 px-4 shadow-[2px_2px_0px_#1E293B] cursor-pointer"
              >
                NEXT STEP ▶
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`btn-pixel text-[8px] py-2 px-3 shadow-[2px_2px_0px_#1E293B] cursor-pointer ${
                  isPlaying ? 'bg-[#EF4444] text-white hover:bg-rose-700' : 'bg-[#5BA848] text-white hover:bg-[#4E933D]'
                }`}
              >
                {isPlaying ? '⏸ PAUSE' : '⚡ AUTO PLAY'}
              </button>

              <button
                onClick={handleReset}
                className="btn-pixel bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] text-[8px] py-2 px-3 shadow-[2px_2px_0px_#1E293B] cursor-pointer"
              >
                ↺ RESET
              </button>
            </div>

            {/* Step Indicator Badge */}
            <div className="font-['Press_Start_2P'] text-[8px] text-[#475569]">
              STEP <span className="text-[#2563EB] font-bold">{step}</span> OF 4
            </div>

          </div>

        </div>

        {/* STEP EXPLANATION & EXAMINER INSIGHT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card 1: What is happening in plain English */}
          <div className="bg-[#FFFDF5] border-3 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] rounded-lg p-5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <span className="font-['Press_Start_2P'] text-[9px] text-[#2563EB]">
                WHAT'S HAPPENING HERE?
              </span>
            </div>
            <h4 className="text-lg font-bold text-[#1E293B] font-['Pixelify_Sans']">
              {current.title}
            </h4>
            <p className="text-sm text-[#475569] leading-relaxed">
              {current.plainEnglish}
            </p>
          </div>

          {/* Card 2: Examiner / Conceptual Question */}
          <div className="bg-[#FFFDF5] border-3 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] rounded-lg p-5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">🎓</span>
              <span className="font-['Press_Start_2P'] text-[9px] text-[#D97706]">
                EXAMINER TIP & RFC SPEC
              </span>
            </div>
            <h4 className="text-lg font-bold text-[#1E293B] font-['Pixelify_Sans']">
              Why TCP Handshake Matters
            </h4>
            <p className="text-sm text-[#475569] leading-relaxed">
              {current.whyItMatters}
            </p>
          </div>

        </div>

        {/* 3 CORE RULES SUMMARY TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] p-3 rounded flex flex-col gap-1">
            <span className="font-['Press_Start_2P'] text-[8px] text-[#2563EB]">RULE 1: SYN CONSUMPTION</span>
            <p className="text-xs text-[#475569]">SYN packets consume 1 sequence number space even with 0 bytes of payload data.</p>
          </div>
          <div className="bg-white border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] p-3 rounded flex flex-col gap-1">
            <span className="font-['Press_Start_2P'] text-[8px] text-[#D97706]">RULE 2: PIGGYBACKING</span>
            <p className="text-xs text-[#475569]">Server combines ACK for Client and its own SYN into one SYN-ACK to save 1 RTT.</p>
          </div>
          <div className="bg-white border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] p-3 rounded flex flex-col gap-1">
            <span className="font-['Press_Start_2P'] text-[8px] text-[#16A34A]">RULE 3: FULL DUPLEX</span>
            <p className="text-xs text-[#475569]">Both sides simultaneously gain independent sending and receiving sequence pointers.</p>
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION: PROCEED TO AIM & OBJECTIVES */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t-2 border-[#E2E8F0]">
          <div className="text-xs text-[#64748B] font-['Pixelify_Sans']">
            Next section: Explore project aim, specifications, and course requirements.
          </div>
          
          <a
            href="#objective"
            onClick={onProceedToAim}
            className="btn-pixel bg-[#5BA848] hover:bg-[#4E933D] text-white text-[9px] py-2.5 px-5 shadow-[3px_3px_0px_#1E293B] flex items-center gap-2"
          >
            <span>CONTINUE TO AIM & THEORY</span>
            <span>▼</span>
          </a>
        </div>

      </div>

    </section>
  );
}
