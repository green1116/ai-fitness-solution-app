/**
 * Product M10 — AI Runtime Foundation manifest builder
 */

import { createHash } from "node:crypto";

import {
  PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
  PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_FOUNDATION_ID,
  PRODUCT_AI_RUNTIME_FOUNDATION_VERSION,
} from "./runtime.constants";
import { getAiRuntimeFoundationMetadata } from "./runtime.metadata";
import { listAiRuntimeCapabilities } from "./runtime.registry";
import type {
  AiRuntimeFoundationManifest,
  AiRuntimeReadinessCheck,
  AiRuntimeReadinessResult,
} from "./runtime.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiRuntimeReadinessCheck {
  return { id, component, label, ok, detail };
}

export function buildAiRuntimeFoundationManifest(): AiRuntimeFoundationManifest {
  const capabilities = listAiRuntimeCapabilities();
  const declared = capabilities.filter((c) => c.status === "DECLARED");
  const metadata = getAiRuntimeFoundationMetadata();

  const payload = {
    foundationId: PRODUCT_AI_RUNTIME_FOUNDATION_ID,
    version: PRODUCT_AI_RUNTIME_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    capabilities: capabilities.map((c) => ({
      capabilityKey: c.capabilityKey,
      kind: c.kind,
      status: c.status,
      scope: c.scope,
      aiBaselineRef: c.aiBaselineRef,
    })),
  };

  return {
    foundationId: PRODUCT_AI_RUNTIME_FOUNDATION_ID,
    version: PRODUCT_AI_RUNTIME_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
    capabilityCount: capabilities.length,
    declaredCount: declared.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiRuntimeFoundationReadiness(): AiRuntimeReadinessResult {
  const checks: AiRuntimeReadinessCheck[] = [];
  const metadata = getAiRuntimeFoundationMetadata();
  const capabilities = listAiRuntimeCapabilities();
  const manifest = buildAiRuntimeFoundationManifest();

  checks.push(
    check(
      "AIRTF-BASE",
      "foundation",
      "ai baseline aligned",
      PRODUCT_AI_RUNTIME_FOUNDATION_BASE ===
        "enterprise-product-ai-baseline-v1" &&
        metadata.base === PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
      `base=${PRODUCT_AI_RUNTIME_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "AIRTF-META",
      "metadata",
      "Runtime foundation metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 9,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AIRTF-CAP",
      "registry",
      "Declared runtime capabilities present",
      capabilities.some((c) => c.status === "DECLARED"),
      `capabilities=${capabilities.length}`,
    ),
  );

  checks.push(
    check(
      "AIRTF-MAN",
      "manifest",
      "Runtime foundation manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.foundationId === PRODUCT_AI_RUNTIME_FOUNDATION_ID &&
        manifest.declaredCount >= 1,
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
    summary: `product-ai-runtime-foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiRuntimeFoundationReadinessReady(
  result: AiRuntimeReadinessResult,
): asserts result is AiRuntimeReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product ai runtime foundation not ready: ${result.summary}`,
    );
  }
}
