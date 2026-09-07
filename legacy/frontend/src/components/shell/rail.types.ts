import {
  Briefcase,
  BookOpen,
  FileCheck2,
  Scale,
  Network,
  ShoppingBag,
  Mic,
  Waves,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';

export type TabId =
  | 'workspace'
  | 'standards'
  | 'auditor'
  | 'qco_explorer'
  | 'knowledge_graph'
  | 'gem_simulator'
  | 'voice_assistant'
  | 'live_voice'
  | 'chat';

export interface RailItemConfig {
  id: TabId;
  label: string;
  icon: LucideIcon;
  description: string;
  shortcut: string;
}

export const RAIL_TABS: RailItemConfig[] = [
  { id: 'workspace', label: 'Workspace', icon: Briefcase, description: 'Audits & Revisions', shortcut: '1' },
  { id: 'standards', label: 'Standards', icon: BookOpen, description: 'IS Search & Clauses', shortcut: '2' },
  { id: 'auditor', label: 'Auditor', icon: FileCheck2, description: 'Tender Spec Auditor', shortcut: '3' },
  { id: 'qco_explorer', label: 'QCO Explorer', icon: Scale, description: 'Quality Control Orders', shortcut: '4' },
  { id: 'knowledge_graph', label: 'Knowledge Graph', icon: Network, description: 'Dependency Graph', shortcut: '5' },
  { id: 'gem_simulator', label: 'GeM Simulator', icon: ShoppingBag, description: 'GeM Bid Verification', shortcut: '6' },
  { id: 'voice_assistant', label: 'Voice Assistant', icon: Mic, description: 'Conversational Agent', shortcut: '7' },
  { id: 'live_voice', label: 'Live Voice', icon: Waves, description: 'Real-time WebSocket', shortcut: '8' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, description: 'Full-page Assistant', shortcut: '9' },
];
