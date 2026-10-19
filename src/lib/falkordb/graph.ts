import { Graph } from "falkordb";
import { falkorDBManager } from "./client";
import { GraphNode, GraphEdge, GraphData, GraphStats, ProvenanceRecord, ContradictionItem } from "@/types";
import { CYPHER_QUERIES } from "./queries";

// ==========================================
// IN-MEMORY GRAPH STORE (OFFLINE / TEST FALLBACK)
// ==========================================
class MemoryGraphStore {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();

  upsertNode(node: GraphNode): void {
    const existing = this.nodes.get(node.id);
    if (existing) {
      this.nodes.set(node.id, {
        ...existing,
        properties: { ...existing.properties, ...node.properties },
      });
    } else {
      this.nodes.set(node.id, node);
    }
  }

  upsertEdge(edge: GraphEdge): void {
    this.edges.set(edge.id, edge);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getProjectNodes(projectId: string): GraphNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.projectId === projectId);
  }

  getProjectEdges(projectId: string): GraphEdge[] {
    return Array.from(this.edges.values()).filter((e) => e.projectId === projectId);
  }

  getGraphData(projectId: string): GraphData {
    return {
      nodes: this.getProjectNodes(projectId),
      edges: this.getProjectEdges(projectId),
    };
  }

  getProvenance(projectId: string, problemId: string): ProvenanceRecord | null {
    const problem = this.nodes.get(problemId);
    if (!problem || problem.projectId !== projectId) return null;

    // Find claims connected to problem
    const claimEdges = Array.from(this.edges.values()).filter(
      (e) => e.projectId === projectId && e.target === problemId && (e.type === "EVIDENCE_FOR" || e.type === "EVIDENCE_AGAINST")
    );

    const claims: ProvenanceRecord["claims"] = [];

    for (const ce of claimEdges) {
      const claim = this.nodes.get(ce.source);
      if (!claim) continue;

      // Find supporting evidence
      const supEdges = Array.from(this.edges.values()).filter(
        (e) => e.projectId === projectId && e.target === claim.id && e.type === "SUPPORTS"
      );
      const supportingEvidence = supEdges.map((se) => {
        const ev = this.nodes.get(se.source);
        const sourceEdge = Array.from(this.edges.values()).find(
          (e) => e.projectId === projectId && e.target === se.source && e.type === "CONTAINS"
        );
        const source = sourceEdge ? this.nodes.get(sourceEdge.source) : undefined;
        return {
          evidenceId: se.source,
          passage: String(ev?.properties?.relevant_passage || ev?.properties?.excerpt || ""),
          epistemicStatus: String(ev?.properties?.epistemic_status || "OBSERVED"),
          sourceTitle: String(source?.properties?.name || ev?.properties?.source_title || "Unknown Source"),
          sourceUrl: source?.properties?.url as string | undefined,
          sourceType: String(source?.properties?.type || "web"),
          contentHash: String(ev?.properties?.content_hash || ""),
        };
      });

      // Find contradicting evidence
      const conEdges = Array.from(this.edges.values()).filter(
        (e) => e.projectId === projectId && e.target === claim.id && e.type === "CONTRADICTS"
      );
      const contradictingEvidence = conEdges.map((ce2) => {
        const ev = this.nodes.get(ce2.source);
        const sourceEdge = Array.from(this.edges.values()).find(
          (e) => e.projectId === projectId && e.target === ce2.source && e.type === "CONTAINS"
        );
        const source = sourceEdge ? this.nodes.get(sourceEdge.source) : undefined;
        return {
          evidenceId: ce2.source,
          passage: String(ev?.properties?.relevant_passage || ev?.properties?.excerpt || ""),
          epistemicStatus: String(ev?.properties?.epistemic_status || "OBSERVED"),
          sourceTitle: String(source?.properties?.name || ev?.properties?.source_title || "Unknown Source"),
          sourceUrl: source?.properties?.url as string | undefined,
          sourceType: String(source?.properties?.type || "web"),
          contentHash: String(ev?.properties?.content_hash || ""),
        };
      });

      claims.push({
        claimId: claim.id,
        claimText: String(claim.properties?.text || claim.label),
        confidence: Number(claim.properties?.confidence || 0.8),
        epistemicStatus: String(claim.properties?.epistemic_status || "OBSERVED"),
        relation: ce.type as "EVIDENCE_FOR" | "EVIDENCE_AGAINST",
        supportingEvidence,
        contradictingEvidence,
      });
    }

    return {
      problemId: problem.id,
      problemTitle: String(problem.properties?.title || problem.label),
      claims,
    };
  }

  getContradictions(projectId: string): ContradictionItem[] {
    const items: ContradictionItem[] = [];
    const contradictionEdges = Array.from(this.edges.values()).filter(
      (e) => e.projectId === projectId && (e.type === "CONTRADICTS" || e.type === "EVIDENCE_AGAINST")
    );

    for (const ce of contradictionEdges) {
      if (ce.type === "CONTRADICTS") {
        const claim = this.nodes.get(ce.target);
        const ev = this.nodes.get(ce.source);
        if (!claim || !ev) continue;

        // Find associated problem
        const probEdge = Array.from(this.edges.values()).find(
          (e) => e.projectId === projectId && e.source === claim.id && e.type === "EVIDENCE_FOR"
        );
        const problem = probEdge ? this.nodes.get(probEdge.target) : undefined;

        // Find supporting evidence for this claim
        const supEdges = Array.from(this.edges.values()).filter(
          (e) => e.projectId === projectId && e.target === claim.id && e.type === "SUPPORTS"
        );
        const supportingExcerpts = supEdges.map((s) => {
          const sEv = this.nodes.get(s.source);
          return String(sEv?.properties?.relevant_passage || sEv?.properties?.excerpt || "");
        });

        items.push({
          claimId: claim.id,
          claimText: String(claim.properties?.text || claim.label),
          problemId: problem?.id || "unlinked",
          problemTitle: String(problem?.properties?.title || "Identified Problem"),
          supportingCount: supEdges.length,
          contradictingCount: 1,
          supportingExcerpts,
          contradictingExcerpts: [String(ev.properties?.relevant_passage || ev.properties?.excerpt || "")],
        });
      }
    }

    return items;
  }

  getStats(projectId?: string): GraphStats {
    const pNodes = projectId ? this.getProjectNodes(projectId) : Array.from(this.nodes.values());
    const pEdges = projectId ? this.getProjectEdges(projectId) : Array.from(this.edges.values());

    const sourcesCount = pNodes.filter((n: GraphNode) => n.type === "Source").length;
    const evidenceCount = pNodes.filter((n: GraphNode) => n.type === "Evidence").length;
    const claimsCount = pNodes.filter((n: GraphNode) => n.type === "Claim").length;
    const problemsCount = pNodes.filter((n: GraphNode) => n.type === "Problem").length;
    const solutionsCount = pNodes.filter((n: GraphNode) => n.type === "Solution").length;
    const entitiesCount = pNodes.filter((n: GraphNode) => n.type === "Entity").length;
    const contradictionsCount = pEdges.filter(
      (e: GraphEdge) => e.type === "CONTRADICTS" || e.type === "EVIDENCE_AGAINST"
    ).length;

    return {
      nodeCount: pNodes.length,
      edgeCount: pEdges.length,
      sourcesCount,
      evidenceCount,
      claimsCount,
      problemsCount,
      solutionsCount,
      entitiesCount,
      contradictionsCount,
      syncStatus: "SYNCED",
      lastSyncedAt: new Date().toISOString(),
    };
  }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
  }
}

