/** ChecksumPanel.jsx — Shows live checksum verification result */
export default function ChecksumPanel({ event }) {
  if (!event) {
    return (
      <div className="card card-glow p-5 flex items-center justify-center min-h-[120px]">
        <p className="text-xs text-slate-600">Checksum results will appear here during transfer.</p>
      </div>
    );
  }

  const isOk      = event.type === 'CHECKSUM_OK';
  const isFailed  = event.type === 'CHECKSUM_FAILED';

  return (
    <div className={`card p-5 border transition-all duration-500 ${
      isOk     ? 'border-green-500/40 shadow-[0_0_16px_rgba(34,197,94,0.1)]' :
      isFailed ? 'border-red-500/40  shadow-[0_0_16px_rgba(239,68,68,0.15)]' :
      'border-white/5'
    }`}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
        Checksum Verification
      </h2>

      <div className="flex flex-col gap-3">
        {/* Packet reference */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Packet</span>
          <span className="font-mono text-sm text-white font-bold">P{event.packetNumber}</span>
        </div>

        {isFailed && (
          <>
            <div>
              <div className="text-xs text-slate-500 mb-1">Expected Checksum</div>
              <div className="font-mono text-[10px] text-green-400 bg-green-900/20 rounded px-2 py-1 break-all">
                {event.expectedChecksum}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Received Checksum</div>
              <div className="font-mono text-[10px] text-red-400 bg-red-900/20 rounded px-2 py-1 break-all">
                {event.receivedChecksum}
              </div>
            </div>
          </>
        )}

        {isOk && event.checksum && (
          <div>
            <div className="text-xs text-slate-500 mb-1">Checksum</div>
            <div className="font-mono text-[10px] text-green-400 bg-green-900/20 rounded px-2 py-1 break-all">
              {event.checksum}
            </div>
          </div>
        )}

        {/* Result badge */}
        <div className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm ${
          isOk     ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
          isFailed ? 'bg-red-900/30   text-red-400   border border-red-500/30' :
          'bg-navy-700 text-slate-400'
        }`}>
          {isOk     ? '✓ CHECKSUM VERIFIED' :
           isFailed ? '✗ CHECKSUM FAILED'   :
           'PENDING'}
        </div>
      </div>
    </div>
  );
}
