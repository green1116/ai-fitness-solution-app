/**
 * Product M14 — Enterprise Intelligence Foundation manifest builder
 */

import { createHash } from "node:crypto";

import { ENTERPRISE_PRODUCT_OS_BASELINE_ID } from "../../m13/baseline/freeze/freeze.lock";
import {
  PRODUCT_INTELLIGENCE_FOUNDATION_BASE,
  PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_FOUNDATION_ID,
  PRODUCT_INTELLIGENCE_FOUNDATION_VERSION,
} from "./intelligence.constants";
import {
  getIntelligenceFoundationMetadata,
  validateIntelligenceLens,
} from "./intelligence.metadata";
import {
  clearIntelligenceLenses,
  listIntelligenceLenses,
} from "./intelligence.registry";
import type {
  IntelligenceFoundationManifest,
  IntelligenceReadinessCheck,
  IntelligenceReadinessResult,
} from "./intelligence.types";
import {
  clearIntelligenceCapabilities,
  listIntelligenceCapabilities,
} from "./capability.registry";
import {
  clearIntelligenceGovernancePolicies,
  listIntelligenceGovernancePolicies,
} from "./governance.policy";
import {
  clearIntelligenceAnalysisContracts,
  listIntelligenceAnalysisContracts,
} from "./analysis.contract";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): IntelligenceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearIntelligenceFoundationLayer(): void {
  clearIntelligenceAnalysisContracts();
  clearIntelligenceGovernancePolicies();
  clearIntelligenceCapabilities();
  clearIntelligenceLenses();
}

export function buildIntelligenceFoundationManifest(): IntelligenceFoundationManifest {
  const lenses = listIntelligenceLenses();
  const capabilities = listIntelligenceCapabilities();
  const policies = listIntelligenceGovernancePolicies();
  const contracts = listIntelligenceAnalysisContracts();
  const metadata = getIntelligenceFoundationMetadata();
  const active = lenses.filter((l) => l.status === "ACTIVE");

  const payload = {
    foundationId: PRODUCT_INTELLIGENCE_FOUNDATION_ID,
    version: PRODUCT_INTELLIGENCE_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_FOUNDATION_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    lenses: lenses.map((l) => ({
      lensKey: l.lensKey,
      kind: l.kind,
      status: l.status,
      scope: l.scope,
      osBaselineRef: l.osBaselineRef,
    })),
    capabilities: capabilities.map((c) => ({
      capabilityKey: c.capabilityKey,
      kind: c.kind,
      status: c.status,
      lensId: c.lensId,
    })),
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      lensKeyRef: p.lensKeyRef,
    })),
    contracts: contracts.map((c) => ({
      contractKey: c.contractKey,
      mode: c.query.mode,
      hitCount: c.hitCount,
    })),
  };

  return {
    foundationId: PRODUCT_INTELLIGENCE_FOUNDATION_ID,
    version: PRODUCT_INTELLIGENCE_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_FOUNDATION_BASE,
    lensCount: lenses.length,
    activeCount: active.length,
    capabilityCount: capabilities.length,
    policyCount: policies.length,
    contractCount: contracts.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateIntelligenceFoundationReadiness(): IntelligenceReadinessResult {
  const checks: IntelligenceReadinessCheck[] = [];
  const metadata = getIntelligenceFoundationMetadata();
  const lenses = listIntelligenceLenses();
  const capabilities = listIntelligenceCapabilities();
  const policies = listIntelligenceGovernancePolicies();
  const contracts = listIntelligenceAnalysisContracts();
  const manifest = buildIntelligenceFoundationManifest();
  const lensesValid = lenses.every((l) => validateIntelligenceLens(l).ok);

  checks.push(
    check(
      "INT-BASE",
      "foundation",
      "os baseline aligned",
      PRODUCT_INTELLIGENCE_FOUNDATION_BASE ===
        ENTERPRISE_PRODUCT_OS_BASELINE_ID &&
        ENTERPRISE_PRODUCT_OS_BASELINE_ID ===
          "enterprise-product-os-baseline-v1",
      `base=${PRODUCT_INTELLIGENCE_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "INT-META",
      "metadata",
      "Intelligence foundation metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "INT-LENS",
      "lens",
      "Active intelligence lenses present and valid",
      lenses.some((l) => l.status === "ACTIVE") && lensesValid,
      `lenses=${lenses.length}`,
    ),
  );

  checks.push(
    check(
      "INT-CAP",
      "capability",
      "Declared capabilities present",
      capabilities.some((c) => c.status === "DECLARED"),
      `capabilities=${capabilities.length}`,
    ),
  );

  checks.push(
    check(
      "INT-GOV",
      "governance",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "INT-AN",
      "analysis",
      "Analysis contracts with hits present",
      contracts.some((c) => c.hitCount >= 1),
      `contracts=${contracts.length}`,
    ),
  );

  checks.push(
    check(
      "INT-MAN",
      "manifest",
      "Intelligence foundation manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.foundationId === PRODUCT_INTELLIGENCE_FOUNDATION_ID &&
        manifest.activeCount >= 1 &&
        manifest.capabilityCount >= 1 &&
        manifest.policyCount >= 1 &&
        manifest.contractCount >= 1,
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
    summary: `product-intelligence-foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertIntelligenceFoundationReadinessReady(
  result: IntelligenceReadinessResult,
): asserts result is IntelligenceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product intelligence foundation not ready: ${result.summary}`,
    );
  }
}
