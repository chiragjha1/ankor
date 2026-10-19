import { EvidenceItem, EvidenceSource } from "@/types";
import { FalkorDBGraphService, memoryGraphStore } from "../graph";
import { CYPHER_QUERIES } from "../queries";

export class EvidenceRepository {
  static async upsertSource(source: EvidenceSource, projectId: string): Promise<void> {
    const params = {
      id: source.id,
      projectId,
      name: source.name,
      type: source.type,
      url: source.url || "",
      terms_compliant: source.termsCompliant,
      rate_limit_status: source.rateLimitStatus || "OK",
      created_at: source.retrievedAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryGraphStore.upsertNode({
      id: source.id,
      label: source.name,
      type: "Source",
      projectId,
      properties: params,
    });

    await FalkorDBGraphService.query(CYPHER_QUERIES.UPSERT_SOURCE, params);
  }

  static async upsertEvidence(item: EvidenceItem, projectId: string): Promise<void> {
    const params = {
      id: item.id,
      projectId,
      source_id: item.sourceId,
      source_title: item.sourceTitle,
      source_url: item.sourceUrl || "",
      excerpt: item.originalExcerpt,
      relevant_passage: item.relevantPassage,
      author: item.author || "anonymous",
      retrieval_method: item.retrievalMethod,
      content_hash: item.contentHash,
      epistemic_status: item.epistemicStatus,
      confidence: item.confidence,
      limitations: item.limitations || "",
      created_at: item.retrievalDate || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryGraphStore.upsertNode({
      id: item.id,
      label: item.sourceTitle,
      type: "Evidence",
      projectId,
      properties: params,
    });

    const linkParams = {
      sourceId: item.sourceId,
      evidenceId: item.id,
      projectId,
    };

    memoryGraphStore.upsertEdge({
      id: `edge_contains_${item.sourceId}_${item.id}`,
      source: item.sourceId,
      target: item.id,
      type: "CONTAINS",
      projectId,
    });

    await FalkorDBGraphService.query(CYPHER_QUERIES.UPSERT_EVIDENCE, params);
    await FalkorDBGraphService.query(CYPHER_QUERIES.LINK_SOURCE_CONTAINS_EVIDENCE, linkParams);
  }

  static async findIndependentSources(
    projectId: string,
    problemId?: string
  ): Promise<Array<{ id: string; name: string; url?: string; type: string }>> {
    if (problemId) {
      const { data, isOfflineFallback } = await FalkorDBGraphService.roQuery(
        CYPHER_QUERIES.FIND_INDEPENDENT_SOURCES,
        { problemId, projectId, limit: 12 }
      );

      if (!isOfflineFallback && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.s?.id || "",
          name: row.s?.properties?.name || "",
          url: row.s?.properties?.url,
          type: row.s?.properties?.type || "web",
        }));
      }
    }

    const pNodes = memoryGraphStore.getProjectNodes(projectId);
    const sources = pNodes.filter((n) => n.type === "Source");
    return sources.map((s) => ({
      id: s.id,
      name: String(s.properties?.name || s.label),
      url: s.properties?.url as string | undefined,
      type: String(s.properties?.type || "web"),
    }));
  }
}
