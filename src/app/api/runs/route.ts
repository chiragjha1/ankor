import { NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/store";
import { OrchestrationEngine } from "@/lib/orchestrator/engine";

export async function GET() {
  try {
    const runs = StorageRepository.getRuns();
    return NextResponse.json({ runs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, searchBrief, targetMarketOrDomain, geography, budgetCeilingUSD } = body;

    if (!name || !searchBrief || !targetMarketOrDomain) {
      return NextResponse.json(
        { error: "name, searchBrief, and targetMarketOrDomain are required." },
        { status: 400 }
      );
    }

    const run = await OrchestrationEngine.startRun({
      name,
      searchBrief,
      targetMarketOrDomain,
      geography,
      budgetCeilingUSD: Number(budgetCeilingUSD) || 25,
    });

    return NextResponse.json({ run }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
