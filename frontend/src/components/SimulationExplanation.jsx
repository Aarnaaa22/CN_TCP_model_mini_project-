const EVENT_ICON = {
  TRANSFER_STARTED:   '🚀',
  PACKET_CREATED:     '📦',
  PACKET_SENT:        '📤',
  IN_TRANSIT:         '📡',
  PACKET_LOST:        '💥',
  PACKET_CORRUPTED:   '👾',
  CHECKSUM_FAILED:    '⚠️',
  PACKET_RECEIVED:    '📥',
  ACK_SENT:           '✉️',
  ACK_RECEIVED:       '✅',
  TIMEOUT:            '⏳',
  RETRANSMISSION:     '🔄',
  FILE_REASSEMBLED:   '📂',
  TRANSFER_COMPLETED: '🏆',
  TRANSFER_FAILED:    '❌',
};

export default function SimulationExplanation({ explanation, lastEventType }) {
  const icon = EVENT_ICON[lastEventType] || '📦';

  const isError = lastEventType === 'PACKET_LOST'     ||
                  lastEventType === 'PACKET_CORRUPTED' ||
                  lastEventType === 'CHECKSUM_FAILED'  ||
                  lastEventType === 'TRANSFER_FAILED';

  const isSuccess = lastEventType === 'TRANSFER_COMPLETED' ||
                    lastEventType === 'FILE_REASSEMBLED'   ||
                    lastEventType === 'ACK_RECEIVED';

  const isWarning = lastEventType === 'TIMEOUT' || lastEventType === 'RETRANSMISSION';

  return (
    <div className={`card retro-card border-3 transition-all duration-300 ${
      isError   ? 'bg-rose-50 border-rose-600 text-rose-900'     :
      isSuccess ? 'bg-emerald-50 border-emerald-600 text-emerald-900' :
      isWarning ? 'bg-amber-50 border-amber-600 text-amber-900' :
      'bg-[#FFFDF5] border-[#1E293B] text-[#1E293B]'
    }`}>
      <div className="retro-window-header">
        <div className="flex items-center gap-2">
          <span>💬</span>
          <span>TCP_EXPLANATION.SYS</span>
        </div>
        <div className="retro-window-controls">
          <div className="retro-win-btn retro-win-btn-min">_</div>
          <div className="retro-win-btn retro-win-btn-max">□</div>
          <div className="retro-win-btn retro-win-btn-close">X</div>
        </div>
      </div>

      <div className="p-4 flex items-start gap-3">
        <span className="text-2xl select-none">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="tag-badge">TCP ENGINE</span>
            <span className="text-[8px] font-['Press_Start_2P'] uppercase">{lastEventType || 'IDLE'}</span>
          </div>
          <p className="text-xs font-['Pixelify_Sans'] leading-relaxed font-semibold">
            {explanation || 'Select a file payload and click START SIMULATION to observe TCP packet stream in real time.'}
          </p>
        </div>
      </div>
    </div>
  );
}
