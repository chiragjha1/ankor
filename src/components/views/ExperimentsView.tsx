"use client";

import React, { useState } from "react";
import { ValidationExperiment } from "@/types";
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  UserCheck,
} from "lucide-react";

interface ExperimentsViewProps {
  experiment?: ValidationExperiment;
  onUpdateResults?: (results: NonNullable<ValidationExperiment["results"]>) => void;
}

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({
  experiment,
  onUpdateResults,
}) => {
  const [interviews, setInterviews] = useState(experiment?.results?.interviewsConducted || 14);
  const [positive, setPositive] = useState(experiment?.results?.positiveResponses || 11);
  const [commitments, setCommitments] = useState(experiment?.results?.pilotCommitmentsCount || 8);
  const [paidPilots, setPaidPilots] = useState(experiment?.results?.paidPilotsCount || 4);
  const [decision, setDecision] = useState<"CONTINUE" | "ITERATE" | "CHANGE_POSITIONING" | "CHANGE_PRICING" | "PIVOT" | "PAUSE" | "KILL">(
    experiment?.results?.decisionTaken || "CONTINUE"
  );

  if (!experiment) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-ink/40 bg-surface/50 text-muted font-mono text-xs">
        No validation experiment proposed yet. Run the discovery workflow to Stage 9.
      </div>
    );
  }

  const handleSaveResults = () => {
    onUpdateResults?.({
      interviewsConducted: Number(interviews),
      positiveResponses: Number(positive),
      pilotCommitmentsCount: Number(commitments),
      paidPilotsCount: Number(paidPilots),
      notes: "Field experiment records updated by user.",
      verdict: Number(commitments) >= 5 ? "PASSED" : "FAILED",
      decisionTaken: decision,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="comic-panel p-5 bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="comic-caption px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5 mb-2">
            <FlaskConical className="w-3.5 h-3.5" /> REAL DEMAND VALIDATION
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-ink">
            Validation Experiment Lab
          </h2>
          <p className="text-xs font-mono text-muted mt-1 max-w-2xl leading-relaxed">
            The experiment designer identifies the single most consequential unknown and proposes the cheapest test before engineering capital is spent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="comic-badge px-3 py-1 bg-[#DCFCE7] text-ink text-xs">
            STATUS: {experiment.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Experiment Design Card */}
        <div className="comic-panel lg:col-span-2 p-6 bg-surface shadow-[4px_4px_0px_#161716] space-y-6">
          <div className="border-b-2 border-ink pb-4">
            <div className="comic-caption px-2 py-0.5 text-[10px] inline-block mb-1">
              CORE TESTABLE HYPOTHESIS
            </div>
            <h3 className="text-lg font-black font-sans uppercase text-ink leading-snug">
              {experiment.hypothesis}
            </h3>
          </div>

          {/* Test Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 border-2 border-ink bg-canvas/30 space-y-1">
              <span className="text-[10px] uppercase font-black text-muted tracking-wider block">
                Target Participant:
              </span>
              <p className="text-ink font-medium">{experiment.targetParticipant}</p>
            </div>

            <div className="p-3.5 border-2 border-ink bg-canvas/30 space-y-1">
              <span className="text-[10px] uppercase font-black text-muted tracking-wider block">
                Recruitment Method:
              </span>
              <p className="text-ink font-medium">{experiment.recruitmentMethod}</p>
            </div>

            <div className="p-3.5 border-2 border-ink bg-canvas/30 space-y-1">
              <span className="text-[10px] uppercase font-black text-muted tracking-wider block">
                Budget & Duration:
              </span>
              <p className="text-ink font-bold">
                \${experiment.costUSD} budget &bull; {experiment.durationDays} days duration
              </p>
            </div>

            <div className="p-3.5 border-2 border-ink bg-[#DCFCE7] space-y-1">
              <span className="text-[10px] uppercase font-black text-forest tracking-wider block">
                Success Threshold:
              </span>
              <p className="text-forest font-black">{experiment.successThreshold}</p>
            </div>
          </div>

          {/* Decision Rules */}
          <div className="p-4 border-2 border-ink bg-caption shadow-[2px_2px_0px_#161716] text-xs font-mono space-y-2">
            <div className="text-[10px] uppercase font-black text-ink tracking-wider">
              Decision Rules Following Outcome:
            </div>
            <div className="flex items-center gap-2 text-ink font-bold">
              <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
              <span>If Passed: {experiment.decisionOnPass}</span>
            </div>
            <div className="flex items-center gap-2 text-ink font-bold">
              <XCircle className="w-4 h-4 text-rust shrink-0" />
              <span>If Failed: {experiment.decisionOnFail}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Real Field Outcome Ledger */}
        <div className="comic-panel p-6 bg-surface shadow-[4px_4px_0px_#161716] space-y-5">
          <div className="border-b-2 border-ink pb-3">
            <div className="comic-caption px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5 mb-1">
              <UserCheck className="w-3.5 h-3.5" /> FIELD OUTCOMES
            </div>
            <h4 className="text-lg font-black font-sans uppercase text-ink">Logged Results</h4>
          </div>

          <div className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-ink text-[10px] uppercase font-bold mb-1">
                Interviews Conducted
              </label>
              <input
                type="number"
                value={interviews}
                onChange={(e) => setInterviews(Number(e.target.value))}
                className="w-full p-2.5 border-2 border-ink bg-canvas text-ink font-black"
              />
            </div>

            <div>
              <label className="block text-ink text-[10px] uppercase font-bold mb-1">
                Positive Qualified Responses
              </label>
              <input
                type="number"
                value={positive}
                onChange={(e) => setPositive(Number(e.target.value))}
                className="w-full p-2.5 border-2 border-ink bg-canvas text-ink font-black"
              />
            </div>

            <div>
              <label className="block text-ink text-[10px] uppercase font-bold mb-1">
                Pilot Commitments Count
              </label>
              <input
                type="number"
                value={commitments}
                onChange={(e) => setCommitments(Number(e.target.value))}
                className="w-full p-2.5 border-2 border-ink bg-canvas text-ink font-black"
              />
            </div>

            <div>
              <label className="block text-ink text-[10px] uppercase font-bold mb-1">
                Paid Pilots / Pre-Orders
              </label>
              <input
                type="number"
                value={paidPilots}
                onChange={(e) => setPaidPilots(Number(e.target.value))}
                className="w-full p-2.5 border-2 border-ink bg-canvas text-ink font-black"
              />
            </div>

            <div>
              <label className="block text-ink text-[10px] uppercase font-bold mb-1">
                Strategic Decision
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value as any)}
                className="w-full p-2.5 border-2 border-ink bg-canvas text-ink font-black cursor-pointer"
              >
                <option value="CONTINUE">CONTINUE (Build Product)</option>
                <option value="ITERATE">ITERATE (Refine Solution)</option>
                <option value="CHANGE_POSITIONING">CHANGE POSITIONING</option>
                <option value="CHANGE_PRICING">CHANGE PRICING</option>
                <option value="PIVOT">PIVOT (New Problem Cluster)</option>
                <option value="KILL">KILL (Shut Down Idea)</option>
              </select>
            </div>

            <button
              onClick={handleSaveResults}
              className="w-full py-2.5 border-2 border-ink bg-forest hover:bg-forest/90 text-white font-bold uppercase transition shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none mt-2"
            >
              Record Field Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
