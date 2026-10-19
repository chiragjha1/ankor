"use client";

import React from "react";
import { AgentRoleId, AgentStatus, ResearchRun } from "@/types";
import { AgentCharacter, AGENT_VISUALS } from "./AgentCharacter";
import {
  Compass,
  FileCheck2,
  GitBranch,
  Calculator,
  Hammer,
  ShieldAlert,
  Wrench,
  Users2,
  Terminal,
  Megaphone,
  Crown,
  Radio,
  Zap,
} from "lucide-react";

interface AgentWorkspaceProps {
  currentRun: ResearchRun;
  selectedAgentId: AgentRoleId | null;
  onSelectAgent: (agentId: AgentRoleId) => void;
  activeTaskSummary?: string;
}

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({
  currentRun,
  selectedAgentId,
  onSelectAgent,
  activeTaskSummary,
}) => {
  const getAgentStatus = (role: AgentRoleId): AgentStatus => {
    if (currentRun.status === "PAUSED") return "idle";
    if (currentRun.status === "COMPLETED") return "successful";
    if (currentRun.status === "FAILED") {
      return currentRun.activeAgent === role ? "error" : "idle";
    }
    if (currentRun.activeAgent === role) {
      if (role === "critic") return "working";
      if (role === "orchestrator") return "thinking";
      return "working";
    }
    return "idle";
  };

  const AGENTS: { role: AgentRoleId; name: string; title: string }[] = [
    { role: "orchestrator", name: "Captain Sterling", title: "Chief Executive & Orchestrator" },
    { role: "scout", name: "Ranger Knox", title: "Field Evidence Scout" },
    { role: "evidence_auditor", name: "Verity Cross", title: "Evidence & Provenance Auditor" },
    { role: "problem_framer", name: "Silas Thorne", title: "Problem Framing Strategist" },
    { role: "economic_analyst", name: "Julian Price", title: "Quantitative Economic Analyst" },
    { role: "solution_architect", name: "Tess Calder", title: "Minimum Spec Solution Architect" },
    { role: "critic", name: "Malik Vance", title: "Adversarial Critic" },
    { role: "revision_agent", name: "Rowan Finch", title: "Assembly Revision Agent" },
    { role: "simulation_coordinator", name: "Dr. Evelyn Ward", title: "Persona Simulation Coordinator" },
    { role: "builder", name: "Kaelen Forge", title: "Software Construction Builder" },
    { role: "marketer", name: "Astrid Bell", title: "Positioning & Market Distribution" },
  ];

  const activeAgentMeta = currentRun.activeAgent
    ? AGENT_VISUALS[currentRun.activeAgent]
    : AGENT_VISUALS.orchestrator;
  const ActiveIcon = activeAgentMeta.icon;

  return (
    <div className="space-y-5">
      {/* Comic Command Banner: Current Mission & Active Transmission */}
      <div className="comic-panel p-4 md:p-5 bg-surface space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-ink pb-3">
          <div className="flex items-center gap-2">
            <span className="comic-caption px-2.5 py-1 text-xs">
              FIELD DOSSIER {"//"} CHAPTER {currentRun.currentStage.toUpperCase()}
            </span>
            <div className="h-4 w-0.5 bg-ink" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
              Live Investigation
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-bold text-ink">
              <span className="w-2.5 h-2.5 rounded-full bg-forest animate-ping inline-block" />
              STATUS: <span className="uppercase text-forest">{currentRun.status}</span>
            </span>
            <span className="comic-badge px-2 py-0.5 bg-canvas text-ink text-[11px]">
              BUDGET: \${currentRun.cumulativeCostUSD.toFixed(2)} / \${currentRun.constraints.budgetCeilingUSD}
            </span>
          </div>
        </div>

        {/* Active Dispatch Box (Speech/Briefing Panel) */}
        <div className="p-3.5 bg-canvas/70 border-2 border-ink shadow-[2px_2px_0px_#161716] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded border-2 border-ink flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#161716]"
              style={{ backgroundColor: activeAgentMeta.bgAccent }}
            >
              <ActiveIcon className="w-5 h-5 text-ink" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-muted tracking-wide">
                Current Agent on Deck: <strong className="text-ink">{activeAgentMeta.alias}</strong> ({activeAgentMeta.stationName})
              </div>
              <div className="text-sm font-sans font-bold text-ink leading-snug">
                {activeTaskSummary || `Investigating: ${currentRun.name}`}
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-muted shrink-0 text-right">
            Click any character card to inspect logs & stats &rarr;
          </div>
        </div>
      </div>

      {/* Agents Roster Grid (Zero Overlap, Comic Book Panels) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black font-sans uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-forest" /> Company Agent Roster (11 Roles)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted">
            All 11 agent comic avatars active &bull; 2D Floor Synced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {AGENTS.map((agent) => (
            <AgentCharacter
              key={agent.role}
              role={agent.role}
              name={agent.name}
              title={agent.title}
              status={getAgentStatus(agent.role)}
              isActive={currentRun.activeAgent === agent.role}
              currentTaskSummary={currentRun.activeAgent === agent.role ? activeTaskSummary : undefined}
              selected={selectedAgentId === agent.role}
              onClick={() => onSelectAgent(agent.role)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
