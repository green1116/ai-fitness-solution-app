/**
 * Product M10 — AI Runtime Governance compliance registry (assessment only)
 */

import { AI_RUNTIME_GOVERNANCE_COMPLIANCE_VERDICTS } from "./governance.constants";
import { getAiRuntimeGovernancePolicy } from "./policy.registry";
import { getAiRuntimeGovernanceReview } from "./review.registry";
import type {
  AiRuntimeGovernanceCompliance,
  AiRuntimeGovernanceComplianceVerdict,
  RecordAiRuntimeGovernanceComplianceInput,
} from "./governance.types";

const records = new Map<string, AiRuntimeGovernanceCompliance>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCompliance(
  compliance: AiRuntimeGovernanceCompliance,
): AiRuntimeGovernanceCompliance {
  return { ...compliance, metadata: { ...compliance.metadata } };
}

export function recordAiRuntimeGovernanceCompliance(
  input: RecordAiRuntimeGovernanceComplianceInput,
): AiRuntimeGovernanceCompliance {
  const policyId = input.policyId.trim();
  const reviewId = input.reviewId.trim();
  const complianceKey = input.complianceKey.trim().toUpperCase();
  if (!policyId) throw new Error("compliance.policyId is required");
  if (!reviewId) throw new Error("compliance.reviewId is required");
  if (!complianceKey) throw new Error("compliance.complianceKey is required");
  if (
    !(AI_RUNTIME_GOVERNANCE_COMPLIANCE_VERDICTS as readonly string[]).includes(
      input.verdict,
    )
  ) {
    throw new Error(`invalid compliance verdict: ${input.verdict}`);
  }

  const policy = getAiRuntimeGovernancePolicy(policyId);
  if (!policy) throw new Error(`policy not found: ${policyId}`);

  const review = getAiRuntimeGovernanceReview(reviewId);
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

  const id = input.id?.trim() || createId("airtgcmp");
  if (records.has(id)) throw new Error(`compliance already exists: ${id}`);

  const compliance: AiRuntimeGovernanceCompliance = {
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

export function getAiRuntimeGovernanceCompliance(
  id: string,
): AiRuntimeGovernanceCompliance | undefined {
  const compliance = records.get(id.trim());
  return compliance ? cloneCompliance(compliance) : undefined;
}

export function listAiRuntimeGovernanceCompliances(filter?: {
  policyId?: string;
  verdict?: AiRuntimeGovernanceComplianceVerdict;
}): AiRuntimeGovernanceCompliance[] {
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

export function clearAiRuntimeGovernanceCompliances(): void {
  records.clear();
}
