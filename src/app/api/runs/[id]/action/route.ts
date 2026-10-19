import { NextResponse } from "next/server";
import { OrchestrationEngine } from "@/lib/orchestrator/engine";
import { StorageRepository } from "@/lib/storage/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === "pause") {
      const updated = await OrchestrationEngine.pauseRun(id);
      return NextResponse.json({ run: updated });
    }

    if (action === "resume") {
      const updated = await OrchestrationEngine.resumeRun(id);
      return NextResponse.json({ run: updated });
    }

    if (action === "reset_demo") {
      StorageRepository.resetDemo();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
