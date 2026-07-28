/**
 * Product M11 — Knowledge Governance manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_KNOWLEDGE_COMPATIBILITY_ID } from "../compatibility-runtime/compatibility.constants";
import {
  clearKnowledgeGovernanceBindings,
  listKnowledgeGovernanceBindings,
} from "./binding.registry";
import {
  PRODUCT_KNOWLEDGE_GOVERNANCE_BASE,
  PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
  PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION,
} from "./governance.constants";
import { getKnowledgeGovernanceMetadata } from "./governance.metadata";
import type {
  KnowledgeGovernanceManifest,
  KnowledgeGovernanceReadinessCheck,
  KnowledgeGovernanceReadinessResult,
} from "./governance.types";
import {
  clearKnowledgeGovernanceReviews,
  listKnowledgeGovernanceReviews,
} from "./review.registry";
import {
  clearKnowledgeGovernanceStandards,
  listKnowledgeGovernanceStandards,
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
): KnowledgeGovernanceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearKnowledgeGovernanceLayer(): void {
  clearKnowledgeGovernanceBindings();
  clearKnowledgeGovernanceReviews();
  clearKnowledgeGovernanceStandards();
}

export function buildKnowledgeGovernanceManifest(): KnowledgeGovernanceManifest {
  const standards = listKnowledgeGovernanceStandards();
  const reviews = listKnowledgeGovernanceReviews();
  const bindings = listKnowledgeGovernanceBindings();
  const metadata = getKnowledgeGovernanceMetadata();

  const payload = {
    governanceRuntimeId: PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
    version: PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_GOVERNANCE_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    standards: standards.map((s) => ({
      standardKey: s.standardKey,
      kind: s.kind,
      status: s.status,
    })),
    reviews: reviews.map((r) => ({
      reviewKey: r.reviewKey,
      sequence: r.sequence,
      status: r.status,
      approval: r.approval,
      riskLevel: r.riskLevel,
      matrixKeyRef: r.matrixKeyRef,
      standardId: r.standardId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      freezeGateRef: b.freezeGateRef,
      pairKeyRef: b.pairKeyRef,
      status: b.status,
      standardId: b.standardId,
    })),
  };

  return {
    governanceRuntimeId: PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
    version: PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_GOVERNANCE_BASE,
    standardCount: standards.length,
    reviewCount: reviews.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateKnowledgeGovernanceReadiness(): KnowledgeGovernanceReadinessResult {
  const checks: KnowledgeGovernanceReadinessCheck[] = [];
  const metadata = getKnowledgeGovernanceMetadata();
  const standards = listKnowledgeGovernanceStandards();
  const reviews = listKnowledgeGovernanceReviews();
  const bindings = listKnowledgeGovernanceBindings();
  const manifest = buildKnowledgeGovernanceManifest();

  checks.push(
    check(
      "KNWGOV-BASE",
      "governance",
      "knowledge compatibility base aligned",
      PRODUCT_KNOWLEDGE_GOVERNANCE_BASE ===
        PRODUCT_KNOWLEDGE_COMPATIBILITY_ID &&
        PRODUCT_KNOWLEDGE_COMPATIBILITY_ID ===
          "enterprise-product-knowledge-compatibility-v1",
      `base=${PRODUCT_KNOWLEDGE_GOVERNANCE_BASE}`,
    ),
  );

  checks.push(
    check(
      "KNWGOV-META",
      "metadata",
      "Knowledge governance metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "KNWGOV-STD",
      "standard",
      "Active governance standards present",
      standards.some((s) => s.status === "ACTIVE"),
      `standards=${standards.length}`,
    ),
  );

  checks.push(
    check(
      "KNWGOV-REV",
      "review",
      "Declared governance reviews with soft matrix refs",
      reviews.some(
        (r) => r.status === "DECLARED" && r.matrixKeyRef.length > 0,
      ),
      `reviews=${reviews.length}`,
    ),
  );

  checks.push(
    check(
      "KNWGOV-BIND",
      "binding",
      "Bound governance reviews present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "KNWGOV-MAN",
      "manifest",
      "Knowledge governance manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.governanceRuntimeId === PRODUCT_KNOWLEDGE_GOVERNANCE_ID &&
        manifest.standardCount >= 1 &&
        manifest.reviewCount >= 1 &&
        manifest.bindingCount >= 1,
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
    summary: `product-knowledge-governance readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertKnowledgeGovernanceReadinessReady(
  result: KnowledgeGovernanceReadinessResult,
): asserts result is KnowledgeGovernanceReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product knowledge governance not ready: ${result.summary}`,
    );
  }
}
