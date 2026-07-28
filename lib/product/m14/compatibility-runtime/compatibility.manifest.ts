/**
 * Product M14 — Intelligence Compatibility Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_INTELLIGENCE_POLICY_ID } from "../policy-runtime/policy.constants";
import {
  clearIntelligenceCompatibilityBindings,
  listIntelligenceCompatibilityBindings,
} from "./binding.registry";
import {
  PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_ID,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION,
} from "./compatibility.constants";
import { getIntelligenceCompatibilityMetadata } from "./compatibility.metadata";
import type {
  IntelligenceCompatibilityManifest,
  IntelligenceCompatibilityReadinessCheck,
  IntelligenceCompatibilityReadinessResult,
} from "./compatibility.types";
import {
  clearIntelligenceCompatibilityMatrices,
  listIntelligenceCompatibilityMatrices,
} from "./matrix.registry";
import {
  clearIntelligenceCompatibilityPairs,
  listIntelligenceCompatibilityPairs,
} from "./pair.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): IntelligenceCompatibilityReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearIntelligenceCompatibilityLayer(): void {
  clearIntelligenceCompatibilityBindings();
  clearIntelligenceCompatibilityPairs();
  clearIntelligenceCompatibilityMatrices();
}

export function buildIntelligenceCompatibilityManifest(): IntelligenceCompatibilityManifest {
  const matrices = listIntelligenceCompatibilityMatrices();
  const pairs = listIntelligenceCompatibilityPairs();
  const bindings = listIntelligenceCompatibilityBindings();
  const metadata = getIntelligenceCompatibilityMetadata();

  const payload = {
    compatibilityRuntimeId: PRODUCT_INTELLIGENCE_COMPATIBILITY_ID,
    version: PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    matrices: matrices.map((m) => ({
      matrixKey: m.matrixKey,
      kind: m.kind,
      status: m.status,
    })),
    pairs: pairs.map((p) => ({
      pairKey: p.pairKey,
      sequence: p.sequence,
      status: p.status,
      relation: p.relation,
      policyKeyRef: p.policyKeyRef,
      upstreamVersionRef: p.upstreamVersionRef,
      downstreamVersionRef: p.downstreamVersionRef,
      matrixId: p.matrixId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      constraint: b.constraint,
      fallbackVersionRef: b.fallbackVersionRef,
      status: b.status,
      matrixId: b.matrixId,
    })),
  };

  return {
    compatibilityRuntimeId: PRODUCT_INTELLIGENCE_COMPATIBILITY_ID,
    version: PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE,
    matrixCount: matrices.length,
    pairCount: pairs.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateIntelligenceCompatibilityReadiness(): IntelligenceCompatibilityReadinessResult {
  const checks: IntelligenceCompatibilityReadinessCheck[] = [];
  const metadata = getIntelligenceCompatibilityMetadata();
  const matrices = listIntelligenceCompatibilityMatrices();
  const pairs = listIntelligenceCompatibilityPairs();
  const bindings = listIntelligenceCompatibilityBindings();
  const manifest = buildIntelligenceCompatibilityManifest();

  checks.push(
    check(
      "INTCMP-BASE",
      "compatibility-runtime",
      "intelligence policy base aligned",
      PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE === PRODUCT_INTELLIGENCE_POLICY_ID &&
        PRODUCT_INTELLIGENCE_POLICY_ID ===
          "enterprise-product-intelligence-policy-v1",
      `base=${PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE}`,
    ),
  );

  checks.push(
    check(
      "INTCMP-META",
      "metadata",
      "Intelligence compatibility metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "INTCMP-MAT",
      "matrix",
      "Active compatibility matrices present",
      matrices.some((m) => m.status === "ACTIVE"),
      `matrices=${matrices.length}`,
    ),
  );

  checks.push(
    check(
      "INTCMP-PAIR",
      "pair",
      "Declared version pairs with soft policy refs",
      pairs.some((p) => p.status === "DECLARED" && p.policyKeyRef.length > 0),
      `pairs=${pairs.length}`,
    ),
  );

  checks.push(
    check(
      "INTCMP-BIND",
      "binding",
      "Bound compatibility pairs present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "INTCMP-MAN",
      "manifest",
      "Intelligence compatibility manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.compatibilityRuntimeId === PRODUCT_INTELLIGENCE_COMPATIBILITY_ID &&
        manifest.matrixCount >= 1 &&
        manifest.pairCount >= 1 &&
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
    summary: `product-intelligence-compatibility readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertIntelligenceCompatibilityReadinessReady(
  result: IntelligenceCompatibilityReadinessResult,
): asserts result is IntelligenceCompatibilityReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product intelligence compatibility not ready: ${result.summary}`,
    );
  }
}
