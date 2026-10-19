import { ProblemCard } from "@/types";
import { FalkorDBGraphService, memoryGraphStore } from "../graph";
import { CYPHER_QUERIES } from "../queries";

export class ProblemsRepository {
  static async upsertProblem(problem: ProblemCard, projectId: string): Promise<void> {
    const params = {
      id: problem.id,
      projectId,
      title: problem.title,
      customer_segment: problem.customerSegment,
      job_to_be_done: problem.jobToBeDone,
      current_workflow: problem.currentWorkflow,
      pain_and_consequences: problem.painAndConsequences,
      time_lost_hours: problem.estimatedTimeLostHoursMonthly,
      money_lost_usd: problem.estimatedMoneyLostMonthlyUSD,
      confidence_score: problem.confidenceScore,
      commercial_rating: problem.commercialPotentialRating,
      status: problem.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryGraphStore.upsertNode({
      id: problem.id,
      label: problem.title,
      type: "Problem",
      projectId,
      properties: params,
    });

    await FalkorDBGraphService.query(CYPHER_QUERIES.UPSERT_PROBLEM, params);

    // Link problem evidence
    for (const evId of problem.evidenceIds || []) {
      memoryGraphStore.upsertEdge({
        id: `edge_prob_ev_${evId}_${problem.id}`,
        source: evId,
        target: problem.id,
        type: "EVIDENCE_FOR",
        projectId,
      });
    }

    // Link counter-evidence
    for (const evId of problem.counterEvidenceIds || []) {
      memoryGraphStore.upsertEdge({
        id: `edge_prob_con_${evId}_${problem.id}`,
        source: evId,
        target: problem.id,
        type: "EVIDENCE_AGAINST",
        projectId,
      });
    }
  }

  static async linkProblemToPersona(
    problemId: string,
    personaId: string,
    projectId: string
  ): Promise<void> {
    memoryGraphStore.upsertEdge({
      id: `edge_affects_${problemId}_${personaId}`,
      source: problemId,
      target: personaId,
      type: "AFFECTS",
      projectId,
    });
  }
}
