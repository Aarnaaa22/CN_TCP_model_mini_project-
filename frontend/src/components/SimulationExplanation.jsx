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
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          What's Happening
        </h2>
        <span className="text-base">{icon}</span>
      </div>

      <p className={`text-sm leading-relaxed fade-in ${
        isError   ? 'text-red-300'   :
        isSuccess ? 'text-green-300' :
        isWarning ? 'text-amber-300' :
        'text-slate-300'
      }`}>
        {explanation}
      </p>

      {/* TCP concept footnote */}
      {lastEventType === 'TIMEOUT' && (
        <div className="mt-3 text-xs text-slate-600 border-t border-white/5 pt-3">
          <span className="text-slate-500 font-semibold">TCP Concept:</span> TCP uses a retransmission timer. If no ACK is received within the timeout window (RTO), the segment is retransmitted.
        </div>
      )}
      {lastEventType === 'CHECKSUM_FAILED' && (
        <div className="mt-3 text-xs text-slate-600 border-t border-white/5 pt-3">
          <span className="text-slate-500 font-semibold">TCP Concept:</span> TCP includes a 16-bit checksum in every segment header. A mismatch means data was corrupted in transit — the receiver silently drops the segment.
        </div>
      )}
      {(lastEventType === 'ACK_SENT' || lastEventType === 'ACK_RECEIVED') && (
        <div className="mt-3 text-xs text-slate-600 border-t border-white/5 pt-3">
          <span className="text-slate-500 font-semibold">TCP Concept:</span> TCP uses cumulative acknowledgements. The ACK number tells the sender the next expected sequence number.
        </div>
      )}
      {lastEventType === 'TRANSFER_COMPLETED' && (
        <div className="mt-3 text-xs text-slate-600 border-t border-white/5 pt-3">
          <span className="text-slate-500 font-semibold">TCP Guarantee:</span> TCP guarantees reliable, in-order delivery of all data. Even with packet loss and corruption, the complete file is reconstructed correctly.
        </div>
      )}
    </div>
  );
}
