/**
 * Product M09 — AI Governance manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_ORCHESTRATION_ID } from "../orchestration/orchestration.constants";
import {
  clearAiGovernanceCompliances,
  listAiGovernanceCompliances,
} from "./compliance.registry";
import {
  PRODUCT_AI_GOVERNANCE_BASE,
  PRODUCT_AI_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_GOVERNANCE_ID,
  PRODUCT_AI_GOVERNANCE_VERSION,
} from "./governance.constants";
import { getAiGovernanceMetadata } from "./governance.metadata";
import type {
  AiGovernanceManifest,
  AiGovernanceReadinessCheck,
  AiGovernanceReadinessResult,
} from "./governance.types";
import {
  clearAiGovernancePolicies,
  listAiGovernancePolicies,
} from "./policy.registry";
import {
  clearAiGovernanceReviews,
  listAiGovernanceReviews,
} from "./review.registry";
import {
  clearAiGovernanceStandards,
  listAiGovernanceStandards,
} from "./standard.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiGovernanceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiGovernanceLayer(): void {
  clearAiGovernanceCompliances();
  clearAiGovernanceReviews();
  clearAiGovernanceStandards();
  clearAiGovernancePolicies();
}

export function buildAiGovernanceManifest(): AiGovernanceManifest {
  const policies = listAiGovernancePolicies();
  const standards = listAiGovernanceStandards();
  const reviews = listAiGovernanceReviews();
  const compliances = listAiGovernanceCompliances();
  const metadata = getAiGovernanceMetadata();

  const payload = {
    governanceId: PRODUCT_AI_GOVERNANCE_ID,
    version: PRODUCT_AI_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_AI_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_AI_GOVERNANCE_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      orchestrationKeyRef: p.orchestrationKeyRef,
    })),
    standards: standards.map((s) => ({
      standardKey: s.standardKey,
      level: s.level,
      ruleRef: s.ruleRef,
      policyId: s.policyId,
    })),
    reviews: reviews.map((r) => ({
      reviewKey: r.reviewKey,
      verdict: r.verdict,
      subjectRef: r.subjectRef,
      policyId: r.policyId,
    })),
    compliances: compliances.map((c) => ({
      complianceKey: c.complianceKey,
      verdict: c.verdict,
      policyId: c.policyId,
    })),
  };

  return {
    governanceId: PRODUCT_AI_GOVERNANCE_ID,
    version: PRODUCT_AI_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_AI_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_AI_GOVERNANCE_BASE,
    policyCount: policies.length,
    standardCount: standards.length,
    reviewCount: reviews.length,
    complianceCount: compliances.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiGovernanceReadiness(): AiGovernanceReadinessResult {
  const checks: AiGovernanceReadinessCheck[] = [];
  const metadata = getAiGovernanceMetadata();
  const policies = listAiGovernancePolicies();
  const standards = listAiGovernanceStandards();
  const reviews = listAiGovernanceReviews();
  const compliances = listAiGovernanceCompliances();
  const manifest = buildAiGovernanceManifest();

  checks.push(
    check(
      "AIGOV-BASE",
      "governance",
      "ai orchestration base aligned",
      PRODUCT_AI_GOVERNANCE_BASE === PRODUCT_AI_ORCHESTRATION_ID &&
        PRODUCT_AI_ORCHESTRATION_ID ===
          "enterprise-product-ai-orchestration-v1",
      `base=${PRODUCT_AI_GOVERNANCE_BASE}`,
    ),
  );

  checks.push(
    check(
      "AIGOV-META",
      "metadata",
      "AI governance metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 6,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AIGOV-POL",
      "policy",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "AIGOV-STD",
      "standard",
      "Governance standards present",
      standards.length >= 1,
      `standards=${standards.length}`,
    ),
  );

  checks.push(
    check(
      "AIGOV-REV",
      "review",
      "Approved reviews present",
      reviews.some((r) => r.verdict === "APPROVED"),
      `reviews=${reviews.length}`,
    ),
  );

  checks.push(
    check(
      "AIGOV-CMP",
      "compliance",
      "Compliant assessments present",
      compliances.some((c) => c.verdict === "COMPLIANT"),
      `compliances=${compliances.length}`,
    ),
  );

  checks.push(
    check(
      "AIGOV-MAN",
      "manifest",
      "AI governance manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.governanceId === PRODUCT_AI_GOVERNANCE_ID &&
        manifest.policyCount >= 1 &&
        manifest.standardCount >= 1 &&
        manifest.reviewCount >= 1 &&
        manifest.complianceCount >= 1,
      `checksum=${manifest.checksum.slice(0, 12)}…`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-ai-governance readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiGovernanceReadinessReady(
  result: AiGovernanceReadinessResult,
): asserts result is AiGovernanceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product ai governance not ready: ${result.summary}`);
  }
}
