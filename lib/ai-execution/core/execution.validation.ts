/**
 * V62 P2 — Execution validation layer (required before all system actions)
 */

import type { ExecutionAction } from "./execution.types";

export class ExecutionValidationError extends Error {
  readonly code = "EXECUTION_VALIDATION_FAILED";
  constructor(message: string) {
    super(message);
    this.name = "ExecutionValidationError";
  }
}

const FORBIDDEN_PAYLOAD_KEYS = ["stripeSecret", "bypassFeatureGate", "skipAuth", "rawSql"];

export function validateExecutionAction(action: ExecutionAction): void {
  if (!action.id || !action.organizationId) {
    throw new ExecutionValidationError("action id and organizationId required");
  }

  if (!["GROWTH", "SALES", "PRICING", "CRM", "SYSTEM"].includes(action.type)) {
    throw new ExecutionValidationError(`invalid action type: ${action.type}`);
  }

  if (!["V60", "V61", "V59"].includes(action.targetSystem)) {
    throw new ExecutionValidationError(`invalid target system: ${action.targetSystem}`);
  }

  if (action.type === "PRICING") {
    const payload = action.payload as Record<string, unknown> | undefined;
    if (payload?.mutateBilling === true || payload?.stripePriceId) {
      throw new ExecutionValidationError("pricing actions cannot mutate billing/stripe");
    }
  }

  const payloadStr = JSON.stringify(action.payload ?? {});
  for (const key of FORBIDDEN_PAYLOAD_KEYS) {
    if (payloadStr.toLowerCase().includes(key.toLowerCase())) {
      throw new ExecutionValidationError(`forbidden payload key: ${key}`);
    }
  }
}

export function validateExecutionPlan(actions: ExecutionAction[]): ExecutionAction[] {
  return actions.filter((a) => {
    try {
      validateExecutionAction(a);
      return true;
    } catch {
      return false;
    }
  });
}
