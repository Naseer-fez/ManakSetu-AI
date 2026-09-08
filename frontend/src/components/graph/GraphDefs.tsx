import React from "react";

export const GraphDefs: React.FC = () => (
  <defs>
    <filter id="unrelatedBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" />
    </filter>
    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#0a84ff" stopOpacity="0.4" />
      <stop offset="100%" stopColor="#0a84ff" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
    </linearGradient>
    <linearGradient id="edgeHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#30d158" stopOpacity="1" />
      <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
    </linearGradient>
    <style>{`
      @keyframes ping {
        0% { transform: scale(1); opacity: 0.6; }
        75%, 100% { transform: scale(1.45); opacity: 0; }
      }
    `}</style>
  </defs>
);
