import { EconomicScenario, EconomicAssumption, EconomicModel } from "@/types";

export interface RawScenarioInput {
  targetCustomerCount: number;
  averagePriceMonthlyUSD: number;
  grossMarginPercent: number;
  customerAcquisitionCostUSD: number;
  monthlyChurnPercent: number;
  monthlyInferenceCostUSD: number;
  monthlyServerCostUSD: number;
}

export function computeEconomicScenario(input: RawScenarioInput): EconomicScenario {
  const {
    targetCustomerCount,
    averagePriceMonthlyUSD,
    grossMarginPercent,
    customerAcquisitionCostUSD,
    monthlyChurnPercent,
    monthlyInferenceCostUSD,
    monthlyServerCostUSD,
  } = input;

  const monthlyRevenueUSD = Number((targetCustomerCount * averagePriceMonthlyUSD).toFixed(2));
  const monthlyGrossProfitUSD = Number((monthlyRevenueUSD * (grossMarginPercent / 100)).toFixed(2));
  const monthlyNetOperatingProfitUSD = Number(
    (monthlyGrossProfitUSD - monthlyInferenceCostUSD - monthlyServerCostUSD).toFixed(2)
  );

  const customerLifetimeMonths =
    monthlyChurnPercent > 0 ? Number((100 / monthlyChurnPercent).toFixed(1)) : 60;

  const unitGrossProfitMonthly = averagePriceMonthlyUSD * (grossMarginPercent / 100);
  const customerLifetimeValueUSD = Number(
    (customerLifetimeMonths * unitGrossProfitMonthly).toFixed(2)
  );

  const ltvToCacRatio =
    customerAcquisitionCostUSD > 0
      ? Number((customerLifetimeValueUSD / customerAcquisitionCostUSD).toFixed(1))
      : 99.9;

  const fixedMonthlyCosts = monthlyInferenceCostUSD + monthlyServerCostUSD;
  const breakEvenCustomerCount =
    unitGrossProfitMonthly > 0 ? Math.ceil(fixedMonthlyCosts / unitGrossProfitMonthly) : 0;

  const paybackPeriodMonths =
    unitGrossProfitMonthly > 0
      ? Number((customerAcquisitionCostUSD / unitGrossProfitMonthly).toFixed(1))
      : 0;

  return {
    targetCustomerCount,
    averagePriceMonthlyUSD,
    grossMarginPercent,
    customerAcquisitionCostUSD,
    monthlyChurnPercent,
    monthlyInferenceCostUSD,
    monthlyServerCostUSD,
    monthlyRevenueUSD,
    monthlyGrossProfitUSD,
    monthlyNetOperatingProfitUSD,
    customerLifetimeMonths,
    customerLifetimeValueUSD,
    ltvToCacRatio,
    breakEvenCustomerCount,
    paybackPeriodMonths,
  };
}

export function evaluateModelViability(
  conservative: EconomicScenario,
  base: EconomicScenario
): { verdict: "VIABLE" | "MARGINAL" | "UNVIABLE" | "INSUFFICIENT_EVIDENCE"; rationale: string } {
  if (base.monthlyRevenueUSD === 0 || base.averagePriceMonthlyUSD === 0) {
    return {
      verdict: "INSUFFICIENT_EVIDENCE",
      rationale: "Price or customer count data is missing or zero.",
    };
  }

  if (base.ltvToCacRatio >= 3.0 && base.monthlyNetOperatingProfitUSD > 0 && conservative.monthlyNetOperatingProfitUSD >= 0) {
    return {
      verdict: "VIABLE",
      rationale: `Strong economics. Base LTV/CAC is ${base.ltvToCacRatio}x (healthy > 3x), and break-even customer count is low (${base.breakEvenCustomerCount} customers). Conservative case remains profitable at \$${conservative.monthlyNetOperatingProfitUSD}/mo.`,
    };
  }

  if (base.ltvToCacRatio >= 1.8 && base.monthlyNetOperatingProfitUSD > 0) {
    return {
      verdict: "MARGINAL",
      rationale: `Viability is fragile. Base LTV/CAC is ${base.ltvToCacRatio}x. Conservative case yields a loss or narrow margin. Distribution must be tested before software development.`,
    };
  }

  return {
    verdict: "UNVIABLE",
    rationale: `Customer acquisition cost (\$${base.customerAcquisitionCostUSD}) or churn (${base.monthlyChurnPercent}%) overwhelms gross margin. Business is unlikely to reach profitability with current pricing and acquisition model.`,
  };
}
