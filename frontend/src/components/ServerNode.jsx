/** ServerNode.jsx — Renders Server A or Server B box (Light Circuit theme) */
export default function ServerNode({ label, role, active, side }) {
  return (
    <div className={`flex flex-col items-center gap-2.5 ${active ? 'server-active' : ''}`}>
      {/* Server icon box */}
      <div className={`
        relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-1.5
        border-2 transition-all duration-300 shadow-sm
        ${active
          ? 'border-[#4C7DFF] bg-white shadow-[0_0_20px_rgba(76,125,255,0.3)]'
          : 'border-[#12131A]/14 bg-white'
        }
      `}>
        {/* Server stack icon */}
        <div className="flex flex-col gap-1 w-10">
          {[0, 1, 2].map(i => (
            <div key={i} className={`
              h-1.5 rounded-sm transition-all duration-300
              ${active
                ? i === 0 ? 'bg-[#4C7DFF]' : i === 1 ? 'bg-[#7095FF]' : 'bg-[#2FD6B4]'
                : 'bg-[#CBD5E1]'
              }
            `} />
          ))}
        </div>
        {/* LED dots */}
        <div className="flex gap-1.5 mt-1">
          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#2FD6B4] animate-pulse shadow-[0_0_6px_#2FD6B4]' : 'bg-[#CBD5E1]'}`} />
          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#4C7DFF] shadow-[0_0_6px_#4C7DFF]' : 'bg-[#CBD5E1]'}`} />
        </div>
        {/* Side label badge */}
        <div className="absolute -top-2.5 -right-2.5">
          <span className={`
            text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs
            ${side === 'A' ? 'bg-[#4C7DFF]/15 text-[#4C7DFF] border border-[#4C7DFF]/40'
                           : 'bg-[#2FD6B4]/20 text-[#0E8570] border border-[#2FD6B4]/50'}
          `}>{side}</span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div className="text-sm font-bold text-[#12131A]">{label}</div>
        <div className="text-xs text-[#5B6478] font-medium">{role}</div>
      </div>
    </div>
  );
}
