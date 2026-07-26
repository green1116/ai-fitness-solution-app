/**
 * Product M10 — AI Runtime Governance manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_RESOURCE_MANAGER_ID } from "../resource-manager/resource.constants";
import {
  clearAiRuntimeGovernanceCompliances,
  listAiRuntimeGovernanceCompliances,
} from "./compliance.registry";
import {
  PRODUCT_AI_RUNTIME_GOVERNANCE_BASE,
  PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
  PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION,
} from "./governance.constants";
import { getAiRuntimeGovernanceMetadata } from "./governance.metadata";
import type {
  AiRuntimeGovernanceManifest,
  AiRuntimeGovernanceReadinessCheck,
  AiRuntimeGovernanceReadinessResult,
} from "./governance.types";
import {
  clearAiRuntimeGovernancePolicies,
  listAiRuntimeGovernancePolicies,
} from "./policy.registry";
import {
  clearAiRuntimeGovernanceReviews,
  listAiRuntimeGovernanceReviews,
} from "./review.registry";
import {
  clearAiRuntimeGovernanceStandards,
  listAiRuntimeGovernanceStandards,
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
): AiRuntimeGovernanceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiRuntimeGovernanceLayer(): void {
  clearAiRuntimeGovernanceCompliances();
  clearAiRuntimeGovernanceReviews();
  clearAiRuntimeGovernanceStandards();
  clearAiRuntimeGovernancePolicies();
}

export function buildAiRuntimeGovernanceManifest(): AiRuntimeGovernanceManifest {
  const policies = listAiRuntimeGovernancePolicies();
  const standards = listAiRuntimeGovernanceStandards();
  const reviews = listAiRuntimeGovernanceReviews();
  const compliances = listAiRuntimeGovernanceCompliances();
  const metadata = getAiRuntimeGovernanceMetadata();

  const payload = {
    governanceId: PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
    version: PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_AI_RUNTIME_GOVERNANCE_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      resourceKeyRef: p.resourceKeyRef,
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
    governanceId: PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
    version: PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_AI_RUNTIME_GOVERNANCE_BASE,
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

export function evaluateAiRuntimeGovernanceReadiness(): AiRuntimeGovernanceReadinessResult {
  const checks: AiRuntimeGovernanceReadinessCheck[] = [];
  const metadata = getAiRuntimeGovernanceMetadata();
  const policies = listAiRuntimeGovernancePolicies();
  const standards = listAiRuntimeGovernanceStandards();
  const reviews = listAiRuntimeGovernanceReviews();
  const compliances = listAiRuntimeGovernanceCompliances();
  const manifest = buildAiRuntimeGovernanceManifest();

  checks.push(
    check(
      "AIRTG-BASE",
      "runtime-governance",
      "ai resource manager base aligned",
      PRODUCT_AI_RUNTIME_GOVERNANCE_BASE === PRODUCT_AI_RESOURCE_MANAGER_ID &&
        PRODUCT_AI_RESOURCE_MANAGER_ID ===
          "enterprise-product-ai-resource-manager-v1",
      `base=${PRODUCT_AI_RUNTIME_GOVERNANCE_BASE}`,
    ),
  );

  checks.push(
    check(
      "AIRTG-META",
      "metadata",
      "Runtime governance metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AIRTG-POL",
      "policy",
      "Active runtime governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "AIRTG-STD",
      "standard",
      "Runtime governance standards present",
      standards.length >= 1,
      `standards=${standards.length}`,
    ),
  );

  checks.push(
    check(
      "AIRTG-REV",
      "review",
      "Approved reviews present",
      reviews.some((r) => r.verdict === "APPROVED"),
      `reviews=${reviews.length}`,
    ),
  );

  checks.push(
    check(
      "AIRTG-CMP",
      "compliance",
      "Compliant assessments present",
      compliances.some((c) => c.verdict === "COMPLIANT"),
      `compliances=${compliances.length}`,
    ),
  );

  checks.push(
    check(
      "AIRTG-MAN",
      "manifest",
      "Runtime governance manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.governanceId === PRODUCT_AI_RUNTIME_GOVERNANCE_ID &&
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
    summary: `product-ai-runtime-governance readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiRuntimeGovernanceReadinessReady(
  result: AiRuntimeGovernanceReadinessResult,
): asserts result is AiRuntimeGovernanceReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product ai runtime governance not ready: ${result.summary}`,
    );
  }
}
