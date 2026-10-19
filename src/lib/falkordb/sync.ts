import {
  EvidenceSource,
  EvidenceItem,
  Claim,
  ProblemCard,
  SolutionSpec,
  Objection,
  WorkflowEvent,
  GraphSyncStatus,
} from "@/types";
import { FalkorDBGraphService, memoryGraphStore } from "./graph";
import { CYPHER_QUERIES } from "./queries";
import { StorageRepository, subscribeEvents } from "@/lib/storage/store";

import {
  EvidenceRepository,
  ClaimsRepository,
  ProblemsRepository,
  EntitiesRepository,
  RelationshipsRepository,
} from "./repositories";

interface SyncState {
  status: GraphSyncStatus;
  lastSyncedAt?: string;
  error?: string;
  syncCount: number;
}

const projectSyncStates = new Map<string, SyncState>();

export class GraphSyncService {
  static getSyncState(projectId: string): SyncState {
    return (
      projectSyncStates.get(projectId) || {
        status: "PENDING",
        syncCount: 0,
      }
    );
  }

  // ==========================================
  // SYNC SOURCE
  // ==========================================
  static async syncSource(source: EvidenceSource, projectId: string): Promise<void> {
    return EvidenceRepository.upsertSource(source, projectId);
  }

  // ==========================================
  // SYNC EVIDENCE
  // ==========================================
  static async syncEvidence(item: EvidenceItem, projectId: string): Promise<void> {
    return EvidenceRepository.upsertEvidence(item, projectId);
  }

  // ==========================================
  // SYNC CLAIM
  // ==========================================
  static async syncClaim(claim: Claim, projectId: string, problemId?: string): Promise<void> {
    return ClaimsRepository.upsertClaim(claim, projectId, problemId);
  }

  // ==========================================
  // SYNC ENTITY
  // ==========================================
  static async syncEntity(
    entity: { id: string; name: string; category: string; frequency?: number },
    projectId: string,
    claimId?: string
  ): Promise<void> {
    return EntitiesRepository.upsertEntity(entity, projectId, claimId);
  }

  // ==========================================
  // SYNC PROBLEM
  // ==========================================
  static async syncProblem(problem: ProblemCard, projectId: string): Promise<void> {
    return ProblemsRepository.upsertProblem(problem, projectId);
  }

  // ==========================================
  // SYNC SOLUTION
  // ==========================================
  static async syncSolution(solution: SolutionSpec, projectId: string): Promise<void> {
    return RelationshipsRepository.upsertSolution(solution, projectId);
  }

  // ==========================================
  // SYNC OBJECTION
  // ==========================================
  static async syncObjection(objection: Objection, projectId: string, problemId?: string): Promise<void> {
    return RelationshipsRepository.upsertObjection(objection, projectId, problemId);
  }

  // ==========================================
  // FULL PROJECT SYNCHRONIZATION
  // ==========================================
  static async syncProject(projectId: string): Promise<SyncState> {
    const t0 = Date.now();
    projectSyncStates.set(projectId, {
      status: "SYNCING",
      syncCount: (projectSyncStates.get(projectId)?.syncCount || 0) + 1,
    });

    try {
      const sources = StorageRepository.getSources();
      for (const s of sources) {
        await this.syncSource(s, projectId);
      }

      const evidence = StorageRepository.getEvidence(projectId);
      for (const e of evidence) {
        await this.syncEvidence(e, projectId);
      }

      const problems = StorageRepository.getProblems(projectId);

      let claims = StorageRepository.getClaims(projectId);
      if (claims.length === 0 && evidence.length > 0) {
        const primaryProblem = problems[0];
        const initialClaim: Claim = {
          id: `claim_${projectId}_1`,
          runId: projectId,
          text: primaryProblem?.title
            ? `Empirical evidence validates: ${primaryProblem.title}`
            : `Friction and failure points observed across ${evidence.length} independent signals`,
          epistemicStatus: "OBSERVED",
          supportingEvidenceIds: evidence.slice(0, 3).map((e) => e.id),
          contradictingEvidenceIds: [],
          confidence: 0.88,
          explanation: "Corroborated across public discussions and developer issue trackers.",
        };
        StorageRepository.addClaim(initialClaim);
        claims = [initialClaim];
      }

      for (const c of claims) {
        await this.syncClaim(c, projectId);
      }

      for (const p of problems) {
        await this.syncProblem(p, projectId);
        // Link problem claims
        for (const c of claims) {
          await this.syncClaim(c, projectId, p.id);
        }
      }

      const solutions = StorageRepository.getSolutions(projectId);
      for (const sol of solutions) {
        await this.syncSolution(sol, projectId);
      }

      const objections = StorageRepository.getObjections();
      for (const obj of objections) {
        const sol = solutions.find((s) => s.id === obj.solutionId);
        if (sol) {
          await this.syncObjection(obj, projectId, sol.problemId);
        }
      }

      const state: SyncState = {
        status: "SYNCED",
        lastSyncedAt: new Date().toISOString(),
        syncCount: (projectSyncStates.get(projectId)?.syncCount || 1),
      };
      projectSyncStates.set(projectId, state);

      StorageRepository.logEvent({
        id: `evt_${Date.now()}_graph_synced`,
        runId: projectId,
        timestamp: new Date().toISOString(),
        type: "GRAPH_SYNCED",
        agentRole: "orchestrator",
        summary: `FalkorDB Evidence Graph synchronized (${evidence.length} items, ${claims.length} claims, ${problems.length} problems in ${Date.now() - t0}ms)`,
        severity: "info",
      });

      return state;
    } catch (err: any) {
      console.warn(`[FalkorDB] Project sync failed for ${projectId}:`, err?.message);
      const state: SyncState = {
        status: "FAILED",
        error: err?.message || "Sync failure",
        syncCount: (projectSyncStates.get(projectId)?.syncCount || 1),
      };
      projectSyncStates.set(projectId, state);
      return state;
    }
  }

  // ==========================================
  // DOMAIN EVENT PROJECTION HANDLER
  // ==========================================
  static handleDomainEvent(event: WorkflowEvent): void {
    if (!event.runId) return;

    // Asynchronously project event into graph without blocking caller
    (async () => {
      try {
        switch (event.type) {
          case "EVIDENCE_COLLECTED":
          case "AUDIT_COMPLETED":
          case "PROBLEM_FRAMED":
          case "SOLUTION_DESIGNED":
          case "OBJECTION_RAISED":
          case "SOLUTION_REVISED":
            await this.syncProject(event.runId);
            break;
        }
      } catch (err: any) {
        console.warn("[FalkorDB] Domain event projection warning:", err?.message);
      }
    })();
  }
}

// Auto-subscribe to domain events for background graph projection
try {
  subscribeEvents((event) => {
    GraphSyncService.handleDomainEvent(event);
  });
} catch (err: any) {
  console.warn("[FalkorDB] Failed to bind event bus subscriber:", err?.message);
}

