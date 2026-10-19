"use client";

import React, { useState } from "react";
import { ProblemCard, EvidenceItem } from "@/types";
import {
  AlertCircle,
  Clock,
  Coins,
} from "lucide-react";

interface ProblemsViewProps {
  problems: ProblemCard[];
  evidence: EvidenceItem[];
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({
  problems,
  evidence,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(problems[0]?.id || "");

  const activeProblem = problems.find((p) => p.id === selectedCardId) || problems[0];

  const supportingEvidence = evidence.filter((e) =>
    activeProblem?.evidenceIds?.includes(e.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="comic-panel p-5 bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="comic-caption px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-3.5 h-3.5" /> PROBLEM SYNTHESIS
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-ink">
            Problem Card Explorer
          </h2>
          <p className="text-xs font-mono text-muted mt-1 max-w-2xl leading-relaxed">
            The system separates genuine market opportunities from transient complaints. A widespread annoyance is not automatically an economically viable business.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="comic-badge px-3 py-1 bg-canvas text-ink text-xs">
            CANDIDATE PROBLEMS: {problems.length}
          </span>
        </div>
      </div>

      {problems.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-ink/40 bg-surface/50 text-muted font-mono text-xs">
          No problem cards framed yet. Run the discovery pipeline to generate candidate cards.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Problem Cards List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-ink font-black">
              Ranked Problem Cards
            </div>

            {problems.map((prob) => {
              const isSelected = prob.id === activeProblem?.id;

              return (
                <div
                  key={prob.id}
                  onClick={() => setSelectedCardId(prob.id)}
                  className={`comic-panel p-4 cursor-pointer transition ${
                    isSelected
                      ? "ring-4 ring-ink border-2 border-ink bg-surface shadow-[4px_4px_0px_#161716] -translate-y-0.5"
                      : "hover:bg-canvas/40 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`comic-badge px-2 py-0.5 text-[10px] ${
                        prob.commercialPotentialRating === "HIGH"
                          ? "bg-[#DCFCE7] text-ink"
                          : prob.commercialPotentialRating === "MEDIUM"
                          ? "bg-[#FEF08A] text-ink"
                          : "bg-canvas text-muted"
                      }`}
                    >
                      {prob.commercialPotentialRating} POTENTIAL
                    </span>

                    <span className="text-[10px] font-mono text-muted font-bold">
                      {(prob.confidenceScore * 100).toFixed(0)}% CONFIDENCE
                    </span>
                  </div>

                  <h4 className="text-sm font-black font-sans uppercase text-ink leading-snug mb-2">
                    {prob.title}
                  </h4>

                  <div className="text-xs font-mono text-muted line-clamp-2 mb-3">
                    {prob.painAndConsequences}
                  </div>

                  <div className="pt-2 border-t border-line-light flex items-center justify-between text-[11px] font-mono">
                    <span className="text-muted">{prob.evidenceIds.length} Evidence links</span>
                    <span className="font-bold uppercase text-forest">
                      {prob.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep Problem Card Inspector */}
          {activeProblem && (
            <div className="comic-panel lg:col-span-2 p-6 bg-surface shadow-[4px_4px_0px_#161716] space-y-6">
              <div className="border-b-2 border-ink pb-4 space-y-2">
                <div className="comic-caption px-2 py-0.5 text-[10px] inline-block">
                  AFFECTED SEGMENT: {activeProblem.customerSegment}
                </div>
                <h3 className="text-xl font-black font-sans uppercase text-ink leading-tight">
                  {activeProblem.title}
                </h3>
              </div>

              {/* Economic Pain Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 border-2 border-ink bg-canvas/40 shadow-[2px_2px_0px_#161716] space-y-1 text-xs font-mono">
                  <div className="text-muted font-bold uppercase text-[10px] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rust" /> Estimated Time Lost
                  </div>
                  <div className="text-lg font-black text-ink">
                    {activeProblem.estimatedTimeLostHoursMonthly} hrs / month per team
                  </div>
                </div>

                <div className="p-3.5 border-2 border-ink bg-canvas/40 shadow-[2px_2px_0px_#161716] space-y-1 text-xs font-mono">
                  <div className="text-muted font-bold uppercase text-[10px] flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-ochre" /> Estimated Financial Waste
                  </div>
                  <div className="text-lg font-black text-ink">
                    \${activeProblem.estimatedMoneyLostMonthlyUSD.toLocaleString()} / month
                  </div>
                </div>
              </div>

              {/* Job to be Done & Workarounds */}
              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 border-2 border-ink bg-caption shadow-[2px_2px_0px_#161716] space-y-1.5">
                  <span className="text-[10px] uppercase font-black text-ink tracking-wider block">
                    Core Job To Be Done:
                  </span>
                  <p className="text-ink leading-relaxed font-medium">{activeProblem.jobToBeDone}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 border-2 border-ink bg-canvas/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                      Current Workaround:
                    </span>
                    <p className="text-ink leading-relaxed font-medium">{activeProblem.existingWorkaround}</p>
                  </div>

                  <div className="p-3.5 border-2 border-ink bg-canvas/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                      Trigger & Frequency:
                    </span>
                    <p className="text-ink leading-relaxed font-medium">{activeProblem.triggerAndFrequency}</p>
                  </div>
                </div>

                {/* Evidence & Spending */}
                <div className="p-3.5 border-2 border-ink bg-canvas/30 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                    Existing Spending Evidenced:
                  </span>
                  <p className="text-ink leading-relaxed font-medium">{activeProblem.existingSpendingEvidenced}</p>
                </div>

                {/* Validation Experiment */}
                <div className="p-4 border-2 border-ink bg-[#FEF08A] shadow-[2px_2px_0px_#161716] space-y-1">
                  <span className="text-[10px] uppercase font-black text-ink tracking-wider block">
                    Cheapest Meaningful Validation Experiment:
                  </span>
                  <p className="text-ink leading-relaxed font-bold">
                    {activeProblem.cheapestValidationExperiment}
                  </p>
                </div>
              </div>

              {/* Supporting Evidence Provenance */}
              <div className="space-y-3 pt-3 border-t-2 border-ink">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                  Linked Supporting Ground Evidence ({supportingEvidence.length})
                </div>

                <div className="space-y-2">
                  {supportingEvidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 border-2 border-ink bg-canvas/40 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-ink">{ev.sourceTitle}</span>
                        <span className="comic-badge px-1.5 py-0.2 bg-surface text-ink font-black">
                          {ev.epistemicStatus}
                        </span>
                      </div>
                      <div className="text-muted leading-relaxed line-clamp-2">
                        {ev.relevantPassage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
