import React, { useState, useEffect } from "react";
import { ShoppingCart, Send, Download } from "lucide-react";
import { simulateGemBid } from "../services/api.service";
import { useRemembrance } from "../context/RemembranceContext";
import { GemResultCard } from "./gem/GemResultCard";
import { clsx } from "clsx";

export const GemSimulatorView: React.FC = () => {
  const { analysis, gemSimItem, setGemSimItem } = useRemembrance();
  const [formData, setFormData] = useState({
    id: "GEM-2026-B-882910", cat: "Power Distribution", title: "Distribution Transformer 2500 kVA",
    spec: "Outdoor 33kV 3-phase oil immersed transformer with copper winding"
  });
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gemSimItem) {
      setFormData({
        id: `GEM-TENDER-ITEM-${gemSimItem.item_id}`,
        cat: gemSimItem.recommended_standards[0]?.standard?.division || "General Procurement",
        title: gemSimItem.product_title,
        spec: gemSimItem.spec_summary,
      });
    }
  }, [gemSimItem]);

  const tenderItems = analysis?.report?.items || [];

  const handleSimulate = async () => {
    setLoading(true);
    try { setResult(await simulateGemBid(formData.id, formData.cat, formData.title, formData.spec)); }
    catch { setResult(null); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="apple-glass rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
              <ShoppingCart className="w-5 h-5 text-apple-mint" /> GeM Webhook Simulator
            </h3>
            <p className="text-sm text-white/50 mt-1">Simulate how GeM portal queries BIS-SpecAI for compliance during bid creation.</p>
          </div>
        </div>

        {tenderItems.length > 0 && (
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 text-xs">
            <Download className="w-3.5 h-3.5 text-apple-mint shrink-0" />
            <span className="text-white/60">From Tender:</span>
            <select
              onChange={(e) => {
                const itm = tenderItems.find(t => String(t.item_id) === e.target.value);
                if (itm) setGemSimItem(itm);
              }}
              value={gemSimItem?.item_id || ""}
              className="bg-black/50 text-white rounded-xl px-2 py-1 border border-white/10 text-xs flex-1"
            >
              <option value="">-- Select Tender Line Item --</option>
              {tenderItems.map(t => <option key={t.item_id} value={t.item_id}>#{t.item_id}: {t.product_title}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            { label: "GeM Bid ID", key: "id" }, { label: "Product Category", key: "cat" },
            { label: "Product Title", key: "title" }, { label: "Technical Specs", key: "spec", isTextArea: true }
          ].map((f) => (
            <div key={f.key} className={f.isTextArea ? "md:col-span-2" : ""}>
              <label className="text-white/60 font-medium block mb-1.5 ml-1">{f.label}</label>
              {f.isTextArea ? (
                <textarea rows={2} value={formData[f.key as keyof typeof formData]} onChange={(e) => setFormData(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:border-apple-mint" />
              ) : (
                <input value={formData[f.key as keyof typeof formData]} onChange={(e) => setFormData(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-white focus:outline-none focus:border-apple-mint" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={handleSimulate} disabled={loading} className="flex items-center gap-2 bg-apple-mint/20 hover:bg-apple-mint/30 text-apple-mint border border-apple-mint/30 text-sm font-semibold px-6 py-3 rounded-full shadow-lg shadow-apple-mint/20 transition-all">
            <Send className={clsx("w-4 h-4", loading && "animate-pulse")} />
            <span>{loading ? "Triggering..." : "Dispatch GeM Validation Webhook"}</span>
          </button>
        </div>
      </div>

      {result && <GemResultCard result={result} />}
    </div>
  );
};
