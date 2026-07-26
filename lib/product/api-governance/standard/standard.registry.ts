/**
 * Product API Governance — standard registry (definition only)
 */

import { GOVERNANCE_STANDARD_LEVELS } from "../management/management.constants";
import { getGovernancePolicy } from "../policy/policy.registry";
import type {
  GovernanceStandard,
  GovernanceStandardLevel,
  RegisterGovernanceStandardInput,
} from "./standard.types";

const standards = new Map<string, GovernanceStandard>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStandard(standard: GovernanceStandard): GovernanceStandard {
  return { ...standard, metadata: { ...standard.metadata } };
}

export function registerGovernanceStandard(
  input: RegisterGovernanceStandardInput,
): GovernanceStandard {
  const policyId = input.policyId.trim();
  const standardKey = input.standardKey.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyId) throw new Error("standard.policyId is required");
  if (!standardKey) throw new Error("standard.standardKey is required");
  if (!ruleRef) throw new Error("standard.ruleRef is required");
  if (
    !(GOVERNANCE_STANDARD_LEVELS as readonly string[]).includes(input.level)
  ) {
    throw new Error(`invalid standard level: ${input.level}`);
  }

  const policy = getGovernancePolicy(policyId);
  if (!policy) throw new Error(`policy not found: ${policyId}`);
  if (policy.status !== "ACTIVE") {
    throw new Error(`policy not active: ${policyId}`);
  }

  const duplicate = [...standards.values()].find(
    (s) => s.policyId === policyId && s.standardKey === standardKey,
  );
  if (duplicate) {
    throw new Error(`standardKey already exists: ${standardKey}`);
  }

  const id = input.id?.trim() || createId("apigovstd");
  if (standards.has(id)) throw new Error(`standard already exists: ${id}`);

  const standard: GovernanceStandard = {
    id,
    policyId,
    standardKey,
    level: input.level,
    ruleRef,
    detail: `level=${input.level} rule=${ruleRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  standards.set(id, standard);
  return cloneStandard(standard);
}

export function getGovernanceStandard(
  id: string,
): GovernanceStandard | undefined {
  const standard = standards.get(id.trim());
  return standard ? cloneStandard(standard) : undefined;
}

export function listGovernanceStandards(filter?: {
  policyId?: string;
  level?: GovernanceStandardLevel;
}): GovernanceStandard[] {
  let result = [...standards.values()];
  if (filter?.policyId) {
    const policyId = filter.policyId.trim();
    result = result.filter((s) => s.policyId === policyId);
  }
  if (filter?.level) result = result.filter((s) => s.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.standardKey.localeCompare(b.standardKey))
    .map(cloneStandard);
}

export function clearGovernanceStandards(): void {
  standards.clear();
}
