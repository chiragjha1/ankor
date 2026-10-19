"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { SystemSettings, AgentRoleId } from "@/types";
import { AGENT_VISUALS } from "@/components/workspace/AgentCharacter";
import {
  Settings,
  Key,
  Cpu,
  Coins,
  Check,
  Save,
  ArrowLeft,
  Search,
  RefreshCw,
  Sparkles,
  Zap,
  ChevronDown,
  X,
} from "lucide-react";

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (updated: Partial<SystemSettings>) => Promise<void>;
  onClose?: () => void;
}

interface OpenRouterModel {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  promptPrice?: string;
  completionPrice?: string;
}

const AGENT_MODEL_HINTS: Record<AgentRoleId, string> = {
  orchestrator: "Needs rock-solid instruction following and JSON tool calling.",
  scout: "Needs 1M+ context window and cheap token rate for high-volume thread scraping.",
  evidence_auditor: "Needs deep chain-of-thought logic to audit claims and detect astroturfing.",
  problem_framer: "Needs high business acumen to frame root causes and JTBD validation gates.",
  economic_analyst: "Needs step-by-step arithmetic reasoning to prevent math hallucinations.",
  solution_architect: "Needs systems architecture depth and clean MVP specification.",
  critic: "Needs ruthless adversarial critique to challenge business and distribution flaws.",
  revision_agent: "Needs disciplined refactoring and schema diffing without scope creep.",
  simulation_coordinator: "Needs expressive persona roleplay to simulate skeptical buyers.",
  builder: "Needs state-of-the-art TypeScript code synthesis and executable unit test generation.",
  marketer: "Needs punchy direct-response B2B copywriting grounded in verified evidence.",
};

// ==========================================
// SEARCHABLE & TYPABLE MODEL COMBOBOX
// ==========================================
interface SearchableModelInputProps {
  value: string;
  onChange: (modelId: string) => void;
  models: OpenRouterModel[];
  placeholder?: string;
}

