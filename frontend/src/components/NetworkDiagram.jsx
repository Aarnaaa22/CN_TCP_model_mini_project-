/**
 * NetworkDiagram.jsx
 *
 * The main visual — shows Server A → Network → Server B with animated packets.
 * All animations are driven purely by `activePacket` from backend events.
 */

import { useEffect, useState } from 'react';
import ServerNode from './ServerNode';

const STATE_CONFIG = {
  traveling:      { bg: 'bg-cyan-500',   border: 'border-cyan-300',  text: 'text-white',      label: null,          glow: 'shadow-[0_0_12px_rgba(0,212,255,0.6)]' },
  lost:           { bg: 'bg-red-600',    border: 'border-red-400',   text: 'text-white',      label: 'LOST',        glow: 'shadow-[0_0_12px_rgba(239,68,68,0.7)]'  },
  corrupted:      { bg: 'bg-amber-500',  border: 'border-amber-300', text: 'text-black',      label: 'CRPT',        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.7)]' },
  received:       { bg: 'bg-green-600',  border: 'border-green-400', text: 'text-white',      label: '✓',           glow: 'shadow-[0_0_12px_rgba(34,197,94,0.6)]'  },
  ack:            { bg: 'bg-blue-600',   border: 'border-blue-400',  text: 'text-white',      label: 'ACK',         glow: 'shadow-[0_0_12px_rgba(59,130,246,0.6)]' },
  retransmitting: { bg: 'bg-purple-600', border: 'border-purple-400',text: 'text-white',      label: 'RETX',        glow: 'shadow-[0_0_12px_rgba(168,85,247,0.6)]' },
};

export default function NetworkDiagram({ activePacket, status, config }) {
  const [visible, setVisible]     = useState(false);
  const [animKey, setAnimKey]     = useState(0);
  const [history, setHistory]     = useState([]);   // last few events shown in middle

  const isRunning = status === 'RUNNING';
  const delay = config?.transmissionDelay || 500;

  useEffect(() => {
    if (!activePacket) { setVisible(false); return; }

    setVisible(true);
    setAnimKey(k => k + 1);

    // Keep a short history for the center event labels
    setHistory(prev => [
      { ...activePacket, id: Date.now() },
      ...prev.slice(0, 3),
    ]);

    // Hide after animation completes
    const timer = setTimeout(() => setVisible(false),
      activePacket.state === 'ack' ? delay : delay * 1.5
    );
    return () => clearTimeout(timer);
  }, [activePacket, delay]);
  const cfg = activePacket ? STATE_CONFIG[activePacket.state] || STATE_CONFIG.traveling : null;
  const isAck = activePacket?.state === 'ack';

  return (
    <div className="card card-glow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Network Simulation</h2>
        {isRunning && (
          <div className="flex items-center gap-1.5 text-xs text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Live
          </div>
        )}
      </div>

      {/* Main diagram */}
      <div className="flex items-center gap-4 min-h-[160px]">

        {/* SERVER A */}
        <div className="flex-shrink-0">
          <ServerNode
            label="Server A"
            role="Sender"
            side="A"
            active={isRunning && !isAck}
          />
        </div>

        {/* Network lane */}
        <div className="flex-1 relative flex flex-col justify-center gap-4">

          {/* Forward lane label */}
          <div className="text-[10px] text-slate-600 text-center mb-1">Data Packets →</div>

          {/* Forward wire */}
          <div className="relative h-10 flex items-center">
            <div className={`w-full ${isRunning && !isAck ? 'wire' : 'wire wire-inactive'}`} />

            {/* Traveling packet */}
            {visible && cfg && (
              <div
                key={`pkt-${animKey}`}
                className={`
                  absolute top-1/2 -translate-y-1/2 pointer-events-none
                  w-12 h-10 rounded-lg border-2 flex flex-col items-center justify-center
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
                <span className={`text-[10px] font-bold ${cfg.text}`}>
                  P{activePacket?.packetNumber}
                </span>
                {cfg.label && (
                  <span className={`text-[8px] font-bold ${cfg.text} opacity-90`}>
                    {cfg.label}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ACK return lane */}
          <div className="text-[10px] text-slate-600 text-center">← ACK</div>
          <div className="relative h-6 flex items-center">
            <div className={`w-full ${isRunning && isAck ? 'wire' : 'wire wire-inactive'} opacity-40`}
              style={{ background: isRunning && isAck
                ? 'repeating-linear-gradient(90deg, rgba(59,130,246,0.6) 0px, rgba(59,130,246,0.6) 8px, transparent 8px, transparent 16px)'
                : undefined }}
            />
          </div>

          {/* Center event history overlay */}
          <div className="absolute inset-0 flex flex-col justify-end items-center pb-1 pointer-events-none">
            <div className="flex flex-col gap-0.5 items-center">
              {history.slice(0, 2).map((h, i) => {
                const hcfg = STATE_CONFIG[h.state] || STATE_CONFIG.traveling;
                return (
                  <div key={h.id}
                    className={`
                      text-[10px] font-bold px-2 py-0.5 rounded-full ${hcfg.bg} ${hcfg.text}
                      transition-opacity duration-500
                    `}
                    style={{ opacity: i === 0 ? 0.9 : 0.35 }}
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

        {/* SERVER B */}
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
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-3 justify-center">
        {[
          { color: 'bg-cyan-500',   label: 'In Transit' },
          { color: 'bg-red-600',    label: 'Lost' },
          { color: 'bg-amber-500',  label: 'Corrupted' },
          { color: 'bg-green-600',  label: 'Received' },
          { color: 'bg-blue-600',   label: 'ACK' },
          { color: 'bg-purple-600', label: 'Retransmit' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
            <span className="text-[10px] text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
