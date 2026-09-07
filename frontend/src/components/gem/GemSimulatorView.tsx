import React, { useState, useEffect } from "react";
import { simulateGemBid } from "@/services/api.service";
import { useRemembrance } from "@/context/RemembranceContext";
import { GemResultCard, type GemValidationResultData } from "@/components/gem/GemResultCard";
import { GemSimulatorForm, type GemFormData } from "@/components/gem/GemSimulatorForm";

export const GemSimulatorView: React.FC = () => {
  const { analysis, gemSimItem, setGemSimItem } = useRemembrance();
  const [formData, setFormData] = useState<GemFormData>({
    id: "GEM-2026-B-882910",
    cat: "Power Distribution",
    title: "Distribution Transformer 2500 kVA",
    spec: "Outdoor 33kV 3-phase oil immersed transformer with copper winding",
  });
  const [result, setResult] = useState<GemValidationResultData | null>(null);
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
    try {
      const res = await simulateGemBid(formData.id, formData.cat, formData.title, formData.spec);
      setResult(res);
    } catch (err: unknown) {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <GemSimulatorForm
        formData={formData}
        setFormData={setFormData}
        tenderItems={tenderItems}
        gemSimItem={gemSimItem}
        setGemSimItem={setGemSimItem}
        onSimulate={handleSimulate}
        loading={loading}
      />
      {result && <GemResultCard result={result} />}
    </div>
  );
};

export default GemSimulatorView;
