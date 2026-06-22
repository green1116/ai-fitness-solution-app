/**
 * V62 P3 — Governance: safety guards
 */

import type { ExecutionAction } from "@/lib/ai-execution/core/execution.types";
import { validateExecutionAction, ExecutionValidationError } from "@/lib/ai-execution/core/execution.validation";

export class SafetyGuardError extends Error {
  readonly code = "SAFETY_GUARD_BLOCKED";
  constructor(message: string) {
    super(message);
    this.name = "SafetyGuardError";
  }
}

const FROZEN_PATH_PATTERNS = [
  /lib\/quote-lifecycle/,
  /app\/\(product\)/,
  /v57/i,
  /v58/i,
];

export function assertNoFrozenSystemMutation(action: ExecutionAction): void {
  const payload = JSON.stringify(action.payload ?? {});
  for (const pattern of FROZEN_PATH_PATTERNS) {
    if (pattern.test(payload)) {
      throw new SafetyGuardError("Cannot target frozen V57/V58 systems");
    }
  }
}

export function guardExecutionAction(action: ExecutionAction): void {
  try {
    validateExecutionAction(action);
  } catch (err) {
    if (err instanceof ExecutionValidationError) {
      throw new SafetyGuardError(err.message);
    }
    throw err;
  }

  assertNoFrozenSystemMutation(action);

  if (action.targetSystem === "V59") {
    const p = action.payload as Record<string, unknown> | undefined;
    if (p?.mutateBilling || p?.createCheckout) {
      throw new SafetyGuardError("V59 billing mutations blocked for autonomous company");
    }
  }
}

export function guardExecutionBatch(actions: ExecutionAction[]): ExecutionAction[] {
  const safe: ExecutionAction[] = [];
  for (const action of actions) {
    try {
      guardExecutionAction(action);
      safe.push(action);
    } catch {
      // skip unsafe actions — logged by caller
    }
  }
  return safe;
}
