import { useEffect, useRef } from 'react';

const COLOR_MAP = {
  cyan:   'text-cyan-400',
  blue:   'text-blue-400',
  green:  'text-emerald-400',
  amber:  'text-amber-400',
  red:    'text-rose-400',
  purple: 'text-purple-400',
  slate:  'text-slate-400',
};

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export default function TransmissionLog({ events }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events.length]);

  return (
    <div className="card retro-card flex flex-col h-full bg-[#0F172A]">
      <div className="retro-window-header">
        <div className="flex items-center gap-2">
          <span>📟</span>
          <span>SYSTEM_CONSOLE.LOG</span>
        </div>
        <div className="retro-window-controls">
          <div className="retro-win-btn retro-win-btn-min">_</div>
          <div className="retro-win-btn retro-win-btn-max">□</div>
          <div className="retro-win-btn retro-win-btn-close">X</div>
        </div>
      </div>

      <div className="p-2 border-b border-slate-700 bg-[#1E293B] flex items-center justify-between px-4">
        <span className="tag-badge">LOG STREAM</span>
        <span className="text-[8px] font-['Press_Start_2P'] text-emerald-400">
          {events.length} EVENTS RECORDED
        </span>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 font-['VT323'] text-sm flex flex-col gap-1 min-h-0 bg-[#0F172A] text-slate-200">
        {events.length === 0 ? (
          <div className="text-slate-500 text-center my-auto py-6 font-['Press_Start_2P'] text-[9px]">
            &gt; AWAITING SIMULATION EVENTS...
          </div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="log-entry flex items-start gap-2 leading-tight hover:bg-slate-800 px-1 py-0.5 rounded">
              <span className="text-slate-500 select-none">[{formatTime(ev.timestamp)}]</span>
              <span className={`${COLOR_MAP[ev.color] || 'text-slate-200'} break-all font-bold`}>
                {ev.label}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
