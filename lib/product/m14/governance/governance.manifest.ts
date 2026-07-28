/**
 * Product M14 — Intelligence Governance manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_INTELLIGENCE_COMPATIBILITY_ID } from "../compatibility-runtime/compatibility.constants";
import {
  clearIntelligenceGovernanceBindings,
  listIntelligenceGovernanceBindings,
} from "./binding.registry";
import {
  PRODUCT_INTELLIGENCE_GOVERNANCE_BASE,
  PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_GOVERNANCE_ID,
  PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION,
} from "./governance.constants";
import { getIntelligenceGovernanceMetadata } from "./governance.metadata";
import type {
  IntelligenceGovernanceManifest,
  IntelligenceGovernanceReadinessCheck,
  IntelligenceGovernanceReadinessResult,
} from "./governance.types";
import {
  clearIntelligenceGovernanceReviews,
  listIntelligenceGovernanceReviews,
} from "./review.registry";
import {
  clearIntelligenceGovernanceStandards,
  listIntelligenceGovernanceStandards,
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
): IntelligenceGovernanceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearIntelligenceGovernanceLayer(): void {
  clearIntelligenceGovernanceBindings();
  clearIntelligenceGovernanceReviews();
  clearIntelligenceGovernanceStandards();
}

export function buildIntelligenceGovernanceManifest(): IntelligenceGovernanceManifest {
  const standards = listIntelligenceGovernanceStandards();
  const reviews = listIntelligenceGovernanceReviews();
  const bindings = listIntelligenceGovernanceBindings();
  const metadata = getIntelligenceGovernanceMetadata();

  const payload = {
    governanceRuntimeId: PRODUCT_INTELLIGENCE_GOVERNANCE_ID,
    version: PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_GOVERNANCE_BASE,
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
    governanceRuntimeId: PRODUCT_INTELLIGENCE_GOVERNANCE_ID,
    version: PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_GOVERNANCE_BASE,
    standardCount: standards.length,
    reviewCount: reviews.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateIntelligenceGovernanceReadiness(): IntelligenceGovernanceReadinessResult {
  const checks: IntelligenceGovernanceReadinessCheck[] = [];
  const metadata = getIntelligenceGovernanceMetadata();
  const standards = listIntelligenceGovernanceStandards();
  const reviews = listIntelligenceGovernanceReviews();
  const bindings = listIntelligenceGovernanceBindings();
  const manifest = buildIntelligenceGovernanceManifest();

  checks.push(
    check(
      "INTGOV-BASE",
      "governance",
      "intelligence compatibility base aligned",
      PRODUCT_INTELLIGENCE_GOVERNANCE_BASE ===
        PRODUCT_INTELLIGENCE_COMPATIBILITY_ID &&
        PRODUCT_INTELLIGENCE_COMPATIBILITY_ID ===
          "enterprise-product-intelligence-compatibility-v1",
      `base=${PRODUCT_INTELLIGENCE_GOVERNANCE_BASE}`,
    ),
  );

  checks.push(
    check(
      "INTGOV-META",
      "metadata",
      "Intelligence governance metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "INTGOV-STD",
      "standard",
      "Active governance standards present",
      standards.some((s) => s.status === "ACTIVE"),
      `standards=${standards.length}`,
    ),
  );

  checks.push(
    check(
      "INTGOV-REV",
      "review",
      "Declared governance reviews with soft matrix refs",
      reviews.some((r) => r.status === "DECLARED" && r.matrixKeyRef.length > 0),
      `reviews=${reviews.length}`,
    ),
  );

  checks.push(
    check(
      "INTGOV-BIND",
      "binding",
      "Bound governance reviews present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "INTGOV-MAN",
      "manifest",
      "Intelligence governance manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.governanceRuntimeId === PRODUCT_INTELLIGENCE_GOVERNANCE_ID &&
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
    summary: `product-intelligence-governance readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertIntelligenceGovernanceReadinessReady(
  result: IntelligenceGovernanceReadinessResult,
): asserts result is IntelligenceGovernanceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product intelligence governance not ready: ${result.summary}`,
    );
  }
}
