import { useState } from 'react';
import { startTransfer, updateConfig, stopTransfer } from '../api/transferApi';
import { runBrowserSimulation, stopBrowserSimulation } from '../services/browserSimulationEngine';

function Slider({ label, value, min, max, step, onChange, format, color = '#2563EB' }) {
  return (
    <div className="flex flex-col gap-1 bg-[#F1F5F9] p-2.5 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-[#1E293B] font-['Pixelify_Sans']">{label}</span>
        <span className="text-xs font-['Press_Start_2P'] font-bold text-[#2563EB] text-[9px] bg-white px-1.5 py-0.5 rounded border border-[#1E293B]">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-3 rounded appearance-none cursor-pointer bg-[#E2E8F0] border border-[#1E293B]"
        style={{ accentColor: color }}
      />
    </div>
  );
}

export default function ControlPanel({ status, totalPackets, onReset, socketEmit, connected, onLocalEvent }) {
  const [file, setFile] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Presentation defaults: 512B packet size, 1200ms transfer delay (easy to explain!)
  const [pktSize, setPktSize] = useState(512);
  const [lossPct, setLossPct] = useState(0);
  const [crptPct, setCrptPct] = useState(0);
  const [delay, setDelay] = useState(1800);
  const [timeout, setTimeout_] = useState(2500);

  const [injected, setInjected] = useState([]);
  const [injPkt, setInjPkt] = useState(2);
  const [injType, setInjType] = useState('LOST');

  const isRunning = status === 'RUNNING';
  const isCompleted = status === 'COMPLETED';

  function handleFileSelect(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setFileMeta({ name: selected.name, size: selected.size });
    setError(null);
  }

  // Plan B: Load pre-generated sample.txt without selecting local file
  function loadSampleFile() {
    const textContent = `TCP Model Simulation Evaluation Sample File
===========================================
This is sample.txt used for testing TCP reliable file transfer simulation.
Features tested:
1. Checksum generation (16-bit internet checksum)
2. Sequence & Acknowledgement (Seq/Ack) numbers
3. Dynamic Timeout & Retransmission (RTO)
4. Packet Loss & Error Recovery
5. Stop-and-Wait / Sliding Window flow control

Packet 1: Handshake & Metadata verification.
Packet 2: Data segment payload transfer.
Packet 3: Error detection & Checksum validation.
Packet 4: Retransmission mechanism evaluation.
Packet 5: Receiver buffer assembly.
Packet 6: Transmission completion & SHA-256 integrity check.
`;

    const fullText = Array(4).fill(textContent).join("\n---\n");
    const blob = new Blob([fullText], { type: 'text/plain' });
    const sampleFile = new File([blob], 'sample.txt', { type: 'text/plain' });

    setFile(sampleFile);
    setFileMeta({ name: 'sample.txt', size: blob.size });
    setPktSize(512);
    setDelay(1800);
    setError(null);
  }

  // Generate a clean 6-packet demo payload (~3 KB sliced by 512B = 6 packets exactly!)
  function loadDemoPayload(presetType = 'NORMAL') {
    const line = "Transmission Control Protocol (TCP) reliable transfer evaluation demo payload line. ";
    const demoContent = Array(45).fill(line).join("\n");

    const blob = new Blob([demoContent], { type: 'text/plain' });
    const dummyFile = new File([blob], 'sample.txt', { type: 'text/plain' });

    setFile(dummyFile);
    setFileMeta({ name: 'sample.txt', size: blob.size });
    setPktSize(512);
    setDelay(1800);

    if (presetType === 'NORMAL') {
      setLossPct(0);
      setCrptPct(0);
      setInjected([]);
    } else if (presetType === 'LOSS') {
      setLossPct(0);
      setCrptPct(0);
      setInjected([{ packetNumber: 2, errorType: 'LOST' }]);
    } else if (presetType === 'CORRUPT') {
      setLossPct(0);
      setCrptPct(0);
      setInjected([{ packetNumber: 3, errorType: 'CORRUPTED' }]);
    }

    setError(null);
  }

  async function handleStart() {
    if (!file) return setError('Please load demo file or select a file first.');
    setLoading(true);
    setError(null);

    const config = {
      packetLossProbability:       lossPct / 100,
      packetCorruptionProbability: crptPct / 100,
      transmissionDelay:           delay,
      timeoutDuration:             timeout,
      packetSize:                  pktSize,
    };

    // If connected to Node.js backend, try backend first
    if (connected) {
      try {
        await updateConfig(config).catch(() => {});
        await startTransfer(file, injected);
        setLoading(false);
        return;
      } catch (err) {
        console.warn('Backend transfer failed, falling back to browser simulation engine:', err);
      }
    }

    // Standalone fallback: execute full TCP simulation directly in browser!
    try {
      setLoading(false);
      await runBrowserSimulation(file, injected, config, onLocalEvent);
    } catch (err) {
      setError(err.message || 'Simulation error.');
    } finally {
      setLoading(false);
    }
  }

  function handleStop() {
    stopBrowserSimulation();
    socketEmit?.('stop_simulation');
    socketEmit?.('stop_transfer');
    stopTransfer().catch(() => {});
  }

  function handleReset() {
    stopBrowserSimulation();
    socketEmit?.('reset_simulation');
    socketEmit?.('reset_transfer');
    setFile(null);
    setFileMeta(null);
    setInjected([]);
    setError(null);
    onReset?.();
  }

  function addInjection() {
    if (injected.some(i => i.packetNumber === injPkt)) return;
    setInjected([...injected, { packetNumber: injPkt, errorType: injType }]);
    setInjPkt(p => p + 1);
  }

  function removeInjection(pktNum) {
    setInjected(injected.filter(i => i.packetNumber !== pktNum));
  }

  return (
    <div className="card retro-card flex flex-col gap-4">
      <div className="retro-window-header">
        <div className="flex items-center gap-2">
          <span>⚙️</span>
          <span>CONTROL_PANEL.EXE</span>
        </div>
        <div className="retro-window-controls">
          <div className="retro-win-btn retro-win-btn-min">_</div>
          <div className="retro-win-btn retro-win-btn-max">□</div>
          <div className="retro-win-btn retro-win-btn-close">X</div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* Presentation One-Click Presets */}
        <div className="bg-[#FEF9C3] border-2 border-[#1E293B] rounded p-2.5 shadow-[2px_2px_0px_#1E293B]">
          <label className="block text-[8px] font-['Press_Start_2P'] text-[#854D0E] uppercase mb-1.5">
            🎓 PRESENTATION PRESETS (6 PACKETS)
          </label>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => loadDemoPayload('NORMAL')}
              disabled={isRunning}
              className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] font-['Press_Start_2P'] rounded border border-[#1E293B] shadow-[1px_1px_0px_#1E293B] text-left cursor-pointer disabled:opacity-50"
            >
              1. 🟢 PERFECT TRANSFER (6 Pkts)
            </button>
            <button
              onClick={() => loadDemoPayload('LOSS')}
              disabled={isRunning}
              className="py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white text-[8px] font-['Press_Start_2P'] rounded border border-[#1E293B] shadow-[1px_1px_0px_#1E293B] text-left cursor-pointer disabled:opacity-50"
            >
              2. 🔴 PKT 2 LOST + RETRANSMIT
            </button>
            <button
              onClick={() => loadDemoPayload('CORRUPT')}
              disabled={isRunning}
              className="py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white text-[8px] font-['Press_Start_2P'] rounded border border-[#1E293B] shadow-[1px_1px_0px_#1E293B] text-left cursor-pointer disabled:opacity-50"
            >
              3. 🟡 PKT 3 CORRUPT + CHECKSUM
            </button>
          </div>
        </div>

        {/* File Payload */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[9px] font-['Press_Start_2P'] text-[#1E293B] uppercase">Custom File</label>
            <button
              type="button"
              onClick={loadSampleFile}
              disabled={isRunning}
              className="text-[8px] font-['Press_Start_2P'] px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded border border-[#1E293B] shadow-[1px_1px_0px_#1E293B] cursor-pointer disabled:opacity-50 flex items-center gap-1"
              title="Plan B: Load sample.txt without selecting local file"
            >
              📄 USE SAMPLE.TXT
            </button>
          </div>

          <div
            onClick={() => !isRunning && document.getElementById('file-input').click()}
            className={`
              border-3 border-dashed border-[#1E293B] rounded-lg p-3 text-center cursor-pointer
              transition-colors bg-[#F8FAFC] hover:bg-[#F1F5F9]
              ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              disabled={isRunning}
              className="hidden"
            />
            {fileMeta ? (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xl">💾</span>
                <span className="text-xs font-bold text-[#1E293B] truncate max-w-[200px] font-['Pixelify_Sans']">
                  {fileMeta.name}
                </span>
                <span className="text-[10px] text-[#2563EB] font-['Press_Start_2P'] text-[8px] mt-0.5">
                  {(fileMeta.size / 1024).toFixed(1)} KB • {totalPackets || Math.ceil(fileMeta.size / pktSize)} Packets
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-[#64748B]">
                <span className="text-xl">📁</span>
                <span className="font-bold text-[#1E293B] text-xs font-['Pixelify_Sans']">Click to Select Custom File</span>
                <span className="text-[8px] text-[#2563EB] font-['Press_Start_2P'] mt-0.5">OR CLICK "USE SAMPLE.TXT" ABOVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Timing & Delay */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-['Press_Start_2P'] text-[#1E293B] uppercase">Speed & Timing</label>
          <Slider label="Transfer Delay (Animation Pace)" value={delay} min={400} max={3000} step={100}
            onChange={v => {
              setDelay(v);
              if (isRunning) {
                socketEmit?.('update_config', { transmissionDelay: v, timeoutDuration: timeout });
              }
            }} 
            format={v => `${v}ms`}
            color="#2563EB" />
          <Slider label="Timeout Duration" value={timeout} min={500} max={5000} step={100}
            onChange={v => {
              setTimeout_(v);
              if (isRunning) {
                socketEmit?.('update_config', { transmissionDelay: delay, timeoutDuration: v });
              }
            }} 
            format={v => `${v}ms`}
            color="#F97316" />
        </div>

        {/* Error Simulation Rates */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-['Press_Start_2P'] text-[#1E293B] uppercase">Random Errors</label>
          <Slider label="Random Loss %" value={lossPct} min={0} max={80} step={5}
            onChange={v => !isRunning && setLossPct(v)} format={v => `${v}%`} color="#EF4444" />
          <Slider label="Random Corruption %" value={crptPct} min={0} max={50} step={5}
            onChange={v => !isRunning && setCrptPct(v)} format={v => `${v}%`} color="#EAB308" />
        </div>

        {/* Manual Error Injection */}
        <div className="bg-[#F1F5F9] p-2.5 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B]">
          <label className="block text-[8px] font-['Press_Start_2P'] text-[#1E293B] uppercase mb-2">Manual Error Injection</label>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-[8px] font-['Press_Start_2P'] text-[#64748B] mb-1">Pkt #</label>
              <input
                type="number"
                min={1}
                value={injPkt}
                onChange={e => setInjPkt(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#1E293B] rounded px-2 py-1 text-xs font-bold font-['Press_Start_2P'] text-[9px]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[8px] font-['Press_Start_2P'] text-[#64748B] mb-1">Type</label>
              <select
                value={injType}
                onChange={e => setInjType(e.target.value)}
                className="w-full bg-white border-2 border-[#1E293B] rounded px-1 py-1 text-xs font-bold font-['Press_Start_2P'] text-[8px]"
              >
                <option value="LOST">LOST</option>
                <option value="CORRUPTED">CRPT</option>
              </select>
            </div>
            <button
              onClick={addInjection}
              disabled={isRunning}
              className="px-3 py-1 rounded bg-[#2563EB] text-[#FFFDF5] border-2 border-[#1E293B] text-[8px] font-['Press_Start_2P'] shadow-[2px_2px_0px_#1E293B] hover:bg-[#1D4ED8] cursor-pointer disabled:opacity-50"
            >
              +ADD
            </button>
          </div>

          {injected.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              {injected.map(({ packetNumber, errorType }) => (
                <div key={packetNumber} className="flex items-center justify-between bg-white border border-[#1E293B] rounded px-2 py-1 text-[8px] font-['Press_Start_2P']">
                  <span>PKT #{packetNumber}</span>
                  <span className={`px-1.5 py-0.5 rounded text-white ${errorType === 'LOST' ? 'bg-rose-600' : 'bg-amber-500'}`}>
                    {errorType}
                  </span>
                  <button onClick={() => removeInjection(packetNumber)} className="text-rose-600 font-bold hover:underline cursor-pointer">
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-rose-100 border-2 border-rose-600 rounded p-2 text-xs text-rose-800 font-bold font-['Pixelify_Sans']">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-col gap-2.5 mt-2">
          {!isRunning && (
            <button
              onClick={handleStart}
              disabled={loading || !file}
              className="btn-pixel btn-pixel-primary w-full py-3.5 text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>▶ </span>
              <span>{loading ? 'STARTING...' : (isCompleted ? 'REPLAY SIMULATION' : 'START SIMULATION')}</span>
            </button>
          )}

          {isRunning && (
            <button
              onClick={handleStop}
              className="btn-pixel btn-pixel-danger w-full py-3.5 text-xs flex items-center justify-center gap-2"
            >
              <span>⏹ </span>
              <span>STOP TRANSFER</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="btn-pixel btn-pixel-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <span>🔄 </span>
            <span>CLEAR & RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
}
