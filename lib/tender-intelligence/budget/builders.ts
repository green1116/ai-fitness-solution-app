import { buildTenderProjectSnapshot } from "../shared/tender-input";
import type { BudgetIntelligence, BudgetTier } from "./types";

function inferBudgetTier(budgetCny: number): BudgetTier {
  if (budgetCny >= 5_000_000) return "enterprise";
  if (budgetCny >= 2_000_000) return "premium";
  if (budgetCny >= 800_000) return "standard";
  return "economy";
}

export function buildBudgetIntelligence(input?: { deploymentId?: string }): BudgetIntelligence {
  const deploymentId = input?.deploymentId ?? "budget-default";
  const snapshot = buildTenderProjectSnapshot({ deploymentId });
  const budgetTier = inferBudgetTier(snapshot.estimatedBudgetCny);

  return {
    intelligenceId: `budget-intel-${deploymentId}`,
    budgetTier,
    budgetPressure: "moderate",
    costSensitivity: "value-driven",
    estimatedBudgetCny: snapshot.estimatedBudgetCny,
    summary: `预算档位 ${budgetTier}，压力 moderate，成本敏感度 value-driven，估算 ¥${snapshot.estimatedBudgetCny.toLocaleString()}`,
  };
}
