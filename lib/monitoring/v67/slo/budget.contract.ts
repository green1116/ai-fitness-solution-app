/**
 * V67 P4 — Error budget & burn-rate window contract (declarative)
 */
import type { BudgetContractManifest, ErrorBudgetRule } from "./governance.types";
import { V67_SLO_GOVERNANCE_VERSION } from "./governance.types";

export const ERROR_BUDGET_CATALOG: ErrorBudgetRule[] = [
  {
    id: "EB-001",
    sloRef: "SLOT-001",
    budgetPercent: 0.1,
    window: "30d",
    windowKind: "rolling",
    burnRateThreshold: 2,
    required: true,
    description: "99.9% availability → 0.1% monthly error budget",
  },
  {
    id: "EB-002",
    sloRef: "SLOT-002",
    budgetPercent: 5,
    window: "1h",
    windowKind: "rolling",
    burnRateThreshold: 3,
    required: true,
    description: "Latency SLO burn rate alert at 3x",
  },
  {
    id: "EB-003",
    sloRef: "SLOT-003",
    budgetPercent: 1,
    window: "5m",
    windowKind: "rolling",
    burnRateThreshold: 5,
    required: true,
    description: "Error rate budget exhaustion fast-burn",
  },
  {
    id: "EB-004",
    sloRef: "SLOT-004",
    budgetPercent: 1,
    window: "24h",
    windowKind: "calendar",
    burnRateThreshold: 2,
    required: true,
    description: "Health probe daily error budget",
  },
  {
    id: "EB-005",
    sloRef: "SLOT-005",
    budgetPercent: 0,
    window: "24h",
    windowKind: "fixed",
    burnRateThreshold: 1,
    required: true,
    description: "Zero-tolerance verify chain budget",
  },
  {
    id: "EB-006",
    sloRef: "SLOT-006",
    budgetPercent: 10,
    window: "30d",
    windowKind: "rolling",
    burnRateThreshold: 1.5,
    required: false,
    description: "MTTR SLO flexible budget",
  },
  {
    id: "EB-007",
    sloRef: "SLOT-001",
    budgetPercent: 0.1,
    window: "7d",
    windowKind: "rolling",
    burnRateThreshold: 4,
    required: true,
    description: "Weekly availability burn-rate window",
  },
  {
    id: "EB-008",
    sloRef: "SLOT-003",
    budgetPercent: 1,
    window: "1h",
    windowKind: "rolling",
    burnRateThreshold: 10,
    required: true,
    description: "Hourly error budget fast-burn detection",
  },
];

export function buildBudgetContractManifest(): BudgetContractManifest {
  const rules = ERROR_BUDGET_CATALOG;
  const windowKinds = new Set(rules.map((r) => r.windowKind));
  const contractComplete = rules.length >= 6 && windowKinds.size >= 3;

  return {
    version: V67_SLO_GOVERNANCE_VERSION,
    ruleCount: rules.length,
    windowKindCount: windowKinds.size,
    contractComplete,
    rules,
    summary: [
      `error-budget rules=${rules.length}`,
      `windowKinds=${windowKinds.size}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}

export function getBudgetRulesBySloRef(sloRef: string): ErrorBudgetRule[] {
  return ERROR_BUDGET_CATALOG.filter((r) => r.sloRef === sloRef);
}

export function computeDeclarativeErrorBudget(input: {
  objectivePercent: number;
  windowDays: number;
}): number {
  return Number(((100 - input.objectivePercent) / 100) * input.windowDays * 24 * 60);
}
