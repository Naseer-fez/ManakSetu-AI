import {
  BookOpen,
  FileCheck,
  FolderOpen,
  MessageSquare,
  Mic,
  Share2,
  Scale,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

export interface NavTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut: string;
}

export const PRIMARY_TABS: NavTabItem[] = [
  { id: "recommend", label: "Standards", icon: BookOpen, shortcut: "1" },
  { id: "tender", label: "Tender Radar", icon: FileCheck, shortcut: "2" },
  { id: "workspace", label: "Workspace Desk", icon: FolderOpen, shortcut: "3" },
  { id: "chat", label: "AI Chat", icon: MessageSquare, shortcut: "4" },
  { id: "speak_to_ai", label: "Speak to AI", icon: Mic, shortcut: "5" },
  { id: "qco", label: "QCO Explorer", icon: Scale, shortcut: "6" },
  { id: "gem", label: "GeM Simulator", icon: ShoppingCart, shortcut: "7" },
];

export const GRAPH_TAB: NavTabItem = {
  id: "graph",
  label: "Knowledge Graph",
  icon: Share2,
  shortcut: "G",
};
