/** PacketGrid.jsx — Grid of packet cards showing real-time state */

const STATUS_STYLE = {
  CREATED:        { bg: 'bg-slate-700/40',  border: 'border-slate-600/40', badge: 'bg-slate-700 text-slate-300' },
  SENT:           { bg: 'bg-cyan-900/20',   border: 'border-cyan-500/30',  badge: 'bg-cyan-900/60 text-cyan-300' },
  IN_TRANSIT:     { bg: 'bg-cyan-900/30',   border: 'border-cyan-400/50',  badge: 'bg-cyan-700/60 text-cyan-200' },
  LOST:           { bg: 'bg-red-900/30',    border: 'border-red-500/50',   badge: 'bg-red-900/60 text-red-300' },
  CORRUPTED:      { bg: 'bg-amber-900/30',  border: 'border-amber-500/50', badge: 'bg-amber-900/60 text-amber-300' },
  RECEIVED:       { bg: 'bg-green-900/20',  border: 'border-green-500/40', badge: 'bg-green-900/50 text-green-300' },
  ACKED:          { bg: 'bg-green-900/30',  border: 'border-green-400/50', badge: 'bg-green-700/60 text-green-200' },
  TIMEOUT:        { bg: 'bg-amber-900/20',  border: 'border-amber-500/40', badge: 'bg-amber-900/50 text-amber-300' },
  RETRANSMITTING: { bg: 'bg-purple-900/30', border: 'border-purple-500/50',badge: 'bg-purple-900/60 text-purple-300' },
  COMPLETED:      { bg: 'bg-green-900/20',  border: 'border-green-400/60', badge: 'bg-green-600/40 text-green-200' },
};

const STATUS_ICON = {
  CREATED: '○', SENT: '→', IN_TRANSIT: '↝', LOST: '✗', CORRUPTED: '⚠',
  RECEIVED: '✓', ACKED: '✓', TIMEOUT: '⏱', RETRANSMITTING: '↺', COMPLETED: '✓✓',
};

export default function PacketGrid({ packets }) {
  const entries = Object.values(packets).sort((a, b) => a.packetNumber - b.packetNumber);

  if (entries.length === 0) {
    return (
      <div className="card card-glow p-5 flex items-center justify-center min-h-[120px]">
        <p className="text-xs text-slate-600">No packets yet. Start a transfer.</p>
      </div>
    );
  }

  return (
    <div className="card card-glow p-5 flex flex-col h-full">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4 flex-shrink-0">
        Packet Transmission Status
        <span className="ml-2 text-cyan-400">{entries.length} packets</span>
      </h2>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 pb-2">
          {entries.map(pkt => {
            const st = STATUS_STYLE[pkt.status] || STATUS_STYLE.CREATED;
            const icon = STATUS_ICON[pkt.status] || '?';
            const isActive = ['IN_TRANSIT', 'RETRANSMITTING', 'SENT'].includes(pkt.status);

            return (
              <div
                key={pkt.packetNumber}
                className={`
                  relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-300
                  ${st.bg} ${st.border}
                  ${isActive ? 'scale-105' : ''}
                `}
              >
                {/* Packet number */}
                <div className="text-sm font-bold text-white">P{pkt.packetNumber}</div>

                {/* Status icon */}
                <div className={`text-base font-bold ${
                  pkt.status === 'LOST'      ? 'text-red-400' :
                  pkt.status === 'CORRUPTED' ? 'text-amber-400' :
                  pkt.status === 'COMPLETED' || pkt.status === 'ACKED' ? 'text-green-400' :
                  pkt.status === 'TIMEOUT'   ? 'text-amber-400' :
                  pkt.status === 'RETRANSMITTING' ? 'text-purple-400' :
                  'text-cyan-400'
                }`}>{icon}</div>

                {/* Status badge */}
                <span className={`text-[8px] font-bold px-1 rounded ${st.badge} text-center leading-tight`}>
                  {pkt.status?.replace('_', ' ')}
                </span>

                {/* Retry count */}
                {pkt.retryCount > 0 && (
                  <span className="text-[8px] text-purple-400 font-mono">×{pkt.retryCount}</span>
                )}

                {/* Active pulse ring */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/40 animate-ping" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
