/** TransmissionLog.jsx — Terminal-style chronological event log (Light Circuit theme) */
import { useEffect, useRef } from 'react';

const COLOR_MAP = {
  cyan:   'text-[#2B5DE0]',
  blue:   'text-[#2B5DE0]',
  green:  'text-[#0E8570]',
  amber:  'text-[#C2580E]',
  red:    'text-red-600',
  purple: 'text-purple-700',
  slate:  'text-[#5B6478]',
};

const DOT_MAP = {
  cyan:   'bg-[#4C7DFF]',
  blue:   'bg-[#4C7DFF]',
  green:  'bg-[#2FD6B4]',
  amber:  'bg-[#FF8A3D]',
  red:    'bg-red-500',
  purple: 'bg-purple-600',
  slate:  'bg-[#5B6478]',
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

  // Auto-scroll to latest entry
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events.length]);

  return (
    <div className="card card-glow flex flex-col h-full overflow-hidden bg-white">
      <div className="flex items-center justify-between p-4 pb-3 border-b border-[#12131A]/10 bg-white">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#12131A]">
            Transmission Log
          </h2>
          <span className="tag-badge">LOG STREAM</span>
        </div>
        <span className="text-xs text-[#5B6478] font-mono font-bold bg-[#EEF2FA] px-2.5 py-0.5 rounded-full border border-[#12131A]/10">
          {events.length} events
        </span>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs flex flex-col gap-1.5 min-h-0 bg-[#F6F8FD]">
        {events.length === 0 ? (
          <div className="text-[#5B6478] text-center my-auto py-8 font-medium">Waiting for simulation events…</div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="log-entry flex items-start gap-3 leading-relaxed hover:bg-[#EEF2FA] px-2.5 py-1 rounded-lg transition-colors border border-transparent hover:border-[#12131A]/05">
              {/* Timestamp */}
              <span className="text-[#5B6478] font-semibold flex-shrink-0 w-20 select-none">{formatTime(ev.timestamp)}</span>
              {/* Dot */}
              <span className={`flex-shrink-0 mt-1.5 w-2 h-2 rounded-full shadow-xs ${DOT_MAP[ev.color] || DOT_MAP.cyan}`} />
              {/* Message */}
              <span className={`${COLOR_MAP[ev.color] || 'text-[#12131A]'} break-all font-mono font-medium`}>
                {ev.label}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
