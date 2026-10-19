import { NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const run = StorageRepository.getRun(id);
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const evidence = StorageRepository.getEvidence(id);
    const problems = StorageRepository.getProblems(id);
    const economics = StorageRepository.getEconomics(id);
    const solutions = StorageRepository.getSolutions(id);
    const feedbacks = StorageRepository.getFeedbacks(id);
    const experiment = StorageRepository.getExperiment(id);
    const productSpec = StorageRepository.getProductSpec(id);
    const marketing = StorageRepository.getMarketing(id);
    const events = StorageRepository.getEvents(id);
    const approvals = StorageRepository.getApprovals(id);
    const costs = StorageRepository.getCosts(id);

    // Get objections and revisions for all solutions in run
    const allObjections = solutions.flatMap((s) => StorageRepository.getObjections(s.id));
    const allRevisions = solutions.flatMap((s) => StorageRepository.getRevisions(s.id));

    const personas = StorageRepository.getPersonas();
    const sources = StorageRepository.getSources();

    return NextResponse.json({
      run,
      evidence,
      sources,
      problems,
      economics,
      solutions,
      objections: allObjections,
      revisions: allRevisions,
      personas,
      feedbacks,
      experiment,
      productSpec,
      marketing,
      events,
      approvals,
      costs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
