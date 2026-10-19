"use client";

import React, { useState } from "react";
import { ApprovalGate } from "@/types";
import { Check, X, Lock } from "lucide-react";

interface DecisionPanelProps {
  approvals: ApprovalGate[];
  onResolveApproval: (approvalId: string, status: "APPROVED" | "REJECTED", notes?: string) => Promise<void>;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  approvals,
  onResolveApproval,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const pendingApprovals = approvals.filter((a) => a.status === "PENDING");

  if (pendingApprovals.length === 0) {
    return null;
  }

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    setLoadingId(id);
    try {
      await onResolveApproval(id, status);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full bg-[#FEF08A] border-2 border-ink shadow-[4px_4px_0px_#161716] p-4 sm:p-5 mb-5 animate-in fade-in duration-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 border-2 border-ink bg-ink text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#161716]">
          <Lock className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="comic-caption px-2 py-0.5 text-xs bg-ink text-white border-ink">
                AUTHORIZATION GATE REQUIRED
              </span>
              <span className="text-xs font-mono font-bold text-ink">
                ({pendingApprovals.length} pending founder action)
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold uppercase text-ink/80 hidden sm:inline">
              Explicit Release Control
            </span>
          </div>

          {pendingApprovals.map((appr) => (
            <div
              key={appr.id}
              className="p-4 border-2 border-ink bg-surface shadow-[2px_2px_0px_#161716] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="text-base font-black font-sans uppercase text-ink">{appr.title}</div>
                <div className="text-xs font-mono text-ink-muted mt-1 leading-relaxed">
                  {appr.description}
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  disabled={loadingId === appr.id}
                  onClick={() => handleAction(appr.id, "REJECTED")}
                  className="px-3.5 py-1.5 border-2 border-ink bg-surface hover:bg-canvas shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-mono font-bold uppercase text-ink transition flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5 text-rust" />
                  <span>Reject</span>
                </button>
                <button
                  disabled={loadingId === appr.id}
                  onClick={() => handleAction(appr.id, "APPROVED")}
                  className="px-4 py-1.5 border-2 border-ink bg-forest hover:bg-forest/90 shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-white text-xs font-mono font-black uppercase transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Authorize & Deploy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
