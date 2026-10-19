/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { AgentRoleId, AgentStatus } from "@/types";
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
} from "lucide-react";

interface AgentCharacterProps {
  role: AgentRoleId;
  name: string;
  title: string;
  status: AgentStatus;
  isActive: boolean;
  currentTaskSummary?: string;
  selected?: boolean;
  customImage?: string;
  onClick: () => void;
}

export const AGENT_VISUALS: Record<
  AgentRoleId,
  {
    code: string;
    alias: string;
    specialty: string;
    themeColor: string;
    bgAccent: string;
    icon: React.ComponentType<{ className?: string }>;
    stationName: string;
    defaultImagePath: string;
  }
> = {
  orchestrator: {
    code: "COMMANDER",
    alias: "The Captain",
    specialty: "Mission Governance & Decisions",
    themeColor: "#161716",
    bgAccent: "#FEF08A", // Comic Yellow
    icon: Crown,
    stationName: "Command Central",
    defaultImagePath: "/brand/agents/orchestrator.jpg",
  },
  scout: {
    code: "RECON",
    alias: "The Scout",
    specialty: "External Source Mining",
    themeColor: "#15803D",
    bgAccent: "#DCFCE7", // Comic Light Green
    icon: Compass,
    stationName: "Public Source Outpost",
    defaultImagePath: "/brand/agents/scout.jpg",
  },
  evidence_auditor: {
    code: "INSPECTOR",
    alias: "The Auditor",
    specialty: "Provenance & Epistemic Audit",
    themeColor: "#1D4ED8",
    bgAccent: "#DBEAFE", // Comic Light Blue
    icon: FileCheck2,
    stationName: "Evidence Pinboard",
    defaultImagePath: "/brand/agents/evidence_auditor.jpg",
  },
  problem_framer: {
    code: "STRATEGIST",
    alias: "The Framer",
    specialty: "Pain Cluster Synthesis",
    themeColor: "#B45309",
    bgAccent: "#FEF3C7", // Amber
    icon: GitBranch,
    stationName: "Problem Workshop",
    defaultImagePath: "/brand/agents/problem_framer.jpg",
  },
  economic_analyst: {
    code: "CALCULATOR",
    alias: "The Analyst",
    specialty: "Unit Economics & Margins",
    themeColor: "#047857",
    bgAccent: "#D1FAE5", // Emerald
    icon: Calculator,
    stationName: "Financial Ledger",
    defaultImagePath: "/brand/agents/economic_analyst.jpg",
  },
  solution_architect: {
    code: "ARCHITECT",
    alias: "The Builder",
    specialty: "Minimum Feasible Spec",
    themeColor: "#4338CA",
    bgAccent: "#E0E7FF", // Indigo
    icon: Hammer,
    stationName: "Drafting Table",
    defaultImagePath: "/brand/agents/solution_architect.jpg",
  },
  critic: {
    code: "EXECUTIONER",
    alias: "The Critic",
    specialty: "Adversarial Falsification",
    themeColor: "#B91C1C",
    bgAccent: "#FEE2E2", // Comic Red
    icon: ShieldAlert,
    stationName: "Critique Bench",
    defaultImagePath: "/brand/agents/critic.jpg",
  },
  revision_agent: {
    code: "MECHANIC",
    alias: "The Revisor",
    specialty: "Hardening & Mitigation",
    themeColor: "#7C3AED",
    bgAccent: "#EDE9FE", // Purple
    icon: Wrench,
    stationName: "Repair Assembly",
    defaultImagePath: "/brand/agents/revision_agent.jpg",
  },
  simulation_coordinator: {
    code: "PROFILER",
    alias: "The Coordinator",
    specialty: "Multi-Persona Simulation",
    themeColor: "#0F766E",
    bgAccent: "#CCFBF1", // Teal
    icon: Users2,
    stationName: "Simulation Chamber",
    defaultImagePath: "/brand/agents/simulation_coordinator.jpg",
  },
  builder: {
    code: "ENGINEER",
    alias: "The Coder",
    specialty: "Code & Quality Verification",
    themeColor: "#0284C7",
    bgAccent: "#E0F2FE", // Sky
    icon: Terminal,
    stationName: "Terminal Deck",
    defaultImagePath: "/brand/agents/builder.jpg",
  },
  marketer: {
    code: "HERALD",
    alias: "The Marketer",
    specialty: "Positioning & Distribution",
    themeColor: "#BE185D",
    bgAccent: "#FCE7F3", // Pink
    icon: Megaphone,
    stationName: "Press Broadcast",
    defaultImagePath: "/brand/agents/marketer.jpg",
  },
};

