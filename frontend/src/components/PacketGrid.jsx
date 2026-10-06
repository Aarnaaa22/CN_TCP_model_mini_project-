/** PacketGrid.jsx — Grid of packet cards showing real-time state (Light Circuit theme) */

const STATUS_STYLE = {
  CREATED:        { bg: 'bg-[#EEF2FA]',         border: 'border-[#12131A]/10',  badge: 'bg-white text-[#5B6478]' },
  SENT:           { bg: 'bg-[#4C7DFF]/10',      border: 'border-[#4C7DFF]/40',  badge: 'bg-[#4C7DFF]/20 text-[#2B5DE0]' },
  IN_TRANSIT:     { bg: 'bg-[#4C7DFF]/15',      border: 'border-[#4C7DFF]',     badge: 'bg-[#4C7DFF] text-white' },
  LOST:           { bg: 'bg-red-50',            border: 'border-red-400',       badge: 'bg-red-200 text-red-800' },
  CORRUPTED:      { bg: 'bg-amber-50',          border: 'border-amber-400',     badge: 'bg-amber-200 text-amber-800' },
  RECEIVED:       { bg: 'bg-[#2FD6B4]/15',      border: 'border-[#2FD6B4]',     badge: 'bg-[#2FD6B4]/30 text-[#0E8570]' },
  ACKED:          { bg: 'bg-[#FF8A3D]/15',      border: 'border-[#FF8A3D]',     badge: 'bg-[#FF8A3D]/30 text-[#C2580E]' },
  TIMEOUT:        { bg: 'bg-amber-100',         border: 'border-amber-400',     badge: 'bg-amber-200 text-amber-800' },
  RETRANSMITTING: { bg: 'bg-purple-100',        border: 'border-purple-400',    badge: 'bg-purple-200 text-purple-800' },
  COMPLETED:      { bg: 'bg-[#2FD6B4]/20',      border: 'border-[#2FD6B4]',     badge: 'bg-[#2FD6B4]/40 text-[#0E8570]' },
};

const STATUS_ICON = {
  CREATED: '○', SENT: '→', IN_TRANSIT: '↝', LOST: '✗', CORRUPTED: '⚠',
  RECEIVED: '✓', ACKED: '◀', TIMEOUT: '⏱', RETRANSMITTING: '↺', COMPLETED: '✓✓',
};

export default function PacketGrid({ packets }) {
  const entries = Object.values(packets).sort((a, b) => a.packetNumber - b.packetNumber);

  if (entries.length === 0) {
    return (
      <div className="card card-glow p-5 flex items-center justify-center min-h-[120px] bg-white">
        <p className="text-xs text-[#5B6478]">No packets yet. Choose a file and start transfer.</p>
      </div>
    );
  }

  return (
    <div className="card card-glow p-5 flex flex-col h-full bg-white">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#12131A]">
            Packet Transmission Status
          </h2>
          <span className="tag-badge">MATRIX</span>
        </div>
        <span className="text-xs text-[#4C7DFF] font-mono font-bold bg-[#EEF2FA] px-2.5 py-0.5 rounded-full border border-[#12131A]/10">
          {entries.length} packets
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
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
                  ${isActive ? 'scale-105 shadow-md shadow-[#4C7DFF]/20 ring-2 ring-[#4C7DFF]/30' : ''}
                `}
              >
                {/* Packet number */}
                <div className="text-sm font-bold text-[#12131A]">P{pkt.packetNumber}</div>

                {/* Status icon */}
                <div className={`text-base font-bold ${
                  pkt.status === 'LOST'      ? 'text-red-600' :
                  pkt.status === 'CORRUPTED' ? 'text-amber-600' :
                  pkt.status === 'COMPLETED' || pkt.status === 'RECEIVED' ? 'text-[#0E8570]' :
                  pkt.status === 'ACKED' || pkt.status === 'TIMEOUT' ? 'text-[#C2580E]' :
                  pkt.status === 'RETRANSMITTING' ? 'text-purple-700' :
                  'text-[#4C7DFF]'
                }`}>{icon}</div>

                {/* Status badge */}
                <span className={`text-[8px] font-bold px-1 rounded ${st.badge} text-center leading-tight`}>
                  {pkt.status?.replace('_', ' ')}
                </span>

                {/* Retry count */}
                {pkt.retryCount > 0 && (
                  <span className="text-[8px] text-purple-700 font-mono font-bold">×{pkt.retryCount}</span>
                )}

                {/* Active pulse ring */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl border-2 border-[#4C7DFF]/50 animate-ping pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
