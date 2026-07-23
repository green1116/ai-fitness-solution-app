/**
 * Commercialization P7 — Compliance checks
 */

import type {
  ComplianceCheck,
  RunComplianceCheckInput,
} from "./compliance.types";

const checks = new Map<string, ComplianceCheck>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCheck(check: ComplianceCheck): ComplianceCheck {
  return { ...check };
}

export function runComplianceCheck(
  input: RunComplianceCheckInput,
): ComplianceCheck {
  const name = input.name.trim();
  const component = input.component.trim();
  if (!name) throw new Error("complianceCheck.name is required");
  if (!component) throw new Error("complianceCheck.component is required");

  const weight =
    input.weight === undefined ? 1 : Math.max(1, Math.round(input.weight));

  const id = input.id?.trim() || createId("cmp");
  if (checks.has(id)) {
    throw new Error(`compliance check already exists: ${id}`);
  }

  const check: ComplianceCheck = {
    id,
    name,
    component,
    ok: input.ok === true,
    weight,
    detail: `component=${component} ok=${input.ok === true} weight=${weight}`,
    checkedAt: nowIso(),
  };
  checks.set(id, check);
  return cloneCheck(check);
}

export function getComplianceCheck(
  id: string,
): ComplianceCheck | undefined {
  const check = checks.get(id.trim());
  return check ? cloneCheck(check) : undefined;
}

export function listComplianceChecks(filter?: {
  component?: string;
  ok?: boolean;
}): ComplianceCheck[] {
  let result = [...checks.values()];
  if (filter?.component) {
    const component = filter.component.trim();
    result = result.filter((c) => c.component === component);
  }
  if (filter?.ok !== undefined) {
    result = result.filter((c) => c.ok === filter.ok);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCheck);
}

export function clearComplianceChecks(): void {
  checks.clear();
}
