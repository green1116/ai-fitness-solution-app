/**
 * Product M13 — OS Governance manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_OS_COMPATIBILITY_ID } from "../compatibility-runtime/compatibility.constants";
import {
  clearOsGovernanceBindings,
  listOsGovernanceBindings,
} from "./binding.registry";
import {
  PRODUCT_OS_GOVERNANCE_BASE,
  PRODUCT_OS_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_OS_GOVERNANCE_ID,
  PRODUCT_OS_GOVERNANCE_VERSION,
} from "./governance.constants";
import { getOsGovernanceMetadata } from "./governance.metadata";
import type {
  OsGovernanceManifest,
  OsGovernanceReadinessCheck,
  OsGovernanceReadinessResult,
} from "./governance.types";
import {
  clearOsGovernanceReviews,
  listOsGovernanceReviews,
} from "./review.registry";
import {
  clearOsGovernanceStandards,
  listOsGovernanceStandards,
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
): OsGovernanceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearOsGovernanceLayer(): void {
  clearOsGovernanceBindings();
  clearOsGovernanceReviews();
  clearOsGovernanceStandards();
}

export function buildOsGovernanceManifest(): OsGovernanceManifest {
  const standards = listOsGovernanceStandards();
  const reviews = listOsGovernanceReviews();
  const bindings = listOsGovernanceBindings();
  const metadata = getOsGovernanceMetadata();

  const payload = {
    governanceRuntimeId: PRODUCT_OS_GOVERNANCE_ID,
    version: PRODUCT_OS_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_OS_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_OS_GOVERNANCE_BASE,
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
    governanceRuntimeId: PRODUCT_OS_GOVERNANCE_ID,
    version: PRODUCT_OS_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_OS_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_OS_GOVERNANCE_BASE,
    standardCount: standards.length,
    reviewCount: reviews.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateOsGovernanceReadiness(): OsGovernanceReadinessResult {
  const checks: OsGovernanceReadinessCheck[] = [];
  const metadata = getOsGovernanceMetadata();
  const standards = listOsGovernanceStandards();
  const reviews = listOsGovernanceReviews();
  const bindings = listOsGovernanceBindings();
  const manifest = buildOsGovernanceManifest();

  checks.push(
    check(
      "OSGOV-BASE",
      "governance",
      "os compatibility base aligned",
      PRODUCT_OS_GOVERNANCE_BASE === PRODUCT_OS_COMPATIBILITY_ID &&
        PRODUCT_OS_COMPATIBILITY_ID ===
          "enterprise-product-os-compatibility-v1",
      `base=${PRODUCT_OS_GOVERNANCE_BASE}`,
    ),
  );

  checks.push(
    check(
      "OSGOV-META",
      "metadata",
      "OS governance metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "OSGOV-STD",
      "standard",
      "Active governance standards present",
      standards.some((s) => s.status === "ACTIVE"),
      `standards=${standards.length}`,
    ),
  );

  checks.push(
    check(
      "OSGOV-REV",
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
      "OSGOV-BIND",
      "binding",
      "Bound governance reviews present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "OSGOV-MAN",
      "manifest",
      "OS governance manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.governanceRuntimeId === PRODUCT_OS_GOVERNANCE_ID &&
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
    summary: `product-os-governance readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertOsGovernanceReadinessReady(
  result: OsGovernanceReadinessResult,
): asserts result is OsGovernanceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product os governance not ready: ${result.summary}`);
  }
}
