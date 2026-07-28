/**
 * Product M13 — OS Compatibility Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_OS_POLICY_ID } from "../policy-runtime/policy.constants";
import {
  clearOsCompatibilityBindings,
  listOsCompatibilityBindings,
} from "./binding.registry";
import {
  PRODUCT_OS_COMPATIBILITY_BASE,
  PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_OS_COMPATIBILITY_ID,
  PRODUCT_OS_COMPATIBILITY_VERSION,
} from "./compatibility.constants";
import { getOsCompatibilityMetadata } from "./compatibility.metadata";
import type {
  OsCompatibilityManifest,
  OsCompatibilityReadinessCheck,
  OsCompatibilityReadinessResult,
} from "./compatibility.types";
import {
  clearOsCompatibilityMatrices,
  listOsCompatibilityMatrices,
} from "./matrix.registry";
import {
  clearOsCompatibilityPairs,
  listOsCompatibilityPairs,
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
): OsCompatibilityReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearOsCompatibilityLayer(): void {
  clearOsCompatibilityBindings();
  clearOsCompatibilityPairs();
  clearOsCompatibilityMatrices();
}

export function buildOsCompatibilityManifest(): OsCompatibilityManifest {
  const matrices = listOsCompatibilityMatrices();
  const pairs = listOsCompatibilityPairs();
  const bindings = listOsCompatibilityBindings();
  const metadata = getOsCompatibilityMetadata();

  const payload = {
    compatibilityRuntimeId: PRODUCT_OS_COMPATIBILITY_ID,
    version: PRODUCT_OS_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION,
    base: PRODUCT_OS_COMPATIBILITY_BASE,
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
    compatibilityRuntimeId: PRODUCT_OS_COMPATIBILITY_ID,
    version: PRODUCT_OS_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION,
    base: PRODUCT_OS_COMPATIBILITY_BASE,
    matrixCount: matrices.length,
    pairCount: pairs.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateOsCompatibilityReadiness(): OsCompatibilityReadinessResult {
  const checks: OsCompatibilityReadinessCheck[] = [];
  const metadata = getOsCompatibilityMetadata();
  const matrices = listOsCompatibilityMatrices();
  const pairs = listOsCompatibilityPairs();
  const bindings = listOsCompatibilityBindings();
  const manifest = buildOsCompatibilityManifest();

  checks.push(
    check(
      "OSCMP-BASE",
      "compatibility",
      "os policy base aligned",
      PRODUCT_OS_COMPATIBILITY_BASE === PRODUCT_OS_POLICY_ID &&
        PRODUCT_OS_POLICY_ID === "enterprise-product-os-policy-v1",
      `base=${PRODUCT_OS_COMPATIBILITY_BASE}`,
    ),
  );

  checks.push(
    check(
      "OSCMP-META",
      "metadata",
      "OS compatibility metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "OSCMP-MAT",
      "matrix",
      "Active compatibility matrices present",
      matrices.some((m) => m.status === "ACTIVE"),
      `matrices=${matrices.length}`,
    ),
  );

  checks.push(
    check(
      "OSCMP-PAIR",
      "pair",
      "Declared version pairs with soft policy refs",
      pairs.some((p) => p.status === "DECLARED" && p.policyKeyRef.length > 0),
      `pairs=${pairs.length}`,
    ),
  );

  checks.push(
    check(
      "OSCMP-BIND",
      "binding",
      "Bound compatibility pairs present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "OSCMP-MAN",
      "manifest",
      "OS compatibility manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.compatibilityRuntimeId === PRODUCT_OS_COMPATIBILITY_ID &&
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
    summary: `product-os-compatibility readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertOsCompatibilityReadinessReady(
  result: OsCompatibilityReadinessResult,
): asserts result is OsCompatibilityReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product os compatibility not ready: ${result.summary}`);
  }
}
