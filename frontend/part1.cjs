const fs = require('fs');
const path = require('path');

function save(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + relPath);
}

// 1. Header.jsx
save('src/components/Header.jsx', `
export default function Header({ connected, status }) {
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
          <span>SYSTEM_OS_V2.0 :: TCP_PROTOCOL_SIMULATOR.EXE</span>
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
                TCP RELIABLE TRANSFER
              </h1>
              <span className="tag-badge">PIXEL-OS</span>
            </div>
            <p className="text-xs text-[#475569] font-['Pixelify_Sans'] font-semibold mt-0.5 flex items-center gap-2">
              <span>Packet Loss, Checksums & Error Recovery Simulation</span>
              <span className="text-[#EC4899] animate-bounce">♥</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
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
`);

// 2. ServerNode.jsx
save('src/components/ServerNode.jsx', `
export default function ServerNode({ label, role, active, side }) {
  return (
    <div className="flex flex-col items-center gap-2 pixel-float">
      <div className={`
        relative w-28 h-28 rounded-lg flex flex-col items-center justify-center p-2
        border-3 border-[#1E293B] transition-all duration-300
        ${active
          ? 'bg-[#FEF08A] shadow-[4px_4px_0px_#1E293B,0_0_12px_rgba(250,204,21,0.5)]'
          : 'bg-[#ECE9D8] shadow-[4px_4px_0px_#1E293B]'
        }
      `}>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none text-base drop-shadow-[1px_1px_0px_#000]">
          {side === 'A' ? '💖' : '📂'}
        </div>

        <div className={`
          w-full h-16 rounded border-2 border-[#1E293B] flex flex-col items-center justify-center relative overflow-hidden
          ${active ? 'bg-[#1E3A8A] text-[#60A5FA]' : 'bg-[#0F172A] text-[#64748B]'}
        `}>
          <div className="flex flex-col items-center justify-center gap-0.5 z-10 font-['Press_Start_2P'] text-[9px]">
            <span className="text-[16px]">{side === 'A' ? '💻' : '🖥️'}</span>
            <span className="text-[7px] text-[#FACC15]">{side === 'A' ? 'SRV-A' : 'SRV-B'}</span>
          </div>

          {active && (
            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>

        <div className="w-full flex items-center justify-between px-1 mt-1.5">
          <div className="flex gap-1">
            <div className={`w-2 h-2 rounded-sm border border-[#1E293B] ${active ? 'bg-emerald-400' : 'bg-slate-400'}`} />
            <div className="w-2 h-2 rounded-sm border border-[#1E293B] bg-blue-500" />
          </div>
          <div className="w-8 h-1.5 bg-[#1E293B] rounded-xs" />
        </div>

        <div className="absolute -top-2 -right-2 z-20">
          <span className={`
            font-['Press_Start_2P'] text-[7px] px-1.5 py-0.5 rounded border-1.5 border-[#1E293B] shadow-[1px_1px_0px_#1E293B]
            ${side === 'A' ? 'bg-[#3B82F6] text-white' : 'bg-[#22C55E] text-white'}
          `}>
            {side}
          </span>
        </div>
      </div>

      <div className="text-center font-['Pixelify_Sans']">
        <div className="text-xs font-bold text-[#1E293B] uppercase tracking-wider font-['Press_Start_2P'] text-[9px]">{label}</div>
        <div className="text-xs text-[#475569] font-semibold">{role}</div>
      </div>
    </div>
  );
}
`);
