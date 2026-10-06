export default function ChecksumPanel({ event }) {
  const hasEvent = Boolean(event);

  return (
    <div className="card retro-card">
      <div className="retro-window-header">
        <div className="flex items-center gap-2">
          <span>🔒</span>
          <span>CHECKSUM_VERIFICATION.EXE</span>
        </div>
        <div className="retro-window-controls">
          <div className="retro-win-btn retro-win-btn-min">_</div>
          <div className="retro-win-btn retro-win-btn-max">□</div>
          <div className="retro-win-btn retro-win-btn-close">X</div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="tag-badge">SHA-256</span>
          <span className="text-[8px] font-['Press_Start_2P'] text-[#64748B]">SHA256 CHECKSUM</span>
        </div>

        {!hasEvent ? (
          <div className="bg-[#1E293B] text-emerald-400 p-3 rounded font-['VT323'] text-sm border-2 border-[#1E293B] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
            <div>&gt; CHECKSUM MONITOR READY</div>
            <div className="text-slate-400 text-xs mt-1">&gt; Awaiting packet checksum computations...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="bg-[#1E293B] text-emerald-400 p-3 rounded border-2 border-[#1E293B] font-['VT323'] text-sm leading-snug">
              <div className="text-slate-400 text-xs mb-1">&gt; ORIGINAL_PAYLOAD_SHA256:</div>
              <div className="break-all text-amber-300 font-bold">{event.originalChecksum || 'COMPUTING...'}</div>

              <div className="text-slate-400 text-xs mt-2 mb-1">&gt; RECEIVED_PAYLOAD_SHA256:</div>
              <div className="break-all text-cyan-300 font-bold">{event.receivedChecksum || 'COMPUTING...'}</div>
            </div>

            <div className={`p-2 rounded border-2 text-[9px] font-['Press_Start_2P'] flex items-center justify-center gap-2 ${
              event.match
                ? 'bg-emerald-100 text-emerald-900 border-emerald-700'
                : 'bg-rose-100 text-rose-900 border-rose-700'
            }`}>
              <span>{event.match ? '✅ MATCH CONFIRMED (INTEGRITY OK)' : '❌ CHECKSUM MISMATCH (CORRUPTED)'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
