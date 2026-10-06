/** Header.jsx — Top bar with title, connection badge, and simulation status (Light Circuit theme) */
export default function Header({ connected, status }) {
  const statusConfig = {
    IDLE:      { label: 'Idle',      color: 'text-[#5B6478]',  dot: 'bg-[#5B6478]' },
    RUNNING:   { label: 'Running',   color: 'text-[#4C7DFF]',  dot: 'bg-[#4C7DFF] animate-pulse shadow-[0_0_8px_#4C7DFF]' },
    COMPLETED: { label: 'Completed', color: 'text-[#0E8570]',  dot: 'bg-[#2FD6B4] shadow-[0_0_6px_#2FD6B4]' },
    FAILED:    { label: 'Failed',    color: 'text-red-500',    dot: 'bg-red-500' },
  };
  const s = statusConfig[status] || statusConfig.IDLE;

  return (
    <header className="sticky top-0 z-50 border-b border-[#12131A]/10 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4C7DFF] to-[#2FD6B4] flex items-center justify-center shadow-md shadow-[#4C7DFF]/25">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#12131A] tracking-tight leading-none">TCP Reliable File Transfer</h1>
              <span className="tag-badge hidden sm:inline-flex">CIRCUIT</span>
            </div>
            <p className="text-xs text-[#5B6478] mt-0.5">Packet Loss, Checksums & Error Recovery Simulation</p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-4">
          {/* Simulation status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5B6478] uppercase tracking-wider font-semibold text-[10px]">Simulation</span>
            <div className="flex items-center gap-1.5 bg-[#EEF2FA] px-3 py-1 rounded-full border border-[#12131A]/10">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
            </div>
          </div>

          <div className="w-px h-5 bg-[#12131A]/10" />

          {/* Connection status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5B6478] uppercase tracking-wider font-semibold text-[10px]">Network</span>
            <div className="flex items-center gap-1.5 bg-[#EEF2FA] px-3 py-1 rounded-full border border-[#12131A]/10">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[#2FD6B4] animate-pulse shadow-[0_0_6px_#2FD6B4]' : 'bg-red-500'}`} />
              <span className={`text-xs font-semibold ${connected ? 'text-[#0E8570]' : 'text-red-500'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
