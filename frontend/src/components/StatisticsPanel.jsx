/** StatisticsPanel.jsx — Live transfer statistics */

function StatCard({ label, value, color = 'text-white', sub }) {
  return (
    <div className="bg-navy-700/60 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold font-mono ${color}`}>{value ?? '—'}</div>
      {sub && <div className="text-[10px] text-slate-600">{sub}</div>}
    </div>
  );
}

function fmtTime(ms) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtBytes(b) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}

export default function StatisticsPanel({ stats, totalPackets }) {
  const s = stats || {};
  const total   = s.totalPackets   || totalPackets || 0;
  const success = s.successfulPackets || 0;
  const pct     = total > 0 ? Math.round((success / total) * 100) : 0;

  return (
    <div className="card card-glow p-5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
        Transfer Statistics
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <StatCard label="Total Packets"  value={total}           color="text-white" />
        <StatCard label="Delivered"      value={success}         color="text-green-400" />
        <StatCard label="Lost"           value={s.lostPackets   ?? 0} color="text-red-400" />
        <StatCard label="Corrupted"      value={s.corruptedPackets ?? 0} color="text-amber-400" />
        <StatCard label="Retransmissions" value={s.retransmissions ?? 0} color="text-purple-400" />
        <StatCard label="Total Attempts" value={s.totalAttempts ?? 0} />
        <StatCard label="Transfer Time"  value={fmtTime(s.transferTime)} />
        <StatCard label="File Size"      value={fmtBytes(s.originalFileSize)} />
      </div>

      {/* Delivery progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Delivery Progress</span>
          <span className="text-cyan-400 font-mono">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-navy-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Checksum status */}
      {stats?.checksumVerified !== undefined && (
        <div className={`mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold ${
          stats.checksumVerified
            ? 'bg-green-900/20 text-green-400 border border-green-500/30'
            : 'bg-red-900/20   text-red-400   border border-red-500/30'
        }`}>
          {stats.checksumVerified ? '✓ Final Checksum Verified' : '✗ Checksum Mismatch'}
        </div>
      )}
    </div>
  );
}
