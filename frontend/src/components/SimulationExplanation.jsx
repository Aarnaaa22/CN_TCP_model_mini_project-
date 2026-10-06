/**
 * SimulationExplanation.jsx (Light Circuit theme)
 *
 * Dynamic plain-English explanation of the current simulation event.
 */

const EVENT_ICON = {
  TRANSFER_STARTED:   '🚀',
  PACKET_CREATED:     '📦',
  PACKET_SENT:        '→',
  IN_TRANSIT:         '↝',
  PACKET_LOST:        '✗',
  PACKET_CORRUPTED:   '⚠',
  CHECKSUM_FAILED:    '🔍',
  PACKET_RECEIVED:    '✓',
  ACK_SENT:           '◀',
  ACK_RECEIVED:       '✓✓',
  TIMEOUT:            '⏱',
  RETRANSMISSION:     '↺',
  FILE_REASSEMBLED:   '🔧',
  TRANSFER_COMPLETED: '🎉',
  TRANSFER_FAILED:    '❌',
};

export default function SimulationExplanation({ explanation, lastEventType }) {
  const icon = EVENT_ICON[lastEventType] || '📡';

  const isError = lastEventType === 'PACKET_LOST'     ||
                  lastEventType === 'PACKET_CORRUPTED' ||
                  lastEventType === 'CHECKSUM_FAILED'  ||
                  lastEventType === 'TRANSFER_FAILED';

  const isSuccess = lastEventType === 'TRANSFER_COMPLETED' ||
                    lastEventType === 'FILE_REASSEMBLED'   ||
                    lastEventType === 'ACK_RECEIVED';

  const isWarning = lastEventType === 'TIMEOUT' || lastEventType === 'RETRANSMISSION';

  return (
    <div className={`card card-glow p-4.5 border transition-all duration-300 bg-white ${
      isError   ? 'border-red-300 bg-red-50/50'     :
      isSuccess ? 'border-[#2FD6B4]/60 bg-[#2FD6B4]/5' :
      isWarning ? 'border-amber-300 bg-amber-50/50' :
      'border-[#12131A]/10'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="tag-badge">TCP EXPLANATION</span>
        <span className="text-base">{icon}</span>
      </div>
      <p className={`text-xs leading-relaxed fade-in font-medium ${
        isError   ? 'text-red-700'       :
        isSuccess ? 'text-[#0E8570]'     :
        isWarning ? 'text-amber-800'     :
        'text-[#12131A]'
      }`}>
        {explanation}
      </p>
    </div>
  );
}
