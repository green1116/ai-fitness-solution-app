/**
 * Product Integration Governance — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listIntegrationGovernanceCompliances } from "../compliance/compliance.registry";
import { getIntegrationGovernancePolicy } from "../policy/policy.registry";
import { listIntegrationGovernanceReviews } from "../review/review.registry";
import { listIntegrationGovernanceStandards } from "../standard/standard.registry";

export type IntegrationGovernanceReleaseManifest = {
  id: string;
  policyId: string;
  policyKey: string;
  checksum: string;
  standardId: string;
  reviewId: string;
  complianceId: string;
  createdAt: string;
};

const releases = new Map<string, IntegrationGovernanceReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: IntegrationGovernanceReleaseManifest,
): IntegrationGovernanceReleaseManifest {
  return { ...release };
}

export function createIntegrationGovernanceReleaseManifest(input: {
  id?: string;
  policyId: string;
}): IntegrationGovernanceReleaseManifest {
  const policyId = input.policyId.trim();
  if (!policyId) throw new Error("manifest.policyId is required");

  const policy = getIntegrationGovernancePolicy(policyId);
  if (!policy) throw new Error(`policy not found: ${policyId}`);

  const standards = listIntegrationGovernanceStandards({ policyId });
  if (standards.length < 1) throw new Error("governance standard missing");
  const reviews = listIntegrationGovernanceReviews({ policyId });
  const approved = reviews.find((r) => r.verdict === "APPROVED");
  if (!approved) throw new Error("approved review missing");
  const compliances = listIntegrationGovernanceCompliances({ policyId });
  const compliant = compliances.find((c) => c.verdict === "COMPLIANT");
  if (!compliant) throw new Error("compliant assessment missing");

  const payload = {
    policyKey: policy.policyKey,
    kind: policy.kind,
    status: policy.status,
    catalogKeyRef: policy.catalogKeyRef,
    standard: {
      standardKey: standards[0].standardKey,
      level: standards[0].level,
      ruleRef: standards[0].ruleRef,
    },
    review: {
      reviewKey: approved.reviewKey,
      verdict: approved.verdict,
      subjectRef: approved.subjectRef,
    },
    compliance: {
      complianceKey: compliant.complianceKey,
      verdict: compliant.verdict,
    },
  };

  const id = input.id?.trim() || createId("igovrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: IntegrationGovernanceReleaseManifest = {
    id,
    policyId,
    policyKey: policy.policyKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    standardId: standards[0].id,
    reviewId: approved.id,
    complianceId: compliant.id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getIntegrationGovernanceReleaseManifest(
  id: string,
): IntegrationGovernanceReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listIntegrationGovernanceReleaseManifests(): IntegrationGovernanceReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearIntegrationGovernanceReleaseManifests(): void {
  releases.clear();
}
