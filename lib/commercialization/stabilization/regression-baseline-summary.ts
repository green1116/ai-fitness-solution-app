export const REGRESSION_BASELINE_SUMMARY_VERSION = "3.7-regression-baseline-1" as const;

export type RegressionCheck = {
  id: string;
  label: string;
  verifyScript: string;
  required: boolean;
};

export type RegressionBaselineSummary = {
  version: typeof REGRESSION_BASELINE_SUMMARY_VERSION;
  baselineId: string;
  checks: RegressionCheck[];
  checkCount: number;
  baselineReady: boolean;
  regressionBaselineSummary: string;
  summary: string;
};

const BASELINE_CHECKS: RegressionCheck[] = [
  {
    id: "hub",
    label: "Canonical hub foundation",
    verifyScript: "verify:commercialization-v37-hub",
    required: true,
  },
  {
    id: "hub-freeze",
    label: "Hub freeze regression",
    verifyScript: "verify:commercialization-v37-hub-freeze",
    required: true,
  },
  {
    id: "product",
    label: "Product foundation",
    verifyScript: "verify:commercialization-product",
    required: true,
  },
  {
    id: "v37",
    label: "V3.7 aggregate",
    verifyScript: "verify:commercialization-v37",
    required: false,
  },
];

export function buildRegressionBaselineSummary(input: {
  deploymentId: string;
  hubFrozen: boolean;
}): RegressionBaselineSummary {
  const baselineId = `RBASE-V37-${input.deploymentId.slice(0, 8)}`;
  const baselineReady = input.hubFrozen && BASELINE_CHECKS.filter((c) => c.required).length > 0;

  return {
    version: REGRESSION_BASELINE_SUMMARY_VERSION,
    baselineId,
    checks: BASELINE_CHECKS,
    checkCount: BASELINE_CHECKS.length,
    baselineReady,
    regressionBaselineSummary: BASELINE_CHECKS.map((c) => c.verifyScript).join(" "),
    summary: `regression-baseline id=${baselineId} ready=${baselineReady} checks=${BASELINE_CHECKS.length}`,
  };
}
