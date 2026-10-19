"use client";

import React, { useState } from "react";
import { ResearchRun } from "@/types";
import {
  Compass,
  Plus,
  Coins,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface DiscoveriesViewProps {
  runs: ResearchRun[];
  currentRunId: string;
  onSelectRun: (runId: string) => void;
  onNewRunClick: () => void;
}

export const DiscoveriesView: React.FC<DiscoveriesViewProps> = ({
  runs,
  currentRunId,
  onSelectRun,
  onNewRunClick,
}) => {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredRuns = runs.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return r.status.includes("ING") || r.status === "RUNNING";
    if (filter === "COMPLETED") return r.status === "COMPLETED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="comic-panel p-5 bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="comic-caption px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5 mb-2">
            <Compass className="w-3.5 h-3.5" /> COMPANY DOSSIER LEDGER
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-ink">
            Research Discoveries
          </h2>
          <p className="text-xs font-mono text-muted mt-1 max-w-2xl leading-relaxed">
            Every investigation begins with empirical ground evidence, extracts economic pain points, formulates solution specifications, and prepares products for market validation.
          </p>
        </div>

        <button
          onClick={onNewRunClick}
          className="px-4 py-2 border-2 border-ink bg-forest hover:bg-forest/90 text-white text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Investigation</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-ink pb-2 text-xs font-mono">
        <span className="text-muted font-bold uppercase mr-2 text-[10px]">Filter Runs:</span>
        {["ALL", "ACTIVE", "COMPLETED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 border-2 border-ink text-xs font-mono font-bold uppercase transition ${
              filter === f
                ? "bg-ink text-white shadow-[2px_2px_0px_#161716]"
                : "bg-surface hover:bg-canvas text-ink"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-muted font-bold text-[11px]">
          Showing {filteredRuns.length} of {runs.length} runs
        </span>
      </div>

      {/* Runs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRuns.map((r) => {
          const isSelected = r.id === currentRunId;
          const dateStr = new Date(r.createdAt).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={r.id}
              onClick={() => onSelectRun(r.id)}
              className={`comic-panel p-5 cursor-pointer flex flex-col justify-between transition ${
                isSelected
                  ? "ring-4 ring-ink border-2 border-ink bg-surface shadow-[5px_5px_0px_#161716] -translate-y-0.5"
                  : "hover:bg-canvas/40 hover:-translate-y-0.5"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="comic-caption px-2 py-0.5 text-[9px] bg-canvas text-ink">
                    <Calendar className="w-3 h-3 inline mr-1" /> {dateStr}
                  </span>

                  <span
                    className={`comic-badge px-2 py-0.5 text-[10px] ${
                      r.status === "COMPLETED"
                        ? "bg-[#DCFCE7] text-ink"
                        : r.status === "PAUSED"
                        ? "bg-[#FEF3C7] text-ink"
                        : "bg-[#FEF08A] text-ink"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <h3 className="text-lg font-black font-sans uppercase text-ink mb-1.5 leading-snug">
                  {r.name}
                </h3>
                <p className="text-xs font-mono text-muted line-clamp-2 mb-4 leading-relaxed">
                  {r.searchBrief}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-4">
                  <span className="px-2 py-0.5 border border-ink bg-canvas text-ink font-bold text-[10px]">
                    DOMAIN: {r.targetMarketOrDomain}
                  </span>
                  <span className="px-2 py-0.5 border border-ink bg-canvas text-ink font-bold text-[10px]">
                    STAGE: {r.currentStage.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-ink flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1 font-bold text-ink">
                  <Coins className="w-3.5 h-3.5 text-ochre" />
                  <span>Cost:</span>
                  <span>\${r.cumulativeCostUSD.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-1 font-bold uppercase text-ink">
                  <span>{isSelected ? "Current Active" : "Open Dossier"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
