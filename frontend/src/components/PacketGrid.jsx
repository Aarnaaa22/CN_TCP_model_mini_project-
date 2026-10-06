const STATUS_STYLE = {
  CREATED:        { bg: 'bg-[#F1F5F9]',         border: 'border-[#1E293B]',  badge: 'bg-white text-slate-700' },
  SENT:           { bg: 'bg-blue-100',          border: 'border-[#1E293B]',  badge: 'bg-blue-600 text-white' },
  IN_TRANSIT:     { bg: 'bg-blue-200',          border: 'border-[#1E293B]',  badge: 'bg-blue-700 text-white' },
  LOST:           { bg: 'bg-rose-100',          border: 'border-rose-600',   badge: 'bg-rose-600 text-white' },
  CORRUPTED:      { bg: 'bg-amber-100',         border: 'border-amber-600',  badge: 'bg-amber-600 text-white' },
  RECEIVED:       { bg: 'bg-emerald-100',       border: 'border-emerald-600',badge: 'bg-emerald-600 text-white' },
  ACKED:          { bg: 'bg-orange-100',        border: 'border-orange-600', badge: 'bg-orange-600 text-white' },
  TIMEOUT:        { bg: 'bg-amber-200',         border: 'border-amber-600',  badge: 'bg-amber-700 text-white' },
  RETRANSMITTING: { bg: 'bg-purple-100',        border: 'border-purple-600', badge: 'bg-purple-600 text-white' },
  COMPLETED:      { bg: 'bg-emerald-200',       border: 'border-emerald-700',badge: 'bg-emerald-700 text-white' },
};

const STATUS_ICON = {
  CREATED: '📦', SENT: '📤', IN_TRANSIT: '📡', LOST: '💥', CORRUPTED: '👾',
  RECEIVED: '📥', ACKED: '✅', TIMEOUT: '⏳', RETRANSMITTING: '🔄', COMPLETED: '🏆',
};

export default function PacketGrid({ packets }) {
  const entries = Object.values(packets).sort((a, b) => a.packetNumber - b.packetNumber);

  if (entries.length === 0) {
    return (
      <div className="card retro-card">
        <div className="retro-window-header">
          <div className="flex items-center gap-2">
            <span>💾</span>
            <span>PACKET_MATRIX.DAT</span>
          </div>
          <div className="retro-window-controls">
            <div className="retro-win-btn retro-win-btn-min">_</div>
            <div className="retro-win-btn retro-win-btn-max">□</div>
            <div className="retro-win-btn retro-win-btn-close">X</div>
          </div>
        </div>
        <div className="p-6 text-center text-xs text-[#64748B] font-['Press_Start_2P'] text-[9px]">
          [CHOOSE A PRESET SCENARIO OR LOAD FILE TO START]
        </div>
      </div>
    );
  }

  return (
    <div className="card retro-card flex flex-col">
      <div className="retro-window-header">
        <div className="flex items-center gap-2">
          <span>💾</span>
          <span>PACKET_MATRIX.DAT</span>
        </div>
        <div className="retro-window-controls">
          <div className="retro-win-btn retro-win-btn-min">_</div>
          <div className="retro-win-btn retro-win-btn-max">□</div>
          <div className="retro-win-btn retro-win-btn-close">X</div>
        </div>
      </div>

      <div className="p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="tag-badge">STREAM SEQUENCE</span>
          <span className="text-[9px] font-['Press_Start_2P'] text-[#2563EB] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#1E293B]">
            {entries.length} TOTAL PACKETS
          </span>
        </div>

        {/* Single clean grid for presentation readability */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {entries.map(pkt => {
            const st = STATUS_STYLE[pkt.status] || STATUS_STYLE.CREATED;
            const icon = STATUS_ICON[pkt.status] || '📦';
            const isActive = ['IN_TRANSIT', 'RETRANSMITTING', 'SENT'].includes(pkt.status);

            return (
              <div
                key={pkt.packetNumber}
                className={`
                  relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-3 transition-all duration-300
                  ${st.bg} ${st.border}
                  ${isActive ? 'scale-105 shadow-[4px_4px_0px_#2563EB] ring-2 ring-blue-500' : 'shadow-[3px_3px_0px_#1E293B]'}
                `}
              >
                <div className="text-xs font-['Press_Start_2P'] font-bold text-[#1E293B]">
                  PKT {pkt.packetNumber}
                </div>

                <div className="text-xl select-none my-0.5">{icon}</div>

                <span className={`text-[8px] font-['Press_Start_2P'] px-1.5 py-0.5 rounded ${st.badge} text-center leading-tight border border-[#1E293B]`}>
                  {pkt.status?.replace('_', ' ')}
                </span>

                {pkt.retryCount > 0 && (
                  <span className="text-[8px] text-purple-900 font-['Press_Start_2P'] font-bold mt-0.5">RETX-{pkt.retryCount}</span>
                )}

                {isActive && (
                  <div className="absolute inset-0 rounded-lg border-2 border-blue-600 animate-ping pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
