import { NextResponse } from "next/server";

export interface OpenRouterModelItem {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  promptPrice?: string;
  completionPrice?: string;
}

const FALLBACK_MODELS: OpenRouterModelItem[] = [
  { id: "anthropic/claude-3.7-sonnet", name: "Anthropic: Claude 3.7 Sonnet", provider: "Anthropic", contextLength: 200000 },
  { id: "anthropic/claude-3.5-sonnet", name: "Anthropic: Claude 3.5 Sonnet", provider: "Anthropic", contextLength: 200000 },
  { id: "anthropic/claude-3.5-haiku", name: "Anthropic: Claude 3.5 Haiku", provider: "Anthropic", contextLength: 200000 },
  { id: "deepseek/deepseek-r1", name: "DeepSeek: R1 (Reasoning)", provider: "DeepSeek", contextLength: 128000 },
  { id: "deepseek/deepseek-chat", name: "DeepSeek: V3 (Chat)", provider: "DeepSeek", contextLength: 128000 },
  { id: "openai/o3-mini", name: "OpenAI: o3 Mini", provider: "OpenAI", contextLength: 200000 },
  { id: "openai/gpt-4o", name: "OpenAI: GPT-4o", provider: "OpenAI", contextLength: 128000 },
  { id: "openai/gpt-4o-mini", name: "OpenAI: GPT-4o Mini", provider: "OpenAI", contextLength: 128000 },
  { id: "google/gemini-2.5-pro", name: "Google: Gemini 2.5 Pro", provider: "Google", contextLength: 1048576 },
  { id: "google/gemini-2.5-flash", name: "Google: Gemini 2.5 Flash", provider: "Google", contextLength: 1048576 },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Meta: Llama 3.3 70B Instruct", provider: "Meta Llama", contextLength: 131072 },
  { id: "qwen/qwen-2.5-coder-32b-instruct", name: "Qwen: Qwen 2.5 Coder 32B Instruct", provider: "Qwen", contextLength: 32768 },
  { id: "mistralai/mistral-large-2411", name: "Mistral: Mistral Large 2411", provider: "Mistral", contextLength: 128000 },
];

function getProviderName(id: string): string {
  const prefix = id.split("/")[0]?.toLowerCase() || "";
  switch (prefix) {
    case "anthropic":
      return "Anthropic";
    case "openai":
      return "OpenAI";
    case "deepseek":
      return "DeepSeek";
    case "google":
      return "Google";
    case "meta-llama":
      return "Meta Llama";
    case "qwen":
      return "Qwen";
    case "mistralai":
      return "Mistral";
    case "x-ai":
      return "xAI";
    case "cohere":
      return "Cohere";
    default:
      return prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : "Other";
  }
}

// In-memory server cache (5-minute TTL)
let cachedModels: OpenRouterModelItem[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  const now = Date.now();
  if (cachedModels && now - cacheTimestamp < CACHE_TTL_MS) {
    return NextResponse.json({ models: cachedModels, count: cachedModels.length, cached: true });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`OpenRouter returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawList: any[] = Array.isArray(data?.data) ? data.data : [];

    const parsed: OpenRouterModelItem[] = rawList
      .filter((m) => m && typeof m.id === "string")
      .map((m) => ({
        id: m.id,
        name: m.name || m.id,
        provider: getProviderName(m.id),
        contextLength: m.context_length,
        promptPrice: m.pricing?.prompt ? (parseFloat(m.pricing.prompt) * 1000000).toFixed(2) : undefined,
        completionPrice: m.pricing?.completion ? (parseFloat(m.pricing.completion) * 1000000).toFixed(2) : undefined,
      }));

    // Provider sort priority for clean grouping
    const priorityOrder: Record<string, number> = {
      Anthropic: 1,
      DeepSeek: 2,
      OpenAI: 3,
      Google: 4,
      Qwen: 5,
      "Meta Llama": 6,
      Mistral: 7,
      xAI: 8,
      Cohere: 9,
    };

    parsed.sort((a, b) => {
      const orderA = priorityOrder[a.provider] || 99;
      const orderB = priorityOrder[b.provider] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.id.localeCompare(b.id);
    });

    cachedModels = parsed.length > 0 ? parsed : FALLBACK_MODELS;
    cacheTimestamp = now;

    return NextResponse.json({
      models: cachedModels,
      count: cachedModels.length,
      cached: false,
    });
  } catch (err: any) {
    console.warn("[OpenRouter API] Error fetching live models, returning fallback list:", err.message);
    return NextResponse.json({
      models: cachedModels || FALLBACK_MODELS,
      count: (cachedModels || FALLBACK_MODELS).length,
      isFallback: true,
      error: err.message,
    });
  }
}
