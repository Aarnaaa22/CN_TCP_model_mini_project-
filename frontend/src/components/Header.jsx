/** Header.jsx — Top bar with title, connection badge, and simulation status */
export default function Header({ connected, status }) {
  const statusConfig = {
    IDLE:      { label: 'Idle',      color: 'text-slate-400',  dot: 'bg-slate-500' },
    RUNNING:   { label: 'Running',   color: 'text-cyan-400',   dot: 'bg-cyan-400 animate-pulse' },
    COMPLETED: { label: 'Completed', color: 'text-green-400',  dot: 'bg-green-400' },
    FAILED:    { label: 'Failed',    color: 'text-red-400',    dot: 'bg-red-400' },
  };
  const s = statusConfig[status] || statusConfig.IDLE;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-900/90 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">TCP Reliable File Transfer</h1>
            <p className="text-xs text-slate-500">Packet Loss & Error Recovery Simulation</p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-4">
          {/* Simulation status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Simulation</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
            </div>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-xs font-semibold ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
