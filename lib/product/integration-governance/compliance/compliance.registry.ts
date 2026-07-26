/**
 * Product Integration Governance — compliance registry (no business execution)
 */

import { INTEGRATION_GOVERNANCE_COMPLIANCE_VERDICTS } from "../management/management.constants";
import { getIntegrationGovernancePolicy } from "../policy/policy.registry";
import { getIntegrationGovernanceReview } from "../review/review.registry";
import type {
  IntegrationGovernanceCompliance,
  IntegrationGovernanceComplianceVerdict,
  RecordIntegrationGovernanceComplianceInput,
} from "./compliance.types";

const records = new Map<string, IntegrationGovernanceCompliance>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCompliance(
  compliance: IntegrationGovernanceCompliance,
): IntegrationGovernanceCompliance {
  return { ...compliance, metadata: { ...compliance.metadata } };
}

export function recordIntegrationGovernanceCompliance(
  input: RecordIntegrationGovernanceComplianceInput,
): IntegrationGovernanceCompliance {
  const policyId = input.policyId.trim();
  const reviewId = input.reviewId.trim();
  const complianceKey = input.complianceKey.trim().toUpperCase();
  if (!policyId) throw new Error("compliance.policyId is required");
  if (!reviewId) throw new Error("compliance.reviewId is required");
  if (!complianceKey) throw new Error("compliance.complianceKey is required");
  if (
    !(INTEGRATION_GOVERNANCE_COMPLIANCE_VERDICTS as readonly string[]).includes(
      input.verdict,
    )
  ) {
    throw new Error(`invalid compliance verdict: ${input.verdict}`);
  }

  const policy = getIntegrationGovernancePolicy(policyId);
  if (!policy) throw new Error(`policy not found: ${policyId}`);

  const review = getIntegrationGovernanceReview(reviewId);
  if (!review) throw new Error(`review not found: ${reviewId}`);
  if (review.policyId !== policyId) {
    throw new Error(`review policy mismatch: ${reviewId}`);
  }

  const duplicate = [...records.values()].find(
    (c) => c.policyId === policyId && c.complianceKey === complianceKey,
  );
  if (duplicate) {
    throw new Error(`complianceKey already exists: ${complianceKey}`);
  }

  const id = input.id?.trim() || createId("igovcmp");
  if (records.has(id)) throw new Error(`compliance already exists: ${id}`);

  const compliance: IntegrationGovernanceCompliance = {
    id,
    policyId,
    reviewId,
    complianceKey,
    verdict: input.verdict,
    detail: `verdict=${input.verdict}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  records.set(id, compliance);
  return cloneCompliance(compliance);
}

export function getIntegrationGovernanceCompliance(
  id: string,
): IntegrationGovernanceCompliance | undefined {
  const compliance = records.get(id.trim());
  return compliance ? cloneCompliance(compliance) : undefined;
}

export function listIntegrationGovernanceCompliances(filter?: {
  policyId?: string;
  verdict?: IntegrationGovernanceComplianceVerdict;
}): IntegrationGovernanceCompliance[] {
  let result = [...records.values()];
  if (filter?.policyId) {
    const policyId = filter.policyId.trim();
    result = result.filter((c) => c.policyId === policyId);
  }
  if (filter?.verdict) {
    result = result.filter((c) => c.verdict === filter.verdict);
  }
  return result
    .slice()
    .sort((a, b) => a.complianceKey.localeCompare(b.complianceKey))
    .map(cloneCompliance);
}

export function clearIntegrationGovernanceCompliances(): void {
  records.clear();
}
