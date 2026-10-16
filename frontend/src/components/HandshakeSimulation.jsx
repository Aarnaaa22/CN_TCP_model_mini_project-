import ThreeWayHandshakeSection from './ThreeWayHandshakeSection';

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

export default function HandshakeSimulation({ onProceedToOverview, onProceedToSimulation, onBackToLanding }) {
  return (
    <div className="min-h-screen bg-[#F7F4EA] text-[#1E293B] font-['Pixelify_Sans'] selection:bg-[#2563EB] selection:text-white pb-12">
      
      {/* RETRO OS TASKBAR HEADER */}
      <header className="sticky top-0 z-50 bg-[#FFFDF5] border-b-3 border-[#1E293B] shadow-[0_4px_0px_rgba(30,41,59,0.15)] py-2.5 mb-8">
        <div className="max-w-[1240px] mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToLanding}>
            <MyComputerIcon className="w-8 h-8" />
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
              className="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#1D4ED8] rounded border border-blue-600 transition-colors cursor-pointer font-bold"
            >
              📘 AIM & THEORY
            </button>
            <button
              onClick={onProceedToSimulation}
              className="px-3 py-1.5 bg-[#5BA848] text-white rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] hover:bg-[#4D943B] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <span>SIMULATOR</span>
              <span>▶</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-4 flex flex-col gap-8">
        <ThreeWayHandshakeSection
          onProceedToAim={onProceedToOverview}
        />
      </main>

    </div>
  );
}
