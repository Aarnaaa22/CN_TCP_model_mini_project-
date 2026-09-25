/**
 * ControlPanel.jsx
 *
 * File upload, simulation config sliders, and manual error injection.
 * Calls backend REST APIs directly.
 */

import { useState, useRef, useEffect } from 'react';
import { SIMULATION_STATUS } from '../store/simulationStore';

function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function Slider({ label, value, min, max, step, onChange, format }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs text-cyan-400 font-mono">{format ? format(value) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: '#00d4ff' }}
      />
    </div>
  );
}

export default function ControlPanel({ status, onReset, totalPackets, socketEmit }) {
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
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Control Panel</h2>

      {/* ── File selection ───────────────────────────────────── */}
      <div>
        <label className="block text-xs text-slate-400 mb-2">File to Transfer</label>
        <div
          className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-cyan-500/40 transition-colors"
          onClick={() => !isRunning && fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} disabled={isRunning} />
          {file ? (
            <div className="flex items-center justify-center gap-1 text-xs text-white overflow-hidden whitespace-nowrap">
              <span className="font-medium truncate">{file.name}</span>
              <span className="text-cyan-400 flex-shrink-0">({fmtSize(file.size)})</span>
              <span className="text-slate-500 flex-shrink-0">≈ {estimatedPackets} pkts @ {pktSize}B</span>
            </div>
          ) : (
            <div className="text-slate-500 text-xs">Click to select a file</div>
          )}
        </div>
      </div>

      {/* ── Packet size ──────────────────────────────────────── */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-400">Packet Size</span>
          <span className="text-xs text-cyan-400 font-mono">{pktSize} B</span>
        </div>
        <input type="range" min={64} max={2048} step={64} value={pktSize}
          onChange={e => setPktSize(Number(e.target.value))}
          disabled={isRunning}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#00d4ff' }}
        />
      </div>

      {/* ── Error probabilities ──────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <label className="text-xs text-slate-400">Error Simulation</label>
        <Slider label="Packet Loss %" value={lossPct} min={0} max={80} step={5}
          onChange={v => !isRunning && setLossPct(v)} format={v => `${v}%`} />
        <Slider label="Corruption %" value={crptPct} min={0} max={50} step={5}
          onChange={v => !isRunning && setCrptPct(v)} format={v => `${v}%`} />
      </div>

      {/* ── Timing ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <label className="text-xs text-slate-400">Simulation Timing</label>
        <Slider label="Transfer Delay (Slows down animation)" value={delay} min={100} max={3000} step={100}
          onChange={async v => {
            setDelay(v);
            if (isRunning) {
              try {
                await updateConfig({
                  packetLossProbability:       lossPct / 100,
                  packetCorruptionProbability: crptPct / 100,
                  transmissionDelay:           v,
                  timeoutDuration:             timeout,
                  packetSize:                  pktSize,
                });
              } catch (err) {
                console.error('Failed to update config:', err);
              }
            }
          }} 
          format={v => `${v} ms`} />
        <Slider label="Timeout" value={timeout} min={500} max={5000} step={100}
          onChange={async v => {
            setTimeout_(v);
            if (isRunning) {
              try {
                await updateConfig({
                  packetLossProbability:       lossPct / 100,
                  packetCorruptionProbability: crptPct / 100,
                  transmissionDelay:           delay,
                  timeoutDuration:             v,
                  packetSize:                  pktSize,
                });
              } catch (err) {
                console.error('Failed to update config:', err);
              }
            }
          }} 
          format={v => `${v} ms`} />
      </div>

      {/* ── Manual error injection ───────────────────────────── */}
      <div>
        <label className="block text-xs text-slate-400 mb-2">Manual Error Injection</label>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-[10px] text-slate-500 mb-1">Packet #</label>
            <input type="number" min={1} value={injPkt}
              onChange={e => setInjPkt(Number(e.target.value))}
              className="w-full bg-navy-700 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] text-slate-500 mb-1">Error Type</label>
            <select value={injType} onChange={e => setInjType(e.target.value)}
              className="w-full bg-navy-700 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
              <option value="LOST">Lost</option>
              <option value="CORRUPTED">Corrupted</option>
            </select>
          </div>
          <button onClick={addInjection} disabled={isRunning}
            className="px-3 py-1.5 rounded-lg bg-navy-600 border border-white/10 text-xs text-white hover:bg-navy-500 disabled:opacity-40 transition-colors">
            Add
          </button>
        </div>

        {/* Injected list */}
        {injected.length > 0 && (
          <div className="mt-2 flex flex-col gap-1">
            {injected.map(({ packetNumber, errorType }) => (
              <div key={packetNumber} className="flex items-center justify-between
                bg-navy-700 border border-white/5 rounded-lg px-3 py-1">
                <span className="text-xs text-white">Packet {packetNumber}</span>
                <span className={`badge ${errorType === 'LOST' ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/50 text-amber-400'}`}>
                  {errorType}
                </span>
                <button onClick={() => removeInjection(packetNumber)}
                  className="text-slate-500 hover:text-red-400 text-xs ml-2">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Error banner ─────────────────────────────────────── */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/40 rounded-lg px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* ── Action buttons ───────────────────────────────────── */}
      <div className="flex flex-col gap-2 mt-auto">
        {!isRunning && (
          <button onClick={handleStart} disabled={loading || !file}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700
              text-white text-sm font-semibold hover:from-cyan-500 hover:to-blue-600
              disabled:opacity-40 disabled:cursor-not-allowed transition-all
              shadow-lg shadow-cyan-500/20">
            {loading ? 'Starting…' : (isCompleted ? '▶  Replay Transfer' : '▶  Start Transfer')}
          </button>
        )}
        {isRunning && (
          <button onClick={handleStop}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-900
              text-white text-sm font-semibold hover:from-red-600 hover:to-red-800 transition-all">
            ■  Stop Transfer
          </button>
        )}
        <button onClick={handleReset}
          className="w-full py-2 rounded-xl border border-white/10 text-slate-400
            text-sm hover:bg-navy-700 hover:text-white transition-all">
          ↺  Clear & Reset
        </button>
      </div>
    </div>
  );
}
