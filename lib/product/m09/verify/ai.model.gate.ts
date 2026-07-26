/**
 * Product M09 — AI Model Registry Release Gate
 * MODULE: Model Registry (M09-P2)
 * BASE: enterprise-product-ai-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AI_FOUNDATION_ID } from "../foundation/ai.constants";
import { bindAiModelCapability } from "../model/binding.registry";
import {
  AI_MODEL_BINDING_STATUSES,
  AI_MODEL_FAMILIES,
  AI_MODEL_READINESS_VERDICTS,
  AI_MODEL_STATUSES,
  AI_MODEL_VERSION_STATUSES,
  PRODUCT_AI_MODEL_FREEZE_TAG,
  PRODUCT_AI_MODEL_REGISTRY_BASE,
  PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION,
  PRODUCT_AI_MODEL_REGISTRY_ID,
  PRODUCT_AI_MODEL_REGISTRY_VERSION,
} from "../model/model.constants";
import {
  assertAiModelRegistryReadinessReady,
  buildAiModelRegistryManifest,
  clearAiModelRegistryLayer,
  evaluateAiModelRegistryReadiness,
} from "../model/model.manifest";
import {
  getAiModelRegistryMetadata,
  isAiModelRegistryMetadataIntact,
} from "../model/model.metadata";
import {
  registerAiModel,
  updateAiModelStatus,
} from "../model/model.registry";
import {
  registerAiModelVersion,
  updateAiModelVersionStatus,
} from "../model/version.registry";

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

export const PRODUCT_AI_MODEL_SIGNOFF_VERSION =
  "product-ai-model-signoff-1" as const;

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
  clearAiModelRegistryLayer();
}

export function checkProductAiModelRegistryReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiModelRegistryMetadata();

  checks.push(
    check(
      "MODEL-CONSTANTS",
      "model-registry",
      "Product AI model registry version constants",
      PRODUCT_AI_MODEL_REGISTRY_ID ===
        "enterprise-product-ai-model-registry-v1" &&
        PRODUCT_AI_MODEL_REGISTRY_VERSION === "product-ai-model-1" &&
        PRODUCT_AI_MODEL_REGISTRY_BASE === PRODUCT_AI_FOUNDATION_ID &&
        PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION ===
          "product-ai-model-registry-freeze-1" &&
        PRODUCT_AI_MODEL_FREEZE_TAG === "product-ai-model-registry-freeze-1" &&
        AI_MODEL_FAMILIES.length === 5 &&
        AI_MODEL_STATUSES.length === 4 &&
        AI_MODEL_VERSION_STATUSES.length === 4 &&
        AI_MODEL_BINDING_STATUSES.length === 3 &&
        AI_MODEL_READINESS_VERDICTS.length === 3 &&
        isAiModelRegistryMetadataIntact(metadata),
      `id=${PRODUCT_AI_MODEL_REGISTRY_ID} base=${PRODUCT_AI_MODEL_REGISTRY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "MODEL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "MODEL-UPSTREAM",
      "compatibility",
      "Depends on AI foundation chain",
      PRODUCT_AI_MODEL_REGISTRY_BASE ===
        "enterprise-product-ai-foundation-v1" &&
        PRODUCT_AI_FOUNDATION_ID === "enterprise-product-ai-foundation-v1",
      `foundation=${PRODUCT_AI_FOUNDATION_ID}`,
    ),
  );

  try {
    cleanup();

    const model = registerAiModel({
      id: "model.gate.reg",
      modelKey: "DOMAIN_LLM_GENERAL",
      name: "Domain General LLM",
      family: "GENERAL",
      summary: "Declared general model for domain reuse",
    });
    const active = updateAiModelStatus({
      modelId: model.id,
      status: "ACTIVE",
    });
    const version = registerAiModelVersion({
      id: "model.gate.ver",
      modelId: model.id,
      versionKey: "DOMAIN_LLM_GENERAL_V1",
      semver: "1.0.0",
    });
    const published = updateAiModelVersionStatus({
      versionId: version.id,
      status: "PUBLISHED",
    });
    const binding = bindAiModelCapability({
      id: "model.gate.bind",
      modelId: model.id,
      versionId: version.id,
      bindingKey: "DOMAIN_LLM_COMPLETION",
      capabilityKeyRef: "DOMAIN_COMPLETION",
    });
    const manifest = buildAiModelRegistryManifest();
    const readiness = evaluateAiModelRegistryReadiness();

    const ok =
      model.modelKey === "DOMAIN_LLM_GENERAL" &&
      active.status === "ACTIVE" &&
      published.status === "PUBLISHED" &&
      binding.status === "BOUND" &&
      binding.capabilityKeyRef === "DOMAIN_COMPLETION" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiModelRegistryReadinessReady(readiness);
      checks.push(
        check(
          "MODEL-STACK",
          "model-registry",
          "Model / version / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "MODEL-STACK",
          "model-registry",
          "Model / version / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai model registry not ready",
        ),
      );
    }

    checks.push(
      check(
        "MODEL-SCOPE",
        "scope",
        "No provider-runtime / prompt-engine / workflow / agent / tool-calling",
        ok && metadata.declarationOnly === true,
        "ai-model-registry-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai model registry probe failed";
    checks.push(
      check(
        "MODEL-STACK",
        "model-registry",
        "Model / version / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "MODEL-SCOPE",
        "scope",
        "No provider-runtime / prompt-engine / workflow / agent / tool-calling",
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
      `product-ai-model-registry-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiModelRegistryReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiModelRegistryReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI model registry release gate failed: ${gate.summary}`,
    );
  }
}
