import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { clsx } from "clsx";
import type { PositionedNode, NodeRelationItem } from "@/components/graph/types";
import { GraphInspectorHeader } from "@/components/graph/GraphInspectorHeader";

interface GraphInspectorPanelProps {
  selectedNode: PositionedNode | null;
  relations: NodeRelationItem[];
  zoom?: number;
  onClose: () => void;
  onSelectNodeId: (id: string) => void;
}

export const GraphInspectorPanel: React.FC<GraphInspectorPanelProps> = ({
  selectedNode,
  relations,
  zoom = 1,
  onClose,
  onSelectNodeId,
}) => {
  const isZoomedIn = zoom >= 1.25;

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.aside
          initial={{ opacity: 0, x: -30, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={clsx(
            "absolute top-24 left-20 z-30 apple-glass-dark rounded-3xl border border-white/20 shadow-2xl backdrop-blur-2xl transition-all duration-300 select-text max-w-[min(460px,38vw)] max-h-[calc(100vh-12rem)] flex flex-col overflow-hidden",
            isZoomedIn ? "w-[440px] p-6 space-y-4" : "w-[360px] p-4.5 space-y-3"
          )}
        >
          <GraphInspectorHeader selectedNode={selectedNode} zoom={zoom} onClose={onClose} />

          <div className={clsx("flex gap-2 flex-wrap", isZoomedIn ? "text-xs" : "text-[11px]")}>
            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-white/80">
              Division: <strong className="text-white ml-1">{selectedNode.division || "General"}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-apple-blue/15 border border-apple-blue/30 text-apple-blue font-medium">
              Status: {selectedNode.status || "Active"}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10 flex-1 overflow-hidden flex flex-col">
            <div className={clsx("font-semibold text-white/50 uppercase tracking-wider flex justify-between", isZoomedIn ? "text-xs" : "text-[10px]")}>
              <span>Connected Standards Network</span>
              <span>({relations.length})</span>
            </div>
            <div className="overflow-y-auto space-y-1.5 pr-1 flex-1 min-h-0">
              {relations.length === 0 ? (
                <p className="text-white/40 italic text-xs py-2">No direct links recorded in graph.</p>
              ) : (
                relations.map((rel, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => rel.otherNode && onSelectNodeId(rel.otherNode.id)}
                    className={clsx(
                      "w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-left cursor-pointer transition-colors group",
                      isZoomedIn ? "p-2.5 text-xs" : "p-2 text-[11px]"
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-white/90 font-semibold truncate group-hover:text-apple-mint transition-colors">
                        {rel.otherNode?.label}
                      </span>
                      <span className="text-white/50 shrink-0">({rel.relation})</span>
                    </div>
                    <ExternalLink className={clsx("text-white/40 group-hover:text-white shrink-0 ml-2", isZoomedIn ? "w-3.5 h-3.5" : "w-3 h-3")} />
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
