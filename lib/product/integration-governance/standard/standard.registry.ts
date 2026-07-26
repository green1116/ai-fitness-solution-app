/**
 * Product Integration Governance — standard registry (definition only)
 */

import { INTEGRATION_GOVERNANCE_STANDARD_LEVELS } from "../management/management.constants";
import { getIntegrationGovernancePolicy } from "../policy/policy.registry";
import type {
  IntegrationGovernanceStandard,
  IntegrationGovernanceStandardLevel,
  RegisterIntegrationGovernanceStandardInput,
} from "./standard.types";

const standards = new Map<string, IntegrationGovernanceStandard>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStandard(
  standard: IntegrationGovernanceStandard,
): IntegrationGovernanceStandard {
  return { ...standard, metadata: { ...standard.metadata } };
}

export function registerIntegrationGovernanceStandard(
  input: RegisterIntegrationGovernanceStandardInput,
): IntegrationGovernanceStandard {
  const policyId = input.policyId.trim();
  const standardKey = input.standardKey.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyId) throw new Error("standard.policyId is required");
  if (!standardKey) throw new Error("standard.standardKey is required");
  if (!ruleRef) throw new Error("standard.ruleRef is required");
  if (
    !(INTEGRATION_GOVERNANCE_STANDARD_LEVELS as readonly string[]).includes(
      input.level,
    )
  ) {
    throw new Error(`invalid standard level: ${input.level}`);
  }

  const policy = getIntegrationGovernancePolicy(policyId);
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

  const id = input.id?.trim() || createId("igovstd");
  if (standards.has(id)) throw new Error(`standard already exists: ${id}`);

  const standard: IntegrationGovernanceStandard = {
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

export function getIntegrationGovernanceStandard(
  id: string,
): IntegrationGovernanceStandard | undefined {
  const standard = standards.get(id.trim());
  return standard ? cloneStandard(standard) : undefined;
}

export function listIntegrationGovernanceStandards(filter?: {
  policyId?: string;
  level?: IntegrationGovernanceStandardLevel;
}): IntegrationGovernanceStandard[] {
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

export function clearIntegrationGovernanceStandards(): void {
  standards.clear();
}
