import { useState, useEffect } from 'react';

function CustomPixelCursor({ x, y }) {
  if (x < 0 || y < 0) return null;
  return (
    <div
      className="fixed z-[9999] pointer-events-none transition-transform duration-75 ease-out drop-shadow-[2px_2px_0px_#000]"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <svg width="32" height="40" viewBox="0 0 20 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0V22L5 17L9 25L13 23L9 15L16 15L0 0Z" fill="#1E293B" />
        <path d="M2 3V18L5.8 14.2L9.2 21L11.2 20L7.8 13.2L13 13.2L2 3Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export default function LandingPage({ onStart }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 400);
          return 100;
        }
        return prev + 10;
      });
    }, 120);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col justify-between selection:bg-[#2563EB] selection:text-white relative font-['Pixelify_Sans'] select-none cursor-none">
      
      {/* MOUSE-FOLLOWING SINGLE RETRO WHITE PIXEL ARROW */}
      <CustomPixelCursor x={mousePos.x} y={mousePos.y} />

      {/* FULLSCREEN RETRO WINDOWS DESKTOP WALLPAPER */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB] via-[#60A5FA] via-[#93C5FD] to-[#4ADE80] pointer-events-none z-0">
        <div className="absolute top-8 left-20 text-white/90 text-2xl font-['Press_Start_2P']">☁️   ☁️</div>
        <div className="absolute top-16 right-32 text-white/80 text-xl font-['Press_Start_2P']">☁️</div>

        <div className="absolute bottom-0 inset-x-0 h-[45%] bg-gradient-to-t from-[#15803D] via-[#22C55E] to-[#4ADE80] border-t-4 border-[#166534] shadow-[inset_0_10px_20px_rgba(0,0,0,0.15)] flex items-end justify-between px-10">
          <div className="text-4xl pb-12 opacity-90">🪨 🌸 🌿</div>
          <div className="text-4xl pb-16 opacity-90">🌸 🪨</div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.15)_51%)] bg-[length:100%_4px] pointer-events-none" />
      </div>

      {/* DESKTOP ICONS */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-6">
        {[
          { icon: '💻', name: 'My Computer' },
          { icon: '🗑️', name: 'Recycle Bin' },
          { icon: '📡', name: 'Network' },
          { icon: '📁', name: 'Documents' },
          { icon: '🕹️', name: 'TCP_SIM.EXE', active: true },
        ].map(item => (
          <div
            key={item.name}
            onClick={onStart}
            className={`
              flex flex-col items-center justify-center w-20 p-2 rounded-lg cursor-pointer transition-all
              hover:bg-white/20 border border-transparent hover:border-white/40
              ${item.active ? 'bg-blue-600/30 border-blue-400' : ''}
            `}
          >
            <span className="text-3xl drop-shadow-[2px_2px_0px_#000]">{item.icon}</span>
            <span className="text-[10px] font-['Press_Start_2P'] text-white text-shadow-[1px_1px_0px_#000] text-center mt-1 leading-tight">
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {/* CENTER AREA */}
      <div className="flex-1 flex items-center justify-center p-4 z-20">
        
        {/* RETRO OS LOADING DIALOG BOX (Matching Image 2!) */}
        {loading ? (
          <div className="card retro-card border-4 border-[#1E293B] shadow-[10px_10px_0px_#1E293B] bg-[#ECE9D8] p-5 w-80 sm:w-96 flex flex-col gap-4 animate-bounce-short">
            <div className="retro-window-header bg-[#1D4ED8] text-white px-3 py-1 flex items-center justify-between">
              <span className="font-['Press_Start_2P'] text-xs">Loading...</span>
              <button onClick={() => setLoading(false)} className="retro-win-btn retro-win-btn-close">X</button>
            </div>

            <div className="text-xs font-['Press_Start_2P'] text-[#1E293B] text-center my-2 leading-relaxed">
              INITIALIZING TCP MODEL SIMULATION...
            </div>

            <div className="retro-progress w-full h-8 border-3 border-[#1E293B] bg-white p-1 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]">
              <div
                className="h-full bg-[#1D4ED8] transition-all duration-150 border-r-2 border-[#1E293B]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                disabled={progress < 100}
                onClick={() => setLoading(false)}
                className="px-4 py-1.5 bg-[#E2E8F0] border-2 border-[#1E293B] text-[9px] font-['Press_Start_2P'] rounded shadow-[2px_2px_0px_#1E293B] disabled:opacity-50 hover:bg-emerald-400 hover:text-white transition-colors"
              >
                Done
              </button>
              <button
                onClick={() => setLoading(false)}
                className="px-4 py-1.5 bg-[#E2E8F0] border-2 border-[#1E293B] text-[9px] font-['Press_Start_2P'] rounded shadow-[2px_2px_0px_#1E293B] hover:bg-slate-300"
              >
                Skip
              </button>
            </div>
          </div>
        ) : (

          /* MAIN LANDING WINDOW */
          <div className="w-full max-w-2xl card retro-card border-4 border-[#1E293B] shadow-[10px_10px_0px_#1E293B] bg-[#FFFDF5] rounded-xl overflow-hidden relative">
            
            <div className="px-4 py-2 bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] flex items-center justify-between border-b-4 border-[#1E293B]">
              <div className="flex items-center gap-2 font-['Press_Start_2P'] text-xs text-white text-shadow-[1px_1px_0px_#000]">
                <span>🕹️</span>
                <span>TCP_MODEL_SIMULATION.EXE</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onStart}
                  className="w-7 h-7 rounded bg-[#EF4444] border-2 border-[#1E293B] text-white flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_#000] hover:bg-rose-700"
                >
                  ↗
                </button>
              </div>
            </div>

            <div className="relative min-h-[420px] p-6 bg-gradient-to-b from-[#38BDF8] via-[#60A5FA] via-[#93C5FD] to-[#4ADE80] border-b-4 border-[#1E293B] flex flex-col items-center justify-center overflow-hidden">

              <div className="absolute top-4 left-10 text-white/90 font-['Press_Start_2P'] text-xs">☁️  ☁️</div>
              <div className="absolute top-8 right-12 text-yellow-300 text-xl pixel-float">✨ ✨</div>

              {/* HEADING IN MATCHING THEME FONT */}
              <div className="z-10 text-center mb-8 flex flex-col items-center gap-2">
                <div className="inline-block bg-[#FFFDF5] border-4 border-[#1E293B] px-6 py-3.5 rounded-xl shadow-[5px_5px_0px_#1E293B]">
                  <h1 className="text-xl sm:text-2xl font-bold font-['Press_Start_2P'] text-[#1E293B] tracking-tight text-shadow-[1px_1px_0px_#64748B]">
                    TCP MODEL SIMULATION
                  </h1>
                </div>
                <div className="bg-yellow-300 border-2 border-[#1E293B] px-4 py-1 rounded shadow-[2px_2px_0px_#1E293B] font-['Press_Start_2P'] text-[9px] text-[#1E293B] font-bold">
                  RELIABLE FILE TRANSFER & ERROR RECOVERY VISUALIZER
                </div>
              </div>

              {/* SINGLE GIANT 8-BIT GREEN START BUTTON IN CENTER */}
              <div className="relative z-30 my-auto flex flex-col items-center gap-3">
                <button
                  onClick={onStart}
                  className="
                    btn-pixel w-72 h-24 sm:w-96 sm:h-28 bg-[#5BA848] hover:bg-[#4E933D] text-white
                    border-4 border-[#1E293B] shadow-[8px_8px_0px_#1E293B]
                    rounded-2xl flex items-center justify-center
                    font-['Press_Start_2P'] text-3xl sm:text-4xl tracking-widest text-shadow-[3px_3px_0px_#14532D]
                    transition-all hover:scale-105 active:translate-x-1 active:translate-y-1 active:shadow-none
                    animate-pulse cursor-none
                  "
                >
                  START
                </button>

                <div className="bg-[#FFFDF5] border-3 border-[#1E293B] px-4 py-1.5 rounded-lg shadow-[3px_3px_0px_#1E293B] font-['Press_Start_2P'] text-[9px] text-[#1E293B] mt-2">
                  [ CLICK START TO LAUNCH TCP MODEL ]
                </div>
              </div>

              <div className="absolute bottom-4 right-6 z-20 flex items-end gap-3 pointer-events-none">
                <div className="text-3xl pixel-float">🎮</div>
                <div className="relative">
                  <div className="absolute -top-5 right-0 bg-white border-2 border-[#1E293B] rounded px-1.5 py-0.5 text-xs">
                    💖
                  </div>
                  <div className="text-4xl">📂</div>
                </div>
              </div>

            </div>

            <div className="px-4 py-2 bg-[#FFFDF5] flex items-center justify-between font-['Press_Start_2P'] text-[8px] text-[#1E293B]">
              <span>TCP MODEL SIMULATION</span>
              <span className="text-[#2563EB]">@CN_PROJECT</span>
            </div>

          </div>
        )}

      </div>

      {/* WINDOWS OS BOTTOM TASKBAR */}
      <div className="w-full h-11 bg-[#1D4ED8] border-t-4 border-[#1E293B] flex items-center justify-between px-3 z-50 shadow-[0_-4px_0px_#000]">
        
        <div className="relative">
          <button
            onClick={() => setShowStartMenu(!showStartMenu)}
            className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white font-['Press_Start_2P'] text-xs px-3 py-1.5 rounded border-2 border-[#1E293B] shadow-[2px_2px_0px_#000]"
          >
            <span>❖</span>
            <span>start</span>
          </button>

          {showStartMenu && (
            <div className="absolute bottom-12 left-0 w-56 card retro-card border-3 border-[#1E293B] bg-[#FFFDF5] shadow-[6px_6px_0px_#000] p-2 flex flex-col gap-1 z-50">
              <div className="bg-[#1D4ED8] text-white p-2 font-['Press_Start_2P'] text-[9px] rounded mb-1 flex items-center gap-2">
                <span>💻</span>
                <span>TCP SIMULATOR OS</span>
              </div>
              <button
                onClick={() => { setShowStartMenu(false); onStart(); }}
                className="w-full text-left p-2 hover:bg-blue-100 rounded font-['Press_Start_2P'] text-[9px] text-[#1E293B] flex items-center gap-2"
              >
                <span>▶</span>
                <span>Launch TCP Model</span>
              </button>
              <button
                onClick={() => { setShowStartMenu(false); window.location.reload(); }}
                className="w-full text-left p-2 hover:bg-rose-100 rounded font-['Press_Start_2P'] text-[9px] text-rose-800 flex items-center gap-2"
              >
                <span>🔄</span>
                <span>Reboot OS</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStart}
            className="flex items-center gap-2 bg-[#2563EB] text-white font-['Press_Start_2P'] text-[9px] px-3 py-1.5 rounded border-2 border-[#1E293B] shadow-[inset_2px_2px_0px_rgba(0,0,0,0.3)]"
          >
            <span>🕹️</span>
            <span className="hidden sm:inline">TCP_MODEL_SIMULATION.EXE</span>
          </button>
        </div>

        <div className="flex items-center gap-3 bg-[#1E3A8A] text-white px-3 py-1 rounded border-2 border-[#1E293B] font-['Press_Start_2P'] text-[9px]">
          <span>🔊</span>
          <span>📶</span>
          <span>{timeStr || '11:50 AM'}</span>
        </div>

      </div>

    </div>
  );
}
