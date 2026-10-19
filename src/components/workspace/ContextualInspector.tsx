/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { AgentRoleId, ResearchRun, CostRecord, WorkflowEvent } from "@/types";
import { AGENT_VISUALS } from "./AgentCharacter";
import {
  X,
  Cpu,
  Coins,
  History,
  ArrowRight,
  ShieldCheck,
  Radio,
} from "lucide-react";

interface ContextualInspectorProps {
  selectedAgentId: AgentRoleId | null;
  onClose: () => void;
  currentRun: ResearchRun;
  costs: CostRecord[];
  events: WorkflowEvent[];
  onNavigateTab: (tabId: string) => void;
}

export const ContextualInspector: React.FC<ContextualInspectorProps> = ({
  selectedAgentId,
  onClose,
  currentRun,
  costs,
  events,
  onNavigateTab,
}) => {
  if (!selectedAgentId) return null;

  const meta = AGENT_VISUALS[selectedAgentId];
  if (!meta) return null;

  const RoleIcon = meta.icon;
  const agentCosts = (costs || []).filter((c) => c.agentRole === selectedAgentId);
  const totalTokens = agentCosts.reduce((acc, c) => acc + (c.tokensPrompt || 0) + (c.tokensCompletion || 0), 0);
  const totalCostUSD = agentCosts.reduce((acc, c) => acc + (c.estimatedCostUSD || 0), 0);
  const agentEvents = (events || []).filter((e) => e.agentRole === selectedAgentId).slice(0, 5);

  const getStageLinkForRole = (role: AgentRoleId): { tab: string; label: string } => {
    switch (role) {
      case "scout":
      case "evidence_auditor":
        return { tab: "evidence", label: "Open Evidence Explorer" };
      case "problem_framer":
        return { tab: "summary", label: "Open Problem Breakdown" };
      case "economic_analyst":
        return { tab: "analytics", label: "Open Economic Scenarios" };
      case "solution_architect":
      case "critic":
      case "revision_agent":
      case "simulation_coordinator":
        return { tab: "solutions", label: "Open Solution Workshop" };
      case "builder":
      case "marketer":
        return { tab: "products", label: "Open Construction Lab & Pitch" };
      default:
        return { tab: "overview", label: "Open 2D Office" };
    }
  };

  const actionLink = getStageLinkForRole(selectedAgentId);

  return (
    <div className="comic-panel w-full bg-surface flex flex-col h-full shadow-[4px_4px_0px_#161716] overflow-hidden">
      {/* Comic Dossier Header */}
      <div className="p-4 border-b-2 border-ink flex items-center justify-between bg-canvas/80">
        <div className="flex items-center gap-3">
          <div
            className="w-16 h-16 rounded border-2 border-ink overflow-hidden bg-surface flex items-center justify-center shadow-[2px_2px_0px_#161716] relative shrink-0"
            style={{ backgroundColor: meta.bgAccent }}
          >
            {meta.defaultImagePath ? (
              <img
                src={meta.defaultImagePath}
                alt={meta.alias}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <RoleIcon className="w-8 h-8 text-ink" />
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-ink flex items-center justify-center shadow-[1px_1px_0px_#161716] z-10">
              <RoleIcon className="w-3 h-3 text-ink" />
            </div>
          </div>
          <div>
            <div className="comic-caption px-1.5 py-0.2 text-[9px] inline-block">
              DOSSIER {"//"} {meta.code}
            </div>
            <div className="text-base font-black font-sans uppercase text-ink">{meta.alias}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 border-2 border-ink bg-surface hover:bg-canvas text-ink transition shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5"
          aria-label="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Station Location & State */}
        <div className="p-3 border-2 border-ink bg-canvas/40 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-muted font-bold uppercase text-[10px]">Station:</span>
            <span className="font-bold text-ink">{meta.stationName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted font-bold uppercase text-[10px]">Status:</span>
            <span
              className={`comic-badge px-2 py-0.5 text-[10px] ${
                currentRun.activeAgent === selectedAgentId
                  ? "bg-[#FEF08A] text-ink animate-pulse"
                  : "bg-surface text-ink"
              }`}
            >
              {currentRun.activeAgent === selectedAgentId ? "ACTIVE MISSION" : "STANDBY"}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-line-light pt-1.5">
            <span className="text-muted font-bold uppercase text-[10px]">Specialty:</span>
            <span className="font-medium text-ink truncate max-w-[200px]">{meta.specialty}</span>
          </div>
        </div>

        {/* Intelligence Router & Cost */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 border-2 border-ink bg-surface shadow-[2px_2px_0px_#161716] space-y-1">
            <div className="text-[10px] uppercase font-bold text-muted flex items-center gap-1">
              <Cpu className="w-3 h-3 text-ink" /> Tokens
            </div>
            <div className="text-sm font-black text-ink">{totalTokens.toLocaleString()}</div>
          </div>

          <div className="p-3 border-2 border-ink bg-surface shadow-[2px_2px_0px_#161716] space-y-1">
            <div className="text-[10px] uppercase font-bold text-muted flex items-center gap-1">
              <Coins className="w-3 h-3 text-ochre" /> Spend
            </div>
            <div className="text-sm font-black text-ink">\${totalCostUSD.toFixed(4)}</div>
          </div>
        </div>

        {/* Recent Station Events */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold uppercase text-ink flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-ink" /> Station Log Transmissions
          </div>

          {agentEvents.length === 0 ? (
            <div className="text-xs font-mono text-muted italic p-3 border-2 border-dashed border-ink/40 bg-canvas/30 text-center">
              No recent logs recorded for this station.
            </div>
          ) : (
            <div className="space-y-2">
              {agentEvents.map((e) => (
                <div
                  key={e.id}
                  className="p-2.5 border-2 border-ink bg-surface shadow-[2px_2px_0px_#161716] text-xs font-mono space-y-1"
                >
                  <div className="text-[10px] text-muted flex justify-between font-bold">
                    <span>{e.type}</span>
                    <span>{new Date(e.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-ink font-medium leading-snug">{e.summary}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Jump to Relevant Workstream */}
        <div className="pt-2">
          <button
            onClick={() => onNavigateTab(actionLink.tab)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 border-2 border-ink bg-[#FEF08A] hover:bg-[#FDE047] shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-ink text-xs font-mono font-black uppercase transition"
          >
            <span>{actionLink.label}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
