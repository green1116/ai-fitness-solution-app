import { buildRequirementRegistryRecords } from "../requirement-registry";
import type { RequirementComplianceRecord } from "../shared/types";
import { evaluateRequirementCompliance } from "./compliance-builder";

let cachedComplianceRecords: RequirementComplianceRecord[] | undefined;

export function buildRequirementComplianceRecords(): RequirementComplianceRecord[] {
  if (!cachedComplianceRecords) {
    cachedComplianceRecords = buildRequirementRegistryRecords().map(evaluateRequirementCompliance);
  }
  return cachedComplianceRecords;
}

export function buildRequirementComplianceRegistry() {
  const records = buildRequirementComplianceRecords();

  return {
    registryId: "requirement-compliance-registry-v40-p3",
    records,
    recordCount: records.length,
    registryReady: records.length >= 50,
    mode: "requirement-intelligence" as const,
  };
}

export function findRequirementComplianceById(
  requirementId: string,
): RequirementComplianceRecord | undefined {
  return buildRequirementComplianceRecords().find(
    (record) => record.requirementId === requirementId,
  );
}

export function findSatisfiedRequirements(): RequirementComplianceRecord[] {
  return buildRequirementComplianceRecords().filter((record) => record.satisfied);
}

export function findUnsatisfiedRequirements(): RequirementComplianceRecord[] {
  return buildRequirementComplianceRecords().filter((record) => !record.satisfied);
}

export function findRequirementGaps() {
  return buildRequirementComplianceRecords().map((record) => record.gap);
}

export function buildRequirementCompliance(): RequirementComplianceRecord[] {
  return buildRequirementComplianceRecords();
}
