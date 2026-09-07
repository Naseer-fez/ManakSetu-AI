import React from "react";
import { FileCheck } from "lucide-react";
import { WorkspaceView } from "@/components/WorkspaceView";

export interface TenderRadarViewProps {
  setPdfText?: (text: string) => void;
}

export const TenderRadarView: React.FC<TenderRadarViewProps> = ({ setPdfText }) => {
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

export default TenderRadarView;
