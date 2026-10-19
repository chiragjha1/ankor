"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ResearchRun,
  EvidenceItem,
  EvidenceSource,
  ProblemCard,
  EconomicModel,
  SolutionSpec,
  Objection,
  SolutionRevision,
  PersonaTemplate,
  SimulationFeedback,
  ValidationExperiment,
  ProductSpec,
  MarketingArtifact,
  WorkflowEvent,
  ApprovalGate,
  CostRecord,
  SystemSettings,
  AgentRoleId,
} from "@/types";
import { TopNav } from "@/components/navigation/TopNav";
import { TabBar } from "@/components/navigation/TabBar";
import { LandingHero } from "@/components/home/LandingHero";
import { OfficeWorkspace2D } from "@/components/workspace/OfficeWorkspace2D";
import { SimpleResultsView } from "@/components/views/SimpleResultsView";
import { ActivityRail } from "@/components/workspace/ActivityRail";
import { ContextualInspector } from "@/components/workspace/ContextualInspector";
import { EvidenceView } from "@/components/views/EvidenceView";
import { EvidenceGraphView } from "@/components/views/EvidenceGraphView";
import { ProblemsView } from "@/components/views/ProblemsView";
import { SolutionsView } from "@/components/views/SolutionsView";
import { ProductsView } from "@/components/views/ProductsView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { SettingsView } from "@/components/views/SettingsView";
import { NewRunModal } from "@/components/modals/NewRunModal";

