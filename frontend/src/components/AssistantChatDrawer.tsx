import React from "react";
import { Send, Sparkles } from "lucide-react";
import { ChatMessageItem } from "@/components/ChatMessageItem";
import { ChatHeaderToolbar } from "@/components/ChatHeaderToolbar";
import { useAssistantChatDrawer } from "@/components/chat/useAssistantChatDrawer";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";

export const AssistantChatDrawer: React.FC<{ pdfText?: string }> = ({ pdfText: propPdfText }) => {
  const chat = useAssistantChatDrawer(propPdfText);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {chat.isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={clsx(
              "w-[400px] h-[560px] bg-white dark:bg-[#111927] rounded-xl flex flex-col overflow-hidden relative shadow-2xl border border-gov-border dark:border-slate-800",
              chat.loading && "ring-2 ring-gov-blue/40"
            )}
          >
            <ChatHeaderToolbar
              mode={chat.mode}
              setMode={chat.setMode}
              onRefreshContext={chat.handleRefresh}
              refreshing={chat.refreshing}
              onClearChat={chat.handleClear}
              onClose={() => chat.setIsOpen(false)}
            />
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gov-offwhite dark:bg-[#0a0f18]">
              {chat.messages.map((m, i) => (
                <ChatMessageItem
                  key={i}
                  message={m}
                  loading={chat.loading && i === chat.messages.length - 1 && m.role === "assistant"}
                />
              ))}
            </div>
            <div className="p-3 bg-white dark:bg-[#111927] border-t border-gov-border dark:border-slate-800 relative">
              {chat.speaking && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gov-blue origin-left"
                  animate={{ scaleX: [0, 1, 0.5, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
              <div className="flex gap-2 relative z-10 items-center">
                <input
                  value={chat.input}
                  onChange={e => chat.setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && chat.handleSend()}
                  placeholder={chat.mode === "fast" ? "Ask quick query..." : "Ask deep reasoning query..."}
                  className="flex-1 bg-gov-offwhite dark:bg-[#0c1626] border border-gov-border dark:border-slate-700 rounded-lg px-3.5 py-2 text-sm text-gov-text dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gov-blue focus:border-gov-blue transition-colors"
                />
                <button
                  onClick={chat.handleSend}
                  disabled={chat.loading || !chat.input.trim()}
                  className="p-2.5 bg-gov-blue hover:bg-blue-700 disabled:opacity-40 rounded-lg text-white transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!chat.isOpen && (
        <button
          onClick={() => chat.setIsOpen(true)}
          className="bg-gov-navy hover:bg-slate-800 text-white p-3.5 rounded-full shadow-lg transition-all border border-slate-700 hover:scale-105 active:scale-95 group flex items-center justify-center"
          title="Open BIS AI Assistant"
        >
          <Sparkles className="w-5 h-5 text-gov-saffron group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
};
export default AssistantChatDrawer;
