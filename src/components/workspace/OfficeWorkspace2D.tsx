/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  AgentRoleId,
  ResearchRun,
  ProblemCard,
  SolutionSpec,
  Objection,
  ProductSpec,
  MarketingArtifact,
  WorkflowEvent,
} from "@/types";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Compass,
  FileCheck2,
  GitBranch,
  Calculator,
  Hammer,
  ShieldAlert,
  Wrench,
  Terminal,
  Megaphone,
  Crown,
  Coffee,
} from "lucide-react";

interface OfficeWorkspace2DProps {
  currentRun: ResearchRun;
  selectedAgentId: AgentRoleId | null;
  onSelectAgent: (agentId: AgentRoleId) => void;
  isLiveEngineActive?: boolean;
  problems?: ProblemCard[];
  solutions?: SolutionSpec[];
  objections?: Objection[];
  productSpec?: ProductSpec | null;
  marketing?: MarketingArtifact[];
  events?: WorkflowEvent[];
}

interface AgentOfficeMeta {
  role: AgentRoleId;
  alias: string;
  roomName: string;
  themeColor: string;
  accentBg: string;
  icon: React.ComponentType<{ className?: string }>;
  homeX: number; // percentage
  homeY: number; // percentage
  avatarImagePath: string;
}

export const OFFICE_AGENTS: Record<AgentRoleId, AgentOfficeMeta> = {
  orchestrator: {
    role: "orchestrator",
    alias: "The Captain",
    roomName: "Command Central",
    themeColor: "#161716",
    accentBg: "#FEF08A",
    icon: Crown,
    homeX: 12,
    homeY: 18,
    avatarImagePath: "/brand/agents/orchestrator.jpg",
  },
  scout: {
    role: "scout",
    alias: "The Scout",
    roomName: "Recon Outpost",
    themeColor: "#15803D",
    accentBg: "#DCFCE7",
    icon: Compass,
    homeX: 32,
    homeY: 18,
    avatarImagePath: "/brand/agents/scout.jpg",
  },
  evidence_auditor: {
    role: "evidence_auditor",
    alias: "The Auditor",
    roomName: "Evidence Vault",
    themeColor: "#0369A1",
    accentBg: "#E0F2FE",
    icon: FileCheck2,
    homeX: 52,
    homeY: 18,
    avatarImagePath: "/brand/agents/evidence_auditor.jpg",
  },
  problem_framer: {
    role: "problem_framer",
    alias: "The Framer",
    roomName: "Problem Lab",
    themeColor: "#7C3AED",
    accentBg: "#F3E8FF",
    icon: GitBranch,
    homeX: 72,
    homeY: 18,
    avatarImagePath: "/brand/agents/problem_framer.jpg",
  },
  economic_analyst: {
    role: "economic_analyst",
    alias: "The Quant",
    roomName: "Numbers Ledger",
    themeColor: "#B45309",
    accentBg: "#FEF3C7",
    icon: Calculator,
    homeX: 90,
    homeY: 18,
    avatarImagePath: "/brand/agents/economic_analyst.jpg",
  },
  simulation_coordinator: {
    role: "simulation_coordinator",
    alias: "The Director",
    roomName: "Water Cooler Lounge",
    themeColor: "#4338CA",
    accentBg: "#EEF2FF",
    icon: Coffee,
    homeX: 50,
    homeY: 48,
    avatarImagePath: "/brand/agents/simulation_coordinator.jpg",
  },
  solution_architect: {
    role: "solution_architect",
    alias: "The Architect",
    roomName: "Blueprints Bay",
    themeColor: "#0F766E",
    accentBg: "#CCFBF1",
    icon: Hammer,
    homeX: 12,
    homeY: 78,
    avatarImagePath: "/brand/agents/solution_architect.jpg",
  },
  critic: {
    role: "critic",
    alias: "The Critic",
    roomName: "Critic's Arena",
    themeColor: "#B91C1C",
    accentBg: "#FEE2E2",
    icon: ShieldAlert,
    homeX: 32,
    homeY: 78,
    avatarImagePath: "/brand/agents/critic.jpg",
  },
  revision_agent: {
    role: "revision_agent",
    alias: "The Hardener",
    roomName: "Hardening Bench",
    themeColor: "#C2410C",
    accentBg: "#FFEDD5",
    icon: Wrench,
    homeX: 52,
    homeY: 78,
    avatarImagePath: "/brand/agents/revision_agent.jpg",
  },
  builder: {
    role: "builder",
    alias: "The Engineer",
    roomName: "Sandbox Depot",
    themeColor: "#047857",
    accentBg: "#D1FAE5",
    icon: Terminal,
    homeX: 72,
    homeY: 78,
    avatarImagePath: "/brand/agents/builder.jpg",
  },
  marketer: {
    role: "marketer",
    alias: "The Herald",
    roomName: "Broadcast Suite",
    themeColor: "#BE185D",
    accentBg: "#FCE7F3",
    icon: Megaphone,
    homeX: 90,
    homeY: 78,
    avatarImagePath: "/brand/agents/marketer.jpg",
  },
};

