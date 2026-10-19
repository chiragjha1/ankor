import { FalkorDBGraphService, memoryGraphStore } from "../graph";
import { CYPHER_QUERIES } from "../queries";
import { ProvenanceRecord, ContradictionItem, GraphData, GraphStats } from "@/types";
import {
  RelationshipsRepository,
  EntitiesRepository,
  EvidenceRepository,
} from "../repositories";

export class GraphRetrievalService {
  // ==========================================
  // GET PROVENANCE TRAIL FOR PROBLEM
  // ==========================================
  static async getProvenanceForProblem(
    projectId: string,
    problemId: string
  ): Promise<ProvenanceRecord | null> {
    return RelationshipsRepository.traceProvenance(projectId, problemId);
  }

  // ==========================================
  // GET CONTRADICTIONS FOR PROBLEM
  // ==========================================
  static async getContradictionsForProblem(
    projectId: string,
    problemId?: string
  ): Promise<ContradictionItem[]> {
    return RelationshipsRepository.findContradictions(projectId, problemId);
  }

  // ==========================================
  // GET ENTITIES FOR PROBLEM
  // ==========================================
  static async getEntitiesForProblem(
    projectId: string,
    problemId: string
  ): Promise<Array<{ id: string; name: string; category: string; claimCount: number }>> {
    return EntitiesRepository.findEntitiesForProblem(problemId, projectId);
  }

  // ==========================================
  // GET INDEPENDENT SOURCES
  // ==========================================
  static async getIndependentSourcesForProblem(
    projectId: string,
    problemId: string
  ): Promise<Array<{ id: string; name: string; url?: string; type: string }>> {
    return EvidenceRepository.findIndependentSources(projectId, problemId);
  }

  // ==========================================
  // GET PROJECT GRAPH FOR VISUALIZATION
  // ==========================================
  static async getProjectGraph(projectId: string): Promise<GraphData> {
    try {
      const { data, isOfflineFallback } = await FalkorDBGraphService.roQuery(
        CYPHER_QUERIES.PROJECT_GRAPH_SNAPSHOT,
        { projectId }
      );

      if (!isOfflineFallback && data && data.length > 0) {
        const nodesMap = new Map<string, any>();
        const edgesMap = new Map<string, any>();

        for (const row of data) {
          if (row.n) {
            const n = row.n;
            const type = n.labels?.[0] || "Entity";
            const id = n.properties?.id || String(n.id);
            const label = n.properties?.name || n.properties?.title || n.properties?.text || id;
            nodesMap.set(id, {
              id,
              label,
              type,
              projectId: n.properties?.project_id || projectId,
              properties: n.properties || {},
            });
          }

          if (row.m && row.r) {
            const m = row.m;
            const r = row.r;
            const mId = m.properties?.id || String(m.id);
            const nId = row.n.properties?.id || String(row.n.id);
            const edgeType = r.relationshipType || r.type || "RELATED_TO";
            const edgeId = `${nId}_${edgeType}_${mId}`;
            edgesMap.set(edgeId, {
              id: edgeId,
              source: nId,
              target: mId,
              type: edgeType,
              projectId,
            });
          }
        }

        if (nodesMap.size > 0) {
          const graph: GraphData = {
            nodes: Array.from(nodesMap.values()),
            edges: Array.from(edgesMap.values()),
          };

          // Synchronize back to in-memory store for instant cache hits
          for (const node of graph.nodes) {
            memoryGraphStore.upsertNode(node);
          }
          for (const edge of graph.edges) {
            memoryGraphStore.upsertEdge(edge);
          }

          return graph;
        }
      }
    } catch {
      // Fall through to memoryGraphStore
    }

    return memoryGraphStore.getGraphData(projectId);
  }

  // ==========================================
  // GET GRAPH STATS
  // ==========================================
  static async getGraphStats(projectId: string): Promise<GraphStats> {
    try {
      const graph = await this.getProjectGraph(projectId);
      if (graph.nodes.length > 0) {
        return {
          nodeCount: graph.nodes.length,
          edgeCount: graph.edges.length,
          sourcesCount: graph.nodes.filter((n) => n.type === "Source").length,
          evidenceCount: graph.nodes.filter((n) => n.type === "Evidence").length,
          claimsCount: graph.nodes.filter((n) => n.type === "Claim").length,
          problemsCount: graph.nodes.filter((n) => n.type === "Problem").length,
          solutionsCount: graph.nodes.filter((n) => n.type === "Solution").length,
          entitiesCount: graph.nodes.filter((n) => n.type === "Entity").length,
          contradictionsCount: graph.edges.filter(
            (e) => e.type === "CONTRADICTS" || e.type === "EVIDENCE_AGAINST"
          ).length,
          syncStatus: "SYNCED",
          lastSyncedAt: new Date().toISOString(),
        };
      }
    } catch {
      // Fall through to memory store stats
    }

    return memoryGraphStore.getStats(projectId);
  }
}