const SearchableModelInput: React.FC<SearchableModelInputProps> = ({
  value,
  onChange,
  models,
  placeholder = "Type or search OpenRouter model ID...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize when value changes externally (e.g. preset button clicked)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click-outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter models based on query
  const filteredModels = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models.slice(0, 50); // Show top 50 when empty
    return models
      .filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [models, query]);

  const handleSelectModel = (modelId: string) => {
    onChange(modelId);
    setQuery(modelId);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // Make immediately typable for custom models
    if (!isOpen) setIsOpen(true);
  };

  const isExactMatch = models.some((m) => m.id.toLowerCase() === query.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-3 pr-16 py-2 border-2 border-ink bg-canvas text-ink text-xs focus:outline-none font-mono font-bold shadow-[2px_2px_0px_#161716]"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange("");
                inputRef.current?.focus();
              }}
              className="p-1 text-muted hover:text-ink transition"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-ink hover:bg-canvas border border-ink/40 transition"
            title="Toggle model dropdown"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Floating Searchable Popover Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto bg-surface border-2 border-ink shadow-[4px_4px_0px_#161716] divide-y divide-line-light">
          {/* Header count status */}
          <div className="p-2 bg-canvas/80 text-[10px] font-mono text-muted flex items-center justify-between border-b border-ink/20">
            <span>
              {query.trim()
                ? `Showing ${filteredModels.length} matches for "${query}"`
                : `Top OpenRouter Models (${models.length} loaded)`}
            </span>
            <span className="comic-caption px-1 text-[8px] bg-white border border-ink">
              OPENROUTER
            </span>
          </div>

          {/* Custom typed option if not an exact match */}
          {query.trim() && !isExactMatch && (
            <button
              type="button"
              onClick={() => handleSelectModel(query.trim())}
              className="w-full text-left p-2.5 bg-[#FEF9C3] hover:bg-[#FEF08A] transition text-xs font-mono border-b border-ink/20 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-ink">Use custom model ID: </span>
                <span className="font-mono text-ink underline">{query.trim()}</span>
              </div>
              <span className="comic-caption px-1 py-0.2 text-[8px] bg-white border border-ink">
                CUSTOM
              </span>
            </button>
          )}

          {/* Filtered models list */}
          {filteredModels.length === 0 && !query.trim() ? (
            <div className="p-4 text-center text-xs font-mono text-muted">
              Loading OpenRouter models...
            </div>
          ) : filteredModels.length === 0 && !isExactMatch ? (
            <div className="p-4 text-center text-xs font-mono text-muted">
              No matching catalog models. Press Enter or click &quot;Use custom model ID&quot; above to keep this ID.
            </div>
          ) : (
            filteredModels.map((m) => {
              const isSelected = m.id === value;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectModel(m.id)}
                  className={`w-full text-left p-2.5 hover:bg-[#FEF08A] transition text-xs font-mono flex flex-col gap-0.5 ${
                    isSelected ? "bg-[#FEF08A]/50 font-bold" : "bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink truncate max-w-sm">{m.id}</span>
                    <span className="comic-caption px-1 text-[8px] bg-white border border-ink text-ink shrink-0 ml-2">
                      {m.provider}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span className="truncate max-w-xs">{m.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {m.contextLength && (
                        <span>{Math.round(m.contextLength / 1000)}k ctx</span>
                      )}
                      {m.promptPrice && (
                        <span>&bull; \${m.promptPrice}/1M</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// SETTINGS VIEW MAIN COMPONENT
// ==========================================
export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey || "");
  const [maxRunCost, setMaxRunCost] = useState(settings.budgets?.maxRunCostUSD || 25);
  const [maxCritiqueRounds, setMaxCritiqueRounds] = useState(settings.critiqueLimits?.maxRounds || 3);
  const [modelRegistry, setModelRegistry] = useState(settings.modelRegistry);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live OpenRouter models
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);

  const fetchOpenRouterModels = useCallback(async () => {
    setIsLoadingModels(true);
    try {
      const res = await fetch("/api/models");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);
        }
      }
    } catch (err) {
      console.error("[SettingsView] Failed to fetch OpenRouter models:", err);
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  useEffect(() => {
    fetchOpenRouterModels();
  }, [fetchOpenRouterModels]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onSaveSettings({
        openRouterApiKey: apiKey,
        budgets: {
          maxRunCostUSD: Number(maxRunCost),
          maxStageCostUSD: 5,
        },
        critiqueLimits: {
          maxRounds: Number(maxCritiqueRounds),
          stopOnConsecutiveNoObjections: true,
        },
        modelRegistry,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateRoleModel = (role: AgentRoleId, primaryModel: string) => {
    setModelRegistry((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        primary: primaryModel,
      },
    }));
  };

  // Preset: High Rigor (Maximum Intelligence & Depth)
  const applyHighRigorPreset = () => {
    setModelRegistry((prev) => ({
      ...prev,
      orchestrator: { ...prev.orchestrator, primary: "anthropic/claude-3.7-sonnet" },
      scout: { ...prev.scout, primary: "google/gemini-2.5-flash" },
      evidence_auditor: { ...prev.evidence_auditor, primary: "deepseek/deepseek-r1" },
      problem_framer: { ...prev.problem_framer, primary: "anthropic/claude-3.7-sonnet" },
      economic_analyst: { ...prev.economic_analyst, primary: "deepseek/deepseek-r1" },
      solution_architect: { ...prev.solution_architect, primary: "anthropic/claude-3.7-sonnet" },
      critic: { ...prev.critic, primary: "deepseek/deepseek-r1" },
      revision_agent: { ...prev.revision_agent, primary: "anthropic/claude-3.5-sonnet" },
      simulation_coordinator: { ...prev.simulation_coordinator, primary: "meta-llama/llama-3.3-70b-instruct" },
      builder: { ...prev.builder, primary: "anthropic/claude-3.7-sonnet" },
      marketer: { ...prev.marketer, primary: "anthropic/claude-3.5-sonnet" },
    }));
  };

  // Preset: Cost-Optimized (Sub-$0.10/run budget)
  const applyCostOptimizedPreset = () => {
    setModelRegistry((prev) => ({
      ...prev,
      orchestrator: { ...prev.orchestrator, primary: "google/gemini-2.5-flash" },
      scout: { ...prev.scout, primary: "google/gemini-2.5-flash" },
      evidence_auditor: { ...prev.evidence_auditor, primary: "openai/o3-mini" },
      problem_framer: { ...prev.problem_framer, primary: "openai/gpt-4o" },
      economic_analyst: { ...prev.economic_analyst, primary: "openai/o3-mini" },
      solution_architect: { ...prev.solution_architect, primary: "qwen/qwen-2.5-coder-32b-instruct" },
      critic: { ...prev.critic, primary: "deepseek/deepseek-r1" },
      revision_agent: { ...prev.revision_agent, primary: "qwen/qwen-2.5-coder-32b-instruct" },
      simulation_coordinator: { ...prev.simulation_coordinator, primary: "meta-llama/llama-3.3-70b-instruct" },
      builder: { ...prev.builder, primary: "qwen/qwen-2.5-coder-32b-instruct" },
      marketer: { ...prev.marketer, primary: "google/gemini-2.5-flash" },
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="comic-panel p-5 bg-surface flex items-center justify-between">
        <div>
          <div className="comic-caption px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5 mb-2">
            <Settings className="w-3.5 h-3.5" /> SYSTEM GOVERNANCE
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-ink">
            Platform Settings
          </h2>
          <p className="text-xs font-mono text-muted mt-1 max-w-xl leading-relaxed">
            Configure OpenRouter AI credentials, role-to-model intelligence mappings, hard budget ceilings, and critique iteration limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="comic-badge px-3 py-1.5 bg-[#DCFCE7] text-ink text-xs flex items-center gap-1.5">
              <Check className="w-4 h-4 text-forest" />
              <span>Settings Saved</span>
            </div>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-ink bg-[#FEF08A] hover:bg-[#FDE047] font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center gap-1.5 text-ink"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs font-mono">
        {/* OpenRouter API Credentials */}
        <div className="comic-panel p-6 bg-surface shadow-[4px_4px_0px_#161716] space-y-4">
          <div className="flex items-center gap-2 text-base font-black font-sans uppercase text-ink border-b-2 border-ink pb-3">
            <Key className="w-4 h-4 text-ink" />
            <span>OpenRouter Gateway Credentials</span>
          </div>

          <div>
            <label className="block text-ink text-[10px] uppercase font-bold mb-1">
              OPENROUTER_API_KEY (Server-side Encrypted)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full p-2.5 border-2 border-ink bg-canvas text-ink focus:outline-none font-mono text-xs"
            />
            <p className="text-[11px] text-muted mt-1">
              Keys are strictly stored server-side and never exposed to client browsers. If left empty, local research dataset is used.
            </p>
          </div>
        </div>

        {/* Budget & Stopping Limits */}
        <div className="comic-panel p-6 bg-surface shadow-[4px_4px_0px_#161716] space-y-4">
          <div className="flex items-center gap-2 text-base font-black font-sans uppercase text-ink border-b-2 border-ink pb-3">
            <Coins className="w-4 h-4 text-ochre" />
            <span>Budget Ceilings & Stopping Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-ink text-[10px] uppercase font-bold mb-1">
                Max Budget Per Run (USD)
              </label>
              <input
                type="number"
                min={5}
                max={500}
                value={maxRunCost}
                onChange={(e) => setMaxRunCost(Number(e.target.value))}
                className="w-full p-2.5 border-2 border-ink bg-canvas text-ink font-black text-sm"
              />
              <span className="text-[10px] text-muted mt-0.5 block">
                Workflow halts automatically when spend reaches this ceiling.
              </span>
            </div>

            <div>
              <label className="block text-ink text-[10px] uppercase font-bold mb-1">
                Max Adversarial Critique Rounds
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={maxCritiqueRounds}
                onChange={(e) => setMaxCritiqueRounds(Number(e.target.value))}
                className="w-full p-2.5 border-2 border-ink bg-canvas text-ink font-black text-sm"
              />
              <span className="text-[10px] text-muted mt-0.5 block">
                Adversarial loop terminates if no new objections appear across 2 rounds.
              </span>
            </div>
          </div>
        </div>

        {/* Model Registry By Role */}
        <div className="comic-panel p-6 bg-surface shadow-[4px_4px_0px_#161716] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-ink pb-3">
            <div className="flex items-center gap-2 text-base font-black font-sans uppercase text-ink">
              <Cpu className="w-4 h-4 text-forest" />
              <span>Live OpenRouter Model Registry by Agent</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="comic-badge px-2.5 py-1 bg-[#FEF08A] text-ink text-[10px] font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                <span>{isLoadingModels ? "Fetching OpenRouter..." : `${models.length} Models Available`}</span>
              </span>

              <button
                type="button"
                onClick={fetchOpenRouterModels}
                disabled={isLoadingModels}
                className="p-1.5 border-2 border-ink bg-surface hover:bg-canvas text-ink shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 transition"
                title="Refresh models from OpenRouter"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModels ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-canvas/70 p-3 border-2 border-ink">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-muted">Quick Presets:</span>
              <button
                type="button"
                onClick={applyHighRigorPreset}
                className="px-2.5 py-1 bg-surface hover:bg-[#FEF08A] border-2 border-ink text-[10px] font-bold uppercase transition flex items-center gap-1 shadow-[2px_2px_0px_#161716]"
              >
                <Sparkles className="w-3 h-3 text-ochre" />
                <span>High Rigor</span>
              </button>
              <button
                type="button"
                onClick={applyCostOptimizedPreset}
                className="px-2.5 py-1 bg-surface hover:bg-[#FEF08A] border-2 border-ink text-[10px] font-bold uppercase transition flex items-center gap-1 shadow-[2px_2px_0px_#161716]"
              >
                <Zap className="w-3 h-3 text-forest" />
                <span>Cost Optimized</span>
              </button>
            </div>

            <div className="text-[10px] text-muted font-mono italic">
              Click any input below to search catalog, or type any custom model ID directly.
            </div>
          </div>

          {/* Agent Role Rows */}
          <div className="divide-y-2 border-2 border-ink bg-surface divide-line-light">
            {Object.entries(modelRegistry).map(([role, cfg]) => {
              const meta = AGENT_VISUALS[role as AgentRoleId];
              const hint = AGENT_MODEL_HINTS[role as AgentRoleId] || "";
              const currentModelInfo = models.find((m) => m.id === cfg.primary);

              return (
                <div key={role} className="p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-canvas/30 transition">
                  {/* Agent Character Info */}
                  <div className="w-full lg:w-72 shrink-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="comic-caption px-1.5 py-0.2 text-[8px] bg-canvas border border-ink">
                        {role.toUpperCase()}
                      </span>
                      <span className="font-sans font-black text-xs text-ink uppercase">
                        {meta ? meta.alias : role}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted leading-tight font-medium">
                      {hint}
                    </p>
                  </div>

                  {/* Searchable and Typable Combobox */}
                  <div className="flex-1 w-full space-y-1">
                    <SearchableModelInput
                      value={cfg.primary}
                      onChange={(newModelId) => updateRoleModel(role as AgentRoleId, newModelId)}
                      models={models}
                    />

                    {/* Active Model Metadata Pill */}
                    <div className="flex items-center gap-2 text-[10px] text-muted">
                      <span className="font-bold text-ink truncate max-w-xs">{cfg.primary}</span>
                      {currentModelInfo?.contextLength && (
                        <span>&bull; {Math.round(currentModelInfo.contextLength / 1000)}k context</span>
                      )}
                      {currentModelInfo?.promptPrice && (
                        <span>&bull; \${currentModelInfo.promptPrice}/1M prompt</span>
                      )}
                      {currentModelInfo?.provider && (
                        <span className="comic-caption px-1 text-[8px] bg-canvas border border-ink/40">
                          {currentModelInfo.provider}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 border-2 border-ink bg-forest hover:bg-forest/90 text-white font-bold uppercase transition flex items-center gap-2 shadow-[2px_2px_0px_#161716] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Settings..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
