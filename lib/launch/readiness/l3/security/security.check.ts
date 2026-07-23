/**
 * Launch L3 — Security check
 */

import { SECURITY_CHECK_RESULTS } from "../runtime/runtime.constants";
import { getSecurityPolicy } from "./security.policy";
import type {
  RunSecurityCheckInput,
  SecurityCheck,
  SecurityCheckResult,
} from "./security.types";

const checks = new Map<string, SecurityCheck>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCheck(check: SecurityCheck): SecurityCheck {
  return { ...check };
}

export function runSecurityCheck(
  input: RunSecurityCheckInput,
): SecurityCheck {
  const name = input.name.trim();
  const policyId = input.policyId.trim();
  if (!name) throw new Error("securityCheck.name is required");
  if (!policyId) throw new Error("securityCheck.policyId is required");
  if (!getSecurityPolicy(policyId)) {
    throw new Error(`security policy not found: ${policyId}`);
  }
  if (!(SECURITY_CHECK_RESULTS as readonly string[]).includes(input.result)) {
    throw new Error(`invalid security check result: ${input.result}`);
  }

  const id = input.id?.trim() || createId("l3sec");
  if (checks.has(id)) {
    throw new Error(`security check already exists: ${id}`);
  }

  const check: SecurityCheck = {
    id,
    policyId,
    name,
    result: input.result,
    detail: `result=${input.result}`,
    checkedAt: nowIso(),
  };
  checks.set(id, check);
  return cloneCheck(check);
}

export function getSecurityCheck(id: string): SecurityCheck | undefined {
  const check = checks.get(id.trim());
  return check ? cloneCheck(check) : undefined;
}

export function listSecurityChecks(filter?: {
  policyId?: string;
  result?: SecurityCheckResult;
}): SecurityCheck[] {
  let result = [...checks.values()];
  if (filter?.policyId) {
    const pid = filter.policyId.trim();
    result = result.filter((c) => c.policyId === pid);
  }
  if (filter?.result) {
    result = result.filter((c) => c.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCheck);
}

export function clearSecurityChecks(): void {
  checks.clear();
}
