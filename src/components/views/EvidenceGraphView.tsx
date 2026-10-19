"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  GraphNode,
  GraphEdge,
  GraphData,
  GraphStats,
  ProvenanceRecord,
  ContradictionItem,
} from "@/types";
import {
  Network,
  RefreshCw,
  Search,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Fingerprint,
  ExternalLink,
  Cpu,
  Database,
  Hash,
  Activity,
  FileText,
  SlidersHorizontal,
} from "lucide-react";

interface EvidenceGraphViewProps {
  runId: string;
  onNavigateTab?: (tab: string) => void;
}

interface GraphApiResponse {
  ok: boolean;
  graph: GraphData;
  stats: GraphStats;
  syncState: { status: string; lastSyncedAt?: string; syncCount: number };
  provenance: ProvenanceRecord | null;
  contradictions: ContradictionItem[];
  entities: Array<{ id: string; name: string; category: string; claimCount: number }>;
  independentSources: Array<{ id: string; name: string; url?: string; type: string }>;
  selectedProblemId?: string;
  error?: string;
}

interface HealthApiResponse {
  ok: boolean;
  health: {
    connected: boolean;
    database: string;
    latencyMs: number;
    serverVersion?: string;
    nodeCount: number;
    edgeCount: number;
    memoryNodeCount?: number;
    memoryEdgeCount?: number;
    error?: string;
  };
  fallbackActive: boolean;
}