interface StepDialogue {
  stepNum: number;
  speaker: AgentRoleId;
  target?: AgentRoleId;
  speakerWalkTo?: { x: number; y: number };
  targetWalkTo?: { x: number; y: number };
  bubbleText: string;
  stageName: string;
  summary: string;
}

export const OfficeWorkspace2D: React.FC<OfficeWorkspace2DProps> = ({
  currentRun,
  selectedAgentId,
  onSelectAgent,
  isLiveEngineActive = false,
  problems,
  solutions,
  objections,
  productSpec,
  marketing,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const domainText = currentRun.targetMarketOrDomain || "Target Software Market";
  const problemTitle = problems?.[0]?.title || `Recurring Workflow Friction in ${domainText}`;
  const solutionTitle = solutions?.[0]?.title || `${currentRun.name} Core Solution`;
  const objectionText = objections?.[0]?.description || "Security, privacy, and system bloat concerns";
  const mitigationText = objections?.[0]?.proposedTestOrMitigation || "Client-side validation and zero-custody architecture";
  const pkgName = productSpec?.name || `${currentRun.name} Software Package`;

  const displayDomain = domainText.length > 36 ? `${domainText.slice(0, 33)}...` : domainText;
  const displayProblem = problemTitle.length > 38 ? `${problemTitle.slice(0, 35)}...` : problemTitle;
  const displaySolution = solutionTitle.length > 34 ? `${solutionTitle.slice(0, 31)}...` : solutionTitle;
  const displayObjection = objectionText.length > 34 ? `${objectionText.slice(0, 31)}...` : objectionText;
  const displayMitigation = mitigationText.length > 34 ? `${mitigationText.slice(0, 31)}...` : mitigationText;
  const displayPkg = pkgName.length > 30 ? `${pkgName.slice(0, 27)}...` : pkgName;

  // Office Steps: Agents walking to each other with casual, natural coworker dialogue
  const STEPS: StepDialogue[] = useMemo(
    () => [
      {
        stepNum: 1,
        speaker: "orchestrator",
        target: "scout",
        speakerWalkTo: { x: 14, y: 22 },
        targetWalkTo: { x: 22, y: 22 },
        bubbleText: `Morning everyone. Knox, grab your coffee—let's scour real forum threads and user discussions across ${displayDomain}. What are people actually struggling with?`,
        stageName: "STAGE 1: STREAM RECONNAISSANCE",
        summary: `Captain Sterling tasks Knox with scanning community forums and issue trackers for unvarnished user pain.`,
      },
      {
        stepNum: 2,
        speaker: "scout",
        target: "orchestrator",
        speakerWalkTo: { x: 28, y: 20 },
        targetWalkTo: { x: 14, y: 20 },
        bubbleText: `Already on it, Cap. Found dozens of raw user posts across ${displayDomain}. People are burning hours every week on broken manual handoffs and crashes.`,
        stageName: "STAGE 2: MINING USER BEHAVIOR",
        summary: "Knox combs through public discussions and isolates genuine workflow bottlenecks.",
      },
      {
        stepNum: 3,
        speaker: "scout",
        target: "evidence_auditor",
        speakerWalkTo: { x: 45, y: 20 },
        targetWalkTo: { x: 50, y: 20 },
        bubbleText: `Verity, take a look at these complaint logs. Want to make sure we're looking at genuine user distress and not vendor promotional fluff.`,
        stageName: "STAGE 2: EVIDENCE HAND-OFF",
        summary: "Knox walks the raw evidence files over to Verity's desk for provenance verification.",
      },
      {
        stepNum: 4,
        speaker: "evidence_auditor",
        target: "scout",
        speakerWalkTo: { x: 52, y: 20 },
        targetWalkTo: { x: 44, y: 20 },
        bubbleText: "Checking provenance now... All clean. Found independent corroboration across multiple public threads, zero paid shills, and content hashes match. This pain is 100% genuine.",
        stageName: "STAGE 3: VERIFICATION",
        summary: "Verity audits source independence and confirms authentic, observed complaints.",
      },
      {
        stepNum: 5,
        speaker: "evidence_auditor",
        target: "problem_framer",
        speakerWalkTo: { x: 65, y: 20 },
        targetWalkTo: { x: 72, y: 20 },
        bubbleText: `Silas, evidence is locked into the graph. Time to frame the root cause and figure out where the real money is leaking.`,
        stageName: "STAGE 4: SYNTHESIS",
        summary: "Verity passes audited evidence to Silas Thorne in the Problem Lab.",
      },
      {
        stepNum: 6,
        speaker: "problem_framer",
        target: "economic_analyst",
        speakerWalkTo: { x: 80, y: 20 },
        targetWalkTo: { x: 88, y: 20 },
        bubbleText: `Here's the real breakdown: '${displayProblem}'. People are losing an estimated $${problems?.[0]?.estimatedMoneyLostMonthlyUSD ? problems[0].estimatedMoneyLostMonthlyUSD.toLocaleString() : '1,800'} every month. Julian, can we turn this into a viable business?`,
        stageName: "STAGE 4: PROBLEM FRAMED",
        summary: "Silas isolates the core job-to-be-done and brings the numbers to Julian Price.",
      },
      {
        stepNum: 7,
        speaker: "economic_analyst",
        target: "solution_architect",
        speakerWalkTo: { x: 22, y: 72 },
        targetWalkTo: { x: 14, y: 76 },
        bubbleText: "Just ran the bottom-up numbers. Healthy margins and low break-even—they're burning more on manual labor than our tool would ever cost. Tess, let's architect a clean solution.",
        stageName: "STAGE 5: ECONOMIC VIABILITY",
        summary: "Julian models conservative and base unit economics, confirming healthy LTV/CAC.",
      },
      {
        stepNum: 8,
        speaker: "solution_architect",
        target: "critic",
        speakerWalkTo: { x: 16, y: 76 },
        targetWalkTo: { x: 28, y: 76 },
        bubbleText: `Just sketched out the v1 blueprints for '${displaySolution}'. Lightweight, zero unnecessary bloat, plugs right in. Malik, go ahead and poke holes in it.`,
        stageName: "STAGE 6: SOLUTION DRAFT",
        summary: "Tess Calder unrolls minimum viable solution specs on the drafting table.",
      },
      {
        stepNum: 9,
        speaker: "critic",
        target: "solution_architect",
        speakerWalkTo: { x: 24, y: 76 },
        targetWalkTo: { x: 14, y: 76 },
        bubbleText: `Not so fast, Tess. What about: '${displayObjection}'? If we don't address that upfront, enterprise buyers will reject it before pilot testing.`,
        stageName: "STAGE 7: ADVERSARIAL ATTACK",
        summary: "Malik Vance challenges the architecture, identifying a potential deployment blocker.",
      },
      {
        stepNum: 10,
        speaker: "revision_agent",
        target: "critic",
        speakerWalkTo: { x: 30, y: 76 },
        targetWalkTo: { x: 22, y: 76 },
        bubbleText: `Good catch Malik, already on it. Hardened the spec: '${displayMitigation}'. That completely bypasses the friction point. Version 2 is rock-solid.`,
        stageName: "STAGE 7: REVISION & HARDENING",
        summary: "Rowan Finch refines the architecture, resolving all critical blocking objections.",
      },
      {
        stepNum: 11,
        speaker: "simulation_coordinator",
        target: "revision_agent",
        speakerWalkTo: { x: 42, y: 68 },
        targetWalkTo: { x: 32, y: 76 },
        bubbleText: "Tested the revised flow with our customer personas. The response was overwhelmingly positive—they love that it solves the headache without disrupting their existing routine.",
        stageName: "STAGE 8: SIMULATION",
        summary: "Dr. Ward reviews feedback across target customer simulation profiles.",
      },
      {
        stepNum: 12,
        speaker: "builder",
        target: "marketer",
        speakerWalkTo: { x: 82, y: 78 },
        targetWalkTo: { x: 90, y: 78 },
        bubbleText: `Sandbox build is compiled and running: '${displayPkg}'. Clean API endpoints, test suite passed green, and the whole package is ready to run.`,
        stageName: "STAGE 9: SOFTWARE BUILT",
        summary: "Kaelen Forge verifies the working prototype and passes off to marketing.",
      },
      {
        stepNum: 13,
        speaker: "marketer",
        target: "orchestrator",
        speakerWalkTo: { x: 28, y: 32 },
        targetWalkTo: { x: 14, y: 22 },
        bubbleText: `Launch copy and customer outreach are locked for ${displayDomain}. Clear value proposition, zero marketing hype—just the direct fix for their exact problem.`,
        stageName: "STAGE 10: MARKETING PREPARED",
        summary: "Astrid Bell presents positioning letters and launch strategy to Captain Sterling.",
      },
      {
        stepNum: 14,
        speaker: "orchestrator",
        speakerWalkTo: { x: 38, y: 46 },
        bubbleText: `Tremendous job team! Verified pain, confirmed evidence, healthy unit economics, and working software. Let's inspect the complete findings below!`,
        stageName: "INVESTIGATION COMPLETE",
        summary: "The entire team gathers in the studio with the finalized discovery dossier.",
      },
    ],
    [displayDomain, displayProblem, displaySolution, displayObjection, displayMitigation, displayPkg, problems]
  );

  const currentStep = STEPS[currentStepIndex];

  // Auto-play timeline timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const duration = playbackSpeed === 1 ? 4200 : 2200;
    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, duration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, STEPS.length]);

  // Determine current position of an agent
  const getAgentPosition = (role: AgentRoleId) => {
    const meta = OFFICE_AGENTS[role];
    if (currentStep.speaker === role && currentStep.speakerWalkTo) {
      return currentStep.speakerWalkTo;
    }
    if (currentStep.target === role && currentStep.targetWalkTo) {
      return currentStep.targetWalkTo;
    }
    return { x: meta.homeX, y: meta.homeY };
  };

  const isAgentSpeaking = (role: AgentRoleId) => currentStep.speaker === role;
  const isAgentListening = (role: AgentRoleId) => currentStep.target === role;

  return (
    <div className="comic-panel bg-surface border-2 border-ink shadow-[6px_6px_0px_#161716] overflow-hidden space-y-3">
      {/* Top Controls & Mission Banner */}
      <div className="p-3 bg-canvas/80 border-b-2 border-ink flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="comic-caption px-2.5 py-0.5 text-xs font-bold">
              {currentStep.stageName}
            </span>
            <span className="text-xs font-mono font-bold uppercase text-muted">
              Step {currentStep.stepNum} of {STEPS.length}
            </span>
            <span className="px-2 py-0.5 border border-forest bg-[#DCFCE7] text-[#14532D] text-[10px] font-mono font-black uppercase flex items-center gap-1.5 shadow-[1px_1px_0px_#161716]">
              <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
              LIVE OPENROUTER ENGINE
            </span>
          </div>
          <div className="text-xs sm:text-sm font-sans font-black uppercase text-ink truncate">
            {currentStep.summary}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 border-2 border-ink bg-surface hover:bg-[#FEF08A] text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-ink" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-ink fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (currentStepIndex < STEPS.length - 1) {
                setCurrentStepIndex((prev) => prev + 1);
              }
            }}
            disabled={currentStepIndex >= STEPS.length - 1}
            className="px-3 py-1.5 border-2 border-ink bg-surface hover:bg-canvas disabled:opacity-40 text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>Next</span>
            <SkipForward className="w-3.5 h-3.5 text-ink" />
          </button>

          <button
            onClick={() => {
              setCurrentStepIndex(0);
              setIsPlaying(true);
            }}
            title="Restart Office Simulation"
            className="p-1.5 border-2 border-ink bg-surface hover:bg-canvas text-xs font-mono font-bold uppercase transition shadow-[2px_2px_0px_#161716]"
          >
            <RotateCcw className="w-4 h-4 text-ink" />
          </button>

          <button
            onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
            className="px-2.5 py-1.5 border-2 border-ink bg-surface hover:bg-[#FEF08A] text-[10px] font-mono font-black uppercase shadow-[2px_2px_0px_#161716]"
          >
            {playbackSpeed}x SPEED
          </button>
        </div>
      </div>

      {/* 2D Office Floor Map (Interactive Canvas) - Matching Noir Pinboard */}
      <div className="relative w-full h-[390px] sm:h-[430px] md:h-[460px] max-h-[calc(100vh-230px)] bg-[#181614] border-2 border-ink mx-auto overflow-hidden select-none">
        {/* Authentic Noir Pinboard Cork Texture with Granules & Subtle Detective Grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="office-cork-specks" width="64" height="64" patternUnits="userSpaceOnUse">
              <rect width="64" height="64" fill="#181614" />
              <circle cx="8" cy="14" r="1.5" fill="#2d2823" />
              <circle cx="28" cy="8" r="2" fill="#231f1a" />
              <circle cx="44" cy="22" r="1.2" fill="#363029" />
              <circle cx="56" cy="10" r="1.8" fill="#1f1c18" />
              <circle cx="16" cy="40" r="2.2" fill="#2e2924" />
              <circle cx="36" cy="48" r="1.4" fill="#3b342c" />
              <circle cx="52" cy="38" r="2" fill="#26221c" />
              <circle cx="10" cy="58" r="1.2" fill="#322c25" />
              <circle cx="42" cy="60" r="1.8" fill="#2a251f" />
              <circle cx="60" cy="54" r="1.5" fill="#3d362e" />
            </pattern>
            <pattern id="office-cork-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#36302a" strokeWidth="0.75" strokeDasharray="3 3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#office-cork-specks)" />
          <rect width="100%" height="100%" fill="url(#office-cork-grid)" opacity="0.6" />
        </svg>

        {/* Vignette Shadow Overlay for Moody Noir Ambiance */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(24, 22, 20, 0.2) 0%, rgba(10, 9, 8, 0.85) 100%)",
          }}
        />

        {/* Room Partition Walls */}
        <div className="absolute top-[38%] left-0 right-0 h-0.5 bg-[#FEF08A]/10 border-b border-dashed border-[#FEF08A]/25 pointer-events-none" />
        <div className="absolute top-[62%] left-0 right-0 h-0.5 bg-[#FEF08A]/10 border-b border-dashed border-[#FEF08A]/25 pointer-events-none" />

        {/* Room Labels & Evidence Tags */}
        <div className="absolute top-2 left-3 px-2 py-1 border border-ink bg-[#FAF9F5] shadow-[2px_2px_0px_#000000] text-[9px] font-mono font-black text-ink uppercase z-10">
          Command Suite &bull; The Captain
        </div>
        <div className="absolute top-2 left-[25%] px-2 py-1 border border-ink bg-[#FAF9F5] shadow-[2px_2px_0px_#000000] text-[9px] font-mono font-black text-ink uppercase z-10">
          Recon Radar &bull; The Scout
        </div>
        <div className="absolute top-2 left-[45%] px-2 py-1 border border-ink bg-[#FAF9F5] shadow-[2px_2px_0px_#000000] text-[9px] font-mono font-black text-ink uppercase z-10">
          Evidence Vault &bull; The Auditor
        </div>
        <div className="absolute top-2 left-[66%] px-2 py-1 border border-ink bg-[#FAF9F5] shadow-[2px_2px_0px_#000000] text-[9px] font-mono font-black text-ink uppercase z-10">
          Problem Lab &bull; The Framer
        </div>
        <div className="absolute top-2 right-3 px-2 py-1 border border-ink bg-[#FAF9F5] shadow-[2px_2px_0px_#000000] text-[9px] font-mono font-black text-ink uppercase z-10">
          Ledger &bull; The Quant
        </div>

        {/* Middle Lounge: Water Cooler */}
        <div className="absolute top-[34%] left-1/2 -translate-x-1/2 px-3 py-1 border-2 border-ink bg-[#FEF08A] shadow-[2px_2px_0px_#000000] text-center text-[9px] font-mono font-black text-ink uppercase tracking-wider pointer-events-none z-10">
          Breakroom &bull; Water Cooler Lounge
        </div>

        {/* Bottom Rooms */}
        <div className="absolute bottom-2 left-3 px-2 py-1 border border-ink bg-[#FAF9F5] shadow-[2px_2px_0px_#000000] text-[9px] font-mono font-black text-ink uppercase z-10">
          Blueprints &bull; The Architect
        </div>
        <div className="absolute bottom-2 left-[25%] px-2 py-1 border border-ink bg-[#FAF9F5] shadow-[2px_2px_0px_#000000] text-[9px] font-mono font-black text-ink uppercase z-10">
          Critic Arena &bull; The Critic
        </div>
        <div className="absolute bottom-2 left-[45%] px-2 py-1 border border-ink bg-[#FAF9F5] shadow-[2px_2px_0px_#000000] text-[9px] font-mono font-black text-ink uppercase z-10">
          Hardening &bull; The Hardener
        </div>
        <div className="absolute bottom-2 left-[66%] px-2 py-1 border border-ink bg-[#FAF9F5] shadow-[2px_2px_0px_#000000] text-[9px] font-mono font-black text-ink uppercase z-10">
          Sandbox Depot &bull; The Engineer
        </div>
        <div className="absolute bottom-2 right-3 px-2 py-1 border border-ink bg-[#FAF9F5] shadow-[2px_2px_0px_#000000] text-[9px] font-mono font-black text-ink uppercase z-10">
          Broadcast &bull; The Herald
        </div>

        {/* Desks / Minimal Docking Station Pads on Floor */}
        {Object.values(OFFICE_AGENTS).map((agent) => (
          <div
            key={`desk-${agent.role}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-5 border border-[#b4975a]/30 bg-[#241f1a]/80 rounded-sm pointer-events-none flex items-center justify-center shadow-[1px_1px_0px_#000000]"
            style={{ left: `${agent.homeX}%`, top: `${agent.homeY + 4}%` }}
          >
            <div className="w-4 h-0.5 bg-[#FEF08A]/30 rounded-full" />
          </div>
        ))}

        {/* 2D Animated Agents */}
        {Object.values(OFFICE_AGENTS).map((agent) => {
          const pos = getAgentPosition(agent.role);
          const speaking = isAgentSpeaking(agent.role);
          const listening = isAgentListening(agent.role);
          const isSelected = selectedAgentId === agent.role;
          const AgentIcon = agent.icon;
          // Upper half agents (<= 48% height) point speech bubble downwards into open floor;
          // Lower half agents (> 48%) point speech bubble upwards into open floor
          const isTopHalf = pos.y <= 48;
          const horizontalClass =
            pos.x <= 25
              ? "left-0 translate-x-0"
              : pos.x >= 75
              ? "right-0 translate-x-0"
              : "left-1/2 -translate-x-1/2";
          const tailClass =
            pos.x <= 25
              ? "left-8"
              : pos.x >= 75
              ? "right-8"
              : "left-1/2 -translate-x-1/2";

          return (
            <div
              key={agent.role}
              onClick={() => onSelectAgent(agent.role)}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transition: "left 1.4s cubic-bezier(0.34, 1.56, 0.64, 1), top 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                speaking ? "z-50" : isSelected ? "z-30" : "z-20"
              } cursor-pointer group`}
            >
              {/* SPEECH BUBBLE - Always on top (z-[70]), wider sizing so conversations fit completely */}
              {speaking && (
                <div
                  className={`absolute ${horizontalClass} ${
                    isTopHalf ? "top-full mt-3.5" : "bottom-full mb-3.5"
                  } w-[280px] sm:w-[340px] md:w-[380px] max-w-[calc(100vw-40px)] p-3 sm:p-3.5 bg-[#FAF9F5] border-2 border-ink shadow-[5px_5px_0px_#000000] rounded-md z-[70] animate-in fade-in zoom-in-95 pointer-events-none`}
                  style={{
                    transformOrigin: isTopHalf ? "top center" : "bottom center",
                  }}
                >
                  <div className="text-[9px] font-mono font-black uppercase text-muted tracking-wider mb-1.5 flex items-center justify-between border-b border-ink/20 pb-1">
                    <span className="text-ink font-bold">{agent.alias}</span>
                    <span className="text-emerald-700 font-bold tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      TRANSMITTING
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-sans font-bold text-ink leading-snug break-words">
                    {currentStep.bubbleText}
                  </div>
                  {/* Tail pointing toward agent */}
                  {isTopHalf ? (
                    <>
                      <div
                        className={`absolute bottom-full ${tailClass} w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-ink`}
                        style={{ marginBottom: "-1px" }}
                      />
                      <div
                        className={`absolute bottom-full ${tailClass} w-0 h-0 border-x-[7px] border-x-transparent border-b-[7px] border-b-[#FAF9F5]`}
                        style={{ marginBottom: "-2px" }}
                      />
                    </>
                  ) : (
                    <>
                      <div
                        className={`absolute top-full ${tailClass} w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-ink`}
                        style={{ marginTop: "-1px" }}
                      />
                      <div
                        className={`absolute top-full ${tailClass} w-0 h-0 border-x-[7px] border-x-transparent border-t-[7px] border-t-[#FAF9F5]`}
                        style={{ marginTop: "-2px" }}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Listening Attention Marker */}
              {listening && !speaking && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#FEF08A] border border-ink text-[9px] font-black font-mono uppercase shadow-[1px_1px_0px_#000000] animate-bounce z-30">
                  LISTENING!
                </div>
              )}

              {/* Character Avatar Token */}
              <div
                className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-ink bg-surface flex items-center justify-center transition-transform duration-300 ${
                  speaking
                    ? "ring-4 ring-[#FEF08A] scale-110 shadow-[4px_4px_0px_#000000]"
                    : listening
                    ? "scale-105 shadow-[3px_3px_0px_#000000]"
                    : "shadow-[2px_2px_0px_#000000] hover:scale-105"
                } ${isSelected ? "ring-2 ring-ink ring-offset-2" : ""}`}
                style={{ backgroundColor: agent.accentBg }}
              >
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                  {agent.avatarImagePath ? (
                    <img
                      src={agent.avatarImagePath}
                      alt={agent.alias}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <AgentIcon className="w-8 h-8 text-ink stroke-[2.2]" />
                  )}
                </div>

                {/* Corner role badge instead of obscuring the face */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-ink flex items-center justify-center shadow-[1px_1px_0px_#000000] z-10 pointer-events-none">
                  <AgentIcon className="w-3 h-3 text-ink stroke-[2.2]" />
                </div>

                {/* Live Activity Pulse Ring */}
                {speaking && (
                  <span className="absolute -inset-1 rounded-full border-2 border-[#FEF08A] animate-ping opacity-75 pointer-events-none z-20" />
                )}
              </div>

              {/* Character Name Tag Banner */}
              <div className="mt-1 px-1.5 py-0.5 bg-[#FAF9F5] border border-ink text-center shadow-[1px_1px_0px_#000000] rounded-sm max-w-[95px] mx-auto truncate">
                <span className="text-[9px] font-mono font-black uppercase text-ink block leading-none">
                  {agent.alias.replace("The ", "")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Tracker Pips */}
      <div className="p-3 bg-canvas/60 border-t-2 border-ink flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-[10px] font-mono font-bold uppercase text-muted shrink-0">
          Mission Timeline:
        </span>
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, idx) => (
            <button
              key={s.stepNum}
              onClick={() => {
                setCurrentStepIndex(idx);
                setIsPlaying(false);
              }}
              title={`Step ${s.stepNum}: ${s.stageName}`}
              className={`h-2.5 rounded-sm transition-all border border-ink ${
                currentStepIndex === idx
                  ? "w-8 bg-[#FEF08A] shadow-[1px_1px_0px_#161716]"
                  : idx < currentStepIndex
                  ? "w-4 bg-ink/70"
                  : "w-3 bg-white"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] font-mono font-black text-ink shrink-0">
          {Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}% COMPLETE
        </span>
      </div>
    </div>
  );
};
