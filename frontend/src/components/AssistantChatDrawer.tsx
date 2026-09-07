import React from "react";
import { Send, Sparkles } from "lucide-react";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatHeaderToolbar } from "./ChatHeaderToolbar";
import { useAssistantChatDrawer } from "./chat/useAssistantChatDrawer";
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
              "w-[400px] h-[560px] apple-glass-dark rounded-3xl flex flex-col overflow-hidden relative shadow-2xl border border-white/20",
              chat.loading && "shadow-[0_0_40px_rgba(94,92,230,0.3)]"
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chat.messages.map((m, i) => (
                <ChatMessageItem
                  key={i}
                  message={m}
                  loading={chat.loading && i === chat.messages.length - 1 && m.role === "assistant"}
                />
              ))}
            </div>
            <div className="p-3 bg-white/5 border-t border-white/10 relative backdrop-blur-md">
              {chat.speaking && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-apple-indigo origin-left"
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
                  className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-3.5 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-apple-indigo/50 transition-colors"
                />
                <button
                  onClick={chat.handleSend}
                  disabled={chat.loading || !chat.input.trim()}
                  className="p-2.5 bg-apple-blue hover:bg-apple-blue/80 disabled:opacity-40 rounded-2xl text-white transition-all shadow-md shadow-apple-blue/20"
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
          className="apple-glass-dark hover:bg-white/15 text-white p-4 rounded-full shadow-2xl transition-all border border-white/20 hover:scale-105 active:scale-95 group"
          title="Open AI Assistant"
        >
          <Sparkles className="w-6 h-6 text-apple-indigo group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
};
export default AssistantChatDrawer;
