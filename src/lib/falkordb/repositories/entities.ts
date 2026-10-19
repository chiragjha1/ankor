import { FalkorDBGraphService, memoryGraphStore } from "../graph";
import { CYPHER_QUERIES } from "../queries";

export class EntitiesRepository {
  static async upsertEntity(
    entity: { id: string; name: string; category: string; frequency?: number },
    projectId: string,
    claimId?: string
  ): Promise<void> {
    const params = {
      id: entity.id,
      projectId,
      name: entity.name,
      category: entity.category,
      frequency: entity.frequency || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryGraphStore.upsertNode({
      id: entity.id,
      label: entity.name,
      type: "Entity",
      projectId,
      properties: params,
    });

    await FalkorDBGraphService.query(CYPHER_QUERIES.UPSERT_ENTITY, params);

    if (claimId) {
      memoryGraphStore.upsertEdge({
        id: `edge_ent_claim_${entity.id}_${claimId}`,
        source: entity.id,
        target: claimId,
        type: "RELATED_TO",
        projectId,
      });

      await FalkorDBGraphService.query(CYPHER_QUERIES.LINK_ENTITY_RELATED_TO_CLAIM, {
        entityId: entity.id,
        claimId,
        projectId,
      });
    }
  }

  static async findEntitiesForProblem(
    problemId: string,
    projectId: string
  ): Promise<Array<{ id: string; name: string; category: string; claimCount: number }>> {
    const { data, isOfflineFallback } = await FalkorDBGraphService.roQuery(
      CYPHER_QUERIES.FIND_ENTITIES_FOR_PROBLEM,
      { problemId, projectId, limit: 15 }
    );

    if (!isOfflineFallback && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.ent?.id || "",
        name: row.ent?.properties?.name || "",
        category: row.ent?.properties?.category || "concept",
        claimCount: Number(row.claimCount || 1),
      }));
    }

    const pNodes = memoryGraphStore.getProjectNodes(projectId);
    const entities = pNodes.filter((n) => n.type === "Entity");
    return entities.map((ent) => ({
      id: ent.id,
      name: String(ent.properties?.name || ent.label),
      category: String(ent.properties?.category || "concept"),
      claimCount: Number(ent.properties?.frequency || 1),
    }));
  }
}
