/**
 * Product M09 — AI Prompt Engine Release Gate
 * MODULE: Prompt Engine (M09-P3)
 * BASE: enterprise-product-ai-model-registry-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AI_MODEL_REGISTRY_ID } from "../model/model.constants";
import { bindAiPromptModel } from "../prompt-engine/binding.registry";
import {
  AI_PROMPT_BINDING_STATUSES,
  AI_PROMPT_KINDS,
  AI_PROMPT_READINESS_VERDICTS,
  AI_PROMPT_STATUSES,
  AI_PROMPT_VERSION_STATUSES,
  PRODUCT_AI_PROMPT_ENGINE_BASE,
  PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_PROMPT_ENGINE_ID,
  PRODUCT_AI_PROMPT_ENGINE_VERSION,
  PRODUCT_AI_PROMPT_FREEZE_TAG,
} from "../prompt-engine/prompt.constants";
import {
  assertAiPromptEngineReadinessReady,
  buildAiPromptEngineManifest,
  clearAiPromptEngineLayer,
  evaluateAiPromptEngineReadiness,
} from "../prompt-engine/prompt.manifest";
import {
  getAiPromptEngineMetadata,
  isAiPromptEngineMetadataIntact,
} from "../prompt-engine/prompt.metadata";
import {
  registerAiPrompt,
  updateAiPromptStatus,
} from "../prompt-engine/prompt.registry";
import {
  registerAiPromptVersion,
  updateAiPromptVersionStatus,
} from "../prompt-engine/version.registry";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_AI_PROMPT_SIGNOFF_VERSION =
  "product-ai-prompt-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearAiPromptEngineLayer();
}

export function checkProductAiPromptEngineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiPromptEngineMetadata();

  checks.push(
    check(
      "PROMPT-CONSTANTS",
      "prompt-engine",
      "Product AI prompt engine version constants",
      PRODUCT_AI_PROMPT_ENGINE_ID ===
        "enterprise-product-ai-prompt-engine-v1" &&
        PRODUCT_AI_PROMPT_ENGINE_VERSION === "product-ai-prompt-1" &&
        PRODUCT_AI_PROMPT_ENGINE_BASE === PRODUCT_AI_MODEL_REGISTRY_ID &&
        PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION ===
          "product-ai-prompt-engine-freeze-1" &&
        PRODUCT_AI_PROMPT_FREEZE_TAG === "product-ai-prompt-engine-freeze-1" &&
        AI_PROMPT_KINDS.length === 5 &&
        AI_PROMPT_STATUSES.length === 4 &&
        AI_PROMPT_VERSION_STATUSES.length === 4 &&
        AI_PROMPT_BINDING_STATUSES.length === 3 &&
        AI_PROMPT_READINESS_VERDICTS.length === 3 &&
        isAiPromptEngineMetadataIntact(metadata),
      `id=${PRODUCT_AI_PROMPT_ENGINE_ID} base=${PRODUCT_AI_PROMPT_ENGINE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PROMPT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "PROMPT-UPSTREAM",
      "compatibility",
      "Depends on AI model registry chain",
      PRODUCT_AI_PROMPT_ENGINE_BASE ===
        "enterprise-product-ai-model-registry-v1" &&
        PRODUCT_AI_MODEL_REGISTRY_ID ===
          "enterprise-product-ai-model-registry-v1",
      `model=${PRODUCT_AI_MODEL_REGISTRY_ID}`,
    ),
  );

  try {
    cleanup();

    const prompt = registerAiPrompt({
      id: "prompt.gate.reg",
      promptKey: "DOMAIN_COACH_SYSTEM",
      name: "Domain Coach System Prompt",
      kind: "SYSTEM",
      summary: "Declared system prompt template for coaching domain",
    });
    const active = updateAiPromptStatus({
      promptId: prompt.id,
      status: "ACTIVE",
    });
    const version = registerAiPromptVersion({
      id: "prompt.gate.ver",
      promptId: prompt.id,
      versionKey: "DOMAIN_COACH_SYSTEM_V1",
      semver: "1.0.0",
      bodyRef: "PROMPT_BODY_COACH_SYSTEM_V1",
      variableSchemaRef: "PROMPT_VARS_COACH_V1",
    });
    const published = updateAiPromptVersionStatus({
      versionId: version.id,
      status: "PUBLISHED",
    });
    const binding = bindAiPromptModel({
      id: "prompt.gate.bind",
      promptId: prompt.id,
      versionId: version.id,
      bindingKey: "DOMAIN_COACH_TO_GENERAL",
      modelKeyRef: "DOMAIN_LLM_GENERAL",
    });
    const manifest = buildAiPromptEngineManifest();
    const readiness = evaluateAiPromptEngineReadiness();

    const ok =
      prompt.promptKey === "DOMAIN_COACH_SYSTEM" &&
      active.status === "ACTIVE" &&
      published.status === "PUBLISHED" &&
      binding.status === "BOUND" &&
      binding.modelKeyRef === "DOMAIN_LLM_GENERAL" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiPromptEngineReadinessReady(readiness);
      checks.push(
        check(
          "PROMPT-STACK",
          "prompt-engine",
          "Prompt / version / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "PROMPT-STACK",
          "prompt-engine",
          "Prompt / version / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai prompt engine not ready",
        ),
      );
    }

    checks.push(
      check(
        "PROMPT-SCOPE",
        "scope",
        "No provider-runtime / model-execution / workflow / agent / tool-calling",
        ok && metadata.declarationOnly === true,
        "ai-prompt-engine-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai prompt engine probe failed";
    checks.push(
      check(
        "PROMPT-STACK",
        "prompt-engine",
        "Prompt / version / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "PROMPT-SCOPE",
        "scope",
        "No provider-runtime / model-execution / workflow / agent / tool-calling",
        false,
        detail,
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-ai-prompt-engine-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiPromptEngineReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiPromptEngineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI prompt engine release gate failed: ${gate.summary}`,
    );
  }
}
