function fmtBytes(b) {
  if (!b) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}
function fmtTime(ms) {
  if (!ms) return '0 ms';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export default function CompletionPanel({ completion, onReset, onClose, onProceedToSlidingWindow }) {
  if (!completion) return null;
  const s = completion.stats || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="card retro-card border-4 border-[#1E293B] shadow-[8px_8px_0px_#1E293B] max-w-lg w-full bg-[#FFFDF5] animate-bounce-short">
        <div className="retro-window-header bg-emerald-600">
          <div className="flex items-center gap-2">
            <span>🏆</span>
            <span>TRANSFER_COMPLETED.EXE</span>
          </div>
          <div className="retro-window-controls">
            <button onClick={onClose} className="retro-win-btn retro-win-btn-close">X</button>
          </div>
        </div>

        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-3 border-[#1E293B] flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0px_#1E293B] text-3xl">
            🏆
          </div>

          <h2 className="text-base font-bold text-[#1E293B] font-['Press_Start_2P'] mb-2">
            FILE TRANSFER COMPLETE!
          </h2>
          <p className="text-xs text-[#475569] font-['Pixelify_Sans'] font-semibold mb-4">
            All packets were successfully transmitted, acknowledged, and reassembled on Server B.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4 text-left">
            {[
              { label: 'Original Size',       value: fmtBytes(s.originalFileSize) },
              { label: 'Reconstructed Size',  value: fmtBytes(s.reconstructedFileSize) },
              { label: 'Transfer Time',       value: fmtTime(s.transferTime) },
              { label: 'Total Packets',       value: s.totalPackets },
              { label: 'Retransmissions',     value: s.retransmissions },
              { label: 'Total Attempts',      value: s.totalAttempts },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F1F5F9] border-2 border-[#1E293B] rounded p-2 shadow-[2px_2px_0px_#1E293B]">
                <div className="text-[7px] font-['Press_Start_2P'] text-[#64748B] uppercase">{label}</div>
                <div className="text-xs font-bold text-[#1E293B] font-['Press_Start_2P'] mt-0.5">{value}</div>
              </div>
            ))}
          </div>

          <div className={`p-2.5 rounded border-2 text-[9px] font-['Press_Start_2P'] mb-4 ${
            s.checksumVerified
              ? 'bg-emerald-100 text-emerald-900 border-emerald-700'
              : 'bg-rose-100 text-rose-900 border-rose-700'
          }`}>
            {s.checksumVerified ? '✅ CHECKSUM VERIFIED (100% INTEGRITY)' : '❌ CHECKSUM MISMATCH'}
          </div>

          <div className="flex flex-col gap-2.5">
            {onProceedToSlidingWindow && (
              <button
                onClick={() => {
                  onClose();
                  onProceedToSlidingWindow();
                }}
                className="btn-pixel bg-[#2563EB] hover:bg-[#1D4ED8] text-white w-full py-3 text-[9px] shadow-[3px_3px_0px_#1E293B] flex items-center justify-center gap-2"
              >
                <span>🚀 PROCEED TO SLIDING WINDOW PROTOCOL</span>
                <span>➔</span>
              </button>
            )}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="btn-pixel btn-pixel-secondary flex-1 py-2 text-[9px]"
              >
                CLOSE
              </button>
              <button
                onClick={onReset}
                className="btn-pixel btn-pixel-primary flex-1 py-2 text-[9px]"
              >
                REPLAY SIMULATION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
