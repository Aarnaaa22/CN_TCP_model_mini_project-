/**
 * CompletionPanel.jsx
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

export default function CompletionPanel({ completion, onReset }) {
  if (!completion) return null;
  const s = completion.stats || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm fade-in">
      <div className="card border border-green-500/40 shadow-[0_0_60px_rgba(34,197,94,0.15)] max-w-lg w-full mx-4 p-8 text-center">

        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-green-900/40 border-2 border-green-500/60
          flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <span className="text-3xl">✓</span>
        </div>

        <h2 className="text-2xl font-bold text-green-400 mb-1">File Transfer Completed</h2>
        <p className="text-slate-400 text-sm mb-6">All packets were successfully received and verified.</p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-navy-700 rounded-full overflow-hidden mb-6">
          <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-cyan-500 w-full" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          {[
            { label: 'Original File Size',  value: fmtBytes(s.originalFileSize) },
            { label: 'Reconstructed Size',  value: fmtBytes(s.reconstructedFileSize) },
            { label: 'Total Packets',       value: s.totalPackets },
            { label: 'Retransmissions',     value: s.retransmissions },
            { label: 'Transfer Time',       value: fmtTime(s.transferTime) },
            { label: 'Total Attempts',      value: s.totalAttempts },
          ].map(({ label, value }) => (
            <div key={label} className="bg-navy-700/60 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 mb-0.5">{label}</div>
              <div className="text-sm font-bold text-white font-mono">{value}</div>
            </div>
          ))}
        </div>

        {/* Checksum verified */}
        <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl mb-6 font-bold ${
          s.checksumVerified
            ? 'bg-green-900/30 text-green-400 border border-green-500/30'
            : 'bg-red-900/30   text-red-400   border border-red-500/30'
        }`}>
          {s.checksumVerified ? '✓ Checksum Verified — File Integrity Confirmed' : '✗ Checksum Mismatch'}
        </div>

        {/* Dismiss */}
        <button
          onClick={onReset}
          className="w-full py-2.5 rounded-xl border border-white/10 text-slate-400
            text-sm hover:bg-navy-700 hover:text-white transition-all"
        >
          ↺ Start New Transfer
        </button>
      </div>
    </div>
  );
}
