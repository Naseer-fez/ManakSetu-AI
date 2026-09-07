import React, { useState, useRef } from "react";
import { Sparkles, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { explainStandardStream } from "@/services/api.service";

export interface LlmStreamExplanationProps {
  isCode: string;
  query: string;
  title: string;
}

export const LlmStreamExplanation: React.FC<LlmStreamExplanationProps> = ({ isCode, query, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const textRef = useRef("");

  const fetchExplanation = async () => {
    setLoading(true);
    setError(false);
    setText("");
    textRef.current = "";
    try {
      await explainStandardStream(query || title, isCode, (chunk) => {
        textRef.current += chunk;
        setText(textRef.current);
      });
    } catch (err: unknown) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !text && !loading) {
      fetchExplanation();
    }
  };

  return (
    <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-blue-100/40 dark:hover:bg-blue-900/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gov-blue dark:text-blue-400" />
          <span className="text-xs font-semibold text-gov-navy dark:text-white">
            AI Technical Justification & Requirement Audit
          </span>
        </div>
        <div className="flex items-center gap-2 text-gov-blue dark:text-blue-400 text-xs font-medium">
          {text ? "Hide Analysis" : "Analyze Fit"}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3.5 border-t border-blue-200 dark:border-blue-900/50 bg-white dark:bg-[#0c131d] space-y-2.5">
          {loading && !text && (
            <div className="py-2 space-y-2 animate-pulse">
              <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-full" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between text-xs text-gov-red dark:text-rose-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded border border-red-200 dark:border-red-900/50">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Could not generate explanation.</span>
              </div>
              <button onClick={fetchExplanation} className="underline font-semibold flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}

          {text && (
            <div className="text-xs text-gov-text dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {text}
              {loading && <span className="inline-block w-1.5 h-3.5 ml-1 bg-gov-blue dark:bg-blue-400 animate-pulse align-middle" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LlmStreamExplanation;
