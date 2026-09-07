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
      <p className="text-xs font-bold uppercase tracking-wider text-gov-text-secondary dark:text-gray-400 text-center">
        Suggested Topics
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {prompts.map((sp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(sp.query)}
            className="p-3.5 rounded-lg bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 text-left hover:border-gov-blue dark:hover:border-blue-500 hover:shadow-md transition-all group shadow-sm"
          >
            <div className="text-xs font-bold text-gov-navy dark:text-white group-hover:text-gov-blue dark:group-hover:text-blue-400 transition-colors">
              {sp.label}
            </div>
            <div className="text-[11px] text-gov-text-secondary dark:text-gray-400 line-clamp-1 mt-0.5">
              {sp.query}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
