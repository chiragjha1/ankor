import { StorageRepository } from "@/lib/storage/store";
import { AgentRoleId, CostRecord } from "@/types";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterResponse {
  content: string;
  model: string;
  tokensPrompt: number;
  tokensCompletion: number;
  totalTokens: number;
  estimatedCostUSD: number;
  durationMs: number;
}

export class OpenRouterClient {
  static getApiKey(): string {
    const fromEnv = process.env.OPENROUTER_API_KEY;
    if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim();
    const settings = StorageRepository.getSettings();
    return settings.openRouterApiKey?.trim() || "";
  }

  static hasApiKey(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 0);
  }

  static async executeRolePrompt(options: {
    runId: string;
    agentRole: AgentRoleId;
    systemPrompt: string;
    userPrompt: string;
    jsonMode?: boolean;
  }): Promise<OpenRouterResponse> {
    const { runId, agentRole, systemPrompt, userPrompt, jsonMode = false } = options;
    const settings = StorageRepository.getSettings();
    const roleConfig = settings.modelRegistry[agentRole];
    const apiKey = this.getApiKey();

    // Check run budget
    const run = StorageRepository.getRun(runId);
    if (run && run.cumulativeCostUSD >= (run.constraints?.budgetCeilingUSD || 25)) {
      throw new Error(
        `Budget ceiling exceeded: Current cost \$${run.cumulativeCostUSD.toFixed(
          2
        )} reached limit of \$${run.constraints.budgetCeilingUSD}. Stop rule applied.`
      );
    }

    if (!apiKey) {
      throw new Error(
        "OpenRouter API key is missing. Please configure it in Settings or via OPENROUTER_API_KEY environment variable."
      );
    }

    const startTime = Date.now();
    const primaryModel = roleConfig?.primary || "openai/gpt-4o-mini";

    // Strictly execute assigned OpenRouter model with zero fallback
    return await this.callApi({
      apiKey,
      model: primaryModel,
      systemPrompt,
      userPrompt,
      temperature: roleConfig?.temperature ?? 0.3,
      maxTokens: roleConfig?.maxTokens ?? 3000,
      jsonMode,
      runId,
      agentRole,
      startTime,
    });
  }

  private static async callApi(params: {
    apiKey: string;
    model: string;
    systemPrompt: string;
    userPrompt: string;
    temperature: number;
    maxTokens: number;
    jsonMode: boolean;
    runId: string;
    agentRole: AgentRoleId;
    startTime: number;
  }): Promise<OpenRouterResponse> {
    const {
      apiKey,
      model,
      systemPrompt,
      userPrompt,
      temperature,
      maxTokens,
      jsonMode,
      runId,
      agentRole,
      startTime,
    } = params;

    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const body: Record<string, unknown> = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ankor.local",
        "X-Title": "ankor Company Builder",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`OpenRouter API error (HTTP ${response.status}): ${errBody.slice(0, 300)}`);
    }

    const data = await response.json();
    const durationMs = Date.now() - startTime;
    const choice = data.choices?.[0];
    const content = (choice?.message?.content || choice?.message?.reasoning || "").trim();
    const usage = data.usage || {};
    const tokensPrompt = usage.prompt_tokens || 0;
    const tokensCompletion = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || tokensPrompt + tokensCompletion;

    // Use exact OpenRouter reported cost if available, otherwise compute estimate
    let estimatedCostUSD = 0;
    if (typeof usage.cost === "number" && usage.cost > 0) {
      estimatedCostUSD = Number(usage.cost.toFixed(6));
    } else {
      let costPerMIn = 0.15;
      let costPerMOut = 0.6;
      if (model.includes("claude-3.5-sonnet") || model.includes("gpt-4o")) {
        costPerMIn = 3.0;
        costPerMOut = 15.0;
      } else if (model.includes("deepseek-r1")) {
        costPerMIn = 0.55;
        costPerMOut = 2.19;
      }
      estimatedCostUSD = Number(
        ((tokensPrompt / 1_000_000) * costPerMIn + (tokensCompletion / 1_000_000) * costPerMOut).toFixed(5)
      );
    }

    // Record cost in audit repository
    const costRecord: CostRecord = {
      id: `cost_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      runId,
      timestamp: new Date().toISOString(),
      agentRole,
      modelId: model,
      tokensPrompt,
      tokensCompletion,
      estimatedCostUSD,
      purpose: `Workflow task invocation for stage: ${agentRole}`,
    };
    StorageRepository.recordCost(costRecord);

    return {
      content,
      model,
      tokensPrompt,
      tokensCompletion,
      totalTokens,
      estimatedCostUSD,
      durationMs,
    };
  }
}

export function extractJsonFromResponse<T = any>(content: string): T | null {
  if (!content || typeof content !== "string") return null;
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch {}
    }
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(content.substring(firstBrace, lastBrace + 1));
      } catch {}
    }
    const firstBracket = content.indexOf("[");
    const lastBracket = content.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(content.substring(firstBracket, lastBracket + 1));
      } catch {}
    }
    return null;
  }
}
