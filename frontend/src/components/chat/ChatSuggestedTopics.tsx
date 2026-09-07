import React from "react";

interface StarterPrompt {
  label: string;
  query: string;
}

interface ChatSuggestedTopicsProps {
  prompts: StarterPrompt[];
  onSelectPrompt: (query: string) => void;
}

export const ChatSuggestedTopics: React.FC<ChatSuggestedTopicsProps> = ({
  prompts,
  onSelectPrompt,
}) => {
  return (
    <div className="pt-8 pb-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/40 text-center">
        Suggested Topics
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {prompts.map((sp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(sp.query)}
            className="p-3 rounded-2xl apple-glass text-left hover:border-apple-blue/50 hover:bg-white/10 transition-all group"
          >
            <div className="text-xs font-semibold text-white/90 group-hover:text-apple-blue transition-colors">
              {sp.label}
            </div>
            <div className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
              {sp.query}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
