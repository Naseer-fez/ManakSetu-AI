import React from "react";
import { ShoppingCart, Send, Download, Loader2 } from "lucide-react";
import type { ExtractedLineItem } from "@/types";

export interface GemFormData {
  id: string;
  cat: string;
  title: string;
  spec: string;
}

interface GemSimulatorFormProps {
  formData: GemFormData;
  setFormData: React.Dispatch<React.SetStateAction<GemFormData>>;
  tenderItems: ExtractedLineItem[];
  gemSimItem: ExtractedLineItem | null;
  setGemSimItem: (item: ExtractedLineItem | null) => void;
  onSimulate: () => void;
  loading: boolean;
}

export const GemSimulatorForm: React.FC<GemSimulatorFormProps> = ({
  formData,
  setFormData,
  tenderItems,
  gemSimItem,
  setGemSimItem,
  onSimulate,
  loading,
}) => (
  <div className="bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 rounded-lg p-6 shadow-sm space-y-5">
    <div>
      <h2 className="text-base font-bold text-gov-navy dark:text-white flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-gov-blue dark:text-blue-400" />
        Government e-Marketplace (GeM) Simulator
      </h2>
      <p className="text-xs text-gov-text-secondary dark:text-gray-400 mt-0.5">
        Simulate how the GeM portal validates buyer specifications and enforces compulsory BIS standards.
      </p>
    </div>

    {tenderItems.length > 0 && (
      <div className="flex items-center gap-2.5 bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded border border-blue-200 dark:border-blue-900/50 text-xs">
        <Download className="w-4 h-4 text-gov-blue dark:text-blue-400 shrink-0" />
        <span className="font-semibold text-gov-navy dark:text-white whitespace-nowrap">Load From Tender:</span>
        <select
          onChange={(e) => {
            const itm = tenderItems.find((t) => String(t.item_id) === e.target.value);
            if (itm) setGemSimItem(itm);
          }}
          value={gemSimItem?.item_id || ""}
          className="bg-white dark:bg-[#0c1626] text-gov-text dark:text-gray-200 rounded px-2.5 py-1 border border-gov-border dark:border-slate-700 text-xs flex-1 focus:ring-1 focus:ring-gov-blue"
        >
          <option value="">-- Select Line Item to Pre-fill --</option>
          {tenderItems.map((t) => (
            <option key={t.item_id} value={t.item_id}>#{t.item_id}: {t.product_title}</option>
          ))}
        </select>
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
      <div>
        <label className="block font-semibold uppercase tracking-wider text-gov-text-secondary dark:text-gray-400 mb-1">GeM Bid ID</label>
        <input value={formData.id} onChange={(e) => setFormData((p) => ({ ...p, id: e.target.value }))} className="w-full bg-gov-offwhite dark:bg-[#0c1626] border border-gov-border dark:border-slate-700 rounded px-3 py-2 text-xs text-gov-text dark:text-gray-100 focus:ring-2 focus:ring-gov-blue" />
      </div>
      <div>
        <label className="block font-semibold uppercase tracking-wider text-gov-text-secondary dark:text-gray-400 mb-1">Product Category</label>
        <input value={formData.cat} onChange={(e) => setFormData((p) => ({ ...p, cat: e.target.value }))} className="w-full bg-gov-offwhite dark:bg-[#0c1626] border border-gov-border dark:border-slate-700 rounded px-3 py-2 text-xs text-gov-text dark:text-gray-100 focus:ring-2 focus:ring-gov-blue" />
      </div>
      <div className="sm:col-span-2">
        <label className="block font-semibold uppercase tracking-wider text-gov-text-secondary dark:text-gray-400 mb-1">Product Title</label>
        <input value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} className="w-full bg-gov-offwhite dark:bg-[#0c1626] border border-gov-border dark:border-slate-700 rounded px-3 py-2 text-xs text-gov-text dark:text-gray-100 focus:ring-2 focus:ring-gov-blue" />
      </div>
      <div className="sm:col-span-2">
        <label className="block font-semibold uppercase tracking-wider text-gov-text-secondary dark:text-gray-400 mb-1">Technical Specifications</label>
        <textarea rows={3} value={formData.spec} onChange={(e) => setFormData((p) => ({ ...p, spec: e.target.value }))} className="w-full bg-gov-offwhite dark:bg-[#0c1626] border border-gov-border dark:border-slate-700 rounded px-3 py-2 text-xs text-gov-text dark:text-gray-100 focus:ring-2 focus:ring-gov-blue font-mono" />
      </div>
    </div>

    <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-slate-800">
      <button onClick={onSimulate} disabled={loading} className="inline-flex items-center gap-2 bg-gov-blue hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded shadow-sm transition-colors disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        <span>{loading ? "Validating with BIS..." : "Dispatch GeM Validation Webhook"}</span>
      </button>
    </div>
  </div>
);

export default GemSimulatorForm;
