/** StatisticsPanel.jsx — Live transfer statistics (Light Circuit theme) */

function StatCard({ label, value, color = 'text-[#12131A]', sub }) {
  return (
    <div className="bg-[#EEF2FA] border border-[#12131A]/08 rounded-xl p-3 flex flex-col gap-1 shadow-2xs">
      <div className="text-[10px] text-[#5B6478] uppercase tracking-wider font-semibold">{label}</div>
      <div className={`text-xl font-bold font-mono ${color}`}>{value ?? '—'}</div>
      {sub && <div className="text-[10px] text-[#5B6478]">{sub}</div>}
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
    <div className="card card-glow p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#12131A]">
          Transfer Statistics
        </h2>
        <span className="tag-badge">METRICS</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <StatCard label="Total Packets"  value={total}           color="text-[#12131A]" />
        <StatCard label="Delivered"      value={success}         color="text-[#0E8570]" />
        <StatCard label="Lost"           value={s.lostPackets   ?? 0} color="text-red-600" />
        <StatCard label="Corrupted"      value={s.corruptedPackets ?? 0} color="text-amber-600" />
        <StatCard label="Retransmits"    value={s.retransmissions ?? 0} color="text-purple-700" />
        <StatCard label="Total Attmpts"  value={s.totalAttempts ?? 0} color="text-[#12131A]" />
        <StatCard label="Transfer Time"  value={fmtTime(s.transferTime)} color="text-[#4C7DFF]" />
        <StatCard label="File Size"      value={fmtBytes(s.originalFileSize)} color="text-[#4C7DFF]" />
      </div>

      {/* Delivery progress bar */}
      <div className="bg-[#EEF2FA] p-3.5 rounded-xl border border-[#12131A]/10">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[#5B6478] font-semibold">Delivery Progress</span>
          <span className="text-[#0E8570] font-mono font-bold">{pct}%</span>
        </div>
        <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#12131A]/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4C7DFF] to-[#2FD6B4] transition-all duration-500 shadow-sm"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Checksum status */}
      {stats?.checksumVerified !== undefined && (
        <div className={`mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold ${
          stats.checksumVerified
            ? 'bg-[#2FD6B4]/18 text-[#0E8570] border border-[#2FD6B4]/40'
            : 'bg-red-100       text-red-700   border border-red-300'
        }`}>
          {stats.checksumVerified ? '✓ Final File Integrity Verified' : '✗ Checksum Mismatch Detected'}
        </div>
      )}
    </div>
  );
}
