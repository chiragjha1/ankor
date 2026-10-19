"use client";

import React, { useState } from "react";
import { SolutionSpec, Objection, SolutionRevision } from "@/types";
import {
  Lightbulb,
  ShieldAlert,
  History,
  Layers,
  X,
  CheckCircle2,
} from "lucide-react";

interface SolutionsViewProps {
  solutions: SolutionSpec[];
  objections: Objection[];
  revisions: SolutionRevision[];
}

export const SolutionsView: React.FC<SolutionsViewProps> = ({
  solutions,
  objections,
  revisions,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<number>(
    solutions[solutions.length - 1]?.version || 1
  );

  const activeSolution =
    solutions.find((s) => s.version === selectedVersion) || solutions[solutions.length - 1];

  const currentObjections = objections.filter(
    (o) => o.solutionId === activeSolution?.id || o.resolvedInVersion === activeSolution?.version
  );

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-[#FEE2E2] text-ink font-black";
      case "HIGH":
        return "bg-[#FEF3C7] text-ink font-bold";
      case "MEDIUM":
        return "bg-canvas text-ink font-medium";
      default:
        return "bg-surface text-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="comic-panel p-5 bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="comic-caption px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5" /> SPECIFICATION & ADVERSARIAL REVIEW
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-ink">
            Solution Workshop
          </h2>
          <p className="text-xs font-mono text-muted mt-1 max-w-2xl leading-relaxed">
            The solution architect drafts the smallest useful solution mapped to validated customer pain. The adversarial critic challenges feasibility, economics, and distribution.
          </p>
        </div>

        {/* Version Switcher */}
        <div className="flex items-center gap-2 bg-canvas border-2 border-ink p-1.5 shadow-[2px_2px_0px_#161716] text-xs font-mono">
          <span className="text-muted font-bold uppercase text-[10px] px-1">Version:</span>
          {solutions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedVersion(s.version)}
              className={`px-3 py-1 border-2 border-ink transition font-bold uppercase ${
                s.version === activeSolution?.version
                  ? "bg-ink text-white shadow-[2px_2px_0px_#161716]"
                  : "bg-surface hover:bg-canvas text-ink"
              }`}
            >
              v{s.version} {s.status === "REVIEWED_WITHIN_LIMITS" ? "(Hardened)" : ""}
            </button>
          ))}
        </div>
      </div>

      {!activeSolution ? (
        <div className="p-8 text-center border-2 border-dashed border-ink/40 bg-surface/50 text-muted font-mono text-xs">
          No solution drafted yet. Advance the investigation to Stage 6.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Solution Spec (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="comic-panel p-6 bg-surface shadow-[4px_4px_0px_#161716] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-ink pb-4">
                <div>
                  <div className="comic-caption px-2 py-0.5 text-[10px] inline-block mb-1">
                    VERSION {activeSolution.version} {"//"} USER: {activeSolution.primaryUser}
                  </div>
                  <h3 className="text-xl font-black font-sans uppercase text-ink">{activeSolution.title}</h3>
                </div>

                <span className="comic-badge px-3 py-1 text-xs bg-[#DCFCE7] text-ink">
                  {activeSolution.status}
                </span>
              </div>

              {/* Core Job & Current Alternative */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 border-2 border-ink bg-canvas/40 shadow-[2px_2px_0px_#161716] space-y-1">
                  <span className="text-[10px] uppercase font-black text-muted tracking-wider block">
                    Core Job To Be Done:
                  </span>
                  <p className="text-ink leading-relaxed font-medium">{activeSolution.coreJobToBeDone}</p>
                </div>

                <div className="p-3.5 border-2 border-ink bg-canvas/40 shadow-[2px_2px_0px_#161716] space-y-1">
                  <span className="text-[10px] uppercase font-black text-muted tracking-wider block">
                    Displaced Alternative:
                  </span>
                  <p className="text-ink leading-relaxed font-medium">{activeSolution.currentAlternative}</p>
                </div>
              </div>

              {/* Minimum Viable Features */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase font-black text-ink tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-forest" /> Minimum Viable Feature Set
                </div>

                <div className="space-y-2">
                  {activeSolution.minimumViableFeatures.map((feat) => (
                    <div
                      key={feat.id}
                      className="p-3 border-2 border-ink bg-surface text-xs font-mono flex items-start justify-between gap-3 shadow-[2px_2px_0px_#161716]"
                    >
                      <div>
                        <div className="font-bold text-ink uppercase mb-0.5">{feat.name}</div>
                        <div className="text-muted leading-relaxed font-medium">{feat.description}</div>
                      </div>
                      <span className="comic-badge px-2 py-0.5 bg-[#FEF08A] text-ink text-[10px] shrink-0">
                        Essential
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explicitly Excluded Features */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase font-black text-rust tracking-wider flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-rust" /> Excluded Scope
                </div>
                <ul className="list-disc list-inside text-xs font-mono text-muted space-y-1 pl-1">
                  {activeSolution.explicitlyExcludedFeatures.map((exc, i) => (
                    <li key={i}>{exc}</li>
                  ))}
                </ul>
              </div>

              {/* Technical & Security Constraints */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-3 border-t-2 border-ink">
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Reliability Spec:</span>
                  <p className="text-ink font-medium mt-0.5">{activeSolution.reliabilityRequirements}</p>
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Security & Privacy:</span>
                  <p className="text-ink font-medium mt-0.5">{activeSolution.securityAndPrivacy}</p>
                </div>
              </div>
            </div>

            {/* Revision Ledger History */}
            {revisions.length > 0 && (
              <div className="comic-panel p-5 bg-surface shadow-[4px_4px_0px_#161716] space-y-3">
                <div className="text-xs font-mono font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <History className="w-4 h-4 text-forest" /> Revision Ledger
                </div>

                <div className="space-y-3">
                  {revisions.map((rev) => (
                    <div key={rev.id} className="p-3.5 border-2 border-ink bg-canvas/40 text-xs font-mono space-y-2">
                      <div className="flex items-center justify-between text-muted text-[10px]">
                        <span className="font-bold text-ink">
                          Version {rev.fromVersion} &rarr; Version {rev.toVersion} (Round {rev.roundNumber})
                        </span>
                        <span>{new Date(rev.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-ink leading-relaxed font-medium">{rev.changesSummary}</div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rev.modifiedFeatures.map((m, i) => (
                          <span key={i} className="px-2 py-0.5 border border-ink bg-surface text-[10px] text-ink font-bold">
                            + {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Adversarial Objections Ledger (Critic) */}
          <div className="space-y-4">
            <div className="comic-panel p-4 bg-[#FEE2E2] shadow-[3px_3px_0px_#161716] space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rust" /> Adversarial Critic Objections
                </div>
                <span className="comic-badge px-2 py-0.5 bg-surface text-ink text-[10px]">
                  {currentObjections.length} Raised
                </span>
              </div>
              <p className="text-[11px] font-mono text-ink/80 leading-relaxed font-medium">
                The Critic aggressively tests for fatal flaws before code is written. Critical objections block progression until resolved.
              </p>
            </div>

            <div className="space-y-3">
              {currentObjections.map((obj) => (
                <div
                  key={obj.id}
                  className="comic-panel p-4 bg-surface shadow-[3px_3px_0px_#161716] space-y-3 text-xs font-mono"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`comic-badge px-2 py-0.5 text-[10px] ${getSeverityStyle(
                        obj.severity
                      )}`}
                    >
                      {obj.severity} SEVERITY
                    </span>

                    <span
                      className={`comic-badge px-2 py-0.5 text-[9px] ${
                        obj.resolved
                          ? "bg-[#DCFCE7] text-ink"
                          : "bg-[#FEE2E2] text-ink"
                      }`}
                    >
                      {obj.resolved ? "RESOLVED IN V2" : "UNRESOLVED"}
                    </span>
                  </div>

                  <div className="text-[10px] font-bold text-muted uppercase tracking-wide">
                    CATEGORY: {obj.category.replace(/_/g, " ")}
                  </div>

                  <p className="text-ink font-sans font-bold text-sm leading-snug">{obj.description}</p>

                  <div className="p-3 border-2 border-ink bg-canvas/60 text-[11px] text-ink space-y-1 font-medium">
                    <strong className="block text-muted text-[10px] uppercase font-bold">Reasoning / Impact:</strong>
                    <p className="leading-relaxed">{obj.supportingEvidenceOrReasoning}</p>
                  </div>

                  {obj.proposedTestOrMitigation && (
                    <div className="p-2.5 border-2 border-ink bg-[#DCFCE7]/60 text-[11px] text-ink space-y-0.5 font-medium">
                      <strong className="block text-[10px] uppercase font-bold">Proposed Mitigation:</strong>
                      <p className="leading-relaxed">{obj.proposedTestOrMitigation}</p>
                    </div>
                  )}

                  {obj.resolutionNotes && (
                    <div className="text-[11px] text-forest font-bold pt-1 border-t border-line-light flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{obj.resolutionNotes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