export const memoryGraphStore = new MemoryGraphStore();

// ==========================================
// FALKORDB GRAPH SERVICE
// ==========================================
export class FalkorDBGraphService {
  private static indicesCreated = false;

  private static async ensureIndices(graph: Graph): Promise<void> {
    if (this.indicesCreated) return;
    try {
      // Range indices for fast lookups by ID and project_id
      await graph.createNodeRangeIndex("Source", "id").catch(() => {});
      await graph.createNodeRangeIndex("Source", "project_id").catch(() => {});
      await graph.createNodeRangeIndex("Evidence", "id").catch(() => {});
      await graph.createNodeRangeIndex("Evidence", "project_id").catch(() => {});
      await graph.createNodeRangeIndex("Claim", "id").catch(() => {});
      await graph.createNodeRangeIndex("Claim", "project_id").catch(() => {});
      await graph.createNodeRangeIndex("Problem", "id").catch(() => {});
      await graph.createNodeRangeIndex("Problem", "project_id").catch(() => {});
      await graph.createNodeRangeIndex("Entity", "id").catch(() => {});
      await graph.createNodeRangeIndex("Entity", "project_id").catch(() => {});
      await graph.createNodeRangeIndex("Solution", "id").catch(() => {});
      await graph.createNodeRangeIndex("Solution", "project_id").catch(() => {});
      this.indicesCreated = true;
    } catch (err: any) {
      console.warn("[FalkorDB] Index creation skipped or partially supported:", err?.message);
    }
  }

  static async query(
    cypher: string,
    params: Record<string, any> = {}
  ): Promise<{ data: any[]; isOfflineFallback: boolean }> {
    const graph = await falkorDBManager.getGraph();

    if (graph) {
      try {
        await this.ensureIndices(graph);
        const res = await (graph as any).query(cypher, { params });
        return { data: (res.data as any[]) || [], isOfflineFallback: false };
      } catch (err: any) {
        console.warn("[FalkorDB] Live query error, falling back to memory store:", err?.message);
      }
    }

    return { data: [], isOfflineFallback: true };
  }

  static async roQuery(
    cypher: string,
    params: Record<string, any> = {}
  ): Promise<{ data: any[]; isOfflineFallback: boolean }> {
    const graph = await falkorDBManager.getGraph();

    if (graph) {
      try {
        const res = await (graph as any).roQuery(cypher, { params });
        return { data: (res.data as any[]) || [], isOfflineFallback: false };
      } catch (err: any) {
        console.warn("[FalkorDB] Live roQuery error, falling back to memory store:", err?.message);
      }
    }

    return { data: [], isOfflineFallback: true };
  }
}
