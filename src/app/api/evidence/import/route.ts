import { NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/store";
import { ManualImportAdapter, HackerNewsAdapter, GitHubAdapter } from "@/lib/evidence/adapters";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { runId, type, title, text, author, url, query } = body;

    if (!runId) {
      return NextResponse.json({ error: "runId is required" }, { status: 400 });
    }

    if (type === "search_hn") {
      const items = await HackerNewsAdapter.search({
        query: query || "developer pain problem",
        runId,
        limit: 5,
      });
      for (const item of items) StorageRepository.addEvidence(item);
      return NextResponse.json({ items, count: items.length });
    }

    if (type === "search_github") {
      const items = await GitHubAdapter.search({
        query: query || "issue bug",
        runId,
        limit: 5,
      });
      for (const item of items) StorageRepository.addEvidence(item);
      return NextResponse.json({ items, count: items.length });
    }

    // Manual text / interview import
    if (!title || !text) {
      return NextResponse.json({ error: "title and text are required for manual import" }, { status: 400 });
    }

    const newItem = ManualImportAdapter.createItem({
      runId,
      title,
      text,
      author,
      url,
    });
    StorageRepository.addEvidence(newItem);

    StorageRepository.logEvent({
      id: `evt_${Date.now()}_import`,
      runId,
      timestamp: new Date().toISOString(),
      type: "EVIDENCE_IMPORTED",
      agentRole: "scout",
      stage: "evidence_collection",
      summary: `User imported manual evidence: ${title}`,
      severity: "info",
    });

    return NextResponse.json({ item: newItem });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
