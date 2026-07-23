/**
 * Launch L4 — Validation checks
 */

import { VALIDATION_CHECK_RESULTS } from "../scenario/scenario.constants";
import { getScenario } from "../scenario/scenario.registry";
import type {
  RunValidationCheckInput,
  ValidationCheck,
  ValidationCheckResult,
} from "./validation.types";

const checks = new Map<string, ValidationCheck>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCheck(check: ValidationCheck): ValidationCheck {
  return { ...check, metadata: { ...check.metadata } };
}

export function runValidationCheck(
  input: RunValidationCheckInput,
): ValidationCheck {
  const name = input.name.trim();
  const component = input.component.trim();
  const scenarioId = input.scenarioId.trim();
  if (!name) throw new Error("validationCheck.name is required");
  if (!component) throw new Error("validationCheck.component is required");
  if (!scenarioId) throw new Error("validationCheck.scenarioId is required");
  if (!getScenario(scenarioId)) {
    throw new Error(`scenario not found: ${scenarioId}`);
  }
  if (
    !(VALIDATION_CHECK_RESULTS as readonly string[]).includes(input.result)
  ) {
    throw new Error(`invalid validation check result: ${input.result}`);
  }

  const weight =
    input.weight === undefined ? 1 : Math.max(1, Math.round(input.weight));
  const id = input.id?.trim() || createId("l4chk");
  if (checks.has(id)) {
    throw new Error(`validation check already exists: ${id}`);
  }

  const check: ValidationCheck = {
    id,
    scenarioId,
    name,
    component,
    result: input.result,
    weight,
    detail: `component=${component} result=${input.result} weight=${weight}`,
    metadata: { ...(input.metadata ?? {}) },
    checkedAt: nowIso(),
  };
  checks.set(id, check);
  return cloneCheck(check);
}

export function getValidationCheck(
  id: string,
): ValidationCheck | undefined {
  const check = checks.get(id.trim());
  return check ? cloneCheck(check) : undefined;
}

export function listValidationChecks(filter?: {
  scenarioId?: string;
  result?: ValidationCheckResult;
}): ValidationCheck[] {
  let result = [...checks.values()];
  if (filter?.scenarioId) {
    const sid = filter.scenarioId.trim();
    result = result.filter((c) => c.scenarioId === sid);
  }
  if (filter?.result) {
    result = result.filter((c) => c.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCheck);
}

export function clearValidationChecks(): void {
  checks.clear();
}
