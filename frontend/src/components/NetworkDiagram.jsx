import { useEffect, useState } from 'react';
import ServerNode from './ServerNode';

const STATE_CONFIG = {
  traveling:      { bg: 'bg-[#2563EB]',  border: 'border-[#1E293B]', text: 'text-white',     label: null,   glow: 'shadow-[3px_3px_0px_#1E293B]' },
  lost:           { bg: 'bg-[#EF4444]',  border: 'border-[#1E293B]', text: 'text-white',     label: 'LOST', glow: 'shadow-[3px_3px_0px_#1E293B]' },
  corrupted:      { bg: 'bg-[#EAB308]',  border: 'border-[#1E293B]', text: 'text-black',     label: 'CRPT', glow: 'shadow-[3px_3px_0px_#1E293B]' },
  received:       { bg: 'bg-[#22C55E]',  border: 'border-[#1E293B]', text: 'text-white',     label: 'OK',   glow: 'shadow-[3px_3px_0px_#1E293B]' },
  ack:            { bg: 'bg-[#F97316]',  border: 'border-[#1E293B]', text: 'text-white',     label: 'ACK',  glow: 'shadow-[3px_3px_0px_#1E293B]' },
  retransmitting: { bg: 'bg-[#A855F7]',  border: 'border-[#1E293B]', text: 'text-white',     label: 'RETX', glow: 'shadow-[3px_3px_0px_#1E293B]' },
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

    setHistory(prev => [
      { ...activePacket, id: Date.now() },
      ...prev.slice(0, 2),
    ]);
  }, [activePacket]);

  const cfg = activePacket ? STATE_CONFIG[activePacket.state] || STATE_CONFIG.traveling : null;
  const isAck = activePacket?.state === 'ack';

  return (
    <div className="card retro-card">
      <div className="retro-window-header">
        <div className="flex items-center gap-2">
          <span>📡</span>
          <span>NETWORK_TOPOLOGY.SYS</span>
        </div>
        <div className="retro-window-controls">
          <div className="retro-win-btn retro-win-btn-min">_</div>
          <div className="retro-win-btn retro-win-btn-max">□</div>
          <div className="retro-win-btn retro-win-btn-close">X</div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="tag-badge">TOPOLOGY</span>
            <span className="text-xs font-['Press_Start_2P'] text-[#1E293B] text-[9px]">LIVE PACKET STREAM</span>
          </div>
          {isRunning && (
            <div className="flex items-center gap-1.5 text-[9px] font-['Press_Start_2P'] text-[#15803D] bg-emerald-100 px-2.5 py-1 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              TRANSMITTING
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 min-h-[180px] bg-[#F1F5F9] rounded-lg p-5 border-3 border-[#1E293B] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.06)] relative">
          <div className="flex-shrink-0 z-10">
            <ServerNode
              label="Server A"
              role="Sender"
              side="A"
              active={isRunning && !isAck}
            />
          </div>

          <div className="flex-1 relative flex flex-col justify-center gap-6 px-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#2563EB] font-['Press_Start_2P'] text-[8px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#2563EB] border border-[#1E293B]" />
                DATA PACKETS
              </span>
              <span className="text-[#64748B] font-['VT323'] text-sm">TCP STREAM ►</span>
            </div>

            <div className="relative h-10 flex items-center">
              <div className={`w-full ${isRunning && !isAck ? 'wire-data' : 'wire-inactive'}`} />

              {isVisible && cfg && (
                <div
                  key={`pkt-${animKey}`}
                  className={`
                    absolute top-1/2 -translate-y-1/2 pointer-events-none
                    w-14 h-10 rounded-md border-2 border-[#1E293B] flex flex-col items-center justify-center
                    ${cfg.bg} ${cfg.text} ${cfg.glow}
                    ${isAck ? 'packet-traveling-left' : 'packet-traveling-right'}
                    ${activePacket?.state === 'lost' ? 'packet-lost-anim' : ''}
                  `}
                  style={{ 
                    zIndex: 20,
                    animationDuration: activePacket?.state === 'lost' 
                      ? `${delay * 0.8}ms` 
                      : isAck ? `${delay * 0.8}ms` : `${delay * 1.2}ms`
                  }}
                >
                  <span className="text-[9px] font-['Press_Start_2P'] font-extrabold">
                    P{activePacket?.packetNumber}
                  </span>
                  {cfg.label && (
                    <span className="text-[7px] font-['Press_Start_2P'] font-bold opacity-90">
                      {cfg.label}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="relative h-6 flex items-center">
              <div className={`w-full ${isRunning && isAck ? 'wire-ack' : 'wire-inactive'}`} />
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[#F97316] font-['Press_Start_2P'] text-[8px] -mt-3">
              <span className="text-[#64748B] font-['VT323'] text-sm">◄ ACK RESPONSE</span>
              <span className="flex items-center gap-1.5">
                ACK RETURN
                <span className="w-2 h-2 bg-[#F97316] border border-[#1E293B]" />
              </span>
            </div>

            <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
              <div className="flex flex-col gap-1 items-center">
                {history.map((h, i) => {
                  const hcfg = STATE_CONFIG[h.state] || STATE_CONFIG.traveling;
                  return (
                    <div key={h.id}
                      className={`
                        text-[8px] font-['Press_Start_2P'] px-2 py-0.5 rounded border border-[#1E293B] ${hcfg.bg} ${hcfg.text}
                        transition-opacity duration-300 shadow-[2px_2px_0px_#1E293B]
                      `}
                      style={{ opacity: i === 0 ? 1 : 0.4 }}
                    >
                      {h.state === 'lost'           ? `P${h.packetNumber} LOST!`
                       : h.state === 'corrupted'    ? `P${h.packetNumber} CORRUPT!`
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

          <div className="flex-shrink-0 z-10">
            <ServerNode
              label="Server B"
              role="Receiver"
              side="B"
              active={isRunning && (isAck || activePacket?.state === 'received')}
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-[#1E293B] flex flex-wrap gap-3 justify-center">
          {[
            { color: 'bg-[#2563EB]', label: 'In Transit' },
            { color: 'bg-[#EF4444]', label: 'Lost' },
            { color: 'bg-[#EAB308]', label: 'Corrupted' },
            { color: 'bg-[#22C55E]', label: 'Received' },
            { color: 'bg-[#F97316]', label: 'ACK' },
            { color: 'bg-[#A855F7]', label: 'Retransmit' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 bg-[#FFFDF5] px-2 py-0.5 rounded border border-[#1E293B] shadow-[1px_1px_0px_#1E293B]">
              <span className={`w-2.5 h-2.5 border border-[#1E293B] ${color}`} />
              <span className="text-[8px] font-['Press_Start_2P'] text-[#334155]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
