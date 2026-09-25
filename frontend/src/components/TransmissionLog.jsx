/** TransmissionLog.jsx — Terminal-style chronological event log */
import { useEffect, useRef } from 'react';

const COLOR_MAP = {
  cyan:   'text-cyan-400',
  green:  'text-green-400',
  red:    'text-red-400',
  amber:  'text-amber-400',
  purple: 'text-purple-400',
  blue:   'text-blue-400',
  slate:  'text-slate-500',
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
  const bottomRef = useRef(null);

  // Auto-scroll to latest entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  return (
    <div className="card card-glow flex flex-col h-full">
      <div className="flex items-center justify-between p-4 pb-2 border-b border-white/5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Transmission Log
        </h2>
        <span className="text-xs text-slate-600 font-mono">{events.length} events</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs flex flex-col gap-1 min-h-0" style={{ maxHeight: '320px' }}>
        {events.length === 0 ? (
          <div className="text-slate-600 text-center mt-4">Waiting for simulation events…</div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="log-entry flex items-start gap-3 leading-relaxed">
              {/* Timestamp */}
              <span className="text-slate-600 flex-shrink-0 w-20">{formatTime(ev.timestamp)}</span>
              {/* Dot */}
              <span className={`flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full ${
                ev.color === 'red'    ? 'bg-red-500' :
                ev.color === 'green'  ? 'bg-green-500' :
                ev.color === 'amber'  ? 'bg-amber-500' :
                ev.color === 'purple' ? 'bg-purple-500' :
                ev.color === 'blue'   ? 'bg-blue-500' :
                'bg-cyan-500'
              }`} />
              {/* Message */}
              <span className={`${COLOR_MAP[ev.color] || 'text-slate-300'} break-all`}>
                {ev.label}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
