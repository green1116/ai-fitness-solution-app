/**
 * Product API Governance — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listGovernanceCompliances } from "../compliance/compliance.registry";
import { getGovernancePolicy } from "../policy/policy.registry";
import { listGovernanceReviews } from "../review/review.registry";
import { listGovernanceStandards } from "../standard/standard.registry";

export type ApiGovernanceReleaseManifest = {
  id: string;
  policyId: string;
  policyKey: string;
  checksum: string;
  standardId: string;
  reviewId: string;
  complianceId: string;
  createdAt: string;
};

const releases = new Map<string, ApiGovernanceReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: ApiGovernanceReleaseManifest,
): ApiGovernanceReleaseManifest {
  return { ...release };
}

export function createApiGovernanceReleaseManifest(input: {
  id?: string;
  policyId: string;
}): ApiGovernanceReleaseManifest {
  const policyId = input.policyId.trim();
  if (!policyId) throw new Error("manifest.policyId is required");

  const policy = getGovernancePolicy(policyId);
  if (!policy) throw new Error(`policy not found: ${policyId}`);

  const standards = listGovernanceStandards({ policyId });
  if (standards.length < 1) throw new Error("governance standard missing");
  const reviews = listGovernanceReviews({ policyId });
  const approved = reviews.find((r) => r.verdict === "APPROVED");
  if (!approved) throw new Error("approved review missing");
  const compliances = listGovernanceCompliances({ policyId });
  const compliant = compliances.find((c) => c.verdict === "COMPLIANT");
  if (!compliant) throw new Error("compliant assessment missing");

  const payload = {
    policyKey: policy.policyKey,
    kind: policy.kind,
    status: policy.status,
    portalKeyRef: policy.portalKeyRef,
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

  const id = input.id?.trim() || createId("apigovrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: ApiGovernanceReleaseManifest = {
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

export function getApiGovernanceReleaseManifest(
  id: string,
): ApiGovernanceReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listApiGovernanceReleaseManifests(): ApiGovernanceReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearApiGovernanceReleaseManifests(): void {
  releases.clear();
}
