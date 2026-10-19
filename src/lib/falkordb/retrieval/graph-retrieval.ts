import { memoryGraphStore } from "../graph";
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
    return memoryGraphStore.getGraphData(projectId);
  }

  // ==========================================
  // GET GRAPH STATS
  // ==========================================
  static async getGraphStats(projectId: string): Promise<GraphStats> {
    return memoryGraphStore.getStats(projectId);
  }
}
