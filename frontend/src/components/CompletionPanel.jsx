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

export default function CompletionPanel({ completion, onReset, onClose }) {
  if (!completion) return null;
  const s = completion.stats || {};

  return (
    <div className="card border border-green-500/40 shadow-[0_0_60px_rgba(34,197,94,0.15)] w-full p-5 text-center fade-in">

        {/* Success icon */}
        <div className="w-12 h-12 rounded-full bg-green-900/40 border-2 border-green-500/60
          flex items-center justify-center mx-auto mb-2 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <span className="text-2xl">✓</span>
        </div>

        <h2 className="text-xl font-bold text-green-400 mb-1">File Transfer Completed</h2>
        <p className="text-slate-400 text-[11px] mb-3">All packets were successfully received and verified.</p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-navy-700 rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-cyan-500 w-full" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-left">
          {[
            { label: 'Original Size',       value: fmtBytes(s.originalFileSize) },
            { label: 'Reconstructed Size',  value: fmtBytes(s.reconstructedFileSize) },
            { label: 'Transfer Time',       value: fmtTime(s.transferTime) },
            { label: 'Total Packets',       value: s.totalPackets },
            { label: 'Retransmissions',     value: s.retransmissions },
            { label: 'Total Attempts',      value: s.totalAttempts },
          ].map(({ label, value }) => (
            <div key={label} className="bg-navy-700/60 rounded-lg p-2">
              <div className="text-[9px] text-slate-500 mb-0.5">{label}</div>
              <div className="text-xs font-bold text-white font-mono">{value}</div>
            </div>
          ))}
        </div>

        {/* Checksum verified */}
        <div className={`flex items-center justify-center gap-2 py-1.5 rounded-lg mb-4 text-xs font-bold ${
          s.checksumVerified
            ? 'bg-green-900/30 text-green-400 border border-green-500/30'
            : 'bg-red-900/30   text-red-400   border border-red-500/30'
        }`}>
          {s.checksumVerified ? '✓ Checksum Verified' : '✗ Checksum Mismatch'}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-1.5 rounded-lg border border-white/10 text-slate-400
              text-xs hover:bg-navy-700 hover:text-white transition-all"
          >
            ✕ Close
          </button>
          <button
            onClick={() => {
              onClose();
              window.dispatchEvent(new Event('replayTransfer'));
            }}
            className="flex-1 py-1.5 rounded-lg border border-cyan-500/50 text-cyan-400 font-medium
              text-xs hover:bg-cyan-500/20 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            ▶ Replay
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-1.5 rounded-lg border border-green-500/50 text-green-400 font-medium
              text-xs hover:bg-green-500/20 transition-all shadow-[0_0_15px_rgba(34,197,94,0.1)]"
          >
            ↺ Reset
          </button>
        </div>
      </div>
  );
}
