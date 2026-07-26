/**
 * Product M09 — AI Foundation manifest builder
 */

import { createHash } from "node:crypto";

import {
  PRODUCT_AI_FOUNDATION_BASE,
  PRODUCT_AI_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_FOUNDATION_ID,
  PRODUCT_AI_FOUNDATION_VERSION,
} from "./ai.constants";
import { getAiFoundationMetadata } from "./ai.metadata";
import { listAiCapabilities } from "./ai.registry";
import type {
  AiFoundationManifest,
  AiReadinessCheck,
  AiReadinessResult,
} from "./ai.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiReadinessCheck {
  return { id, component, label, ok, detail };
}

export function buildAiFoundationManifest(): AiFoundationManifest {
  const capabilities = listAiCapabilities();
  const declared = capabilities.filter((c) => c.status === "DECLARED");
  const metadata = getAiFoundationMetadata();

  const payload = {
    foundationId: PRODUCT_AI_FOUNDATION_ID,
    version: PRODUCT_AI_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_AI_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_AI_FOUNDATION_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    capabilities: capabilities.map((c) => ({
      capabilityKey: c.capabilityKey,
      kind: c.kind,
      status: c.status,
      scope: c.scope,
      marketplaceBaselineRef: c.marketplaceBaselineRef,
    })),
  };

  return {
    foundationId: PRODUCT_AI_FOUNDATION_ID,
    version: PRODUCT_AI_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_AI_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_AI_FOUNDATION_BASE,
    capabilityCount: capabilities.length,
    declaredCount: declared.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiFoundationReadiness(): AiReadinessResult {
  const checks: AiReadinessCheck[] = [];
  const metadata = getAiFoundationMetadata();
  const capabilities = listAiCapabilities();
  const manifest = buildAiFoundationManifest();

  checks.push(
    check(
      "AI-BASE",
      "foundation",
      "marketplace baseline aligned",
      PRODUCT_AI_FOUNDATION_BASE ===
        "enterprise-product-marketplace-baseline-v1" &&
        metadata.base === PRODUCT_AI_FOUNDATION_BASE,
      `base=${PRODUCT_AI_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "AI-META",
      "metadata",
      "Foundation metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 12,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AI-CAP",
      "registry",
      "Declared capabilities present",
      capabilities.some((c) => c.status === "DECLARED"),
      `capabilities=${capabilities.length}`,
    ),
  );

  checks.push(
    check(
      "AI-MAN",
      "manifest",
      "Foundation manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.foundationId === PRODUCT_AI_FOUNDATION_ID &&
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
    summary: `product-ai-foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiFoundationReadinessReady(
  result: AiReadinessResult,
): asserts result is AiReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product ai foundation not ready: ${result.summary}`);
  }
}
