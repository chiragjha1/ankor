"use client";

import React, { useState } from "react";
import { SimulationFeedback, PersonaTemplate } from "@/types";
import {
  Users2,
  Lightbulb,
} from "lucide-react";

interface SimulationsViewProps {
  feedbacks: SimulationFeedback[];
  personas: PersonaTemplate[];
}

export const SimulationsView: React.FC<SimulationsViewProps> = ({
  feedbacks,
  personas,
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(
    personas[0]?.id || ""
  );

  const activeFeedback =
    feedbacks.find((f) => f.personaId === selectedPersonaId) || feedbacks[0];

  const activePersona = personas.find((p) => p.id === selectedPersonaId) || personas[0];

  // Aggregate recurring themes across personas
  const adoptCount = feedbacks.filter((f) => f.verdict === "ADOPT").length;
  const considerCount = feedbacks.filter((f) => f.verdict === "CONSIDER").length;
  const rejectCount = feedbacks.filter((f) => f.verdict === "REJECT").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="comic-panel p-5 bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="comic-caption px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5 mb-2">
            <Users2 className="w-3.5 h-3.5" /> MULTI-PERSPECTIVE STRESS-TESTING
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-ink">
            Customer Simulation Lab
          </h2>
          <p className="text-xs font-mono text-muted mt-1 max-w-2xl leading-relaxed">
            Principle 8 & 9: Simulated customer feedback tests value proposition comprehension and surface objections before real interviews begin.
          </p>
        </div>

        <div className="comic-badge px-3 py-1 bg-[#FEF08A] text-ink text-xs">
          PERSONA EVALUATIONS
        </div>
      </div>

      {/* Aggregate Themes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="comic-panel p-4 bg-surface text-xs font-mono">
          <div className="text-muted uppercase text-[10px] font-bold mb-1">Adopt Verdicts</div>
          <div className="text-2xl font-black text-forest">{adoptCount} personas</div>
        </div>

        <div className="comic-panel p-4 bg-surface text-xs font-mono">
          <div className="text-muted uppercase text-[10px] font-bold mb-1">Consider Verdicts</div>
          <div className="text-2xl font-black text-ochre">{considerCount} personas</div>
        </div>

        <div className="comic-panel p-4 bg-surface text-xs font-mono">
          <div className="text-muted uppercase text-[10px] font-bold mb-1">Reject Verdicts</div>
          <div className="text-2xl font-black text-rust">{rejectCount} personas</div>
        </div>

        <div className="comic-panel p-4 bg-surface text-xs font-mono">
          <div className="text-muted uppercase text-[10px] font-bold mb-1">Evaluated Sample</div>
          <div className="text-2xl font-black text-ink">{feedbacks.length} Distinct Roles</div>
        </div>
      </div>

      {/* Main Persona Feedback Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Persona Selector List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-ink font-black">
            Customer Persona Personas
          </div>

          {personas.map((p) => {
            const fb = feedbacks.find((f) => f.personaId === p.id);
            const isSelected = p.id === activePersona?.id;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPersonaId(p.id)}
                className={`comic-panel p-4 cursor-pointer transition ${
                  isSelected
                    ? "ring-4 ring-ink border-2 border-ink bg-surface shadow-[4px_4px_0px_#161716] -translate-y-0.5"
                    : "hover:bg-canvas/40 hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-black font-sans uppercase text-ink">{p.name}</span>
                  <span
                    className={`comic-badge px-2 py-0.5 text-[10px] ${
                      fb?.verdict === "ADOPT"
                        ? "bg-[#DCFCE7] text-ink"
                        : fb?.verdict === "CONSIDER"
                        ? "bg-[#FEF08A] text-ink"
                        : "bg-[#FEE2E2] text-ink"
                    }`}
                  >
                    {fb?.verdict || "REVIEWED"}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-muted line-clamp-1 mb-2 font-medium">
                  {p.roleTitle}
                </div>

                <div className="pt-2 border-t border-line-light flex items-center justify-between text-[10px] font-mono text-muted">
                  <span>Budget: \${p.budgetMonthlyUSD}/mo</span>
                  <span className="font-bold text-ink uppercase">{p.purchasingAuthority}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep Simulated Persona Feedback */}
        {activeFeedback && activePersona && (
          <div className="comic-panel lg:col-span-2 p-6 bg-surface shadow-[4px_4px_0px_#161716] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-ink pb-4">
              <div>
                <div className="comic-caption px-2 py-0.5 text-[10px] inline-block mb-1">
                  PERSONA REVIEW {"//"} {activePersona.roleTitle}
                </div>
                <h3 className="text-xl font-black font-sans uppercase text-ink">{activePersona.name}</h3>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="p-2 border-2 border-ink bg-canvas text-center shadow-[2px_2px_0px_#161716]">
                  <div className="text-[9px] text-muted uppercase font-bold">Comprehension</div>
                  <div className="font-black text-ink">{activeFeedback.comprehensionScore} / 10</div>
                </div>
                <div className="p-2 border-2 border-ink bg-canvas text-center shadow-[2px_2px_0px_#161716]">
                  <div className="text-[9px] text-muted uppercase font-bold">Pricing Verdict</div>
                  <div className="font-black text-forest">{activeFeedback.pricingReaction}</div>
                </div>
              </div>
            </div>

            {/* Initial Reaction */}
            <div className="p-4 border-2 border-ink bg-caption text-xs font-mono space-y-2 shadow-[2px_2px_0px_#161716]">
              <strong className="block text-ink text-[10px] uppercase font-black tracking-wider">
                Persona Reaction & Comprehension:
              </strong>
              <p className="text-ink leading-relaxed font-sans text-sm font-medium">
                {activeFeedback.initialReaction}
              </p>
            </div>

            {/* Current Alternative & Concerns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 border-2 border-ink bg-canvas/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                  Currently Used Alternative:
                </span>
                <p className="text-ink font-medium">{activeFeedback.currentAlternativeUsed}</p>
              </div>

              <div className="p-3.5 border-2 border-ink bg-canvas/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                  Trust & Security Perspective:
                </span>
                <p className="text-ink leading-relaxed font-medium">
                  {activeFeedback.trustSecurityConcerns.join(", ") || "None specified"}
                </p>
              </div>
            </div>

            {/* Missing Capabilities & Suggestions */}
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3.5 border-2 border-ink bg-canvas/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rust tracking-wider block">
                  Missing Capabilities / Hesitations:
                </span>
                <ul className="list-disc list-inside text-ink space-y-1 font-medium">
                  {activeFeedback.missingCapabilities.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 border-2 border-ink bg-[#FEF08A]/60 space-y-1">
                <span className="text-[10px] uppercase font-black text-ink tracking-wider block flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-ochre" /> Suggested Product Revisions:
                </span>
                <ul className="list-disc list-inside text-ink space-y-1 font-medium">
                  {activeFeedback.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
