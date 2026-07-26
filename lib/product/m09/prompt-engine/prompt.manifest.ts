/**
 * Product M09 — AI Prompt Engine manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_MODEL_REGISTRY_ID } from "../model/model.constants";
import {
  clearAiPromptModelBindings,
  listAiPromptModelBindings,
} from "./binding.registry";
import {
  PRODUCT_AI_PROMPT_ENGINE_BASE,
  PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_PROMPT_ENGINE_ID,
  PRODUCT_AI_PROMPT_ENGINE_VERSION,
} from "./prompt.constants";
import { getAiPromptEngineMetadata } from "./prompt.metadata";
import { clearAiPrompts, listAiPrompts } from "./prompt.registry";
import type {
  AiPromptEngineManifest,
  AiPromptReadinessCheck,
  AiPromptReadinessResult,
} from "./prompt.types";
import { clearAiPromptVersions, listAiPromptVersions } from "./version.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiPromptReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiPromptEngineLayer(): void {
  clearAiPromptModelBindings();
  clearAiPromptVersions();
  clearAiPrompts();
}

export function buildAiPromptEngineManifest(): AiPromptEngineManifest {
  const prompts = listAiPrompts();
  const versions = listAiPromptVersions();
  const bindings = listAiPromptModelBindings();
  const metadata = getAiPromptEngineMetadata();

  const payload = {
    engineId: PRODUCT_AI_PROMPT_ENGINE_ID,
    version: PRODUCT_AI_PROMPT_ENGINE_VERSION,
    freezeVersion: PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION,
    base: PRODUCT_AI_PROMPT_ENGINE_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    prompts: prompts.map((p) => ({
      promptKey: p.promptKey,
      kind: p.kind,
      status: p.status,
    })),
    versions: versions.map((v) => ({
      versionKey: v.versionKey,
      semver: v.semver,
      bodyRef: v.bodyRef,
      variableSchemaRef: v.variableSchemaRef,
      status: v.status,
      promptId: v.promptId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      modelKeyRef: b.modelKeyRef,
      status: b.status,
      promptId: b.promptId,
    })),
  };

  return {
    engineId: PRODUCT_AI_PROMPT_ENGINE_ID,
    version: PRODUCT_AI_PROMPT_ENGINE_VERSION,
    freezeVersion: PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION,
    base: PRODUCT_AI_PROMPT_ENGINE_BASE,
    promptCount: prompts.length,
    versionCount: versions.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiPromptEngineReadiness(): AiPromptReadinessResult {
  const checks: AiPromptReadinessCheck[] = [];
  const metadata = getAiPromptEngineMetadata();
  const prompts = listAiPrompts();
  const versions = listAiPromptVersions();
  const bindings = listAiPromptModelBindings();
  const manifest = buildAiPromptEngineManifest();

  checks.push(
    check(
      "PROMPT-BASE",
      "engine",
      "ai model registry base aligned",
      PRODUCT_AI_PROMPT_ENGINE_BASE === PRODUCT_AI_MODEL_REGISTRY_ID &&
        PRODUCT_AI_MODEL_REGISTRY_ID ===
          "enterprise-product-ai-model-registry-v1",
      `base=${PRODUCT_AI_PROMPT_ENGINE_BASE}`,
    ),
  );

  checks.push(
    check(
      "PROMPT-META",
      "metadata",
      "Prompt engine metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 5,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "PROMPT-REG",
      "prompt",
      "Active prompts present",
      prompts.some((p) => p.status === "ACTIVE"),
      `prompts=${prompts.length}`,
    ),
  );

  checks.push(
    check(
      "PROMPT-VER",
      "version",
      "Published versions present",
      versions.some((v) => v.status === "PUBLISHED"),
      `versions=${versions.length}`,
    ),
  );

  checks.push(
    check(
      "PROMPT-BIND",
      "binding",
      "Bound model refs present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "PROMPT-MAN",
      "manifest",
      "Prompt engine manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.engineId === PRODUCT_AI_PROMPT_ENGINE_ID &&
        manifest.promptCount >= 1 &&
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
    summary: `product-ai-prompt-engine readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiPromptEngineReadinessReady(
  result: AiPromptReadinessResult,
): asserts result is AiPromptReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product ai prompt engine not ready: ${result.summary}`,
    );
  }
}
