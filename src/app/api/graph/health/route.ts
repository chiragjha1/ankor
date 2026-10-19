import { NextResponse } from "next/server";
import { falkorDBManager } from "@/lib/falkordb/client";
import { memoryGraphStore } from "@/lib/falkordb/graph";

export async function GET() {
  try {
    const health = await falkorDBManager.checkHealth();
    const fallbackStats = memoryGraphStore.getStats();

    return NextResponse.json({
      connected: health.connected,
      database: health.database,
      url: health.url,
      latencyMs: health.latencyMs,
      nodeCount: health.connected ? (health.nodeCount || 0) : fallbackStats.nodeCount,
      edgeCount: health.connected ? (health.edgeCount || 0) : fallbackStats.edgeCount,
      activeGraphCount: 1,
      usingFallbackMemory: !health.connected,
      timestamp: new Date().toISOString(),
      error: health.error || null,
    });
  } catch (err: any) {
    const fallbackStats = memoryGraphStore.getStats();
    return NextResponse.json(
      {
        connected: false,
        database: process.env.FALKORDB_DATABASE || "ankor",
        url: process.env.FALKORDB_URL || "redis://localhost:6379",
        latencyMs: 0,
        nodeCount: fallbackStats.nodeCount,
        edgeCount: fallbackStats.edgeCount,
        activeGraphCount: 0,
        usingFallbackMemory: true,
        timestamp: new Date().toISOString(),
        error: err?.message || "Failed to query FalkorDB health",
      },
      { status: 200 }
    );
  }
}
