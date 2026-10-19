"use client";

import React from "react";
import { WorkflowStage } from "@/types";
import { Check, AlertTriangle } from "lucide-react";

interface StageTrackerProps {
  currentStage: WorkflowStage;
  activeBlocker?: string;
  onSelectStage?: (stage: WorkflowStage) => void;
}

export const WORKFLOW_STAGES_LIST: { id: WorkflowStage; number: number; name: string; shortName: string }[] = [
  { id: "search_definition", number: 1, name: "Define Search", shortName: "1. Brief" },
  { id: "evidence_collection", number: 2, name: "Evidence Collection", shortName: "2. Scout" },
  { id: "evidence_assessment", number: 3, name: "Evidence Assessment", shortName: "3. Audit" },
  { id: "problem_discovery", number: 4, name: "Problem Discovery", shortName: "4. Problem" },
  { id: "economic_investigation", number: 5, name: "Economic Investigation", shortName: "5. Economy" },
  { id: "solution_design", number: 6, name: "Solution Design", shortName: "6. Spec" },
  { id: "adversarial_review", number: 7, name: "Adversarial Review", shortName: "7. Critique" },
  { id: "customer_simulation", number: 8, name: "Customer Simulation", shortName: "8. Personas" },
  { id: "validation_experiment", number: 9, name: "Validation Experiment", shortName: "9. Test" },
  { id: "product_construction", number: 10, name: "Product Construction", shortName: "10. Build" },
  { id: "marketing_distribution", number: 11, name: "Marketing & Distribution", shortName: "11. Market" },
  { id: "feedback_learning", number: 12, name: "Feedback & Learning", shortName: "12. Learn" },
];

export const StageTracker: React.FC<StageTrackerProps> = ({
  currentStage,
  activeBlocker,
  onSelectStage,
}) => {
  const currentIndex = WORKFLOW_STAGES_LIST.findIndex((s) => s.id === currentStage);

  return (
    <div className="comic-panel p-3.5 bg-surface">
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-ink flex items-center gap-2">
          <span className="comic-caption px-2 py-0.5 text-[10px]">WORKFLOW GATES</span>
          <span className="text-muted text-[11px]">12 Progressive Stages</span>
        </div>
        {activeBlocker && (
          <div className="comic-badge flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] bg-[#FEE2E2] text-ink border-ink">
            <AlertTriangle className="w-3.5 h-3.5 text-rust" />
            <span>Blocker: {activeBlocker}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1">
        {WORKFLOW_STAGES_LIST.map((stage, idx) => {
          const isCompleted = idx < currentIndex || (idx === currentIndex && currentStage === "feedback_learning");
          const isActive = idx === currentIndex && currentStage !== "feedback_learning";

          return (
            <div
              key={stage.id}
              onClick={() => onSelectStage?.(stage.id)}
              className={`flex-1 min-w-[76px] flex flex-col items-center cursor-pointer p-2 border-2 transition ${
                isActive
                  ? "bg-[#FEF08A] border-ink shadow-[2px_2px_0px_#161716] -translate-y-0.5"
                  : isCompleted
                  ? "bg-canvas border-ink hover:bg-surface"
                  : "bg-surface border-line-light opacity-60 hover:opacity-100 hover:border-ink"
              }`}
            >
              <div
                className={`w-6 h-6 border-2 border-ink flex items-center justify-center text-[10px] font-mono font-black mb-1 ${
                  isCompleted
                    ? "bg-forest text-white"
                    : isActive
                    ? "bg-ink text-white animate-pulse"
                    : "bg-surface text-ink"
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : stage.number}
              </div>

              <span
                className={`text-[10px] font-mono uppercase truncate block max-w-[70px] ${
                  isActive ? "font-black text-ink" : isCompleted ? "font-bold text-ink" : "text-muted"
                }`}
              >
                {stage.shortName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
