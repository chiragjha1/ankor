"use client";

import React from "react";
import { EconomicModel, CostRecord } from "@/types";
import {
  BarChart3,
  Calculator,
  Coins,
  TrendingUp,
  Cpu,
} from "lucide-react";

interface AnalyticsViewProps {
  economicModel?: EconomicModel;
  costs: CostRecord[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  economicModel,
  costs,
}) => {
  const totalTokens = costs.reduce((acc, c) => acc + c.tokensPrompt + c.tokensCompletion, 0);
  const totalCostUSD = costs.reduce((acc, c) => acc + c.estimatedCostUSD, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="comic-panel p-5 bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="comic-caption px-2 py-0.5 text-[10px] inline-flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> QUANTITATIVE ECONOMICS & TELEMETRY
          </div>
          <h2 className="text-2xl font-black font-sans uppercase tracking-tight text-ink">
            Financial & Operating Analytics
          </h2>
          <p className="text-xs font-mono text-muted mt-1 max-w-2xl leading-relaxed">
            All arithmetic is computed deterministically in code. The system does not hallucinate financial multiples or treat hypothetical adoption as fact.
          </p>
        </div>

        {economicModel && (
          <div className="comic-badge px-3.5 py-2 bg-[#DCFCE7] text-ink text-xs font-black">
            VERDICT: {economicModel.viabilityVerdict}
          </div>
        )}
      </div>

      {/* Model Spend Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="comic-panel p-4 bg-surface text-xs font-mono space-y-1">
          <div className="text-muted uppercase text-[10px] font-bold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-ochre" /> Cumulative Model Spend
          </div>
          <div className="text-2xl font-black text-ink">\${totalCostUSD.toFixed(4)}</div>
          <div className="text-[10px] text-muted">Across 10 core agent tasks</div>
        </div>

        <div className="comic-panel p-4 bg-surface text-xs font-mono space-y-1">
          <div className="text-muted uppercase text-[10px] font-bold flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-ink" /> Total Tokens Processed
          </div>
          <div className="text-2xl font-black text-ink">{totalTokens.toLocaleString()}</div>
          <div className="text-[10px] text-muted">Prompt + Completion Tokens</div>
        </div>

        <div className="comic-panel p-4 bg-surface text-xs font-mono space-y-1">
          <div className="text-muted uppercase text-[10px] font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-forest" /> Base Case LTV / CAC
          </div>
          <div className="text-2xl font-black text-forest">
            {economicModel?.scenarios.base.ltvToCacRatio}x
          </div>
          <div className="text-[10px] text-muted font-bold">Benchmark &gt; 3.0x is healthy</div>
        </div>
      </div>

      {/* Deterministic Economic Scenarios Table */}
      {economicModel && (
        <div className="comic-panel p-6 bg-surface shadow-[4px_4px_0px_#161716] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-ink pb-3">
            <div className="text-xs font-mono font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-ink" /> Deterministic Three-Scenario Model
            </div>
            <div className="text-[11px] font-mono text-forest font-bold">
              {economicModel.rationale}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b-2 border-ink text-ink font-black uppercase text-[10px]">
                  <th className="py-2.5">Financial Metric</th>
                  <th className="py-2.5">Conservative Case</th>
                  <th className="py-2.5 font-black text-forest">Base Case (Expected)</th>
                  <th className="py-2.5">Optimistic Case</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b-2 border-ink divide-line-light">
                <tr>
                  <td className="py-2.5 text-muted font-bold">Target Customer Count</td>
                  <td className="py-2.5 font-bold text-ink">
                    {economicModel.scenarios.conservative.targetCustomerCount} teams
                  </td>
                  <td className="py-2.5 font-black text-forest">
                    {economicModel.scenarios.base.targetCustomerCount} teams
                  </td>
                  <td className="py-2.5 font-bold text-ink">
                    {economicModel.scenarios.optimistic.targetCustomerCount} teams
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted font-bold">Average Price (Monthly)</td>
                  <td className="py-2.5 text-ink">\${economicModel.scenarios.conservative.averagePriceMonthlyUSD}/mo</td>
                  <td className="py-2.5 font-black text-forest">\${economicModel.scenarios.base.averagePriceMonthlyUSD}/mo</td>
                  <td className="py-2.5 text-ink">\${economicModel.scenarios.optimistic.averagePriceMonthlyUSD}/mo</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted font-bold">Monthly Gross Revenue</td>
                  <td className="py-2.5 text-ink font-bold">
                    \${economicModel.scenarios.conservative.monthlyRevenueUSD.toLocaleString()}
                  </td>
                  <td className="py-2.5 font-black text-forest">
                    \${economicModel.scenarios.base.monthlyRevenueUSD.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-ink font-bold">
                    \${economicModel.scenarios.optimistic.monthlyRevenueUSD.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted font-bold">Gross Margin %</td>
                  <td className="py-2.5 text-ink">{economicModel.scenarios.conservative.grossMarginPercent}%</td>
                  <td className="py-2.5 font-black text-forest">{economicModel.scenarios.base.grossMarginPercent}%</td>
                  <td className="py-2.5 text-ink">{economicModel.scenarios.optimistic.grossMarginPercent}%</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted font-bold">Customer Acquisition Cost (CAC)</td>
                  <td className="py-2.5 text-ink">\${economicModel.scenarios.conservative.customerAcquisitionCostUSD}</td>
                  <td className="py-2.5 font-black text-forest">\${economicModel.scenarios.base.customerAcquisitionCostUSD}</td>
                  <td className="py-2.5 text-ink">\${economicModel.scenarios.optimistic.customerAcquisitionCostUSD}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted font-bold">Customer Lifetime Value (LTV)</td>
                  <td className="py-2.5 text-ink font-bold">\${economicModel.scenarios.conservative.customerLifetimeValueUSD}</td>
                  <td className="py-2.5 font-black text-forest">\${economicModel.scenarios.base.customerLifetimeValueUSD}</td>
                  <td className="py-2.5 text-ink font-bold">\${economicModel.scenarios.optimistic.customerLifetimeValueUSD}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted font-bold">LTV / CAC Multiple</td>
                  <td className="py-2.5 text-ink font-bold">{economicModel.scenarios.conservative.ltvToCacRatio}x</td>
                  <td className="py-2.5 font-black text-forest">{economicModel.scenarios.base.ltvToCacRatio}x</td>
                  <td className="py-2.5 text-ink font-bold">{economicModel.scenarios.optimistic.ltvToCacRatio}x</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-muted font-bold">Break-even Customer Count</td>
                  <td className="py-2.5 text-ink font-bold">{economicModel.scenarios.conservative.breakEvenCustomerCount} teams</td>
                  <td className="py-2.5 font-black text-forest">{economicModel.scenarios.base.breakEvenCustomerCount} teams</td>
                  <td className="py-2.5 text-ink font-bold">{economicModel.scenarios.optimistic.breakEvenCustomerCount} teams</td>
                </tr>
                <tr className="bg-caption/40">
                  <td className="py-3 text-ink font-black uppercase">Monthly Net Operating Profit</td>
                  <td className="py-3 text-ink font-bold">
                    \${economicModel.scenarios.conservative.monthlyNetOperatingProfitUSD.toLocaleString()}
                  </td>
                  <td className="py-3 text-forest font-black text-sm">
                    \${economicModel.scenarios.base.monthlyNetOperatingProfitUSD.toLocaleString()}
                  </td>
                  <td className="py-3 text-ink font-bold">
                    \${economicModel.scenarios.optimistic.monthlyNetOperatingProfitUSD.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assumptions Breakdown */}
      {economicModel && (
        <div className="comic-panel p-6 bg-surface shadow-[4px_4px_0px_#161716] space-y-4">
          <div className="text-xs font-mono font-black uppercase tracking-wider text-ink border-b-2 border-ink pb-2">
            Structured Model Assumptions & Provenance
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {economicModel.assumptions.map((assump) => (
              <div
                key={assump.id}
                className="p-3.5 border-2 border-ink bg-canvas/30 space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-ink">{assump.name}</span>
                  <span className="comic-badge px-2 py-0.5 bg-surface text-ink text-[9px]">
                    {assump.epistemicStatus}
                  </span>
                </div>
                <div className="text-base font-black text-forest">
                  {assump.value.toLocaleString()} {assump.unit}
                </div>
                <div className="text-muted text-[11px] leading-relaxed font-medium">{assump.rationale}</div>
                <div className="text-[10px] text-muted pt-1 border-t border-line-light flex justify-between font-bold">
                  <span>Source: {assump.source}</span>
                  <span>Sensitivity: {assump.sensitivity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
