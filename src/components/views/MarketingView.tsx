"use client";

import React, { useState } from "react";
import { MarketingArtifact } from "@/types";
import {
  Megaphone,
  Copy,
  Check,
  Lock,
} from "lucide-react";

interface MarketingViewProps {
  marketing: MarketingArtifact[];
}

export const MarketingView: React.FC<MarketingViewProps> = ({ marketing }) => {
  const [selectedId, setSelectedId] = useState<string>(marketing[0]?.id || "");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeArtifact = marketing.find((m) => m.id === selectedId) || marketing[0];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="comic-panel p-5 bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="comic-caption px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5 mb-2">
            <Megaphone className="w-3.5 h-3.5" /> GROUNDED DISTRIBUTION & COPY
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-ink">
            Marketing Studio
          </h2>
          <p className="text-xs font-mono text-muted mt-1 max-w-2xl leading-relaxed">
            The marketing agent develops positioning and launch content strictly grounded in verified customer pain points. All materials default to draft status and require authorization before release.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="comic-badge px-3 py-1 bg-canvas text-ink text-xs">
            CAMPAIGN DELIVERABLES: {marketing.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Artifact Selector */}
        <div className="comic-panel p-4 bg-surface space-y-3">
          <div className="text-xs font-mono font-black uppercase tracking-wider text-ink border-b-2 border-ink pb-2">
            Campaign Deliverables
          </div>

          <div className="space-y-2">
            {marketing.map((art) => {
              const isSelected = art.id === activeArtifact?.id;

              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedId(art.id)}
                  className={`p-3 border-2 border-ink transition cursor-pointer text-xs font-mono ${
                    isSelected
                      ? "bg-[#FEF08A] shadow-[3px_3px_0px_#161716] -translate-y-0.5"
                      : "bg-surface hover:bg-canvas/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-ink tracking-wider">
                      {art.type.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`comic-badge px-1.5 py-0.2 text-[9px] ${
                        art.status === "APPROVED"
                          ? "bg-[#DCFCE7] text-ink"
                          : "bg-surface text-muted"
                      }`}
                    >
                      {art.status}
                    </span>
                  </div>

                  <div className="font-sans font-black text-ink text-sm mb-1 uppercase">{art.title}</div>
                  <div className="text-[11px] text-muted truncate">
                    Channel: {art.intendedChannel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Content Draft Viewer */}
        {activeArtifact && (
          <div className="comic-panel lg:col-span-2 p-6 bg-surface shadow-[4px_4px_0px_#161716] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-ink pb-4">
              <div>
                <div className="comic-caption px-2 py-0.5 text-[10px] inline-block mb-1">
                  TARGET: {activeArtifact.targetAudience} {"//"} CHANNEL: {activeArtifact.intendedChannel}
                </div>
                <h3 className="text-xl font-black font-sans uppercase text-ink">{activeArtifact.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeArtifact.id, activeArtifact.content)}
                  className="px-3 py-1.5 border-2 border-ink bg-surface hover:bg-canvas text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  {copiedId === activeArtifact.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-forest" />
                      <span className="text-forest">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-muted" />
                      <span>Copy Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Render Content */}
            <div className="p-5 border-2 border-ink bg-canvas text-xs font-mono text-ink leading-relaxed whitespace-pre-wrap font-sans shadow-inner">
              {activeArtifact.content}
            </div>

            {/* Gated Distribution Warning */}
            <div className="p-3.5 border-2 border-ink bg-caption flex items-center justify-between gap-3 text-xs font-mono text-ink shadow-[2px_2px_0px_#161716]">
              <div className="flex items-center gap-2 font-bold">
                <Lock className="w-4 h-4 text-ink" />
                <span>Publishing requires channel authorization. Default behavior is draft-only.</span>
              </div>
              <span className="comic-badge px-2 py-0.5 bg-ink text-white text-[10px]">
                Gated Policy
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
