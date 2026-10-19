import { NextResponse } from "next/server";
import { GraphSyncService } from "@/lib/falkordb/sync";
import { StorageRepository } from "@/lib/storage/store";

export async function POST(
  request: Request,
  props: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await props.params;
    if (!runId) {
      return NextResponse.json({ error: "Missing runId parameter" }, { status: 400 });
    }

    const run = StorageRepository.getRun(runId);
    if (!run) {
      return NextResponse.json({ error: `Run not found: ${runId}` }, { status: 404 });
    }

    const syncState = await GraphSyncService.syncProject(runId);

    return NextResponse.json({
      ok: true,
      runId,
      syncState,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to sync project graph" },
      { status: 500 }
    );
  }
}
