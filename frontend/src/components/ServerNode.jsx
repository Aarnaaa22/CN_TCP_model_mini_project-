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
