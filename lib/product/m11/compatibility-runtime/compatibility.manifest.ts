/**
 * Product M11 — Knowledge Compatibility Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_KNOWLEDGE_POLICY_ID } from "../policy-runtime/policy.constants";
import {
  clearKnowledgeCompatibilityBindings,
  listKnowledgeCompatibilityBindings,
} from "./binding.registry";
import {
  PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION,
} from "./compatibility.constants";
import { getKnowledgeCompatibilityMetadata } from "./compatibility.metadata";
import type {
  KnowledgeCompatibilityManifest,
  KnowledgeCompatibilityReadinessCheck,
  KnowledgeCompatibilityReadinessResult,
} from "./compatibility.types";
import {
  clearKnowledgeCompatibilityMatrices,
  listKnowledgeCompatibilityMatrices,
} from "./matrix.registry";
import {
  clearKnowledgeCompatibilityPairs,
  listKnowledgeCompatibilityPairs,
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
): KnowledgeCompatibilityReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearKnowledgeCompatibilityLayer(): void {
  clearKnowledgeCompatibilityBindings();
  clearKnowledgeCompatibilityPairs();
  clearKnowledgeCompatibilityMatrices();
}

export function buildKnowledgeCompatibilityManifest(): KnowledgeCompatibilityManifest {
  const matrices = listKnowledgeCompatibilityMatrices();
  const pairs = listKnowledgeCompatibilityPairs();
  const bindings = listKnowledgeCompatibilityBindings();
  const metadata = getKnowledgeCompatibilityMetadata();

  const payload = {
    compatibilityRuntimeId: PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
    version: PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE,
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
    compatibilityRuntimeId: PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
    version: PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE,
    matrixCount: matrices.length,
    pairCount: pairs.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateKnowledgeCompatibilityReadiness(): KnowledgeCompatibilityReadinessResult {
  const checks: KnowledgeCompatibilityReadinessCheck[] = [];
  const metadata = getKnowledgeCompatibilityMetadata();
  const matrices = listKnowledgeCompatibilityMatrices();
  const pairs = listKnowledgeCompatibilityPairs();
  const bindings = listKnowledgeCompatibilityBindings();
  const manifest = buildKnowledgeCompatibilityManifest();

  checks.push(
    check(
      "KNWCMP-BASE",
      "compatibility",
      "knowledge policy base aligned",
      PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE === PRODUCT_KNOWLEDGE_POLICY_ID &&
        PRODUCT_KNOWLEDGE_POLICY_ID ===
          "enterprise-product-knowledge-policy-v1",
      `base=${PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE}`,
    ),
  );

  checks.push(
    check(
      "KNWCMP-META",
      "metadata",
      "Knowledge compatibility metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "KNWCMP-MAT",
      "matrix",
      "Active compatibility matrices present",
      matrices.some((m) => m.status === "ACTIVE"),
      `matrices=${matrices.length}`,
    ),
  );

  checks.push(
    check(
      "KNWCMP-PAIR",
      "pair",
      "Declared version pairs with soft policy refs",
      pairs.some(
        (p) => p.status === "DECLARED" && p.policyKeyRef.length > 0,
      ),
      `pairs=${pairs.length}`,
    ),
  );

  checks.push(
    check(
      "KNWCMP-BIND",
      "binding",
      "Bound compatibility pairs present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "KNWCMP-MAN",
      "manifest",
      "Knowledge compatibility manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.compatibilityRuntimeId ===
          PRODUCT_KNOWLEDGE_COMPATIBILITY_ID &&
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
    summary: `product-knowledge-compatibility readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertKnowledgeCompatibilityReadinessReady(
  result: KnowledgeCompatibilityReadinessResult,
): asserts result is KnowledgeCompatibilityReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product knowledge compatibility not ready: ${result.summary}`,
    );
  }
}
