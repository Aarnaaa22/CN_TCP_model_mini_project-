export default function Header({ connected, status, onShowLanding }) {
  const statusConfig = {
    IDLE:      { label: 'IDLE',      bg: 'bg-slate-200 text-slate-800 border-slate-700',  dot: 'bg-slate-500' },
    RUNNING:   { label: 'RUNNING',   bg: 'bg-blue-100 text-blue-900 border-blue-700',    dot: 'bg-blue-600 animate-ping' },
    COMPLETED: { label: 'COMPLETED', bg: 'bg-emerald-100 text-emerald-900 border-emerald-700', dot: 'bg-emerald-600' },
    FAILED:    { label: 'FAILED',    bg: 'bg-rose-100 text-rose-900 border-rose-700',      dot: 'bg-rose-600' },
  };
  const s = statusConfig[status] || statusConfig.IDLE;

  return (
    <header className="sticky top-0 z-50 border-b-4 border-[#1E293B] bg-[#FFFDF5] shadow-[0_4px_0px_#1E293B]">
      <div className="retro-window-header px-4 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[#FACC15]">🕹️</span>
          <span>SYSTEM_OS_V2.0 :: TCP_MODEL_SIMULATION.EXE</span>
        </div>
        <div className="retro-window-controls">
          <div className="retro-win-btn retro-win-btn-min">_</div>
          <div className="retro-win-btn retro-win-btn-max">□</div>
          <div className="retro-win-btn retro-win-btn-close">X</div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#2563EB] border-3 border-[#1E293B] flex items-center justify-center shadow-[3px_3px_0px_#1E293B]">
            <span className="text-xl select-none">🖥️</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-sm sm:text-base font-bold text-[#1E293B] font-['Press_Start_2P'] tracking-tight">
                TCP MODEL SIMULATION
              </h1>
              <span className="tag-badge">PIXEL-OS</span>
            </div>
            <p className="text-xs text-[#475569] font-['Pixelify_Sans'] font-semibold mt-0.5 flex items-center gap-2">
              <span>Packet Loss, Checksums & Error Recovery Visualizer</span>
              <span className="text-[#EC4899] animate-bounce">♥</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onShowLanding && (
            <button
              onClick={onShowLanding}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-[#1E293B] border-2 border-[#1E293B] rounded shadow-[2px_2px_0px_#1E293B] font-['Press_Start_2P'] text-[8px] cursor-pointer"
            >
              🏠 LANDING PAGE
            </button>
          )}

          <div className="flex items-center gap-2 bg-[#F1F5F9] px-3 py-1.5 rounded-md border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
            <span className="text-[9px] font-['Press_Start_2P'] text-[#64748B]">SIM:</span>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[8px] font-['Press_Start_2P'] ${s.bg}`}>
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span>{s.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#F1F5F9] px-3 py-1.5 rounded-md border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
            <span className="text-[9px] font-['Press_Start_2P'] text-[#64748B]">NET:</span>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[8px] font-['Press_Start_2P'] ${
              connected ? 'bg-emerald-100 text-emerald-900 border-emerald-700' : 'bg-rose-100 text-rose-900 border-rose-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`} />
              <span>{connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
