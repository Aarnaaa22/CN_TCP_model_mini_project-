/**
 * CompletionPanel.jsx (Light Circuit theme)
 *
 * Full-screen-style overlay shown when TRANSFER_COMPLETED event fires.
 */

function fmtBytes(b) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}
function fmtTime(ms) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export default function CompletionPanel({ completion, onReset, onClose }) {
  if (!completion) return null;
  const s = completion.stats || {};

  return (
    <div className="card border-2 border-[#2FD6B4] shadow-2xl shadow-[#2FD6B4]/20 w-full p-6 text-center fade-in bg-white">

      {/* Success icon */}
      <div className="w-12 h-12 rounded-full bg-[#2FD6B4]/15 border-2 border-[#2FD6B4]
        flex items-center justify-center mx-auto mb-2 shadow-sm">
        <span className="text-2xl text-[#0E8570] font-bold">✓</span>
      </div>

      <h2 className="text-xl font-bold text-[#12131A] mb-1">File Transfer Completed</h2>
      <p className="text-[#5B6478] text-xs mb-3 font-medium">All packets were successfully transmitted, acknowledged, and reassembled.</p>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#EEF2FA] rounded-full overflow-hidden mb-4 border border-[#12131A]/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[#4C7DFF] to-[#2FD6B4] w-full" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-4 text-left">
        {[
          { label: 'Original Size',       value: fmtBytes(s.originalFileSize) },
          { label: 'Reconstructed Size',  value: fmtBytes(s.reconstructedFileSize) },
          { label: 'Transfer Time',       value: fmtTime(s.transferTime) },
          { label: 'Total Packets',       value: s.totalPackets },
          { label: 'Retransmissions',     value: s.retransmissions },
          { label: 'Total Attempts',      value: s.totalAttempts },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#EEF2FA] border border-[#12131A]/08 rounded-xl p-2.5">
            <div className="text-[10px] text-[#5B6478] mb-0.5 uppercase tracking-wider font-semibold">{label}</div>
            <div className="text-xs font-bold text-[#12131A] font-mono">{value}</div>
          </div>
        ))}
      </div>

      {/* Checksum verified */}
      <div className={`flex items-center justify-center gap-2 py-2 rounded-xl mb-4 text-xs font-bold tracking-wide uppercase ${
        s.checksumVerified
          ? 'bg-[#2FD6B4]/20 text-[#0E8570] border border-[#2FD6B4]/50 shadow-xs'
          : 'bg-red-100       text-red-700   border border-red-300'
      }`}>
        {s.checksumVerified ? '✓ Checksum Verified (Integrity Confirmed)' : '✗ Checksum Mismatch'}
      </div>

      {/* Actions */}
      <div className="flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 py-2 rounded-xl border border-[#12131A]/14 text-[#5B6478]
            text-xs font-semibold hover:bg-[#EEF2FA] hover:text-[#12131A] transition-all cursor-pointer"
        >
          ✕ Close
        </button>
        <button
          onClick={() => {
            onClose();
            window.dispatchEvent(new Event('replayTransfer'));
          }}
          className="flex-1 py-2 rounded-xl bg-[#4C7DFF] hover:bg-[#3B6BE8] text-white font-semibold
            text-xs transition-all shadow-md shadow-[#4C7DFF]/25 cursor-pointer"
        >
          ▶ Replay
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-2 rounded-xl border border-[#2FD6B4] text-[#0E8570] font-semibold
            text-xs hover:bg-[#2FD6B4]/15 transition-all shadow-xs cursor-pointer"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