export const EvidenceGraphView: React.FC<EvidenceGraphViewProps> = ({
  runId,
  onNavigateTab,
}) => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"visual" | "provenance" | "contradictions" | "entities">("visual");

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [stats, setStats] = useState<GraphStats>({
    nodeCount: 0,
    edgeCount: 0,
    sourcesCount: 0,
    evidenceCount: 0,
    claimsCount: 0,
    problemsCount: 0,
    solutionsCount: 0,
    entitiesCount: 0,
    contradictionsCount: 0,
    syncStatus: "SYNCED",
  });
  const [health, setHealth] = useState<HealthApiResponse["health"] | null>(null);
  const [fallbackActive, setFallbackActive] = useState(true);
  const [provenance, setProvenance] = useState<ProvenanceRecord | null>(null);
  const [contradictions, setContradictions] = useState<ContradictionItem[]>([]);
  const [entities, setEntities] = useState<Array<{ id: string; name: string; category: string; claimCount: number }>>([]);
  const [independentSources, setIndependentSources] = useState<Array<{ id: string; name: string; url?: string; type: string }>>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch FalkorDB health status
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/graph/health");
      if (res.ok) {
        const data: HealthApiResponse = await res.json();
        setHealth(data.health);
        setFallbackActive(data.fallbackActive);
      }
    } catch (err) {
      console.warn("[EvidenceGraphView] Health check error:", err);
      setFallbackActive(true);
    }
  }, []);

  // Fetch project graph data
  const fetchGraphData = useCallback(async () => {
    try {
      const res = await fetch(`/api/graph/${runId}`);
      if (res.ok) {
        const data: GraphApiResponse = await res.json();
        setGraphData(data.graph || { nodes: [], edges: [] });
        setStats(data.stats || {
          nodeCount: 0,
          edgeCount: 0,
          sourcesCount: 0,
          evidenceCount: 0,
          claimsCount: 0,
          problemsCount: 0,
          solutionsCount: 0,
          entitiesCount: 0,
          contradictionsCount: 0,
          syncStatus: "SYNCED",
        });
        setProvenance(data.provenance || null);
        setContradictions(data.contradictions || []);
        setEntities(data.entities || []);
        setIndependentSources(data.independentSources || []);

        if (!selectedNodeId && data.graph.nodes.length > 0) {
          const problemNode = data.graph.nodes.find((n) => n.type === "Problem");
          setSelectedNodeId(problemNode ? problemNode.id : data.graph.nodes[0].id);
        }
      }
    } catch (err) {
      console.error("[EvidenceGraphView] Fetch graph error:", err);
    } finally {
      setLoading(false);
    }
  }, [runId, selectedNodeId]);

  useEffect(() => {
    fetchHealth();
    fetchGraphData();
  }, [fetchHealth, fetchGraphData]);

  // Trigger manual sync
  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/graph/${runId}`, { method: "POST" });
      if (res.ok) {
        await Promise.all([fetchHealth(), fetchGraphData()]);
      }
    } catch (err) {
      console.error("[EvidenceGraphView] Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  // Filter nodes for Visual View
  const filteredNodes = useMemo(() => {
    return graphData.nodes.filter((node) => {
      const matchesType = filterType === "ALL" || node.type === filterType;
      const matchesSearch =
        searchQuery === "" ||
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(node.properties?.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [graphData.nodes, filterType, searchQuery]);

  const selectedNode = useMemo(() => {
    return graphData.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [graphData.nodes, selectedNodeId]);

  // Connected edges for selected node
  const selectedNodeEdges = useMemo(() => {
    if (!selectedNodeId) return { incoming: [], outgoing: [] };
    const outgoing = graphData.edges.filter((e) => e.source === selectedNodeId);
    const incoming = graphData.edges.filter((e) => e.target === selectedNodeId);
    return { incoming, outgoing };
  }, [graphData.edges, selectedNodeId]);

  // Helper for node badge styling
  const getNodeColor = (type: string) => {
    switch (type) {
      case "Source":
        return "bg-[#DCFCE7] text-[#14532D] border-[#14532D]";
      case "Evidence":
        return "bg-[#E0F2FE] text-[#0369A1] border-[#0369A1]";
      case "Claim":
        return "bg-[#FEF08A] text-[#854D0E] border-[#854D0E]";
      case "Problem":
        return "bg-[#FEE2E2] text-[#991B1B] border-[#991B1B]";
      case "Solution":
        return "bg-[#FFEDD5] text-[#9A3412] border-[#9A3412]";
      case "Objection":
        return "bg-[#F3E8FF] text-[#6B21A8] border-[#6B21A8]";
      case "Entity":
        return "bg-[#F1F5F9] text-[#334155] border-[#334155]";
      default:
        return "bg-surface text-ink border-ink";
    }
  };

  const getEpistemicBadgeColor = (status?: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-[#DCFCE7] text-[#14532D] border-[#14532D]";
      case "OBSERVED":
        return "bg-[#FEF08A] text-[#854D0E] border-[#854D0E]";
      case "INFERRED":
        return "bg-[#E0F2FE] text-[#0369A1] border-[#0369A1]";
      case "ASSUMED":
        return "bg-[#FFEDD5] text-[#9A3412] border-[#9A3412]";
      case "SIMULATED":
        return "bg-[#F3E8FF] text-[#6B21A8] border-[#6B21A8]";
      default:
        return "bg-canvas text-muted border-ink";
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* HEADER / STATUS BAR */}
      <div className="bg-surface border-2 border-ink shadow-[4px_4px_0px_#161716] p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 bg-ink text-white border border-ink">
                <Network className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-mono font-black uppercase tracking-wider text-ink">
                FalkorDB Evidence & Knowledge Graph
              </h2>
              {/* Connection status badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold uppercase border-2 ${
                  fallbackActive
                    ? "bg-[#FEF08A] text-ink border-ink"
                    : "bg-[#DCFCE7] text-[#14532D] border-[#14532D]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    fallbackActive ? "bg-amber-500 animate-pulse" : "bg-emerald-600"
                  }`}
                />
                <span>
                  {fallbackActive
                    ? "OFFLINE (Memory Graph Fallback Active)"
                    : `ONLINE [${health?.database || "ankor"}] (${health?.latencyMs || 0}ms)`}
                </span>
              </div>
            </div>
            <p className="text-xs font-mono text-muted">
              Authoritative OpenCypher evidence graph maintaining epistemic classifications, provenance chains, and independent corroboration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTriggerSync}
              disabled={syncing}
              className="flex items-center gap-2 px-3 py-2 bg-canvas hover:bg-surface border-2 border-ink shadow-[2px_2px_0px_#161716] text-xs font-mono font-bold uppercase active:translate-x-0.5 active:translate-y-0.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Syncing..." : "Sync Graph"}</span>
            </button>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("evidence")}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#FEF08A] hover:bg-[#FDE047] border-2 border-ink shadow-[2px_2px_0px_#161716] text-xs font-mono font-bold uppercase active:translate-x-0.5 active:translate-y-0.5 transition"
              >
                <span>Proof Log &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4 pt-4 border-t-2 border-ink">
          <div className="p-2.5 bg-canvas border-2 border-ink shadow-[2px_2px_0px_#161716]">
            <div className="text-[10px] font-mono uppercase text-muted font-bold">Total Nodes</div>
            <div className="text-xl font-mono font-black text-ink">{stats.nodeCount}</div>
            <div className="text-[10px] font-mono text-muted">{stats.edgeCount} relations</div>
          </div>
          <div className="p-2.5 bg-canvas border-2 border-ink shadow-[2px_2px_0px_#161716]">
            <div className="text-[10px] font-mono uppercase text-muted font-bold">Claims</div>
            <div className="text-xl font-mono font-black text-ink">{stats.claimsCount}</div>
            <div className="text-[10px] font-mono text-muted">atomic assertions</div>
          </div>
          <div className="p-2.5 bg-canvas border-2 border-ink shadow-[2px_2px_0px_#161716]">
            <div className="text-[10px] font-mono uppercase text-muted font-bold">Sources</div>
            <div className="text-xl font-mono font-black text-ink">{stats.sourcesCount}</div>
            <div className="text-[10px] font-mono text-muted">
              {independentSources.length} independent
            </div>
          </div>
          <div className="p-2.5 bg-canvas border-2 border-ink shadow-[2px_2px_0px_#161716]">
            <div className="text-[10px] font-mono uppercase text-muted font-bold">Evidence Excerpts</div>
            <div className="text-xl font-mono font-black text-ink">{stats.evidenceCount}</div>
            <div className="text-[10px] font-mono text-muted">forensically hashed</div>
          </div>
          <div className="p-2.5 bg-canvas border-2 border-ink shadow-[2px_2px_0px_#161716]">
            <div className="text-[10px] font-mono uppercase text-muted font-bold">Contradictions</div>
            <div className="text-xl font-mono font-black text-ink">
              {contradictions.length || stats.contradictionsCount}
            </div>
            <div className="text-[10px] font-mono text-muted">opposing claims</div>
          </div>
          <div className="p-2.5 bg-canvas border-2 border-ink shadow-[2px_2px_0px_#161716]">
            <div className="text-[10px] font-mono uppercase text-muted font-bold">Domain Entities</div>
            <div className="text-xl font-mono font-black text-ink">{entities.length}</div>
            <div className="text-[10px] font-mono text-muted">tools & concepts</div>
          </div>
        </div>
      </div>

      {/* VIEW SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b-2 border-ink pb-1">
        <button
          onClick={() => setActiveSubTab("visual")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border-2 transition ${
            activeSubTab === "visual"
              ? "bg-ink text-white border-ink shadow-[2px_2px_0px_#161716]"
              : "bg-surface hover:bg-canvas text-ink border-ink"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Visual Graph ({filteredNodes.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab("provenance")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border-2 transition ${
            activeSubTab === "provenance"
              ? "bg-ink text-white border-ink shadow-[2px_2px_0px_#161716]"
              : "bg-surface hover:bg-canvas text-ink border-ink"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Provenance Trail</span>
        </button>
        <button
          onClick={() => setActiveSubTab("contradictions")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border-2 transition ${
            activeSubTab === "contradictions"
              ? "bg-ink text-white border-ink shadow-[2px_2px_0px_#161716]"
              : "bg-surface hover:bg-canvas text-ink border-ink"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Contradictions & Objections ({contradictions.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab("entities")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border-2 transition ${
            activeSubTab === "entities"
              ? "bg-ink text-white border-ink shadow-[2px_2px_0px_#161716]"
              : "bg-surface hover:bg-canvas text-ink border-ink"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Entity Network ({entities.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: VISUAL GRAPH EXPLORER */}
      {/* ========================================================================= */}
      {activeSubTab === "visual" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT 8 COLS: GRAPH NODE DIRECTORY & CANVAS */}
          <div className="lg:col-span-8 space-y-3">
            {/* Filter and Search Bar */}
            <div className="p-3 bg-surface border-2 border-ink shadow-[3px_3px_0px_#161716] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {["ALL", "Problem", "Claim", "Evidence", "Source", "Solution", "Objection"].map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-2 py-1 text-[11px] font-mono font-bold uppercase border ${
                        filterType === type
                          ? "bg-ink text-white border-ink"
                          : "bg-canvas text-ink border-ink hover:bg-surface"
                      }`}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter graph nodes..."
                  className="w-full pl-8 pr-3 py-1 text-xs font-mono bg-canvas border-2 border-ink focus:outline-none focus:ring-1 focus:ring-ink"
                />
              </div>
            </div>

            {/* Nodes Layout Grid */}
            <div className="p-4 bg-canvas border-2 border-ink shadow-[3px_3px_0px_#161716] min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b-2 border-ink text-xs font-mono text-muted">
                <span>GRAPH NODES ({filteredNodes.length})</span>
                <span>CLICK ANY NODE TO INSPECT OPENร่วมCYPHER PROPERTIES</span>
              </div>

              {filteredNodes.length === 0 ? (
                <div className="py-20 text-center font-mono text-sm text-muted">
                  No graph nodes found matching filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {filteredNodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const epistemic = (node.properties as any)?.epistemic_status;

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3 bg-surface border-2 transition cursor-pointer ${
                          isSelected
                            ? "border-ink shadow-[4px_4px_0px_#161716] -translate-y-0.5 bg-[#FEF08A]/20"
                            : "border-ink shadow-[2px_2px_0px_#161716] hover:-translate-y-0.5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase border ${getNodeColor(
                              node.type
                            )}`}
                          >
                            {node.type}
                          </span>
                          {epistemic && (
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase border ${getEpistemicBadgeColor(
                                epistemic
                              )}`}
                            >
                              {epistemic}
                            </span>
                          )}
                        </div>

                        <div className="font-mono text-xs font-bold text-ink line-clamp-2">
                          {node.label}
                        </div>

                        {Boolean(node.properties?.excerpt) && (
                          <div className="mt-1 text-[11px] font-mono text-muted line-clamp-2 italic">
                            &ldquo;{String(node.properties?.excerpt)}&rdquo;
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-ink/20 flex items-center justify-between text-[10px] font-mono text-muted">
                          <span className="truncate max-w-[140px]">{node.id}</span>
                          <span className="text-ink font-bold">
                            {graphData.edges.filter((e) => e.source === node.id || e.target === node.id).length} links
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 4 COLS: NODE INSPECTOR PANEL */}
          <div className="lg:col-span-4">
            <div className="bg-surface border-2 border-ink shadow-[3px_3px_0px_#161716] p-4 sticky top-20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-ink">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-ink" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    Node Forensic Inspector
                  </h3>
                </div>
                {selectedNode && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${getNodeColor(
                      selectedNode.type
                    )}`}
                  >
                    {selectedNode.type}
                  </span>
                )}
              </div>

              {!selectedNode ? (
                <div className="py-12 text-center text-xs font-mono text-muted">
                  Select a node from the graph to inspect properties and provenance relationships.
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="text-[10px] uppercase text-muted font-bold">Label / Title</div>
                    <div className="font-bold text-ink text-sm mt-0.5">{selectedNode.label}</div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase text-muted font-bold">Stable Identifier</div>
                    <div className="p-1.5 bg-canvas border border-ink text-[11px] text-ink break-all mt-0.5">
                      {selectedNode.id}
                    </div>
                  </div>

                  {Boolean(selectedNode.properties?.content_hash) && (
                    <div>
                      <div className="text-[10px] uppercase text-muted font-bold flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        <span>Cryptographic Content Hash</span>
                      </div>
                      <div className="p-1.5 bg-canvas border border-ink text-[10px] text-ink break-all mt-0.5">
                        {String(selectedNode.properties?.content_hash)}
                      </div>
                    </div>
                  )}

                  {Boolean(selectedNode.properties?.epistemic_status) && (
                    <div>
                      <div className="text-[10px] uppercase text-muted font-bold">Epistemic Status</div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold uppercase border ${getEpistemicBadgeColor(
                          String(selectedNode.properties?.epistemic_status)
                        )}`}
                      >
                        {String(selectedNode.properties?.epistemic_status)}
                      </span>
                    </div>
                  )}

                  {Boolean(selectedNode.properties?.relevant_passage) && (
                    <div>
                      <div className="text-[10px] uppercase text-muted font-bold">Evidence Passage</div>
                      <div className="p-2 bg-canvas border border-ink text-[11px] text-ink mt-0.5 leading-relaxed">
                        &ldquo;{String(selectedNode.properties?.relevant_passage)}&rdquo;
                      </div>
                    </div>
                  )}

                  {Boolean(selectedNode.properties?.explanation) && (
                    <div>
                      <div className="text-[10px] uppercase text-muted font-bold">Forensic Explanation</div>
                      <div className="p-2 bg-canvas border border-ink text-[11px] text-ink mt-0.5">
                        {String(selectedNode.properties?.explanation)}
                      </div>
                    </div>
                  )}

                  {/* Connected Relationships */}
                  <div className="pt-2 border-t border-ink/20">
                    <div className="text-[10px] uppercase text-muted font-bold mb-1.5">
                      Relationships ({selectedNodeEdges.outgoing.length + selectedNodeEdges.incoming.length})
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {selectedNodeEdges.outgoing.map((edge) => (
                        <div
                          key={edge.id}
                          className="p-1.5 bg-canvas border border-ink text-[10px] flex items-center justify-between gap-1"
                        >
                          <span className="font-bold text-ink">-[{edge.type}]-&gt;</span>
                          <span
                            onClick={() => setSelectedNodeId(edge.target)}
                            className="text-muted hover:text-ink truncate cursor-pointer underline"
                          >
                            {edge.target}
                          </span>
                        </div>
                      ))}

                      {selectedNodeEdges.incoming.map((edge) => (
                        <div
                          key={edge.id}
                          className="p-1.5 bg-canvas border border-ink text-[10px] flex items-center justify-between gap-1"
                        >
                          <span className="text-muted hover:text-ink truncate cursor-pointer underline" onClick={() => setSelectedNodeId(edge.source)}>
                            {edge.source}
                          </span>
                          <span className="font-bold text-ink">&lt;-[{edge.type}]-</span>
                        </div>
                      ))}

                      {selectedNodeEdges.outgoing.length === 0 && selectedNodeEdges.incoming.length === 0 && (
                        <div className="text-[11px] text-muted italic">No linked edges.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: PROVENANCE TRAIL (Problem -> Claim -> Evidence -> Source) */}
      {/* ========================================================================= */}
      {activeSubTab === "provenance" && (
        <div className="space-y-4">
          <div className="p-4 bg-surface border-2 border-ink shadow-[3px_3px_0px_#161716]">
            <div className="text-xs font-mono font-bold uppercase text-muted mb-1">
              EPITOMIZED PROVENANCE RECORD
            </div>
            <h3 className="text-base font-mono font-black text-ink">
              {provenance?.problemTitle || "Target Market Problem Claim"}
            </h3>
            <p className="text-xs font-mono text-muted mt-1">
              Every business claim is backed by empirical observations with source URLs, author attribution, and content hashes.
            </p>
          </div>

          {!provenance || provenance.claims.length === 0 ? (
            <div className="p-8 bg-surface border-2 border-ink shadow-[3px_3px_0px_#161716] text-center font-mono text-sm text-muted">
              No claims linked to this problem yet. Run an investigation to generate verified claims.
            </div>
          ) : (
            <div className="space-y-4">
              {provenance.claims.map((claim, idx) => (
                <div
                  key={claim.claimId || idx}
                  className="bg-surface border-2 border-ink shadow-[4px_4px_0px_#161716] p-4 space-y-3"
                >
                  {/* Claim Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b-2 border-ink">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-ink text-white font-mono text-xs font-black">
                        CLAIM #{idx + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 font-mono text-xs font-bold uppercase border ${getEpistemicBadgeColor(
                          claim.epistemicStatus
                        )}`}
                      >
                        {claim.epistemicStatus}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-muted">
                      Confidence: <span className="font-bold text-ink">{Math.round(claim.confidence * 100)}%</span>
                    </div>
                  </div>

                  {/* Claim Text */}
                  <div className="font-mono text-sm font-bold text-ink">
                    {claim.claimText}
                  </div>

                  {/* Supporting Evidence Chain */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-mono font-bold uppercase text-muted flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                      <span>
                        SUPPORTING EVIDENCE ({claim.supportingEvidence.length} items)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {claim.supportingEvidence.map((ev, evIdx) => (
                        <div
                          key={ev.evidenceId || evIdx}
                          className="p-3 bg-canvas border-2 border-ink shadow-[2px_2px_0px_#161716] text-xs font-mono space-y-2"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-ink truncate max-w-[200px]">
                              {ev.sourceTitle}
                            </span>
                            <span className="px-1.5 py-0.5 bg-surface border border-ink text-[10px] font-bold uppercase">
                              {ev.sourceType}
                            </span>
                          </div>

                          <div className="text-ink text-[11px] leading-relaxed italic border-l-2 border-ink pl-2">
                            &ldquo;{ev.passage}&rdquo;
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-muted pt-1 border-t border-ink/20">
                            <span className="truncate max-w-[120px]">
                              Hash: {ev.contentHash.slice(0, 12)}...
                            </span>
                            {ev.sourceUrl && (
                              <a
                                href={ev.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-ink hover:underline flex items-center gap-0.5 font-bold"
                              >
                                <span>Source</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contradicting Evidence (if any) */}
                  {claim.contradictingEvidence.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-mono font-bold uppercase text-[#991B1B] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>
                          CONTRADICTING EVIDENCE ({claim.contradictingEvidence.length} items)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {claim.contradictingEvidence.map((ev, evIdx) => (
                          <div
                            key={ev.evidenceId || evIdx}
                            className="p-3 bg-[#FEE2E2]/30 border-2 border-[#991B1B] shadow-[2px_2px_0px_#991B1B] text-xs font-mono space-y-2"
                          >
                            <div className="font-bold text-[#991B1B]">{ev.sourceTitle}</div>
                            <div className="text-[11px] text-ink italic">&ldquo;{ev.passage}&rdquo;</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: CONTRADICTIONS & OBJECTIONS */}
      {/* ========================================================================= */}
      {activeSubTab === "contradictions" && (
        <div className="space-y-4">
          <div className="p-4 bg-surface border-2 border-ink shadow-[3px_3px_0px_#161716]">
            <div className="text-xs font-mono font-bold uppercase text-muted mb-1">
              ADVERSARIAL CONTRADICTIONS & BLOCKERS
            </div>
            <h3 className="text-base font-mono font-black text-ink">
              Contradiction & Counter-Evidence Analysis
            </h3>
            <p className="text-xs font-mono text-muted mt-1">
              FalkorDB verifies source independence and identifies conflicting empirical signals to avoid echo chambers and confirmation bias.
            </p>
          </div>

          {contradictions.length === 0 ? (
            <div className="p-8 bg-surface border-2 border-ink shadow-[3px_3px_0px_#161716] text-center font-mono text-sm text-muted">
              No opposing claims or direct contradictions identified in the evidence stream.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contradictions.map((item, idx) => (
                <div
                  key={item.claimId || idx}
                  className="bg-surface border-2 border-ink shadow-[3px_3px_0px_#161716] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b-2 border-ink">
                    <span className="px-2 py-0.5 bg-[#FEF08A] border border-ink text-xs font-mono font-bold">
                      Claim #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-[#991B1B] font-bold">
                      {item.contradictingCount} Contradicting Signals
                    </span>
                  </div>

                  <div className="font-mono text-xs font-bold text-ink">
                    &ldquo;{item.claimText}&rdquo;
                  </div>

                  <div className="space-y-2 pt-2 border-t border-ink/20">
                    <div className="text-[10px] font-mono uppercase text-muted font-bold">
                      Counter-Evidence Excerpts
                    </div>
                    {item.contradictingExcerpts.map((excerpt, exIdx) => (
                      <div
                        key={exIdx}
                        className="p-2 bg-[#FEE2E2]/30 border border-[#991B1B] text-[11px] font-mono text-ink italic"
                      >
                        &ldquo;{excerpt}&rdquo;
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: ENTITY NETWORK */}
      {/* ========================================================================= */}
      {activeSubTab === "entities" && (
        <div className="space-y-4">
          <div className="p-4 bg-surface border-2 border-ink shadow-[3px_3px_0px_#161716]">
            <div className="text-xs font-mono font-bold uppercase text-muted mb-1">
              DOMAIN ENTITY KNOWLEDGE BASE
            </div>
            <h3 className="text-base font-mono font-black text-ink">
              Identified Concepts, Competitors, and Tooling
            </h3>
            <p className="text-xs font-mono text-muted mt-1">
              Extracted entities cross-referenced across user complaints, bug reports, and market reviews.
            </p>
          </div>

          {entities.length === 0 ? (
            <div className="p-8 bg-surface border-2 border-ink shadow-[3px_3px_0px_#161716] text-center font-mono text-sm text-muted">
              No named domain entities mapped to this run yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {entities.map((entity) => (
                <div
                  key={entity.id}
                  className="p-3 bg-surface border-2 border-ink shadow-[2px_2px_0px_#161716] font-mono text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 bg-canvas border border-ink text-[10px] font-bold uppercase">
                      {entity.category}
                    </span>
                    <span className="text-[10px] text-muted font-bold">
                      x{entity.claimCount}
                    </span>
                  </div>
                  <div className="font-black text-ink truncate text-sm">
                    {entity.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
