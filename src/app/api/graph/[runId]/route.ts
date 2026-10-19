import { NextResponse } from "next/server";
import { GraphRetrievalService } from "@/lib/falkordb/retrieval/graph-retrieval";
import { GraphSyncService } from "@/lib/falkordb/sync";
import { StorageRepository } from "@/lib/storage/store";

export async function GET(
  request: Request,
  props: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await props.params;
    if (!runId) {
      return NextResponse.json({ error: "Missing runId parameter" }, { status: 400 });
    }

    const run = StorageRepository.getRun(runId);
    const problems = StorageRepository.getProblems(runId);
    const selectedProblemId = run?.selectedProblemId || problems[0]?.id;

    // Retrieve graph visualization data & statistics
    const graphData = await GraphRetrievalService.getProjectGraph(runId);
    const stats = await GraphRetrievalService.getGraphStats(runId);
    const syncState = GraphSyncService.getSyncState(runId);

    // Retrieve deep provenance, contradictions, entities, and sources
    let provenance = null;
    let entities: Array<{ id: string; name: string; category: string; claimCount: number }> = [];
    let independentSources: Array<{ id: string; name: string; url?: string; type: string }> = [];

    if (selectedProblemId) {
      provenance = await GraphRetrievalService.getProvenanceForProblem(runId, selectedProblemId);
      entities = await GraphRetrievalService.getEntitiesForProblem(runId, selectedProblemId);
      independentSources = await GraphRetrievalService.getIndependentSourcesForProblem(runId, selectedProblemId);
    }

    const contradictions = await GraphRetrievalService.getContradictionsForProblem(runId, selectedProblemId);

    return NextResponse.json({
      ok: true,
      runId,
      graph: graphData,
      stats,
      syncState,
      provenance,
      contradictions,
      entities,
      independentSources,
      selectedProblemId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch project graph" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await props.params;
    if (!runId) {
      return NextResponse.json({ error: "Missing runId parameter" }, { status: 400 });
    }

    const syncState = await GraphSyncService.syncProject(runId);
    const stats = await GraphRetrievalService.getGraphStats(runId);
    const graph = await GraphRetrievalService.getProjectGraph(runId);

    return NextResponse.json({
      ok: true,
      runId,
      success: syncState.status !== "FAILED",
      syncState,
      stats,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      syncedAt: syncState.lastSyncedAt || new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to synchronize graph" },
      { status: 500 }
    );
  }
}

