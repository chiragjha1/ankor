import { NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage/store";

export async function GET() {
  try {
    const settings = StorageRepository.getSettings();
    // Mask API key for client security
    const maskedKey = settings.openRouterApiKey
      ? `${settings.openRouterApiKey.slice(0, 7)}...${settings.openRouterApiKey.slice(-4)}`
      : "";
    return NextResponse.json({
      settings: {
        ...settings,
        openRouterApiKey: maskedKey,
        hasApiKey: !!settings.openRouterApiKey,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = StorageRepository.getSettings();

    // If API key is provided and not masked placeholder, update it
    let keyToSave = current.openRouterApiKey;
    if (body.openRouterApiKey && !body.openRouterApiKey.includes("...")) {
      keyToSave = body.openRouterApiKey.trim();
    }

    const updated = StorageRepository.updateSettings({
      ...body,
      openRouterApiKey: keyToSave,
    });

    const maskedKey = updated.openRouterApiKey
      ? `${updated.openRouterApiKey.slice(0, 7)}...${updated.openRouterApiKey.slice(-4)}`
      : "";

    return NextResponse.json({
      settings: {
        ...updated,
        openRouterApiKey: maskedKey,
        hasApiKey: !!updated.openRouterApiKey,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
