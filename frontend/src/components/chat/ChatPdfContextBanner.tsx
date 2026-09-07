import React from "react";
import { FileText, Link2Off, ArrowDownToDot, CheckCircle2 } from "lucide-react";
import { useRemembrance } from "@/context/RemembranceContext";

export interface ChatPdfContextBannerProps {
  onTransferFindings?: () => void;
}

export const ChatPdfContextBanner: React.FC<ChatPdfContextBannerProps> = ({ onTransferFindings }) => {
  const { file, isPdfConnectedToAiChat, setIsPdfConnectedToAiChat, analysis } = useRemembrance();

  if (!file) return null;

  return (
    <div className="mx-5 mt-3 p-3 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      <div className="flex items-center gap-2.5">
        <div className={`p-2 rounded ${isPdfConnectedToAiChat ? "bg-gov-blue text-white" : "bg-gray-200 text-gray-500"}`}>
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gov-navy dark:text-white truncate max-w-xs sm:max-w-md">
              {file.name}
            </span>
            {isPdfConnectedToAiChat && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-gov-green dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Grounded
              </span>
            )}
          </div>
          <span className="text-[11px] text-gov-text-secondary dark:text-gray-400 block mt-0.5">
            {isPdfConnectedToAiChat
              ? "All chat queries are actively grounded in this tender document's clauses."
              : "Document disconnected — chatbot is in general Indian Standards consultation mode."}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {analysis && onTransferFindings && isPdfConnectedToAiChat && (
          <button
            onClick={onTransferFindings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-slate-800 hover:bg-gov-blue-light text-gov-navy dark:text-gray-200 border border-gov-border dark:border-slate-700 transition-colors text-xs font-semibold"
            title="Import top compliance findings into chat"
          >
            <ArrowDownToDot className="w-3.5 h-3.5 text-gov-blue" />
            <span>Transfer Findings</span>
          </button>
        )}

        <button
          onClick={() => setIsPdfConnectedToAiChat(!isPdfConnectedToAiChat)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-semibold transition-colors ${
            isPdfConnectedToAiChat
              ? "bg-white dark:bg-slate-800 text-gov-red border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30"
              : "bg-gov-blue text-white border-gov-blue hover:bg-blue-700"
          }`}
        >
          {isPdfConnectedToAiChat ? (
            <>
              <Link2Off className="w-3.5 h-3.5" />
              <span>Detach PDF Context</span>
            </>
          ) : (
            <>
              <FileText className="w-3.5 h-3.5" />
              <span>Talk to Loaded PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatPdfContextBanner;
