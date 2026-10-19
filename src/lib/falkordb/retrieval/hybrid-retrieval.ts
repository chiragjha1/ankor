import { EvidenceRetrievalOptions, EvidenceContextResult, ClaimNodeProps, EvidenceNodeProps } from "../types";
import { memoryGraphStore } from "../graph";
import { GraphRetrievalService } from "./graph-retrieval";
import { EvidenceContextBuilder } from "./context-builder";

export async function retrieveEvidence(
  options: EvidenceRetrievalOptions
): Promise<EvidenceContextResult> {
  const {
    projectId,
    query = "",
    role,
    evidenceClasses,
    limit = 10,
    includeContradictions = true,
    includeProvenance = true,
  } = options;

  if (!projectId) {
    throw new Error("Project isolation constraint violated: projectId is mandatory for graph retrieval.");
  }

  // 1. Fetch project nodes
  const projectNodes = memoryGraphStore.getProjectNodes(projectId);
  const evidenceNodes = projectNodes.filter((n) => n.type === "Evidence");
  const claimNodes = projectNodes.filter((n) => n.type === "Claim");

  // 2. Query terms extraction
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  // 3. Score & rank evidence items based on role, query relevance & epistemic status
  const scoredEvidence = evidenceNodes.map((node) => {
    const props = node.properties as unknown as EvidenceNodeProps;
    let score = props.confidence || 0.8;

    // Epistemic weight
    if (props.epistemic_status === "VERIFIED") score += 0.3;
    if (props.epistemic_status === "OBSERVED") score += 0.2;
    if (props.epistemic_status === "SIMULATED") score += 0.05;

    // Filter by requested evidence class
    if (evidenceClasses && evidenceClasses.length > 0) {
      if (!evidenceClasses.includes(props.epistemic_status)) {
        score -= 1.0;
      }
    }

    // Role-specific weighting
    const text = `${props.relevant_passage} ${props.excerpt} ${props.source_title}`.toLowerCase();

    if (role === "economic_analyst") {
      if (text.includes("cost") || text.includes("$") || text.includes("price") || text.includes("hour") || text.includes("pay") || text.includes("expensive")) {
        score += 0.5;
      }
    } else if (role === "solution_architect") {
      if (text.includes("api") || text.includes("tool") || text.includes("workflow") || text.includes("integration") || text.includes("code") || text.includes("cli")) {
        score += 0.5;
      }
    } else if (role === "critic") {
      if (text.includes("fail") || text.includes("broken") || text.includes("hate") || text.includes("waste") || text.includes("bug") || text.includes("worst") || text.includes("slow")) {
        score += 0.6;
      }
    } else if (role === "evidence_auditor") {
      if (props.epistemic_status === "OBSERVED" || text.includes("review") || text.includes("issue")) {
        score += 0.4;
      }
    }

    // Keyword match boost
    for (const term of queryTerms) {
      if (text.includes(term)) {
        score += 0.3;
      }
    }

    return { node, props, score };
  });

  scoredEvidence.sort((a, b) => b.score - a.score);
  const selectedEvidence = scoredEvidence.slice(0, limit).map((s) => s.props);

  // 4. Score & rank claims
  const scoredClaims = claimNodes.map((node) => {
    const props = node.properties as unknown as ClaimNodeProps;
    let score = props.confidence || 0.8;
    const text = props.text.toLowerCase();

    for (const term of queryTerms) {
      if (text.includes(term)) score += 0.3;
    }

    return { node, props, score };
  });

  scoredClaims.sort((a, b) => b.score - a.score);
  const selectedClaims = scoredClaims.slice(0, Math.min(limit, 6)).map((s) => s.props);

  // 5. Gather contradictions
  let contradictionsCount = 0;
  if (includeContradictions) {
    const contradictions = await GraphRetrievalService.getContradictionsForProblem(projectId);
    contradictionsCount = contradictions.length;
  }

  // 6. Gather entities
  const pNodes = memoryGraphStore.getProjectNodes(projectId);
  const entityNodes = pNodes.filter((n) => n.type === "Entity");

  // 7. Provenance summary
  const provenanceSummary: string[] = [];
  if (includeProvenance) {
    for (const ev of selectedEvidence.slice(0, 5)) {
      provenanceSummary.push(
        `[Evidence ${ev.id}] Source: "${ev.source_title}" (${ev.retrieval_method}) | Status: ${ev.epistemic_status} | Hash: ${ev.content_hash.slice(0, 8)}`
      );
    }
  }

  // 8. Format structured context via EvidenceContextBuilder
  const formattedContext = EvidenceContextBuilder.buildAgentContext({
    role,
    projectId,
    claims: selectedClaims,
    evidence: selectedEvidence,
    entities: entityNodes.map((e) => String(e.properties?.name || e.label)),
    contradictionsCount,
    provenanceSummary,
  });

  const sourcesCount = new Set(selectedEvidence.map((e) => e.source_id)).size;

  return {
    formattedContext,
    retrievedClaimsCount: selectedClaims.length,
    retrievedSourcesCount: sourcesCount,
    retrievedEvidenceCount: selectedEvidence.length,
    contradictionsCount,
    entitiesCount: entityNodes.length,
    provenanceSummary,
    rawClaims: selectedClaims,
    rawEvidence: selectedEvidence,
  };
}
