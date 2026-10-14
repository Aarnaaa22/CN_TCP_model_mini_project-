import { useState, useEffect, useRef } from 'react';

// Classic Retro Desktop Icons
function ComputerIcon({ className = "w-8 h-8" }) {
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
      <rect x="18" y="14" width="64" height="22" rx="3" fill="#CBD5E1" stroke="#1E293B" strokeWidth="4" />
      <circle cx="30" cy="25" r="3" fill="#22C55E" />
      <circle cx="40" cy="25" r="3" fill="#2563EB" />
      <line x1="50" y1="25" x2="72" y2="25" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

      <rect x="18" y="39" width="64" height="22" rx="3" fill="#CBD5E1" stroke="#1E293B" strokeWidth="4" />
      <circle cx="30" cy="50" r="3" fill="#22C55E" />
      <circle cx="40" cy="50" r="3" fill="#F59E0B" />
      <line x1="50" y1="50" x2="72" y2="50" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

      <rect x="18" y="64" width="64" height="22" rx="3" fill="#CBD5E1" stroke="#1E293B" strokeWidth="4" />
      <circle cx="30" cy="75" r="3" fill="#22C55E" />
      <circle cx="40" cy="75" r="3" fill="#EF4444" />
      <line x1="50" y1="75" x2="72" y2="75" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function HandshakeSimulation({ onProceedToOverview, onProceedToSimulation, onBackToLanding }) {
  // Initial Sequence Numbers (Default: 1000 and 5000)
  const [clientISN, setClientISN] = useState(1000);
  const [serverISN, setServerISN] = useState(5000);

  // Steps:
  // 0: Initial / Idle (CLOSED, LISTEN)
  // 1: Step 1 (SYN in transit -> SYN_SENT, LISTEN)
  // 2: Step 2 (SYN-ACK in transit -> SYN_SENT, SYN_RCVD)
  // 3: Step 3 (ACK in transit -> ESTABLISHED, SYN_RCVD)
  // 4: Completed (ESTABLISHED, ESTABLISHED)
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2500); // ms per step
  const [simulateLoss, setSimulateLoss] = useState(false);
  const [lossRetrying, setLossRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram' | 'header' | 'fsm'

  const timerRef = useRef(null);

  // States description mapping
  const clientStates = ['CLOSED', 'SYN_SENT', 'SYN_SENT', 'ESTABLISHED', 'ESTABLISHED'];
  const serverStates = ['LISTEN', 'LISTEN / SYN_RCVD', 'SYN_RCVD', 'SYN_RCVD', 'ESTABLISHED'];

  // Step descriptions and examiner presentation notes
  const stepDetails = [
    {
      title: 'Step 0: Connection Inactive (Pre-Handshake)',
      sub: 'Server is passively listening for incoming connection requests on its designated port.',
      clientStatus: 'Client A is in CLOSED state.',
      serverStatus: 'Server B socket is in LISTEN state.',
      packetText: 'No packet on wire yet.',
      direction: 'none',
      explanation: 'Before any data can be transferred, TCP requires a connection to be established. Server B creates a socket and enters the LISTEN state, waiting for connection attempts. Client A is ready to initiate.',
      flags: { URG: 0, ACK: 0, PSH: 0, RST: 0, SYN: 0, FIN: 0 },
      seq: '-',
      ack: '-',
      examTip: 'Examiner Q: Why doesn’t TCP start transferring data immediately? A: TCP is connection-oriented. It must first synchronize sequence numbers and verify buffer capacity on both endpoints to ensure zero data loss.'
    },
    {
      title: 'Step 1: SYN (Synchronize Sequence Number)',
      sub: 'Client A sends a SYN segment with its randomly chosen Initial Sequence Number (ISN_c).',
      clientStatus: 'Client A transitions: CLOSED ➔ SYN_SENT',
      serverStatus: 'Server B is receiving SYN packet.',
      packetText: `SYN [SEQ=${clientISN}, ACK=0, WIN=65535]`,
      direction: 'right', // Client -> Server
      packetType: 'SYN',
      explanation: `Client A wants to establish a connection. It generates a random 32-bit Initial Sequence Number (ISN = ${clientISN}). It sets the SYN control bit to 1. Note: SYN consumes 1 sequence number space even though it carries 0 bytes of user payload!`,
      flags: { URG: 0, ACK: 0, PSH: 0, RST: 0, SYN: 1, FIN: 0 },
      seq: clientISN,
      ack: 0,
      examTip: 'Examiner Q: Why is the ISN random instead of always 0? A: Security & uniqueness. Random ISN prevents "delayed duplicate packets" from old zombie connections colliding with the new connection, and protects against TCP sequence prediction attacks.'
    },
    {
      title: 'Step 2: SYN-ACK (Synchronize + Acknowledge)',
      sub: 'Server B acknowledges Client A’s SYN and sends its own Initial Sequence Number (ISN_s).',
      clientStatus: 'Client A is waiting in SYN_SENT.',
      serverStatus: 'Server B transitions: LISTEN ➔ SYN_RCVD',
      packetText: `SYN-ACK [SEQ=${serverISN}, ACK=${clientISN + 1}, WIN=65535]`,
      direction: 'left', // Server -> Client
      packetType: 'SYN-ACK',
      explanation: `Server B accepts the connection. It responds with both SYN=1 and ACK=1. It sets ACK = ${clientISN + 1} (ISN_c + 1), which tells Client A: "I received your SYN, next byte I expect from you is ${clientISN + 1}". Server B also chooses its own sequence number ISN_s = ${serverISN}.`,
      flags: { URG: 0, ACK: 1, PSH: 0, RST: 0, SYN: 1, FIN: 0 },
      seq: serverISN,
      ack: clientISN + 1,
      examTip: 'Examiner Q: Why is it called "Piggybacking"? A: Instead of sending an ACK packet first and a separate SYN packet later, TCP combines both into a single SYN-ACK packet to save network bandwidth and 1 round-trip delay!'
    },
    {
      title: 'Step 3: ACK (Client Acknowledges Server)',
      sub: 'Client A acknowledges Server B’s SYN. Both endpoints are now ready.',
      clientStatus: 'Client A transitions: SYN_SENT ➔ ESTABLISHED',
      serverStatus: 'Server B is receiving the ACK...',
      packetText: `ACK [SEQ=${clientISN + 1}, ACK=${serverISN + 1}, WIN=65535]`,
      direction: 'right', // Client -> Server
      packetType: 'ACK',
      explanation: `Client A receives the SYN-ACK and moves its state to ESTABLISHED. It sends back the final ACK packet with SEQ = ${clientISN + 1} and ACK = ${serverISN + 1} (ISN_s + 1). Once Server B receives this ACK, Server B also moves to ESTABLISHED!`,
      flags: { URG: 0, ACK: 1, PSH: 0, RST: 0, SYN: 0, FIN: 0 },
      seq: clientISN + 1,
      ack: serverISN + 1,
      examTip: 'Examiner Q: Can this 3rd ACK packet carry real application data? A: YES! RFC 793 allows the 3rd handshake packet (the final ACK) to piggyback real user application data (such as an HTTP GET request)!'
    },
    {
      title: 'Step 4: Connection ESTABLISHED (Full Duplex Ready)',
      sub: 'Two-way synchronized byte-stream channel is open and ready for file transfer!',
      clientStatus: 'Client A: ESTABLISHED (Can send & receive)',
      serverStatus: 'Server B: ESTABLISHED (Can send & receive)',
      packetText: '🤝 THREE-WAY HANDSHAKE COMPLETE! READY FOR DATA STREAM.',
      direction: 'none',
      explanation: 'The TCP 3-Way Handshake has succeeded! Both endpoints have negotiated initial sequence numbers, window buffer sizes, and verified round-trip connectivity. The application layer can now transfer files reliably.',
      flags: { URG: 0, ACK: 1, PSH: 0, RST: 0, SYN: 0, FIN: 0 },
      seq: clientISN + 1,
      ack: serverISN + 1,
      examTip: 'Examiner Q: Why is a 2-Way Handshake not sufficient? A: If it were only 2-way, the client knows the server heard it, but the server NEVER knows if the client received its SYN-ACK! If the SYN-ACK was lost or delayed, the server would open a "half-open" ghost connection and waste memory resources.'
    }
  ];

  const currentInfo = stepDetails[currentStep];

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 4) {
          setIsPlaying(false);
          return 4;
        }
        return prev + 1;
      });
    }, playSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playSpeed]);

  function handleNext() {
    if (simulateLoss && currentStep === 0) {
      // Simulate loss on step 1
      setCurrentStep(1);
      setLossRetrying(true);
      setTimeout(() => {
        setLossRetrying(false);
      }, 1800);
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setIsPlaying(false);
    }
  }

  function handleReset() {
    setCurrentStep(0);
    setIsPlaying(false);
    setLossRetrying(false);
  }

  function randomizeISN() {
    const r1 = Math.floor(Math.random() * 8000) + 1000;
    const r2 = Math.floor(Math.random() * 8000) + 5000;
    setClientISN(r1);
    setServerISN(r2);
    setCurrentStep(0);
    setIsPlaying(false);
  }

  return (
    <div className="min-h-screen bg-[#F7F4EA] text-[#1E293B] font-['Pixelify_Sans'] selection:bg-[#2563EB] selection:text-white pb-12">
      
      {/* TOP NAVIGATION / RETRO TASKBAR */}
      <header className="sticky top-0 z-50 bg-[#FFFDF5] border-b-3 border-[#1E293B] shadow-[0_4px_0px_rgba(30,41,59,0.15)] py-2.5 mb-6">
        <div className="max-w-[1400px] mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToLanding}>
            <ComputerIcon className="w-8 h-8" />
            <div className="px-2.5 py-1 bg-[#2563EB] text-white font-['Press_Start_2P'] text-[9px] border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
              TCP_OS
            </div>
            <div className="font-['Press_Start_2P'] text-[10px] text-[#1E293B]">
              3-WAY HANDSHAKE MODULE
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
              onClick={onProceedToOverview}
              className="px-2.5 py-1.5 hover:bg-[#E2E8F0] rounded border border-transparent transition-colors cursor-pointer text-[#475569]"
            >
              📘 THEORY & AIM
            </button>
            <button
              onClick={onProceedToSimulation}
              className="px-3 py-1.5 bg-[#5BA848] text-white rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] hover:bg-[#4D943B] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <span>DATA SIMULATOR</span>
              <span>▶</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 flex flex-col gap-6">

        {/* HERO BANNER OS WINDOW */}
        <div className="card retro-card overflow-hidden">
          <div className="retro-window-header">
            <div className="flex items-center gap-2">
              <span>🤝</span>
              <span>SYSTEM_OS_V2.0 :: TCP_THREE_WAY_HANDSHAKE.EXE</span>
            </div>
            <div className="retro-window-controls">
              <div className="retro-win-btn retro-win-btn-min">_</div>
              <div className="retro-win-btn retro-win-btn-max">□</div>
              <div className="retro-win-btn retro-win-btn-close">X</div>
            </div>
          </div>

          <div className="p-4 sm:p-6 flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#E0F2FE] border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] px-3 py-1 rounded w-fit mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-ping"></span>
                  <span className="font-['Press_Start_2P'] text-[8px] text-[#0369A1]">
                    CONNECTION ESTABLISHMENT PHASE
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1E293B]">
                  TCP <span className="text-[#2563EB] underline decoration-wavy decoration-[#F97316]">3-Way Handshake</span> Simulator
                </h1>
                <p className="text-sm sm:text-base text-[#475569] mt-1">
                  Watch how SYN, SYN-ACK, and ACK establish a reliable connection before file transmission starts.
                </p>
              </div>

              {/* Progress step badges */}
              <div className="flex items-center gap-1 sm:gap-2">
                {[
                  { step: 1, label: 'SYN' },
                  { step: 2, label: 'SYN-ACK' },
                  { step: 3, label: 'ACK' },
                  { step: 4, label: 'CONNECTED' },
                ].map(item => {
                  const isActive = currentStep === item.step;
                  const isDone = currentStep > item.step || currentStep === 4;
                  return (
                    <div
                      key={item.step}
                      className={`px-2.5 py-1.5 rounded border-2 border-[#1E293B] font-['Press_Start_2P'] text-[7px] sm:text-[8px] flex items-center gap-1.5 shadow-[2px_2px_0px_#1E293B] ${
                        isActive
                          ? 'bg-[#2563EB] text-white animate-pulse'
                          : isDone
                          ? 'bg-[#5BA848] text-white'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                    >
                      <span>{isDone ? '✓' : item.step}</span>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TAB SELECTOR: Diagram vs Header Breakdown vs State Machine */}
            <div className="flex items-center gap-2 border-b-2 border-[#E2E8F0] pb-2 font-['Press_Start_2P'] text-[8px]">
              <button
                onClick={() => setActiveTab('diagram')}
                className={`px-3 py-1.5 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] cursor-pointer ${
                  activeTab === 'diagram' ? 'bg-[#2563EB] text-white' : 'bg-[#FFFDF5] text-[#1E293B] hover:bg-slate-100'
                }`}
              >
                📡 LIVE WIRE TOPOLOGY
              </button>
              <button
                onClick={() => setActiveTab('header')}
                className={`px-3 py-1.5 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] cursor-pointer ${
                  activeTab === 'header' ? 'bg-[#2563EB] text-white' : 'bg-[#FFFDF5] text-[#1E293B] hover:bg-slate-100'
                }`}
              >
                📦 TCP HEADER INSPECTOR
              </button>
              <button
                onClick={() => setActiveTab('fsm')}
                className={`px-3 py-1.5 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] cursor-pointer ${
                  activeTab === 'fsm' ? 'bg-[#2563EB] text-white' : 'bg-[#FFFDF5] text-[#1E293B] hover:bg-slate-100'
                }`}
              >
                ⏱️ TIMELINE & FSM STATES
              </button>
            </div>

            {/* TAB 1: LIVE WIRE TOPOLOGY & ANIMATION */}
            {activeTab === 'diagram' && (
              <div className="bg-[#F8FAFC] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-col gap-6 relative overflow-hidden">
                
                {/* Step Subheader Banner */}
                <div className="flex flex-wrap justify-between items-center bg-[#E2E8F0] border-2 border-[#1E293B] p-2.5 rounded font-['Press_Start_2P'] text-[8px] shadow-[2px_2px_0px_#1E293B] gap-2">
                  <div className="flex items-center gap-2 text-[#1E293B]">
                    <span className="text-[#2563EB] animate-pulse">■</span>
                    <span>{currentInfo.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748B]">STAGE:</span>
                    <span className="bg-[#1E293B] text-yellow-300 px-2 py-0.5 rounded border border-[#1E293B]">
                      {currentStep === 0 ? 'READY' : currentStep === 4 ? 'ESTABLISHED' : `HANDSHAKE #${currentStep}`}
                    </span>
                  </div>
                </div>

                {/* Sender Node <---> Wires <---> Receiver Node */}
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_220px] gap-6 items-center py-2">
                  
                  {/* CLIENT NODE (Initiator) */}
                  <div className={`border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-4 text-center flex flex-col items-center gap-2.5 relative transition-all ${
                    currentStep === 4 ? 'bg-emerald-50 border-emerald-700' : 'bg-[#FFFDF5]'
                  }`}>
                    <span className="absolute -top-3 left-3 text-xs bg-[#FFFDF5] px-1 border border-[#1E293B] rounded">💻 CLIENT</span>
                    <ComputerIcon className="w-16 h-16" />
                    
                    <div className="w-full bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-2 text-left">
                      <div className="font-['Press_Start_2P'] text-[7px] text-[#2563EB] mb-1">CLIENT A (INITIATOR)</div>
                      <div className="text-xs text-[#475569] font-mono">IP: 192.168.1.10:54321</div>
                      <div className="text-xs text-[#475569] font-mono">ISN_c: <span className="font-bold text-[#2563EB]">{clientISN}</span></div>
                    </div>

                    <div className="w-full bg-white border-2 border-[#1E293B] rounded p-1.5 flex justify-between items-center font-['Press_Start_2P'] text-[7px]">
                      <span className="text-[#64748B]">STATE:</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        clientStates[currentStep] === 'ESTABLISHED'
                          ? 'bg-emerald-200 text-emerald-900 border border-emerald-600'
                          : clientStates[currentStep] === 'SYN_SENT'
                          ? 'bg-blue-200 text-blue-900 border border-blue-600 animate-pulse'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        {clientStates[currentStep]}
                      </span>
                    </div>
                  </div>

                  {/* WIRE CHANNELS & ANIMATED PACKET IN TRANSIT */}
                  <div className="flex flex-col gap-6 py-2">
                    
                    {/* Wire 1: Client to Server (SYN / ACK) */}
                    <div className="relative flex flex-col justify-center">
                      <div className="flex justify-between items-center text-[7px] font-['Press_Start_2P'] text-[#475569] mb-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-[#2563EB] inline-block"></span>
                          FORWARD WIRE (Client ➔ Server)
                        </span>
                        <span>[SYN, ACK] ▶</span>
                      </div>

                      <div className="h-4 bg-[#E2E8F0] rounded border-2 border-[#1E293B] overflow-hidden relative shadow-[inner_1px_1px_0px_#000]">
                        <div className={currentStep === 1 || currentStep === 3 ? "wire-data w-full h-full" : "wire-inactive w-full h-full"}></div>
                      </div>

                      {/* Moving packet forward */}
                      {currentStep === 1 && (
                        <div
                          key={`step1-${currentStep}-${lossRetrying}`}
                          className={`absolute left-0 top-3 font-['Press_Start_2P'] text-[7px] bg-[#2563EB] text-white px-2.5 py-1.5 rounded-lg border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] z-20 ${
                            lossRetrying ? 'packet-lost-anim bg-[#EF4444]' : 'packet-traveling-right'
                          }`}
                        >
                          {lossRetrying ? '💥 SYN PACKET DROPPED!' : `SYN [SEQ=${clientISN}]`}
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div
                          key={`step3-${currentStep}`}
                          className="absolute left-0 top-3 font-['Press_Start_2P'] text-[7px] bg-[#5BA848] text-white px-2.5 py-1.5 rounded-lg border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] packet-traveling-right z-20"
                        >
                          ACK [SEQ={clientISN + 1}, ACK={serverISN + 1}]
                        </div>
                      )}
                    </div>

                    {/* Wire 2: Server to Client (SYN-ACK) */}
                    <div className="relative flex flex-col justify-center">
                      <div className="flex justify-between items-center text-[7px] font-['Press_Start_2P'] text-[#475569] mb-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-[#F97316] inline-block"></span>
                          REVERSE WIRE (Server ➔ Client)
                        </span>
                        <span>◀ [SYN-ACK]</span>
                      </div>

                      <div className="h-4 bg-[#E2E8F0] rounded border-2 border-[#1E293B] overflow-hidden relative shadow-[inner_1px_1px_0px_#000]">
                        <div className={currentStep === 2 ? "wire-ack w-full h-full" : "wire-inactive w-full h-full"}></div>
                      </div>

                      {/* Moving packet backward */}
                      {currentStep === 2 && (
                        <div
                          key={`step2-${currentStep}`}
                          className="absolute right-0 top-3 font-['Press_Start_2P'] text-[7px] bg-[#F97316] text-[#0C101D] px-2.5 py-1.5 rounded-lg border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] packet-traveling-left z-20"
                        >
                          SYN-ACK [SEQ={serverISN}, ACK={clientISN + 1}]
                        </div>
                      )}
                    </div>

                    {/* Status Pill Box */}
                    <div className="bg-white border-2 border-[#1E293B] p-2 rounded shadow-[2px_2px_0px_#1E293B] text-center font-['Press_Start_2P'] text-[7px] sm:text-[8px]">
                      {currentStep === 0 && <span className="text-[#64748B]">💤 Sockets waiting. Click "SEND SYN" or "AUTO PLAY" to begin.</span>}
                      {currentStep === 1 && <span className="text-[#2563EB]">📤 Step 1: Client A transmitting SYN segment with ISN_c={clientISN}.</span>}
                      {currentStep === 2 && <span className="text-[#C2410C]">📥 Step 2: Server B responding with SYN-ACK (ISN_s={serverISN}, ACK={clientISN + 1}).</span>}
                      {currentStep === 3 && <span className="text-[#15803D]">📤 Step 3: Client A sending final ACK={serverISN + 1}.</span>}
                      {currentStep === 4 && <span className="text-emerald-700 font-bold">🎉 CONNECTION ESTABLISHED! Full-Duplex Socket is live.</span>}
                    </div>

                  </div>

                  {/* SERVER NODE (Listener) */}
                  <div className={`border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-4 text-center flex flex-col items-center gap-2.5 relative transition-all ${
                    currentStep === 4 ? 'bg-emerald-50 border-emerald-700' : 'bg-[#FFFDF5]'
                  }`}>
                    <span className="absolute -top-3 right-3 text-xs bg-[#FFFDF5] px-1 border border-[#1E293B] rounded">🗄️ SERVER</span>
                    <ServerRackIcon className="w-16 h-16" />
                    
                    <div className="w-full bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-2 text-left">
                      <div className="font-['Press_Start_2P'] text-[7px] text-[#F97316] mb-1">SERVER B (LISTENER)</div>
                      <div className="text-xs text-[#475569] font-mono">IP: 192.168.1.20:80</div>
                      <div className="text-xs text-[#475569] font-mono">ISN_s: <span className="font-bold text-[#F97316]">{serverISN}</span></div>
                    </div>

                    <div className="w-full bg-white border-2 border-[#1E293B] rounded p-1.5 flex justify-between items-center font-['Press_Start_2P'] text-[7px]">
                      <span className="text-[#64748B]">STATE:</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        serverStates[currentStep] === 'ESTABLISHED'
                          ? 'bg-emerald-200 text-emerald-900 border border-emerald-600'
                          : serverStates[currentStep].includes('SYN_RCVD')
                          ? 'bg-amber-200 text-amber-900 border border-amber-600 animate-pulse'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        {serverStates[currentStep]}
                      </span>
                    </div>
                  </div>

                </div>

                {/* CONNECTION ESTABLISHED SUCCESS BANNER */}
                {currentStep === 4 && (
                  <div className="bg-emerald-50 border-3 border-emerald-700 p-4 rounded-lg shadow-[4px_4px_0px_#1E293B] flex flex-wrap items-center justify-between gap-4 animate-bounce-short">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🚀</span>
                      <div>
                        <div className="font-['Press_Start_2P'] text-xs text-emerald-900 font-bold">
                          SOCKET CONNECTION ESTABLISHED (RFC 793)
                        </div>
                        <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                          Sequence numbers synchronized! File packets can now stream between Server A and Server B.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onProceedToSimulation}
                        className="btn-pixel bg-[#5BA848] text-white hover:bg-[#478A37] text-xs py-2.5 px-4 shadow-[2px_2px_0px_#1E293B]"
                      >
                        <span>START FILE TRANSFER</span>
                        <span>▶</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: TCP HEADER INSPECTION */}
            {activeTab === 'header' && (
              <div className="bg-[#F8FAFC] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB]">
                    CURRENT PACKET HEADER BITMAP (RFC 793)
                  </div>
                  <div className="text-xs text-[#475569] font-['Press_Start_2P'] text-[8px]">
                    PACKET: {currentInfo.packetText}
                  </div>
                </div>

                {/* 20-BYTE TCP HEADER GRID */}
                <div className="border-3 border-[#1E293B] bg-white rounded-lg overflow-hidden shadow-[3px_3px_0px_#1E293B]">
                  {/* Bit indices 0 to 31 */}
                  <div className="grid grid-cols-4 bg-[#1E293B] text-white font-['Press_Start_2P'] text-[7px] text-center py-1">
                    <div>BITS 0 - 7</div>
                    <div>BITS 8 - 15</div>
                    <div>BITS 16 - 23</div>
                    <div>BITS 24 - 31</div>
                  </div>

                  {/* Row 1: Source & Dest Ports */}
                  <div className="grid grid-cols-2 border-b-2 border-[#1E293B] text-center font-['Press_Start_2P'] text-[8px]">
                    <div className="p-2.5 bg-blue-50 border-r-2 border-[#1E293B]">
                      <span className="text-[#64748B] block text-[6px] mb-1">SOURCE PORT (16 BITS)</span>
                      <span className="text-[#2563EB] font-bold">{currentStep === 2 ? '80 (HTTP)' : '54321 (EPHEMERAL)'}</span>
                    </div>
                    <div className="p-2.5 bg-blue-50">
                      <span className="text-[#64748B] block text-[6px] mb-1">DESTINATION PORT (16 BITS)</span>
                      <span className="text-[#2563EB] font-bold">{currentStep === 2 ? '54321' : '80 (HTTP)'}</span>
                    </div>
                  </div>

                  {/* Row 2: Sequence Number */}
                  <div className="p-2.5 bg-amber-50 border-b-2 border-[#1E293B] text-center font-['Press_Start_2P'] text-[8px]">
                    <span className="text-[#64748B] block text-[6px] mb-1">SEQUENCE NUMBER (32 BITS)</span>
                    <span className="text-[#D97706] font-bold text-sm font-mono">{currentInfo.seq}</span>
                  </div>

                  {/* Row 3: Acknowledgment Number */}
                  <div className="p-2.5 bg-emerald-50 border-b-2 border-[#1E293B] text-center font-['Press_Start_2P'] text-[8px]">
                    <span className="text-[#64748B] block text-[6px] mb-1">ACKNOWLEDGMENT NUMBER (32 BITS)</span>
                    <span className="text-[#15803D] font-bold text-sm font-mono">{currentInfo.ack}</span>
                  </div>

                  {/* Row 4: Flags & Window */}
                  <div className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-[#1E293B]">
                    {/* Control Flags */}
                    <div className="p-2 bg-slate-50 border-r-2 border-[#1E293B] flex flex-col justify-center">
                      <span className="text-[#64748B] text-center block text-[6px] font-['Press_Start_2P'] mb-1.5">CONTROL FLAGS (6 BITS)</span>
                      <div className="grid grid-cols-6 gap-1 text-center font-['Press_Start_2P'] text-[7px]">
                        {Object.entries(currentInfo.flags).map(([flag, val]) => (
                          <div
                            key={flag}
                            className={`p-1 rounded border ${
                              val === 1
                                ? 'bg-[#2563EB] text-white border-[#1E293B] font-bold shadow-[1px_1px_0px_#000]'
                                : 'bg-slate-200 text-[#94A3B8] border-slate-300'
                            }`}
                          >
                            <div className="text-[6px]">{flag}</div>
                            <div className="text-[8px] font-bold">{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Window Size */}
                    <div className="p-2.5 bg-slate-50 text-center font-['Press_Start_2P'] text-[8px] flex flex-col justify-center">
                      <span className="text-[#64748B] block text-[6px] mb-1">WINDOW SIZE (16 BITS)</span>
                      <span className="text-[#1E293B] font-bold">65,535 BYTES (64 KB)</span>
                    </div>
                  </div>

                  {/* Row 5: Checksum & Urgent */}
                  <div className="grid grid-cols-2 text-center font-['Press_Start_2P'] text-[8px]">
                    <div className="p-2 bg-purple-50 border-r-2 border-[#1E293B]">
                      <span className="text-[#64748B] block text-[6px] mb-1">CHECKSUM (16 BITS)</span>
                      <span className="text-purple-700 font-mono text-[9px]">0x4A2F (VALID)</span>
                    </div>
                    <div className="p-2 bg-purple-50">
                      <span className="text-[#64748B] block text-[6px] mb-1">URGENT POINTER</span>
                      <span className="text-slate-500 font-mono text-[9px]">0x0000</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-600 p-3 rounded text-xs text-yellow-950 font-['Pixelify_Sans']">
                  <strong>💡 How the Flags change during Handshake:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li><span className="font-bold text-[#2563EB]">Step 1 (SYN):</span> Only <code>SYN = 1</code>. Acknowledgment number is unused (0).</li>
                    <li><span className="font-bold text-[#F97316]">Step 2 (SYN-ACK):</span> Both <code>SYN = 1</code> and <code>ACK = 1</code> are active. Piggybacks acknowledgment with server’s own sequence proposal.</li>
                    <li><span className="font-bold text-[#15803D]">Step 3 (ACK):</span> Only <code>ACK = 1</code> (SYN is 0). Confirms server’s sequence number.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 3: TIMELINE & FINITE STATE MACHINE */}
            {activeTab === 'fsm' && (
              <div className="bg-[#F8FAFC] border-3 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] rounded-lg p-5 flex flex-col gap-4">
                <div className="font-['Press_Start_2P'] text-[9px] text-[#2563EB]">
                  RFC 793 TCP CONNECTION STATE MACHINE (LADDER TIMELINE)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch font-['Pixelify_Sans']">
                  
                  {/* Client FSM */}
                  <div className="bg-white border-2 border-[#1E293B] rounded p-4 shadow-[2px_2px_0px_#1E293B]">
                    <div className="font-['Press_Start_2P'] text-[8px] text-[#2563EB] mb-2 pb-1 border-b">
                      CLIENT STATE FLOW
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className={`p-2 rounded border ${currentStep === 0 ? 'bg-blue-100 border-blue-500 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                        1. CLOSED (Initial passive state)
                      </div>
                      <div className="text-center text-[#64748B]">⬇ <em>Active Open (send SYN)</em></div>
                      <div className={`p-2 rounded border ${currentStep === 1 || currentStep === 2 ? 'bg-blue-100 border-blue-500 font-bold animate-pulse' : 'bg-slate-50 border-slate-200'}`}>
                        2. SYN_SENT (Waiting for SYN-ACK)
                      </div>
                      <div className="text-center text-[#64748B]">⬇ <em>Receive SYN-ACK, send ACK</em></div>
                      <div className={`p-2 rounded border ${currentStep >= 3 ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                        3. ESTABLISHED (Connection open!)
                      </div>
                    </div>
                  </div>

                  {/* Packet Sequence Ladder */}
                  <div className="bg-[#FFFDF5] border-2 border-[#1E293B] rounded p-4 shadow-[2px_2px_0px_#1E293B] flex flex-col justify-between">
                    <div className="font-['Press_Start_2P'] text-[8px] text-[#1E293B] mb-2 pb-1 border-b text-center">
                      PACKET EXCHANGE
                    </div>
                    <div className="space-y-4 text-xs font-['Press_Start_2P'] text-[7px]">
                      <div className="flex items-center justify-between p-2 rounded bg-blue-50 border border-blue-300">
                        <span>CLIENT</span>
                        <span className="text-[#2563EB]">─── SYN ───▶</span>
                        <span>SERVER</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-orange-50 border border-orange-300">
                        <span>CLIENT</span>
                        <span className="text-[#F97316]">◀── SYN+ACK ──</span>
                        <span>SERVER</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-green-50 border border-green-300">
                        <span>CLIENT</span>
                        <span className="text-[#16A34A]">─── ACK ───▶</span>
                        <span>SERVER</span>
                      </div>
                    </div>
                    <div className="mt-4 p-2 bg-slate-100 rounded text-center text-[8px] font-['Press_Start_2P'] text-[#475569]">
                      ⏱️ 1.5 RTT TOTAL DURATION
                    </div>
                  </div>

                  {/* Server FSM */}
                  <div className="bg-white border-2 border-[#1E293B] rounded p-4 shadow-[2px_2px_0px_#1E293B]">
                    <div className="font-['Press_Start_2P'] text-[8px] text-[#F97316] mb-2 pb-1 border-b">
                      SERVER STATE FLOW
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className={`p-2 rounded border ${currentStep === 0 ? 'bg-orange-100 border-orange-500 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                        1. LISTEN (Passive open on port 80)
                      </div>
                      <div className="text-center text-[#64748B]">⬇ <em>Receive SYN, send SYN-ACK</em></div>
                      <div className={`p-2 rounded border ${currentStep === 1 || currentStep === 2 || currentStep === 3 ? 'bg-orange-100 border-orange-500 font-bold animate-pulse' : 'bg-slate-50 border-slate-200'}`}>
                        2. SYN_RCVD (Waiting for final ACK)
                      </div>
                      <div className="text-center text-[#64748B]">⬇ <em>Receive ACK</em></div>
                      <div className={`p-2 rounded border ${currentStep === 4 ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                        3. ESTABLISHED (Connection open!)
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* INTERACTIVE CONTROLS BAR */}
            <div className="bg-[#FFFDF5] border-3 border-[#1E293B] p-4 rounded-lg shadow-[4px_4px_0px_#1E293B] flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="btn-pixel bg-[#E2E8F0] text-[#1E293B] hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-[8px]"
                >
                  ◀ PREV STEP
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentStep >= 4}
                  className="btn-pixel btn-pixel-primary disabled:opacity-40 disabled:cursor-not-allowed text-[8px]"
                >
                  {currentStep === 0 ? 'SEND SYN (STEP 1) ▶' : currentStep === 1 ? 'SEND SYN-ACK (STEP 2) ▶' : currentStep === 2 ? 'SEND ACK (STEP 3) ▶' : 'FINISH HANDSHAKE ▶'}
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={currentStep >= 4}
                  className={`btn-pixel text-[8px] ${
                    isPlaying ? 'bg-amber-400 text-black hover:bg-amber-500' : 'bg-[#2563EB] text-white hover:bg-blue-700'
                  }`}
                >
                  {isPlaying ? '⏸ PAUSE' : '▶ AUTO PLAY'}
                </button>

                <button
                  onClick={handleReset}
                  className="btn-pixel bg-rose-100 text-rose-900 hover:bg-rose-200 border-rose-800 text-[8px]"
                >
                  🔄 RESET
                </button>
              </div>

              {/* Speed & Error Simulation Sliders */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-['Press_Start_2P'] text-[7px]">
                
                <div className="flex items-center gap-2 bg-[#F1F5F9] px-2.5 py-1.5 rounded border border-[#1E293B]">
                  <span>PACE:</span>
                  <button
                    onClick={() => setPlaySpeed(3500)}
                    className={`px-1.5 py-0.5 rounded ${playSpeed === 3500 ? 'bg-[#2563EB] text-white' : 'bg-white'}`}
                  >
                    SLOW
                  </button>
                  <button
                    onClick={() => setPlaySpeed(2000)}
                    className={`px-1.5 py-0.5 rounded ${playSpeed === 2000 ? 'bg-[#2563EB] text-white' : 'bg-white'}`}
                  >
                    MED
                  </button>
                  <button
                    onClick={() => setPlaySpeed(1000)}
                    className={`px-1.5 py-0.5 rounded ${playSpeed === 1000 ? 'bg-[#2563EB] text-white' : 'bg-white'}`}
                  >
                    FAST
                  </button>
                </div>

                <button
                  onClick={randomizeISN}
                  className="px-2.5 py-1.5 bg-[#FFFDF5] border border-[#1E293B] rounded shadow-[1px_1px_0px_#1E293B] hover:bg-slate-100 cursor-pointer"
                  title="Randomize initial sequence numbers"
                >
                  🎲 RANDOMIZE ISN
                </button>

                <label className="flex items-center gap-1.5 cursor-pointer select-none bg-amber-50 px-2.5 py-1.5 rounded border border-amber-600">
                  <input
                    type="checkbox"
                    checked={simulateLoss}
                    onChange={(e) => setSimulateLoss(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span className="text-amber-900">SIMULATE SYN DROP</span>
                </label>

              </div>

            </div>

            {/* EXPLANATION & EXAMINER PRESENTATION TIP BOX */}
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4">
              
              {/* Detailed step explanation */}
              <div className="bg-white border-2 border-[#1E293B] p-4 rounded-lg shadow-[3px_3px_0px_#1E293B] flex flex-col justify-between">
                <div>
                  <div className="font-['Press_Start_2P'] text-[8px] text-[#2563EB] mb-1">
                    PROTOCOL EVENT DETAILS
                  </div>
                  <h3 className="text-base font-bold text-[#1E293B] mb-2">{currentInfo.title}</h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {currentInfo.explanation}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t text-xs font-mono text-[#64748B] flex justify-between">
                  <span>Packet Type: <strong className="text-[#1E293B]">{currentInfo.packetType || 'None'}</strong></span>
                  <span>ISN_c: <strong>{clientISN}</strong> | ISN_s: <strong>{serverISN}</strong></span>
                </div>
              </div>

              {/* Viva / Examiner presentation script tip */}
              <div className="bg-amber-50 border-2 border-amber-600 p-4 rounded-lg shadow-[3px_3px_0px_#1E293B] flex flex-col justify-between">
                <div>
                  <div className="font-['Press_Start_2P'] text-[8px] text-amber-900 mb-1 flex items-center gap-1.5">
                    <span>🎓</span>
                    <span>VIVA / EXAMINER SCRIPT TIP</span>
                  </div>
                  <p className="text-xs text-amber-950 font-semibold leading-relaxed mt-2">
                    {currentInfo.examTip}
                  </p>
                </div>
                <div className="mt-2 text-[7px] font-['Press_Start_2P'] text-amber-700">
                  [ SPEAK THIS EXPLANATION DURING THIS DEMO STEP ]
                </div>
              </div>

            </div>

            {/* BOTTOM QUICK ACTIONS: Jump to Overview or Jump to Simulator */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={onBackToLanding}
                className="btn-pixel bg-[#E2E8F0] text-[#1E293B] text-xs py-2 px-4 shadow-[2px_2px_0px_#1E293B]"
              >
                ◀ BACK TO LANDING
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={onProceedToOverview}
                  className="btn-pixel bg-blue-100 hover:bg-blue-200 text-[#1E293B] text-xs py-2 px-4 shadow-[2px_2px_0px_#1E293B]"
                >
                  📘 READ TCP CONCEPTS & AIM
                </button>
                <button
                  onClick={onProceedToSimulation}
                  className="btn-pixel btn-pixel-primary text-xs py-2.5 px-6 shadow-[3px_3px_0px_#1E293B]"
                >
                  <span>LAUNCH FILE SIMULATOR ▶</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}
