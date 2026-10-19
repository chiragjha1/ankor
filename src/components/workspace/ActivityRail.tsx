"use client";

import React from "react";
import { WorkflowEvent } from "@/types";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
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
} from "lucide-react";

interface ActivityRailProps {
  events: WorkflowEvent[];
}

export const ActivityRail: React.FC<ActivityRailProps> = ({ events }) => {
  const getEventIcon = (event: WorkflowEvent) => {
    switch (event.agentRole) {
      case "scout":
        return <Compass className="w-3.5 h-3.5 text-blue-700" />;
      case "evidence_auditor":
        return <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />;
      case "problem_framer":
        return <GitBranch className="w-3.5 h-3.5 text-purple-700" />;
      case "economic_analyst":
        return <Calculator className="w-3.5 h-3.5 text-amber-700" />;
      case "solution_architect":
        return <Hammer className="w-3.5 h-3.5 text-indigo-700" />;
      case "critic":
        return <ShieldAlert className="w-3.5 h-3.5 text-red-700" />;
      case "revision_agent":
        return <Wrench className="w-3.5 h-3.5 text-orange-700" />;
      case "simulation_coordinator":
        return <Users2 className="w-3.5 h-3.5 text-cyan-700" />;
      case "builder":
        return <Terminal className="w-3.5 h-3.5 text-teal-700" />;
      case "marketer":
        return <Megaphone className="w-3.5 h-3.5 text-pink-700" />;
      default:
        if (event.severity === "error") return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
        if (event.severity === "success") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
        return <Info className="w-3.5 h-3.5 text-ink/50" />;
    }
  };

  return (
    <div className="w-full bg-paper flex flex-col h-[320px]">
      {/* Header */}
      <div className="px-4 py-2 border-b-2 border-ink bg-paper-warm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-comic font-bold uppercase tracking-wider text-ink">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Live Investigation Wire</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink/70">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-ink uppercase">Live Feed ({events.length})</span>
        </div>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {(!events || events.length === 0) ? (
          <div className="text-xs font-comic text-ink/50 italic text-center p-6">
            No events logged yet.
          </div>
        ) : (
          (events || []).slice(0, 30).map((evt) => {
            const timeStr = new Date(evt.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            return (
              <div
                key={evt.id}
                className="flex items-start gap-2.5 text-xs font-comic p-2 border border-ink/30 bg-paper-warm/50 hover:bg-paper-warm transition rounded shadow-sm"
              >
                <div className="mt-0.5 shrink-0 p-1 border border-ink/40 bg-paper rounded">
                  {getEventIcon(evt)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] font-mono text-ink/70 mb-0.5">
                    <span className="font-bold uppercase tracking-wider text-ink">
                      {evt.agentRole || "SYSTEM"} &bull; {evt.stage || "ORCHESTRATION"}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-ink/50">
                      <Clock className="w-3 h-3" />
                      {timeStr}
                    </span>
                  </div>
                  <div className="text-ink font-comic text-xs leading-relaxed font-medium">{evt.summary}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
