function StatCard({ label, value, color = 'text-[#1E293B]' }) {
  return (
    <div className="bg-[#F1F5F9] p-2 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
      <div className="text-[8px] font-['Press_Start_2P'] text-[#64748B] uppercase truncate mb-1">{label}</div>
      <div className={`text-base font-bold font-['Press_Start_2P'] ${color}`}>{value}</div>
    </div>
  );
}

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

export default function StatisticsPanel({ stats, totalPackets }) {
  const s = stats || {};
  const total = totalPackets || s.totalPackets || 0;
  const success = s.successfulPackets || 0;
  const pct = total > 0 ? Math.round((success / total) * 100) : 0;

  return (
    <div className="card retro-card">
      <div className="retro-window-header">
        <div className="flex items-center gap-2">
          <span>📊</span>
          <span>STATS_MONITOR.EXE</span>
        </div>
        <div className="retro-window-controls">
          <div className="retro-win-btn retro-win-btn-min">_</div>
          <div className="retro-win-btn retro-win-btn-max">□</div>
          <div className="retro-win-btn retro-win-btn-close">X</div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="tag-badge">METRICS</span>
          <span className="text-[8px] font-['Press_Start_2P'] text-[#64748B]">TELEMETRY</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Total Pkts" value={total} color="text-[#1E293B]" />
          <StatCard label="Delivered"  value={success} color="text-emerald-600" />
          <StatCard label="Lost Pkts"  value={s.lostPackets ?? 0} color="text-rose-600" />
          <StatCard label="Corrupt"    value={s.corruptedPackets ?? 0} color="text-amber-600" />
          <StatCard label="Retx Count" value={s.retransmissions ?? 0} color="text-purple-700" />
          <StatCard label="Attempts"   value={s.totalAttempts ?? 0} color="text-[#1E293B]" />
        </div>

        <div className="bg-[#F1F5F9] p-3 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
          <div className="flex justify-between items-center mb-1.5 font-['Press_Start_2P'] text-[8px]">
            <span className="text-[#1E293B]">LOADING...</span>
            <span className="text-[#2563EB]">{pct}%</span>
          </div>

          <div className="retro-progress">
            <div className="retro-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
