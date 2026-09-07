import React from "react";
import { FileText, Link2Off, RefreshCw, ArrowDownToDot } from "lucide-react";
import { useRemembrance } from "../../context/RemembranceContext";

interface ChatPdfContextBannerProps {
  onTransferFindings?: () => void;
}

export const ChatPdfContextBanner: React.FC<ChatPdfContextBannerProps> = ({ onTransferFindings }) => {
  const { file, isPdfConnectedToAiChat, setIsPdfConnectedToAiChat, analysis } = useRemembrance();

  if (!file) return null;

  return (
    <div className="mx-6 mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg ${isPdfConnectedToAiChat ? "bg-apple-blue/20 text-apple-blue" : "bg-white/10 text-white/40"}`}>
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-white/90 truncate block max-w-xs sm:max-w-md">
            {file.name}
          </span>
          <span className="text-[11px] text-white/50">
            {isPdfConnectedToAiChat ? "PDF context actively linked to AI queries" : "PDF disconnected (generic standard mode)"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {analysis && onTransferFindings && isPdfConnectedToAiChat && (
          <button
            onClick={onTransferFindings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-apple-mint/15 hover:bg-apple-mint/25 text-apple-mint border border-apple-mint/30 transition-colors text-[11px] font-medium"
            title="Import tender audit issues into chat prompt"
          >
            <ArrowDownToDot className="w-3.5 h-3.5" />
            <span>Transfer Findings</span>
          </button>
        )}

        <button
          onClick={() => setIsPdfConnectedToAiChat(!isPdfConnectedToAiChat)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-colors ${
            isPdfConnectedToAiChat
              ? "bg-apple-red/15 hover:bg-apple-red/25 text-apple-red border-apple-red/30"
              : "bg-apple-blue/15 hover:bg-apple-blue/25 text-apple-blue border-apple-blue/30"
          }`}
        >
          {isPdfConnectedToAiChat ? (
            <>
              <Link2Off className="w-3.5 h-3.5" />
              <span>Disconnect PDF</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reconnect PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
