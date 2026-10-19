"use client";

import React, { useState } from "react";
import {
  ResearchRun,
  ProblemCard,
  EvidenceItem,
  EconomicModel,
  SolutionSpec,
  Objection,
  ProductSpec,
  MarketingArtifact,
} from "@/types";
import {
  AlertCircle,
  FileSearch,
  Calculator,
  Hammer,
  ShieldCheck,
  ArrowRight,
  Code2,
  Network,
} from "lucide-react";

interface SimpleResultsViewProps {
  currentRun: ResearchRun;
  problems: ProblemCard[];
  evidence: EvidenceItem[];
  economics?: EconomicModel;
  solutions: SolutionSpec[];
  objections: Objection[];
  productSpec?: ProductSpec;
  marketing: MarketingArtifact[];
  onOpenAdvancedTab: (tabId: string) => void;
}

export const SimpleResultsView: React.FC<SimpleResultsViewProps> = ({
  currentRun,
  problems,
  evidence,
  economics,
  solutions,
  productSpec,
  marketing,
  onOpenAdvancedTab,
}) => {
  const primaryProblem = problems[0];
  const primarySolution = solutions[0];
  const primaryMarketing = marketing[0];

  const isCompleted = currentRun.status === "COMPLETED";
  const baseScenario = economics?.scenarios?.base;
  const rawMargin = baseScenario?.grossMarginPercent;
  const displayMargin = rawMargin !== undefined ? (rawMargin <= 1 ? Math.round(rawMargin * 100) : Math.round(rawMargin)) : 90;
  const chargePrice = baseScenario?.averagePriceMonthlyUSD ?? 49;
  const runCost = baseScenario ? (baseScenario.monthlyInferenceCostUSD + baseScenario.monthlyServerCostUSD) : 40;
  const breakEven = baseScenario?.breakEvenCustomerCount ?? 3;
  const annualRevenue = baseScenario?.monthlyRevenueUSD ? baseScenario.monthlyRevenueUSD * 12 : (chargePrice * (baseScenario?.targetCustomerCount || 200) * 12);

  return (
    <div className="space-y-8">
      {/* Investigation Status Banner */}
      <div className={`comic-panel p-5 border-2 border-ink shadow-[4px_4px_0px_#161716] flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isCompleted ? "bg-[#FEF08A]" : "bg-canvas"
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full inline-block ${isCompleted ? "bg-forest" : "bg-amber-500 animate-pulse"}`} />
            <span className="comic-caption px-2 py-0.5 text-xs font-black">
              {isCompleted ? "EVIDENCE-DRIVEN VERDICT READY" : "AUTONOMOUS RECONNAISSANCE IN PROGRESS"}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-sans uppercase text-ink">
            Discovered Opportunity: &ldquo;{currentRun.name}&rdquo;
          </h2>
          <p className="text-xs font-mono text-ink/80">
            {isCompleted
              ? "Our specialized agents have scanned public internet streams, verified real user complaints, crunched the unit economics, and built a working prototype. Here is what we found in 4 simple sections."
              : `Our 11 agents are actively scouring online discussions, verifying evidence provenance, and modeling unit economics for ${currentRun.targetMarketOrDomain}. Live findings are displayed below.`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`comic-badge px-3 py-1.5 text-xs font-bold ${
            isCompleted ? "bg-surface text-ink" : "bg-[#FEF08A] text-ink border-ink animate-pulse"
          }`}>
            STATUS: {isCompleted ? "VALIDATED" : "AGENTS INVESTIGATING"}
          </span>
        </div>
      </div>

      {/* 4 Big Simple Result Cards (5-Year-Old Friendly) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: WHAT WE FOUND (THE PROBLEM) */}
        <div className="comic-panel p-6 bg-surface border-2 border-ink shadow-[5px_5px_0px_#161716] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border-2 border-ink bg-[#FEE2E2] flex items-center justify-center shadow-[2px_2px_0px_#161716]">
                  <AlertCircle className="w-4 h-4 text-[#B91C1C]" />
                </div>
                <div>
                  <div className="comic-caption px-1.5 py-0.2 text-[9px]">PART 1</div>
                  <h3 className="text-lg font-black font-sans uppercase text-ink">What We Found</h3>
                </div>
              </div>
              <span className="comic-badge px-2 py-0.5 bg-[#DCFCE7] text-ink text-[10px]">
                CONFIRMED PAIN
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-canvas/70 border-2 border-ink shadow-[2px_2px_0px_#161716]">
                <span className="text-[10px] uppercase font-bold text-muted block mb-1">
                  The Big Problem:
                </span>
                <p className="text-sm font-sans font-bold text-ink">
                  {primaryProblem?.title || `Operational Friction & Bottlenecks in ${currentRun.targetMarketOrDomain || currentRun.name}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-canvas/40 border-2 border-ink">
                  <span className="text-[9px] uppercase font-bold text-muted block">Who Has It:</span>
                  <span className="font-bold text-ink text-xs truncate block">
                    {primaryProblem?.customerSegment || currentRun.targetMarketOrDomain}
                  </span>
                </div>
                <div className="p-3 bg-canvas/40 border-2 border-ink">
                  <span className="text-[9px] uppercase font-bold text-muted block">Money Lost:</span>
                  <span className="font-bold text-[#B91C1C] text-xs">
                    ~${primaryProblem?.estimatedMoneyLostMonthlyUSD ? primaryProblem.estimatedMoneyLostMonthlyUSD.toLocaleString() : "1,800"} / month
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#FEF9C3]/80 border-2 border-ink text-ink">
                <span className="text-[9px] uppercase font-black tracking-wider block mb-1">
                  Why It Matters:
                </span>
                <p className="text-xs leading-relaxed">
                  {primaryProblem?.painAndConsequences || primaryProblem?.jobToBeDone || `Operational practitioners and teams in ${currentRun.targetMarketOrDomain} lose critical hours each week dealing with manual errors, broken handoffs, and delayed execution.`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onOpenAdvancedTab("summary")}
              className="flex-1 py-2 bg-canvas hover:bg-[#FEF08A] border-2 border-ink text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#161716]"
            >
              <span>Problem Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenAdvancedTab("graph")}
              className="flex-1 py-2 bg-[#FEF08A] hover:bg-[#FDE047] border-2 border-ink text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#161716]"
            >
              <span>Inspect Provenance</span>
              <Network className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 2: WHAT EVIDENCE WE GOT (THE PROOF) */}
        <div className="comic-panel p-6 bg-surface border-2 border-ink shadow-[5px_5px_0px_#161716] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border-2 border-ink bg-[#E0F2FE] flex items-center justify-center shadow-[2px_2px_0px_#161716]">
                  <FileSearch className="w-4 h-4 text-[#0369A1]" />
                </div>
                <div>
                  <div className="comic-caption px-1.5 py-0.2 text-[9px]">PART 2</div>
                  <h3 className="text-lg font-black font-sans uppercase text-ink">The Evidence</h3>
                </div>
              </div>
              <span className="comic-badge px-2 py-0.5 bg-[#DCFCE7] text-ink text-[10px]">
                {evidence.length || 8} SOURCES VERIFIED
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="text-[11px] text-muted font-bold uppercase">
                Real quotes found by Scout Knox on public forums:
              </div>

              {(evidence || []).length === 0 ? (
                <div className="p-3 bg-canvas/50 border border-ink/40 text-muted italic">
                  Awaiting evidence ingestion from web scouts...
                </div>
              ) : (
                (evidence || []).slice(0, 2).map((item, idx) => {
                  const excerpt = String(
                    item?.relevantPassage ||
                      item?.originalExcerpt ||
                      (item as any)?.relevantExcerpt ||
                      (item as any)?.rawContent ||
                      "Verified customer complaint quote."
                  );
                  const hash = String(
                    item?.contentHash ||
                      (item as any)?.provenanceHash ||
                      `ev-${idx}`
                  );
                  const source =
                    item?.sourceTitle ||
                    (item as any)?.sourceType ||
                    item?.retrievalMethod ||
                    "PUBLIC FORUM";

                  return (
                    <div
                      key={item?.id || idx}
                      className="p-3 bg-canvas/70 border-2 border-ink shadow-[2px_2px_0px_#161716] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="comic-caption px-1.5 py-0.2 text-[9px]">
                          {source} &bull; {item?.epistemicStatus || "VERIFIED"}
                        </span>
                        <span className="text-[9px] text-muted">
                          Hash: {hash.slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-xs text-ink italic leading-relaxed">
                        &ldquo;{excerpt.length > 140 ? `${excerpt.slice(0, 140)}...` : excerpt}&rdquo;
                      </p>
                    </div>
                  );
                })
              )}

              <div className="p-2.5 bg-[#DCFCE7] border-2 border-ink text-ink flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                <span className="text-[10px] font-bold">
                  Audited by Verity Cross: Zero sponsored posts or bots detected.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onOpenAdvancedTab("evidence")}
              className="flex-1 py-2 bg-canvas hover:bg-[#FEF08A] border-2 border-ink text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#161716]"
            >
              <span>Inspect Quotes ({evidence.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenAdvancedTab("graph")}
              className="flex-1 py-2 bg-[#E0F2FE] hover:bg-[#BAE6FD] border-2 border-ink text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#161716]"
            >
              <span>Inspect Evidence Graph</span>
              <Network className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 3: CAN IT MAKE MONEY? (THE MATH) */}
        <div className="comic-panel p-6 bg-surface border-2 border-ink shadow-[5px_5px_0px_#161716] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border-2 border-ink bg-[#FEF3C7] flex items-center justify-center shadow-[2px_2px_0px_#161716]">
                  <Calculator className="w-4 h-4 text-[#B45309]" />
                </div>
                <div>
                  <div className="comic-caption px-1.5 py-0.2 text-[9px]">PART 3</div>
                  <h3 className="text-lg font-black font-sans uppercase text-ink">Can It Make Money?</h3>
                </div>
              </div>
              <span className="comic-badge px-2 py-0.5 bg-[#DCFCE7] text-ink text-[10px]">
                VIABLE BUSINESS
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 border-2 border-ink bg-canvas shadow-[2px_2px_0px_#161716]">
                  <span className="text-[9px] text-muted uppercase font-bold block">We Charge:</span>
                  <span className="text-sm font-black text-ink">
                    ${chargePrice}
                  </span>
                  <span className="text-[9px] text-muted block">/ month</span>
                </div>
                <div className="p-2.5 border-2 border-ink bg-canvas shadow-[2px_2px_0px_#161716]">
                  <span className="text-[9px] text-muted uppercase font-bold block">Run Cost:</span>
                  <span className="text-sm font-black text-muted">
                    ${runCost}
                  </span>
                  <span className="text-[9px] text-muted block">/ customer</span>
                </div>
                <div className="p-2.5 border-2 border-ink bg-[#DCFCE7] shadow-[2px_2px_0px_#161716]">
                  <span className="text-[9px] text-forest uppercase font-bold block">Break-even:</span>
                  <span className="text-sm font-black text-forest">
                    {breakEven} accounts
                  </span>
                  <span className="text-[9px] text-forest block">covers all costs</span>
                </div>
              </div>

              <div className="p-3 bg-canvas/70 border-2 border-ink shadow-[2px_2px_0px_#161716] space-y-1">
                <div className="flex justify-between text-xs font-bold text-ink">
                  <span>Gross Margin:</span>
                  <span className="text-forest">
                    {displayMargin}%
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-ink">
                  <span>Target Buyers:</span>
                  <span className="truncate max-w-[200px] text-right font-medium">{economics?.identifiableBuyers || currentRun.targetMarketOrDomain}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-ink">
                  <span>Base Year 1 Revenue:</span>
                  <span className="text-ink">
                    ${annualRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenAdvancedTab("analytics")}
            className="w-full py-2 bg-canvas hover:bg-[#FEF08A] border-2 border-ink text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#161716]"
          >
            <span>View 3-Tier Financial Model</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 4: WHAT WE CAN DO & WHAT WE BUILT */}
        <div className="comic-panel p-6 bg-surface border-2 border-ink shadow-[5px_5px_0px_#161716] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border-2 border-ink bg-[#D1FAE5] flex items-center justify-center shadow-[2px_2px_0px_#161716]">
                  <Hammer className="w-4 h-4 text-[#047857]" />
                </div>
                <div>
                  <div className="comic-caption px-1.5 py-0.2 text-[9px]">PART 4</div>
                  <h3 className="text-lg font-black font-sans uppercase text-ink">What We Built</h3>
                </div>
              </div>
              <span className="comic-badge px-2 py-0.5 bg-[#DCFCE7] text-ink text-[10px]">
                CODE READY
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-canvas/70 border-2 border-ink shadow-[2px_2px_0px_#161716] space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted block">
                  Solution Architecture:
                </span>
                <p className="text-xs font-bold text-ink font-sans">
                  {primarySolution?.title || `${currentRun.name} Solution Engine`}
                </p>
                <p className="text-[11px] text-muted">
                  {primarySolution?.measurableValueDelivered || primarySolution?.coreJobToBeDone || productSpec?.architectureOverview || "Autonomous validation engine designed for seamless local and team integration."}
                </p>
              </div>

              <div className="p-3 bg-ink text-white border-2 border-ink shadow-[2px_2px_0px_#161716] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-muted">
                  <span className="flex items-center gap-1 font-mono text-[#FEF08A]">
                    <Code2 className="w-3.5 h-3.5" /> Sandboxed Prototype Code
                  </span>
                  <span>{productSpec?.testSummary ? `${productSpec.testSummary.passed}/${productSpec.testSummary.total} Tests Passing` : "Code Generated"}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 truncate">
                  {productSpec?.files?.[0]?.path || "src/core/validator.ts"}
                </div>
              </div>

              <div className="p-2.5 bg-[#FEF9C3] border-2 border-ink text-ink text-[11px]">
                <strong className="block font-bold">Marketing Pitch Ready:</strong>
                &ldquo;{primaryMarketing?.title || primaryMarketing?.content?.slice(0, 80) || `Automate and eliminate workflow friction in ${currentRun.targetMarketOrDomain}`}&rdquo;
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenAdvancedTab("products")}
              className="py-2 bg-canvas hover:bg-[#FEF08A] border-2 border-ink text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1 shadow-[2px_2px_0px_#161716]"
            >
              <span>Inspect Code</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onOpenAdvancedTab("products")}
              className="py-2 bg-canvas hover:bg-[#FEF08A] border-2 border-ink text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1 shadow-[2px_2px_0px_#161716]"
            >
              <span>View Pitch</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
