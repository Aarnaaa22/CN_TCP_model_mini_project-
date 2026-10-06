/**
 * ControlPanel.jsx (Light Circuit theme)
 *
 * File upload, simulation config sliders, and manual error injection.
 */

import { useState, useRef, useEffect } from 'react';
import { SIMULATION_STATUS } from '../store/simulationStore';

function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function Slider({ label, value, min, max, step, onChange, format, color = '#4C7DFF' }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-[#5B6478] font-medium">{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>{format ? format(value) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#EEF2FA]"
        style={{ accentColor: color }}
      />
    </div>
  );
}

export default function ControlPanel({ status, onReset, socketEmit }) {
  const fileRef = useRef();
  const [file, setFile]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Simulation config
  const [lossPct,  setLossPct]      = useState(15);
  const [crptPct,  setCrptPct]      = useState(10);
  const [delay,    setDelay]        = useState(500);
  const [timeout,  setTimeout_]     = useState(1500);
  const [pktSize,  setPktSize]      = useState(512);

  // Manual error injection
  const [injPkt,   setInjPkt]       = useState(2);
  const [injType,  setInjType]      = useState('LOST');
  const [injected, setInjected]     = useState([]);  // [{packetNumber, errorType}]

  const isRunning   = status === SIMULATION_STATUS.RUNNING;
  const isCompleted = status === SIMULATION_STATUS.COMPLETED || status === SIMULATION_STATUS.FAILED;

  const estimatedPackets = file ? Math.ceil(file.size / pktSize) : 0;

  function handleFileChange(e) {
    const f = e.target.files[0];
    setFile(f || null);
    setError('');
    setInjected([]);
  }

  // Allow other components (like CompletionPanel) to trigger a replay
  useEffect(() => {
    const handleReplay = () => {
      if (file && !isRunning) handleStart();
    };
    window.addEventListener('replayTransfer', handleReplay);
    return () => window.removeEventListener('replayTransfer', handleReplay);
  }, [file, isRunning, lossPct, crptPct, delay, timeout, pktSize, injected]);

  function addInjection() {
    if (injPkt < 1) return;
    setInjected(prev => {
      const filtered = prev.filter(i => i.packetNumber !== injPkt);
      return [...filtered, { packetNumber: injPkt, errorType: injType }];
    });
  }

  function removeInjection(pNum) {
    setInjected(prev => prev.filter(i => i.packetNumber !== pNum));
  }

  async function handleStart() {
    if (!file) { setError('Please select a file first.'); return; }
    setError('');
    setLoading(true);
    try {
      // Push config to backend first
      socketEmit('update_config', {
        packetLossProbability:       lossPct / 100,
        packetCorruptionProbability: crptPct / 100,
        transmissionDelay:           delay,
        timeoutDuration:             timeout,
        packetSize:                  pktSize,
      });

      // Send file buffer over WebSocket
      const fileBuffer = await file.arrayBuffer();
      socketEmit('start_transfer', {
        fileBuffer,
        fileName: file.name,
        errorInjections: injected
      });
    } catch (err) {
      setError(err.message || 'Failed to start transfer.');
    } finally {
      setLoading(false);
    }
  }

  function handleStop() {
    socketEmit('stop_transfer');
  }

  function handleReset() {
    socketEmit('reset_transfer');
    setFile(null);
    setInjected([]);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
    onReset?.();
  }

  return (
    <div className="card card-glow flex flex-col gap-5 p-5 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#12131A]">Control Panel</h2>
        <span className="tag-badge">CONFIG</span>
      </div>

      {/* ── File selection ───────────────────────────────────── */}
      <div>
        <label className="block text-xs font-semibold text-[#5B6478] mb-2">File to Transfer</label>
        <div
          className="border-2 border-dashed border-[#12131A]/15 bg-[#EEF2FA] rounded-xl p-4 text-center cursor-pointer hover:border-[#4C7DFF] hover:bg-[#EEF2FA]/70 transition-all"
          onClick={() => !isRunning && fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} disabled={isRunning} />
          {file ? (
            <div className="flex flex-col items-center gap-1 text-xs text-[#12131A]">
              <span className="font-semibold truncate max-w-full text-[#12131A]">{file.name}</span>
              <div className="flex items-center gap-1.5 text-[11px] text-[#5B6478]">
                <span className="text-[#4C7DFF] font-mono font-bold">{fmtSize(file.size)}</span>
                <span>•</span>
                <span>≈ {estimatedPackets} pkts @ {pktSize}B</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[#5B6478] text-xs">
              <svg className="w-6 h-6 text-[#4C7DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="font-medium text-[#12131A]">Click to select a file</span>
              <span className="text-[10px] text-[#5B6478]">Any document or text file</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Packet size ──────────────────────────────────────── */}
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-[#5B6478] font-medium">Packet Size</span>
          <span className="text-xs text-[#4C7DFF] font-mono font-bold">{pktSize} B</span>
        </div>
        <input type="range" min={64} max={2048} step={64} value={pktSize}
          onChange={e => setPktSize(Number(e.target.value))}
          disabled={isRunning}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#EEF2FA]"
          style={{ accentColor: '#4C7DFF' }}
        />
      </div>

      {/* ── Error probabilities ──────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-[#12131A] uppercase tracking-wider text-[11px]">Error Simulation</label>
        <Slider label="Packet Loss %" value={lossPct} min={0} max={80} step={5}
          onChange={v => !isRunning && setLossPct(v)} format={v => `${v}%`} color="#EF4444" />
        <Slider label="Corruption %" value={crptPct} min={0} max={50} step={5}
          onChange={v => !isRunning && setCrptPct(v)} format={v => `${v}%`} color="#F59E0B" />
      </div>

      {/* ── Timing ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-[#12131A] uppercase tracking-wider text-[11px]">Simulation Timing</label>
        <Slider label="Transfer Delay (Slows animation)" value={delay} min={100} max={3000} step={100}
          onChange={v => {
            setDelay(v);
            if (isRunning) {
              socketEmit?.('update_config', {
                transmissionDelay:           v,
                timeoutDuration:             timeout,
              });
            }
          }} 
          format={v => `${v} ms`}
          color="#4C7DFF" />
        <Slider label="Timeout Duration" value={timeout} min={500} max={5000} step={100}
          onChange={v => {
            setTimeout_(v);
            if (isRunning) {
              socketEmit?.('update_config', {
                transmissionDelay:           delay,
                timeoutDuration:             v,
              });
            }
          }} 
          format={v => `${v} ms`}
          color="#FF8A3D" />
      </div>

      {/* ── Manual error injection ───────────────────────────── */}
      <div>
        <label className="block text-xs font-bold text-[#12131A] uppercase tracking-wider text-[11px] mb-2">Manual Error Injection</label>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-[10px] text-[#5B6478] mb-1 font-medium">Packet #</label>
            <input type="number" min={1} value={injPkt}
              onChange={e => setInjPkt(Number(e.target.value))}
              className="w-full bg-[#EEF2FA] border border-[#12131A]/12 rounded-lg px-2.5 py-1.5 text-xs text-[#12131A] font-semibold focus:outline-none focus:border-[#4C7DFF]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] text-[#5B6478] mb-1 font-medium">Error Type</label>
            <select value={injType} onChange={e => setInjType(e.target.value)}
              className="w-full bg-[#EEF2FA] border border-[#12131A]/12 rounded-lg px-2 py-1.5 text-xs text-[#12131A] font-semibold focus:outline-none focus:border-[#4C7DFF]">
              <option value="LOST">Lost</option>
              <option value="CORRUPTED">Corrupted</option>
            </select>
          </div>
          <button onClick={addInjection} disabled={isRunning}
            className="px-3.5 py-1.5 rounded-lg bg-[#EEF2FA] border border-[#12131A]/12 text-xs font-semibold text-[#12131A] hover:bg-[#E2E8F0] hover:border-[#4C7DFF] disabled:opacity-40 transition-all cursor-pointer">
            Add
          </button>
        </div>

        {/* Injected list */}
        {injected.length > 0 && (
          <div className="mt-2.5 flex flex-col gap-1.5">
            {injected.map(({ packetNumber, errorType }) => (
              <div key={packetNumber} className="flex items-center justify-between
                bg-[#EEF2FA] border border-[#12131A]/10 rounded-lg px-3 py-1.5">
                <span className="text-xs font-semibold text-[#12131A]">Packet {packetNumber}</span>
                <span className={`badge ${errorType === 'LOST' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-amber-100 text-amber-700 border border-amber-300'}`}>
                  {errorType}
                </span>
                <button onClick={() => removeInjection(packetNumber)}
                  className="text-[#5B6478] hover:text-red-500 text-xs ml-2 cursor-pointer font-bold">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Error banner ─────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-2 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* ── Action buttons ───────────────────────────────────── */}
      <div className="flex flex-col gap-2 mt-auto pt-2">
        {!isRunning && (
          <button onClick={handleStart} disabled={loading || !file}
            className="w-full py-2.5 rounded-xl bg-[#4C7DFF] hover:bg-[#3B6BE8]
              text-white text-sm font-semibold
              disabled:opacity-40 disabled:cursor-not-allowed transition-all
              shadow-md shadow-[#4C7DFF]/25 hover:shadow-lg hover:shadow-[#4C7DFF]/35 cursor-pointer">
            {loading ? 'Starting…' : (isCompleted ? '▶  Replay Transfer' : '▶  Start Transfer')}
          </button>
        )}
        {isRunning && (
          <button onClick={handleStop}
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700
              text-white text-sm font-semibold transition-all shadow-md shadow-red-600/30 cursor-pointer">
            ■  Stop Transfer
          </button>
        )}
        <button onClick={handleReset}
          className="w-full py-2 rounded-xl border border-[#12131A]/14 text-[#5B6478] font-medium
            text-sm hover:bg-[#EEF2FA] hover:text-[#12131A] transition-all cursor-pointer">
          ↺  Clear & Reset
        </button>
      </div>
    </div>
  );
}
