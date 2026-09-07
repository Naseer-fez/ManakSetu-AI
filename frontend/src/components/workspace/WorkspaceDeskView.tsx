import React from "react";
import { WorkspaceDesk } from "@/components/workspace_desk/WorkspaceDesk";

export interface WorkspaceDeskViewProps {
  onNavigate?: (page: string) => void;
  onSetPdfText?: (text: string) => void;
}

export const WorkspaceDeskView: React.FC<WorkspaceDeskViewProps> = ({ onNavigate, onSetPdfText }) => {
  return <WorkspaceDesk onNavigate={onNavigate} onSetPdfText={onSetPdfText} />;
};

export default WorkspaceDeskView;
