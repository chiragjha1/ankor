"use client";

import React from "react";
import {
  LayoutDashboard,
  Compass,
  FileSearch,
  AlertCircle,
  Lightbulb,
  Users2,
  FlaskConical,
  Code2,
  Megaphone,
  BarChart3,
  Settings,
  Network,
} from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

interface TabBarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  counts?: {
    evidence?: number;
    problems?: number;
    solutions?: number;
    feedbacks?: number;
    objections?: number;
    graphNodes?: number;
  };
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onSelectTab,
  counts,
}) => {
  const TABS: TabItem[] = [
    { id: "overview", label: "2D Living Office", icon: LayoutDashboard },
    { id: "summary", label: "What We Found", icon: AlertCircle },
    { id: "evidence", label: "The Proof", icon: FileSearch, badgeCount: counts?.evidence },
    { id: "graph", label: "Evidence Graph", icon: Network, badgeCount: counts?.graphNodes },
    { id: "solutions", label: "The Solution", icon: Lightbulb, badgeCount: counts?.solutions },
    { id: "products", label: "Built Software", icon: Code2 },
    { id: "analytics", label: "Can It Make Money?", icon: BarChart3 },
  ];

  return (
    <nav className="w-full border-b-2 border-ink bg-surface overflow-x-auto">
      <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-1.5 py-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap border-2 ${
                isActive
                  ? "bg-ink text-white border-ink shadow-[2px_2px_0px_#161716] -translate-y-0.5"
                  : "bg-surface hover:bg-canvas text-muted hover:text-ink border-transparent hover:border-ink"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-ink"}`} />
              <span>{tab.label}</span>
              {typeof tab.badgeCount === "number" && tab.badgeCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? "bg-[#FEF08A] text-ink" : "bg-canvas border border-ink text-ink"
                  }`}
                >
                  {tab.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
