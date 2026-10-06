/**
 * NetworkDiagram.jsx (Light Circuit theme)
 *
 * Shows Server A → Network → Server B with animated packets on a light circuit board canvas.
 * Data lane uses Data Blue (#4C7DFF), return ACK lane uses ACK Orange (#FF8A3D).
 */

import { useEffect, useState } from 'react';
import ServerNode from './ServerNode';

const STATE_CONFIG = {
  traveling:      { bg: 'bg-[#4C7DFF]',  border: 'border-[#7095FF]', text: 'text-white',     label: null,   glow: 'shadow-[0_0_14px_rgba(76,125,255,0.6)]' },
  lost:           { bg: 'bg-[#EF4444]',  border: 'border-red-300',   text: 'text-white',     label: 'LOST', glow: 'shadow-[0_0_14px_rgba(239,68,68,0.6)]' },
  corrupted:      { bg: 'bg-[#F59E0B]',  border: 'border-amber-300', text: 'text-black',     label: 'CRPT', glow: 'shadow-[0_0_14px_rgba(245,158,11,0.6)]' },
  received:       { bg: 'bg-[#2FD6B4]',  border: 'border-[#17B594]', text: 'text-[#12131A]', label: '✓',    glow: 'shadow-[0_0_14px_rgba(47,214,180,0.6)]' },
  ack:            { bg: 'bg-[#FF8A3D]',  border: 'border-[#FFA86B]', text: 'text-white',     label: 'ACK',  glow: 'shadow-[0_0_14px_rgba(255,138,61,0.65)]' },
  retransmitting: { bg: 'bg-[#8B5CF6]',  border: 'border-purple-300',text: 'text-white',     label: 'RETX', glow: 'shadow-[0_0_14px_rgba(139,92,246,0.6)]' },
};

export default function NetworkDiagram({ activePacket, status, config }) {
  const [animKey, setAnimKey] = useState(0);
  const [history, setHistory] = useState([]);

  const isRunning = status === 'RUNNING';
  const delay = config?.transmissionDelay || 500;
  const isVisible = Boolean(activePacket);

  useEffect(() => {
    if (!activePacket) return;

    setAnimKey(k => k + 1);

    // Keep short history for overlay tags
    setHistory(prev => [
      { ...activePacket, id: Date.now() },
      ...prev.slice(0, 2),
    ]);
  }, [activePacket]);

  const cfg = activePacket ? STATE_CONFIG[activePacket.state] || STATE_CONFIG.traveling : null;
  const isAck = activePacket?.state === 'ack';

  return (
    <div className="card card-glow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#12131A]">Network Simulation</h2>
          <span className="tag-badge">TOPOLOGY</span>
        </div>
        {isRunning && (
          <div className="flex items-center gap-1.5 text-xs text-[#0E8570] font-semibold bg-[#2FD6B4]/15 px-3 py-1 rounded-full border border-[#2FD6B4]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2FD6B4] animate-pulse" />
            Live Circuit
          </div>
        )}
      </div>

      {/* Main diagram circuit board */}
      <div className="flex items-center gap-4 min-h-[175px] bg-[#EEF2FA]/90 rounded-2xl p-5 border border-[#12131A]/10 shadow-inner">

        {/* SERVER A (Sender) */}
        <div className="flex-shrink-0">
          <ServerNode
            label="Server A"
            role="Sender"
            side="A"
            active={isRunning && !isAck}
          />
        </div>

        {/* Network lane */}
        <div className="flex-1 relative flex flex-col justify-center gap-6 px-3">

          {/* Forward lane label */}
          <div className="flex items-center justify-between text-xs font-bold text-[#4C7DFF]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4C7DFF]" />
              Data Packets
            </span>
            <span className="text-[11px] text-[#5B6478] font-mono font-medium">TCP Stream →</span>
          </div>

          {/* Forward wire (Data Blue) */}
          <div className="relative h-10 flex items-center">
            <div className={`w-full ${isRunning && !isAck ? 'wire-data' : 'wire-inactive'}`} />

            {/* Traveling packet */}
            {isVisible && cfg && (
              <div
                key={`pkt-${animKey}`}
                className={`
                  absolute top-1/2 -translate-y-1/2 pointer-events-none
                  w-12 h-10 rounded-xl border-2 flex flex-col items-center justify-center
                  ${cfg.bg} ${cfg.border} ${cfg.glow}
                  ${isAck ? 'packet-traveling-left' : 'packet-traveling-right'}
                  ${activePacket?.state === 'lost' ? 'packet-lost-anim' : ''}
                `}
                style={{ 
                  zIndex: 10,
                  animationDuration: activePacket?.state === 'lost' 
                    ? `${delay * 0.8}ms` 
                    : isAck ? `${delay * 0.8}ms` : `${delay * 1.2}ms`
                }}
              >
                <span className={`text-[10px] font-extrabold ${cfg.text}`}>
                  P{activePacket?.packetNumber}
                </span>
                {cfg.label && (
                  <span className={`text-[8px] font-bold ${cfg.text} opacity-95`}>
                    {cfg.label}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ACK return lane (ACK Orange) */}
          <div className="relative h-6 flex items-center">
            <div className={`w-full ${isRunning && isAck ? 'wire-ack' : 'wire-inactive'} opacity-85`} />
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-[#FF8A3D] -mt-4">
            <span className="text-[11px] text-[#5B6478] font-mono font-medium">← ACK Response</span>
            <span className="flex items-center gap-1.5">
              ACK Return
              <span className="w-2 h-2 rounded-full bg-[#FF8A3D]" />
            </span>
          </div>

          {/* Center event history overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
            <div className="flex flex-col gap-1 items-center">
              {history.map((h, i) => {
                const hcfg = STATE_CONFIG[h.state] || STATE_CONFIG.traveling;
                return (
                  <div key={h.id}
                    className={`
                      text-[10px] font-bold px-2.5 py-0.5 rounded-full ${hcfg.bg} ${hcfg.text}
                      transition-opacity duration-300 shadow-md
                    `}
                    style={{ opacity: i === 0 ? 0.95 : 0.4 }}
                  >
                    {h.state === 'lost'           ? `P${h.packetNumber} LOST`
                     : h.state === 'corrupted'    ? `P${h.packetNumber} CORRUPTED`
                     : h.state === 'ack'          ? `ACK ${h.packetNumber}`
                     : h.state === 'retransmitting' ? `P${h.packetNumber} RETX`
                     : `P${h.packetNumber}`
                    }
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SERVER B (Receiver) */}
        <div className="flex-shrink-0">
          <ServerNode
            label="Server B"
            role="Receiver"
            side="B"
            active={isRunning && (isAck || activePacket?.state === 'received')}
          />
        </div>
      </div>

      {/* Event legend */}
      <div className="mt-4 pt-3.5 border-t border-[#12131A]/10 flex flex-wrap gap-4 justify-center">
        {[
          { color: 'bg-[#4C7DFF]',  label: 'In Transit (Data Blue)' },
          { color: 'bg-[#EF4444]',  label: 'Lost' },
          { color: 'bg-[#F59E0B]',  label: 'Corrupted' },
          { color: 'bg-[#2FD6B4]',  label: 'Received (Tag Teal)' },
          { color: 'bg-[#FF8A3D]',  label: 'ACK (ACK Orange)' },
          { color: 'bg-[#8B5CF6]',  label: 'Retransmit' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${color} shadow-sm`} />
            <span className="text-[11px] font-medium text-[#5B6478]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
