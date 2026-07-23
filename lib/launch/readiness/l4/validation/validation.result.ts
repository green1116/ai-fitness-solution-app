/**
 * Launch L4 — Validation result
 */

import { listValidationChecks } from "./validation.checks";
import type {
  EvaluateValidationResultInput,
  ValidationResult,
} from "./validation.types";

const results = new Map<string, ValidationResult>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneResult(result: ValidationResult): ValidationResult {
  return { ...result };
}

export function evaluateValidationResult(
  input: EvaluateValidationResultInput,
): ValidationResult {
  const scenarioId = input.scenarioId.trim();
  if (!scenarioId) throw new Error("validationResult.scenarioId is required");

  const checks = listValidationChecks({ scenarioId });
  if (checks.length < 1) {
    throw new Error(`no validation checks for scenario: ${scenarioId}`);
  }

  const passCount = checks.filter((c) => c.result === "PASS").length;
  const warnCount = checks.filter((c) => c.result === "WARN").length;
  const failCount = checks.filter((c) => c.result === "FAIL").length;
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce((sum, c) => {
    if (c.result === "PASS") return sum + c.weight;
    if (c.result === "WARN") return sum + c.weight * 0.5;
    return sum;
  }, 0);
  const score =
    totalWeight === 0
      ? 0
      : Math.max(0, Math.min(100, Math.round((earned / totalWeight) * 100)));
  const verdict =
    failCount > 0 ? "FAIL" : warnCount > 0 ? "WARN" : ("PASS" as const);

  const id = input.id?.trim() || createId("l4res");
  if (results.has(id)) {
    throw new Error(`validation result already exists: ${id}`);
  }

  const result: ValidationResult = {
    id,
    scenarioId,
    score,
    passCount,
    warnCount,
    failCount,
    verdict,
    detail: `verdict=${verdict} score=${score}`,
    evaluatedAt: nowIso(),
  };
  results.set(id, result);
  return cloneResult(result);
}

export function getValidationResult(
  id: string,
): ValidationResult | undefined {
  const result = results.get(id.trim());
  return result ? cloneResult(result) : undefined;
}

export function listValidationResults(filter?: {
  scenarioId?: string;
}): ValidationResult[] {
  let result = [...results.values()];
  if (filter?.scenarioId) {
    const sid = filter.scenarioId.trim();
    result = result.filter((r) => r.scenarioId === sid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneResult);
}

export function clearValidationResults(): void {
  results.clear();
}
