/**
 * Product M09 — AI Model Registry manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_FOUNDATION_ID } from "../foundation/ai.constants";
import {
  clearAiModelCapabilityBindings,
  listAiModelCapabilityBindings,
} from "./binding.registry";
import {
  PRODUCT_AI_MODEL_REGISTRY_BASE,
  PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION,
  PRODUCT_AI_MODEL_REGISTRY_ID,
  PRODUCT_AI_MODEL_REGISTRY_VERSION,
} from "./model.constants";
import { getAiModelRegistryMetadata } from "./model.metadata";
import { clearAiModels, listAiModels } from "./model.registry";
import type {
  AiModelReadinessCheck,
  AiModelReadinessResult,
  AiModelRegistryManifest,
} from "./model.types";
import { clearAiModelVersions, listAiModelVersions } from "./version.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiModelReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiModelRegistryLayer(): void {
  clearAiModelCapabilityBindings();
  clearAiModelVersions();
  clearAiModels();
}

export function buildAiModelRegistryManifest(): AiModelRegistryManifest {
  const models = listAiModels();
  const versions = listAiModelVersions();
  const bindings = listAiModelCapabilityBindings();
  const metadata = getAiModelRegistryMetadata();

  const payload = {
    registryId: PRODUCT_AI_MODEL_REGISTRY_ID,
    version: PRODUCT_AI_MODEL_REGISTRY_VERSION,
    freezeVersion: PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION,
    base: PRODUCT_AI_MODEL_REGISTRY_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    models: models.map((m) => ({
      modelKey: m.modelKey,
      family: m.family,
      status: m.status,
    })),
    versions: versions.map((v) => ({
      versionKey: v.versionKey,
      semver: v.semver,
      status: v.status,
      modelId: v.modelId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      capabilityKeyRef: b.capabilityKeyRef,
      status: b.status,
      modelId: b.modelId,
    })),
  };

  return {
    registryId: PRODUCT_AI_MODEL_REGISTRY_ID,
    version: PRODUCT_AI_MODEL_REGISTRY_VERSION,
    freezeVersion: PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION,
    base: PRODUCT_AI_MODEL_REGISTRY_BASE,
    modelCount: models.length,
    versionCount: versions.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiModelRegistryReadiness(): AiModelReadinessResult {
  const checks: AiModelReadinessCheck[] = [];
  const metadata = getAiModelRegistryMetadata();
  const models = listAiModels();
  const versions = listAiModelVersions();
  const bindings = listAiModelCapabilityBindings();
  const manifest = buildAiModelRegistryManifest();

  checks.push(
    check(
      "MODEL-BASE",
      "registry",
      "ai foundation base aligned",
      PRODUCT_AI_MODEL_REGISTRY_BASE === PRODUCT_AI_FOUNDATION_ID &&
        PRODUCT_AI_FOUNDATION_ID === "enterprise-product-ai-foundation-v1",
      `base=${PRODUCT_AI_MODEL_REGISTRY_BASE}`,
    ),
  );

  checks.push(
    check(
      "MODEL-META",
      "metadata",
      "Model registry metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 5,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "MODEL-REG",
      "model",
      "Active models present",
      models.some((m) => m.status === "ACTIVE"),
      `models=${models.length}`,
    ),
  );

  checks.push(
    check(
      "MODEL-VER",
      "version",
      "Published versions present",
      versions.some((v) => v.status === "PUBLISHED"),
      `versions=${versions.length}`,
    ),
  );

  checks.push(
    check(
      "MODEL-BIND",
      "binding",
      "Bound capability refs present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "MODEL-MAN",
      "manifest",
      "Model registry manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.registryId === PRODUCT_AI_MODEL_REGISTRY_ID &&
        manifest.modelCount >= 1 &&
        manifest.versionCount >= 1 &&
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
    summary: `product-ai-model-registry readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiModelRegistryReadinessReady(
  result: AiModelReadinessResult,
): asserts result is AiModelReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product ai model registry not ready: ${result.summary}`,
    );
  }
}
