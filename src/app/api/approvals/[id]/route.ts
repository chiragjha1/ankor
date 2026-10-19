import { NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
    }

    const updated = StorageRepository.resolveApproval(id, status, notes);
    if (!updated) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    // If deployment approval was granted, update the product spec status
    if (updated.type === "DEPLOYMENT" && status === "APPROVED") {
      const spec = StorageRepository.getProductSpec(updated.runId);
      if (spec) {
        spec.deploymentAuthorized = true;
        spec.buildStatus = "DEPLOYED";
        spec.deploymentUrl = "https://preview.ankor.dev/pkg/ankor-sync-v1";
        StorageRepository.saveProductSpec(spec);

        StorageRepository.logEvent({
          id: `evt_${Date.now()}_deploy_auth`,
          runId: updated.runId,
          timestamp: new Date().toISOString(),
          type: "DEPLOYMENT_AUTHORIZED",
          agentRole: "builder",
          stage: "product_construction",
          summary: "Founder approved deployment. Production package deployed to https://preview.ankor.dev/pkg/ankor-sync-v1",
          severity: "success",
        });
      }
    }

    return NextResponse.json({ approval: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
