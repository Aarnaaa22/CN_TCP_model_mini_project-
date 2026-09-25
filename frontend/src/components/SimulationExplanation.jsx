/**
 * SimulationExplanation.jsx
 *
 * Dynamic plain-English explanation of the current simulation event.
 * Updates with each backend event — great for viva/demo explanation.
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
    <div className={`card p-5 border transition-all duration-500 ${
      isError   ? 'border-red-500/30'    :
      isSuccess ? 'border-green-500/30'  :
      isWarning ? 'border-amber-500/30'  :
      'border-white/5'
    }`}>
      <p className={`text-sm leading-relaxed fade-in ${
        isError   ? 'text-red-300'   :
        isSuccess ? 'text-green-300' :
        isWarning ? 'text-amber-300' :
        'text-slate-300'
      }`}>
        {explanation}
      </p>
    </div>
  );
}