export const AgentCharacter: React.FC<AgentCharacterProps> = ({
  role,
  name,
  title,
  status,
  isActive,
  currentTaskSummary,
  selected,
  customImage,
  onClick,
}) => {
  const meta = AGENT_VISUALS[role] || AGENT_VISUALS.orchestrator;
  const RoleIcon = meta.icon;

  const imageSrc = customImage || meta.defaultImagePath;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative group flex flex-col cursor-pointer transition-all duration-150 select-none comic-panel ${
        selected
          ? "ring-4 ring-ink border-2 border-ink -translate-y-1 shadow-[5px_5px_0px_#161716] bg-surface"
          : isActive
          ? "border-2 border-ink shadow-[4px_4px_0px_#161716] bg-surface hover:-translate-y-0.5"
          : "border-2 border-ink shadow-[3px_3px_0px_#161716] bg-surface hover:bg-canvas/40 hover:-translate-y-0.5"
      }`}
      aria-label={`${name} (${meta.alias}) - Status: ${status}`}
    >
      {/* Comic Header Stamp */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b-2 border-ink bg-canvas/80 text-[10px] font-mono font-bold tracking-wider uppercase">
        <span className="flex items-center gap-1 truncate text-ink">
          <RoleIcon className="w-3 h-3 text-ink shrink-0" />
          <span className="truncate">{meta.code}</span>
        </span>
        <span
          className={`px-1.5 py-0.2 border border-ink text-[9px] font-black uppercase ${
            status === "working" || isActive
              ? "bg-[#FEF08A] text-ink animate-pulse"
              : status === "successful"
              ? "bg-[#DCFCE7] text-ink"
              : status === "blocked" || status === "error"
              ? "bg-[#FEE2E2] text-ink"
              : "bg-surface text-muted"
          }`}
        >
          {status === "working" || isActive ? "ACTIVE" : status}
        </span>
      </div>

      {/* Main Character Portrait Box (Comic Panel Frame) */}
      <div
        className="relative h-36 w-full flex items-center justify-center overflow-hidden border-b-2 border-ink p-3"
        style={{ backgroundColor: meta.bgAccent }}
      >
        {/* Comic Halftone Dot Texture Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(#161716 1px, transparent 1px)`,
            backgroundSize: "8px 8px",
          }}
        />

        {/* 2D Comic Character Figure with Avatar Image */}
        <div className={`relative flex flex-col items-center justify-center ${isActive ? "anim-work" : "anim-idle"}`}>
          {/* Character Head & Avatar Ring */}
          <div className="relative w-20 h-20 rounded-full border-2 border-ink bg-surface shadow-[3px_3px_0px_#161716] flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <RoleIcon className="w-8 h-8 text-ink" />
              )}
            </div>
            {/* Corner Pin Role Badge */}
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white border border-ink flex items-center justify-center shadow-[1px_1px_0px_#161716] z-20 pointer-events-none">
              <RoleIcon className="w-3.5 h-3.5 text-ink" />
            </div>
          </div>

          {/* Character Body Plate */}
          <div className="w-24 h-6 border-2 border-ink bg-surface rounded-t-lg -mt-1 shadow-[2px_2px_0px_#161716] flex items-center justify-center z-10">
            <span className="text-[9px] font-black font-mono tracking-widest text-ink uppercase">
              {meta.alias}
            </span>
          </div>
        </div>

        {/* Speech Balloon when Active */}
        {isActive && currentTaskSummary && (
          <div className="absolute top-2 inset-x-2 z-20 px-2 py-1 bg-surface border-2 border-ink shadow-[2px_2px_0px_#161716] text-[10px] font-mono font-bold text-ink truncate text-center">
            <span className="truncate block">&gt; {currentTaskSummary}</span>
          </div>
        )}
      </div>

      {/* Card Footer: Name & Assigned Station */}
      <div className="p-3 bg-surface space-y-1">
        <div className="text-sm font-black font-sans uppercase text-ink tracking-tight truncate">
          {name}
        </div>
        <div className="text-[11px] font-mono text-ink-muted truncate font-medium">
          {meta.stationName}
        </div>
        <div className="text-[10px] font-mono text-muted truncate border-t border-line-light pt-1 mt-1">
          {meta.specialty}
        </div>
      </div>
    </div>
  );
};
