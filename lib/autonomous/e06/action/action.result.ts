/**
 * E06-P2 — Business Action Result helpers
 */

import type {
  ActionDefinition,
  ActionEffectRecord,
  ActionExecutionResult,
} from "./action.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function createActionEffectRecord(
  action: ActionDefinition,
  policyEffect: string,
): ActionEffectRecord {
  return {
    actionId: action.id,
    kind: action.kind,
    effect: action.effect,
    operationId: action.operationId,
    policyEffect,
    at: nowIso(),
    readOnly: true,
  };
}

export function summarizeActionResult(result: ActionExecutionResult): string {
  return [
    `action=${result.actionId}`,
    `kind=${result.kind}`,
    `operation=${result.operationId}`,
    `status=${result.status}`,
    `effect=${result.effect?.effect ?? "none"}`,
    `durationMs=${result.duration}`,
  ].join(" ");
}

export function assertActionResultPass(
  result: ActionExecutionResult,
): asserts result is ActionExecutionResult & {
  success: true;
  status: "result";
} {
  if (!result.success || result.status !== "result") {
    throw new Error(
      `E06 action failed: ${result.errorMessage ?? result.status} (${summarizeActionResult(result)})`,
    );
  }
}
