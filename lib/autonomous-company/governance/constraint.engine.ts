/**
 * V62 P3 — Governance: constraint engine
 */

import type { CompanyState } from "../core/company.state";
import type { ExecutionAction } from "@/lib/ai-execution/core/execution.types";

export const COMPANY_CONSTRAINTS = {
  maxActionsPerCycle: 10,
  maxHighPriorityPerCycle: 5,
  minConversionRate: 0,
  maxChurnBeforeHalt: 50,
  maxErrorRateBeforeHeal: 20,
} as const;

export class CompanyConstraintError extends Error {
  readonly code = "COMPANY_CONSTRAINT_VIOLATION";
  constructor(message: string) {
    super(message);
    this.name = "CompanyConstraintError";
  }
}

export function validateCompanyConstraints(state: CompanyState, actions: ExecutionAction[]): void {
  if (actions.length > COMPANY_CONSTRAINTS.maxActionsPerCycle) {
    throw new CompanyConstraintError(
      `Exceeded max actions per cycle (${COMPANY_CONSTRAINTS.maxActionsPerCycle})`,
    );
  }

  const highCount = actions.filter((a) => a.priority === "HIGH").length;
  if (highCount > COMPANY_CONSTRAINTS.maxHighPriorityPerCycle) {
    throw new CompanyConstraintError("Too many HIGH priority actions in single cycle");
  }

  if (state.metrics.churnRate > COMPANY_CONSTRAINTS.maxChurnBeforeHalt) {
    throw new CompanyConstraintError("Churn rate too high — cycle halted for safety");
  }
}

export function trimActionsToConstraints(actions: ExecutionAction[]): ExecutionAction[] {
  const high = actions.filter((a) => a.priority === "HIGH").slice(0, COMPANY_CONSTRAINTS.maxHighPriorityPerCycle);
  const rest = actions.filter((a) => a.priority !== "HIGH");
  return [...high, ...rest].slice(0, COMPANY_CONSTRAINTS.maxActionsPerCycle);
}
