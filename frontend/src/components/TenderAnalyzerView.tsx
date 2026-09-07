import React from "react";
import { WorkspaceView } from "@/components/WorkspaceView";

import { FileCheck } from "lucide-react";

interface TenderAnalyzerViewProps {
  setPdfText?: (text: string) => void;
}

/**
 * TenderAnalyzerView / Tender Radar & Compliance Station.
 * Full-fidelity interactive radar workstation for statutory BIS tender audit.
 */
export const TenderAnalyzerView: React.FC<TenderAnalyzerViewProps> = ({ setPdfText }) => {
  return (
    <WorkspaceView
      tabId="tender"
      viewMode="audit"
      setPdfText={setPdfText}
      title="Tender Radar & Statutory Compliance"
      icon={FileCheck}
    />
  );
};

export default TenderAnalyzerView;
