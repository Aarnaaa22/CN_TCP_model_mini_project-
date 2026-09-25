/** ServerNode.jsx — Renders Server A or Server B box */
export default function ServerNode({ label, role, active, side }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${active ? 'server-active' : ''}`}>
      {/* Server icon box */}
      <div className={`
        relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-1
        border-2 transition-all duration-500
        ${active
          ? 'border-cyan-400/60 bg-gradient-to-b from-navy-700 to-navy-800 shadow-[0_0_24px_rgba(0,212,255,0.25)]'
          : 'border-white/10 bg-navy-800'
        }
      `}>
        {/* Server stack icon */}
        <div className="flex flex-col gap-0.5 w-10">
          {[0, 1, 2].map(i => (
            <div key={i} className={`
              h-2 rounded-sm transition-all duration-300
              ${active
                ? i === 0 ? 'bg-cyan-400' : i === 1 ? 'bg-cyan-600' : 'bg-cyan-800'
                : 'bg-white/20'
              }
            `} />
          ))}
        </div>
        {/* LED dots */}
        <div className="flex gap-1 mt-1">
          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-cyan-400' : 'bg-white/10'}`} />
        </div>
        {/* Side label */}
        <div className="absolute -top-2.5 -right-2.5">
          <span className={`
            text-[9px] font-bold px-1.5 py-0.5 rounded-full
            ${side === 'A' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                           : 'bg-green-500/20 text-green-400 border border-green-500/40'}
          `}>{side}</span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div className="text-sm font-bold text-white">{label}</div>
        <div className="text-xs text-slate-500">{role}</div>
      </div>
    </div>
  );
}
