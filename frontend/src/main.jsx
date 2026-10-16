import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class RetroErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("RetroErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0000AA] text-white font-['VT323'] p-6 md:p-12 flex flex-col items-center justify-center select-none">
          <div className="max-w-[700px] border-4 border-white p-6 bg-[#000080] shadow-[8px_8px_0px_rgba(0,0,0,0.5)] flex flex-col gap-4">
            <div className="bg-white text-[#000080] px-3 py-1 font-['Press_Start_2P'] text-[10px] font-bold inline-block w-fit">
              *** TCP_OS RUNTIME EXCEPTION ***
            </div>
            <p className="text-xl leading-relaxed text-amber-200">
              An unhandled exception occurred in the protocol explorer:
            </p>
            <div className="bg-black/60 border-2 border-white/40 p-3 text-red-300 font-mono text-sm break-all">
              {this.state.error?.toString()}
            </div>
            <p className="text-sm text-slate-300 font-['Press_Start_2P'] text-[8px] leading-relaxed">
              Press the button below to restart TCP_OS or check the browser developer console.
            </p>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="mt-2 bg-white text-[#000080] hover:bg-slate-200 font-['Press_Start_2P'] text-[9px] py-2 px-4 border-2 border-black w-fit cursor-pointer shadow-[3px_3px_0px_#000]"
            >
              ↺ REBOOT TCP_OS
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RetroErrorBoundary>
      <App />
    </RetroErrorBoundary>
  </StrictMode>,
)

