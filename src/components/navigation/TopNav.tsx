"use client";

import React from "react";
import { ResearchRun } from "@/types";
import {
  RotateCcw,
  Settings as SettingsIcon,
} from "lucide-react";

interface TopNavProps {
  runs?: ResearchRun[];
  currentRun?: ResearchRun;
  onSelectRun?: (runId: string) => void;
  onNewRunClick?: () => void;
  onPauseResumeClick?: () => void;
  onResetDemoClick?: () => void;
  onOpenSettings: () => void;
  onHomeClick?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onResetDemoClick,
  onOpenSettings,
  onHomeClick,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-ink bg-surface shadow-[0_3px_0px_#161716]">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Name Typography Only */}
        <button
          onClick={onHomeClick}
          className="flex items-center text-left group focus:outline-none"
          title="Return to ANKOR Home"
        >
          <span className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-ink px-2.5 py-0.5 bg-[#FEF08A] border-2 border-ink shadow-[3px_3px_0px_#161716] group-hover:bg-[#FDE047] transition">
            ANKOR
          </span>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {onResetDemoClick && (
            <button
              onClick={onResetDemoClick}
              className="px-3 py-1.5 border-2 border-ink bg-surface hover:bg-canvas shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold uppercase transition flex items-center gap-1 text-ink"
              title="Reset current investigation workflow"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Run</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 border-2 border-ink bg-surface hover:bg-canvas shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-ink transition"
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
