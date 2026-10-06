/** ChecksumPanel.jsx — Shows live checksum verification result (Light Circuit theme) */
export default function ChecksumPanel({ event }) {
  if (!event) {
    return (
      <div className="card card-glow p-5 flex flex-col items-center justify-center min-h-[140px] text-center bg-white">
        <span className="tag-badge mb-2">SHA-256</span>
        <p className="text-xs text-[#5B6478]">Checksum verification results will appear here during transfer.</p>
      </div>
    );
  }

  const isOk      = event.type === 'CHECKSUM_OK';
  const isFailed  = event.type === 'CHECKSUM_FAILED';

  return (
    <div className={`card p-5 border transition-all duration-300 bg-white ${
      isOk     ? 'border-[#2FD6B4] shadow-md shadow-[#2FD6B4]/15' :
      isFailed ? 'border-red-400  shadow-md shadow-red-500/15' :
      'border-[#12131A]/10'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#12131A]">
          Checksum Verification
        </h2>
        <span className="tag-badge">SHA-256</span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Packet reference */}
        <div className="flex items-center justify-between bg-[#EEF2FA] px-3 py-1.5 rounded-lg border border-[#12131A]/10">
          <span className="text-xs text-[#5B6478] font-medium">Evaluated Packet</span>
          <span className="font-mono text-xs text-[#4C7DFF] font-bold">Packet #{event.packetNumber}</span>
        </div>

        {isFailed && (
          <>
            <div>
              <div className="text-[11px] text-[#5B6478] mb-1 font-medium">Expected Checksum</div>
              <div className="font-mono text-[10px] text-[#0E8570] bg-[#EEF2FA] border border-[#2FD6B4]/40 rounded-lg p-2 break-all font-semibold">
                {event.expectedChecksum}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#5B6478] mb-1 font-medium">Received Corrupted Hash</div>
              <div className="font-mono text-[10px] text-red-600 bg-red-50 border border-red-300 rounded-lg p-2 break-all font-semibold">
                {event.receivedChecksum}
              </div>
            </div>
          </>
        )}

        {isOk && event.checksum && (
          <div>
            <div className="text-[11px] text-[#5B6478] mb-1 font-medium">Calculated SHA-256 Checksum</div>
            <div className="font-mono text-[10px] text-[#0E8570] bg-[#EEF2FA] border border-[#2FD6B4]/40 rounded-lg p-2 break-all font-semibold">
              {event.checksum}
            </div>
          </div>
        )}

        {/* Result badge */}
        <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase ${
          isOk     ? 'bg-[#2FD6B4]/20 text-[#0E8570] border border-[#2FD6B4]/50 shadow-xs' :
          isFailed ? 'bg-red-100       text-red-700   border border-red-300       shadow-xs' :
          'bg-[#EEF2FA] text-[#5B6478]'
        }`}>
          {isOk     ? '✓ CHECKSUM VERIFIED' :
           isFailed ? '✗ CHECKSUM MISMATCH'   :
           'PENDING'}
        </div>
      </div>
    </div>
  );
}