export default function DashboardPage() {
  const [hasInvestigated, setHasInvestigated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [runs, setRuns] = useState<ResearchRun[]>([]);
  const [currentRunId, setCurrentRunId] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<AgentRoleId | null>(null);

  // Run detail states
  const [run, setRun] = useState<ResearchRun | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [sources, setSources] = useState<EvidenceSource[]>([]);
  const [problems, setProblems] = useState<ProblemCard[]>([]);
  const [economics, setEconomics] = useState<EconomicModel | undefined>(undefined);
  const [solutions, setSolutions] = useState<SolutionSpec[]>([]);
  const [objections, setObjections] = useState<Objection[]>([]);
  const [revisions, setRevisions] = useState<SolutionRevision[]>([]);
  const [personas, setPersonas] = useState<PersonaTemplate[]>([]);
  const [feedbacks, setFeedbacks] = useState<SimulationFeedback[]>([]);
  const [experiment, setExperiment] = useState<ValidationExperiment | undefined>(undefined);
  const [productSpec, setProductSpec] = useState<ProductSpec | undefined>(undefined);
  const [marketing, setMarketing] = useState<MarketingArtifact[]>([]);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [approvals, setApprovals] = useState<ApprovalGate[]>([]);
  const [costs, setCosts] = useState<CostRecord[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const [isNewRunModalOpen, setIsNewRunModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch runs list
  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch("/api/runs");
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
        if (!currentRunId && data.runs && data.runs.length > 0) {
          setCurrentRunId(data.runs[0].id);
        }
      }
    } catch (err) {
      console.error("[Dashboard] Error fetching runs:", err);
    }
  }, [currentRunId]);

  // Fetch specific run details
  const fetchRunDetail = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/runs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRun(data.run);
        setEvidence(data.evidence || []);
        setSources(data.sources || []);
        setProblems(data.problems || []);
        setEconomics(data.economics);
        setSolutions(data.solutions || []);
        setObjections(data.objections || []);
        setRevisions(data.revisions || []);
        setPersonas(data.personas || []);
        setFeedbacks(data.feedbacks || []);
        setExperiment(data.experiment);
        setProductSpec(data.productSpec);
        setMarketing(data.marketing || []);
        setEvents(data.events || []);
        setApprovals(data.approvals || []);
        setCosts(data.costs || []);
      }
    } catch (err) {
      console.error("[Dashboard] Error fetching run details:", err);
    }
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("[Dashboard] Error fetching settings:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    Promise.all([fetchRuns(), fetchSettings()]).finally(() => setLoading(false));
  }, [fetchRuns, fetchSettings]);

  // When active run changes, load details
  useEffect(() => {
    if (currentRunId) {
      fetchRunDetail(currentRunId);
    }
  }, [currentRunId, fetchRunDetail]);

  // Polling update if run is actively running
  useEffect(() => {
    if (!run) return;
    const isRunning = run.status.includes("ING") || run.status === "RUNNING";
    if (isRunning) {
      const interval = setInterval(() => {
        fetchRunDetail(run.id);
        fetchRuns();
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [run, fetchRunDetail, fetchRuns]);

  // Start autonomous investigation from Hero
  const handleStartInvestigation = async (customIdea?: string) => {
    setIsSettingsOpen(false);
    setHasInvestigated(true);
    setActiveTab("overview");

    const trimmed = (customIdea || "").trim();
    if (trimmed) {
      let targetMarketOrDomain = "B2B SaaS & Software Services";
      const lower = trimmed.toLowerCase();
      if (
        lower.includes("dental") ||
        lower.includes("clinic") ||
        lower.includes("health") ||
        lower.includes("medical")
      ) {
        targetMarketOrDomain = "Healthcare & Private Clinic Operations";
      } else if (
        lower.includes("shopify") ||
        lower.includes("stock") ||
        lower.includes("inventory") ||
        lower.includes("ecommerce") ||
        lower.includes("e-commerce")
      ) {
        targetMarketOrDomain = "E-Commerce & Retail Supply Chain";
      } else if (
        lower.includes("freelance") ||
        lower.includes("invoice") ||
        lower.includes("contractor") ||
        lower.includes("creator")
      ) {
        targetMarketOrDomain = "Freelance & Independent Contractor Operations";
      } else if (
        lower.includes("security") ||
        lower.includes("compliance") ||
        lower.includes("soc2") ||
        lower.includes("audit") ||
        lower.includes("enterprise")
      ) {
        targetMarketOrDomain = "Enterprise Security & Compliance Operations";
      } else if (
        lower.includes("dev") ||
        lower.includes("code") ||
        lower.includes("git") ||
        lower.includes("api") ||
        lower.includes("cloud") ||
        lower.includes("docker")
      ) {
        targetMarketOrDomain = "Developer Tools & Cloud Infrastructure";
      }

      await handleCreateRun({
        name: trimmed.length > 55 ? `${trimmed.slice(0, 52)}...` : trimmed,
        searchBrief: `Investigate customer complaints, user workflows, software friction, and market willingness to pay for: "${trimmed}". Uncover concrete evidence, quantify the economic cost of failure, and assess solution feasibility.`,
        targetMarketOrDomain,
        geography: "Global",
        budgetCeilingUSD: 25,
        timeToFirstRevenueWeeks: 8,
      });
    } else {
      await handleCreateRun({
        name: "Autonomous Market Reconnaissance",
        searchBrief:
          "Mine developer discussions, customer complaints, Reddit r/saas, reviews, and bug trackers to uncover painful user bottlenecks, unmet SaaS needs, and viable software ideas.",
        targetMarketOrDomain: "B2B SaaS & Developer Infrastructure Tools",
        geography: "Global",
        budgetCeilingUSD: 25,
        timeToFirstRevenueWeeks: 8,
      });
    }
  };

  // Handlers
  const handleCreateRun = async (params: {
    name: string;
    searchBrief: string;
    targetMarketOrDomain: string;
    geography: string;
    budgetCeilingUSD: number;
    timeToFirstRevenueWeeks: number;
  }) => {
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      await fetchRuns();
      if (data.run) {
        setCurrentRunId(data.run.id);
        setIsSettingsOpen(false);
        setHasInvestigated(true);
        setActiveTab("overview");
      }
    }
  };

  const handlePauseResume = async () => {
    if (!run) return;
    const action = run.status === "PAUSED" ? "resume" : "pause";
    await fetch(`/api/runs/${run.id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchRunDetail(run.id);
    fetchRuns();
  };

  const handleResetRun = async () => {
    if (!run) return;
    await fetch(`/api/runs/${run.id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_demo" }),
    });
    await fetchRuns();
    if (runs[0]) fetchRunDetail(runs[0].id);
  };

  const handleResolveApproval = async (approvalId: string, status: "APPROVED" | "REJECTED") => {
    await fetch(`/api/approvals/${approvalId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (run) fetchRunDetail(run.id);
  };

  const handleImportEvidence = async (data: { title: string; text: string; author?: string; url?: string }) => {
    if (!run) return;
    await fetch("/api/evidence/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId: run.id, ...data }),
    });
    fetchRunDetail(run.id);
  };

  const handleTriggerSearch = async (query: string, source: "hn" | "github") => {
    if (!run) return;
    await fetch("/api/evidence/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: run.id,
        type: source === "hn" ? "search_hn" : "search_github",
        query,
      }),
    });
    fetchRunDetail(run.id);
  };

  const handleSaveSettings = async (updated: Partial<SystemSettings>) => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings);
    }
  };

  if (loading || !run) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas text-ink font-mono text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-forest animate-ping" />
          <span>Initializing ANKOR Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Top Navigation */}
      <TopNav
        runs={runs}
        currentRun={run}
        onSelectRun={(id) => {
          setCurrentRunId(id);
          setIsSettingsOpen(false);
          setHasInvestigated(true);
        }}
        onNewRunClick={() => setIsNewRunModalOpen(true)}
        onPauseResumeClick={handlePauseResume}
        onResetDemoClick={handleResetRun}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onHomeClick={() => {
          setIsSettingsOpen(false);
          setHasInvestigated(false);
        }}
      />

      {/* STATE 0: Dedicated Settings View without TabBar clutter */}
      {isSettingsOpen ? (
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6">
          {settings && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onClose={() => setIsSettingsOpen(false)}
            />
          )}
        </main>
      ) : !hasInvestigated ? (
        /* STATE 1: Clean, intuitive Hero for new visitors (Before investigation) */
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 flex items-center justify-center">
          <LandingHero onStartInvestigation={handleStartInvestigation} />
        </main>
      ) : (
        /* STATE 2: Investigation Active / Complete */
        <>
          {/* Main Tab Navigation (Unlocked only after investigation has started) */}
          <TabBar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            counts={{
              evidence: evidence.length,
              problems: problems.length,
              solutions: solutions.length,
              feedbacks: feedbacks.length,
            }}
          />

          <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
            {/* TAB 1: 2D LIVING OFFICE WORKSPACE */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* 2D Animated Comic Office (Agents walking to each other in real-time) */}
                <div className="flex flex-col xl:flex-row gap-5 items-start">
                  <div className="flex-1 w-full space-y-4 min-w-0">
                    <OfficeWorkspace2D
                      currentRun={run}
                      selectedAgentId={selectedAgentId}
                      onSelectAgent={(agentRole) =>
                        setSelectedAgentId(selectedAgentId === agentRole ? null : agentRole)
                      }
                      isLiveEngineActive={Boolean(
                        settings?.openRouterApiKey && settings.openRouterApiKey.trim().length > 0
                      )}
                      problems={problems}
                      solutions={solutions}
                      objections={objections}
                      productSpec={productSpec}
                      marketing={marketing}
                      events={events}
                    />

                    {/* Mission Quick Status Strip */}
                    <div className="p-3 bg-[#FEF08A] border-2 border-ink rounded-lg shadow-comic flex flex-wrap items-center justify-between gap-3 text-xs font-comic">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 font-bold uppercase text-ink">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-ink" />
                          <span>Status:</span>
                          <span className="px-2 py-0.5 bg-paper border border-ink text-ink text-[11px] font-bold rounded">
                            {run.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <span className="text-ink/40 hidden sm:inline">&bull;</span>
                        <div className="text-ink font-medium">
                          <span className="font-bold text-ink mr-1">{evidence.length}</span> Evidence Audited
                        </div>
                        <span className="text-ink/40 hidden sm:inline">&bull;</span>
                        <div className="text-ink font-medium">
                          <span className="font-bold text-ink mr-1">{problems.length}</span> Problems Framed
                        </div>
                        {economics && (
                          <>
                            <span className="text-ink/40 hidden sm:inline">&bull;</span>
                            <div className="text-ink flex items-center gap-1.5">
                              <span>Viability:</span>
                              <span
                                className={`px-2 py-0.5 border border-ink text-[11px] font-bold uppercase rounded ${
                                  economics.viabilityVerdict === "VIABLE"
                                    ? "bg-emerald-200 text-emerald-900"
                                    : "bg-red-200 text-red-900"
                                }`}
                              >
                                {economics.viabilityVerdict}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => setActiveTab("summary")}
                        className="px-3 py-1.5 border-2 border-ink bg-paper hover:bg-paper-warm text-ink font-bold text-xs uppercase rounded shadow-comic-sm hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition shrink-0"
                      >
                        Inspect Findings &rarr;
                      </button>
                    </div>

                    {/* Compact Live Activity Wire */}
                    <div className="max-h-48 overflow-y-auto border-2 border-ink rounded-lg shadow-comic bg-paper">
                      <ActivityRail events={events} />
                    </div>
                  </div>

                  {/* Character Dossier Inspector (Only when an agent is clicked) */}
                  {selectedAgentId && (
                    <div className="w-full xl:w-96 shrink-0 h-[560px] sticky top-20">
                      <ContextualInspector
                        selectedAgentId={selectedAgentId}
                        onClose={() => setSelectedAgentId(null)}
                        currentRun={run}
                        costs={costs}
                        events={events}
                        onNavigateTab={(tab) => setActiveTab(tab)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: WHAT WE FOUND (SUMMARY & PROBLEMS) */}
            {(activeTab === "summary" || activeTab === "problems" || activeTab === "discoveries") && (
              <SimpleResultsView
                currentRun={run}
                problems={problems}
                evidence={evidence}
                economics={economics}
                solutions={solutions}
                objections={objections}
                productSpec={productSpec}
                marketing={marketing}
                onOpenAdvancedTab={(tabId) => setActiveTab(tabId)}
              />
            )}

            {/* TAB 3: THE PROOF (EVIDENCE EXPLORER) */}
            {activeTab === "evidence" && (
              <EvidenceView
                evidence={evidence}
                sources={sources}
                runId={run.id}
                onImportEvidence={handleImportEvidence}
                onTriggerSearch={handleTriggerSearch}
              />
            )}

            {/* TAB 3.5: EVIDENCE GRAPH (FALKORDB KNOWLEDGE & PROVENANCE LAYER) */}
            {activeTab === "graph" && (
              <EvidenceGraphView
                runId={run.id}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* TAB 4: THE SOLUTION (WORKSHOP, CRITIQUE & REVISIONS) */}
            {(activeTab === "solutions" || activeTab === "simulations") && (
              <SolutionsView
                solutions={solutions}
                objections={objections}
                revisions={revisions}
              />
            )}

            {/* TAB 5: BUILT SOFTWARE (CODE SANDBOX, DEPLOYMENT & MARKETING) */}
            {(activeTab === "products" || activeTab === "marketing") && (
              <ProductsView
                productSpec={productSpec}
                onAuthorizeDeployment={async () => {
                  const pending = approvals.find((a) => a.type === "DEPLOYMENT" && a.status === "PENDING");
                  if (pending) await handleResolveApproval(pending.id, "APPROVED");
                }}
              />
            )}

            {/* TAB 6: CAN IT MAKE MONEY? (UNIT ECONOMICS & BREAK-EVEN) */}
            {activeTab === "analytics" && (
              <AnalyticsView
                economicModel={economics}
                costs={costs}
              />
            )}
          </main>
        </>
      )}

      {/* New Search Brief Modal */}
      <NewRunModal
        isOpen={isNewRunModalOpen}
        onClose={() => setIsNewRunModalOpen(false)}
        onSubmit={handleCreateRun}
      />
    </div>
  );
}
