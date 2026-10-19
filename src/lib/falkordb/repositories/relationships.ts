import { SolutionSpec, Objection, ContradictionItem, ProvenanceRecord } from "@/types";
import { FalkorDBGraphService, memoryGraphStore } from "../graph";
import { CYPHER_QUERIES } from "../queries";

export class RelationshipsRepository {
  static async upsertSolution(solution: SolutionSpec, projectId: string): Promise<void> {
    const params = {
      id: solution.id,
      projectId,
      problem_id: solution.problemId,
      version: solution.version,
      title: solution.title,
      primary_user: solution.primaryUser,
      core_jtbd: solution.coreJobToBeDone,
      feasibility: solution.technicalFeasibility,
      value_delivered: solution.measurableValueDelivered,
      created_at: solution.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryGraphStore.upsertNode({
      id: solution.id,
      label: solution.title,
      type: "Solution",
      projectId,
      properties: params,
    });

    memoryGraphStore.upsertEdge({
      id: `edge_sol_prob_${solution.id}_${solution.problemId}`,
      source: solution.problemId,
      target: solution.id,
      type: "SOLVED_BY",
      projectId,
    });

    await FalkorDBGraphService.query(CYPHER_QUERIES.UPSERT_SOLUTION, params);
    await FalkorDBGraphService.query(CYPHER_QUERIES.LINK_PROBLEM_SOLVED_BY, {
      problemId: solution.problemId,
      solutionId: solution.id,
      projectId,
    });
  }

  static async upsertObjection(
    objection: Objection,
    projectId: string,
    problemId?: string
  ): Promise<void> {
    const objectionText = (objection as any).argument || objection.description || "";
    const params = {
      id: objection.id,
      projectId,
      solution_id: objection.solutionId,
      category: objection.category,
      severity: objection.severity,
      argument: objectionText,
      is_blocking: objection.isBlocking,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryGraphStore.upsertNode({
      id: objection.id,
      label: objectionText.slice(0, 60),
      type: "Objection",
      projectId,
      properties: params,
    });

    if (problemId) {
      memoryGraphStore.upsertEdge({
        id: `edge_prob_obj_${problemId}_${objection.id}`,
        source: problemId,
        target: objection.id,
        type: "HAS_OBJECTION",
        projectId,
      });

      await FalkorDBGraphService.query(CYPHER_QUERIES.LINK_PROBLEM_HAS_OBJECTION, {
        problemId,
        objectionId: objection.id,
        projectId,
      });
    }

    await FalkorDBGraphService.query(CYPHER_QUERIES.UPSERT_OBJECTION, params);
  }

  static async findContradictions(
    projectId: string,
    problemId?: string
  ): Promise<ContradictionItem[]> {
    if (problemId) {
      const { data, isOfflineFallback } = await FalkorDBGraphService.roQuery(
        CYPHER_QUERIES.FIND_CONTRADICTIONS_FOR_PROBLEM,
        { problemId, projectId, limit: 10 }
      );

      if (!isOfflineFallback && data && data.length > 0) {
        return data.map((row: any) => ({
          claimId: row.c?.properties?.id || String(row.c?.id || ""),
          claimText: row.c?.properties?.text || "",
          problemId,
          problemTitle: "Problem Under Review",
          supportingCount: 1,
          contradictingCount: 1,
          supportingExcerpts: [],
          contradictingExcerpts: [
            row.e?.properties?.relevant_passage || row.e?.properties?.excerpt || "",
          ],
        }));
      }
    }

    const memContradictions = memoryGraphStore.getContradictions(projectId);
    if (memContradictions.length > 0) {
      return problemId
        ? memContradictions.filter((c) => c.problemId === problemId || c.problemId === "unlinked")
        : memContradictions;
    }

    return [];
  }

  static async traceProvenance(
    projectId: string,
    problemId: string
  ): Promise<ProvenanceRecord | null> {
    const { data, isOfflineFallback } = await FalkorDBGraphService.roQuery(
      CYPHER_QUERIES.TRACE_FULL_PROVENANCE,
      { problemId, projectId }
    );

    if (!isOfflineFallback && data && data.length > 0) {
      const claimsMap = new Map<string, any>();
      let problemTitle = "Identified Problem";

      for (const row of data) {
        if (row.p) problemTitle = row.p.properties?.title || problemTitle;
        const c = row.c;
        if (!c) continue;

        const claimId = c.properties?.id || String(c.id);
        if (!claimsMap.has(claimId)) {
          claimsMap.set(claimId, {
            claimId,
            claimText: c.properties?.text || "",
            confidence: Number(c.properties?.confidence || 0.8),
            epistemicStatus: c.properties?.epistemic_status || "OBSERVED",
            relation: "EVIDENCE_FOR",
            supportingEvidence: [],
            contradictingEvidence: [],
          });
        }

        const entry = claimsMap.get(claimId);

        if (row.eSup) {
          const evId = row.eSup.properties?.id || String(row.eSup.id);
          if (!entry.supportingEvidence.some((e: any) => e.evidenceId === evId)) {
            entry.supportingEvidence.push({
              evidenceId: evId,
              passage: row.eSup.properties?.relevant_passage || row.eSup.properties?.excerpt || "",
              epistemicStatus: row.eSup.properties?.epistemic_status || "OBSERVED",
              sourceTitle: row.sSup?.properties?.name || row.eSup.properties?.source_title || "Public Source",
              sourceUrl: row.sSup?.properties?.url || row.eSup.properties?.source_url,
              sourceType: row.sSup?.properties?.type || "web",
              contentHash: row.eSup.properties?.content_hash || "",
            });
          }
        }

        if (row.eCon) {
          const evId = row.eCon.properties?.id || String(row.eCon.id);
          if (!entry.contradictingEvidence.some((e: any) => e.evidenceId === evId)) {
            entry.contradictingEvidence.push({
              evidenceId: evId,
              passage: row.eCon.properties?.relevant_passage || row.eCon.properties?.excerpt || "",
              epistemicStatus: row.eCon.properties?.epistemic_status || "OBSERVED",
              sourceTitle: row.sCon?.properties?.name || row.eCon.properties?.source_title || "Public Source",
              sourceUrl: row.sCon?.properties?.url || row.eCon.properties?.source_url,
              sourceType: row.sCon?.properties?.type || "web",
              contentHash: row.eCon.properties?.content_hash || "",
            });
          }
        }
      }

      if (claimsMap.size > 0) {
        return {
          problemId,
          problemTitle,
          claims: Array.from(claimsMap.values()),
        };
      }
    }

    return memoryGraphStore.getProvenance(projectId, problemId);
  }

}
