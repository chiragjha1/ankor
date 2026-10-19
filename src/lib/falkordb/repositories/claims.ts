import { Claim, EpistemicStatus } from "@/types";
import { FalkorDBGraphService, memoryGraphStore } from "../graph";
import { CYPHER_QUERIES } from "../queries";

export class ClaimsRepository {
  static async upsertClaim(
    claim: Claim,
    projectId: string,
    problemId?: string
  ): Promise<void> {
    const params = {
      id: claim.id,
      projectId,
      text: claim.text,
      epistemic_status: claim.epistemicStatus,
      confidence: claim.confidence,
      explanation: claim.explanation,
      unresolved_uncertainty: claim.unresolvedUncertainty || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryGraphStore.upsertNode({
      id: claim.id,
      label: claim.text.slice(0, 60),
      type: "Claim",
      projectId,
      properties: params,
    });

    await FalkorDBGraphService.query(CYPHER_QUERIES.UPSERT_CLAIM, params);

    // Link supporting evidence
    for (const evId of claim.supportingEvidenceIds || []) {
      memoryGraphStore.upsertEdge({
        id: `edge_sup_${evId}_${claim.id}`,
        source: evId,
        target: claim.id,
        type: "SUPPORTS",
        projectId,
      });

      await FalkorDBGraphService.query(CYPHER_QUERIES.LINK_EVIDENCE_SUPPORTS_CLAIM, {
        evidenceId: evId,
        claimId: claim.id,
        projectId,
      });
    }

    // Link contradicting evidence
    for (const evId of claim.contradictingEvidenceIds || []) {
      memoryGraphStore.upsertEdge({
        id: `edge_con_${evId}_${claim.id}`,
        source: evId,
        target: claim.id,
        type: "CONTRADICTS",
        projectId,
      });

      await FalkorDBGraphService.query(CYPHER_QUERIES.LINK_EVIDENCE_CONTRADICTS_CLAIM, {
        evidenceId: evId,
        claimId: claim.id,
        projectId,
      });
    }

    // Link to problem anchor if provided
    if (problemId) {
      const isNegative =
        claim.text.toLowerCase().includes("not a problem") ||
        claim.text.toLowerCase().includes("solved already") ||
        claim.text.toLowerCase().includes("no friction");

      const relationType = isNegative ? "EVIDENCE_AGAINST" : "EVIDENCE_FOR";

      memoryGraphStore.upsertEdge({
        id: `edge_claim_prob_${claim.id}_${problemId}`,
        source: claim.id,
        target: problemId,
        type: relationType,
        projectId,
      });

      const cypherQuery = isNegative
        ? CYPHER_QUERIES.LINK_CLAIM_EVIDENCE_AGAINST_PROBLEM
        : CYPHER_QUERIES.LINK_CLAIM_EVIDENCE_FOR_PROBLEM;

      await FalkorDBGraphService.query(cypherQuery, {
        claimId: claim.id,
        problemId,
        projectId,
      });
    }
  }

  static async findClaimsByEpistemicStatus(
    projectId: string,
    status: EpistemicStatus
  ): Promise<any[]> {
    const pNodes = memoryGraphStore.getProjectNodes(projectId);
    return pNodes
      .filter((n) => n.type === "Claim" && n.properties?.epistemic_status === status)
      .map((n) => n.properties);
  }
}
