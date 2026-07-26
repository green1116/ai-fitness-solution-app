/**
 * Product M10 — AI Runtime Foundation Release Gate
 * MODULE: Enterprise AI Runtime Foundation (M10-P1)
 * BASE: enterprise-product-ai-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_AI_BASELINE_ID } from "../../m09/baseline/freeze/freeze.lock";
import {
  AI_RUNTIME_CAPABILITY_KINDS,
  AI_RUNTIME_CAPABILITY_STATUSES,
  AI_RUNTIME_DOMAIN_SCOPES,
  AI_RUNTIME_READINESS_VERDICTS,
  PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
  PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_FOUNDATION_ID,
  PRODUCT_AI_RUNTIME_FOUNDATION_VERSION,
  PRODUCT_AI_RUNTIME_FREEZE_TAG,
} from "../foundation/runtime.constants";
import {
  assertAiRuntimeFoundationReadinessReady,
  buildAiRuntimeFoundationManifest,
  evaluateAiRuntimeFoundationReadiness,
} from "../foundation/runtime.manifest";
import {
  getAiRuntimeFoundationMetadata,
  isAiRuntimeFoundationMetadataIntact,
} from "../foundation/runtime.metadata";
import {
  clearAiRuntimeCapabilities,
  registerAiRuntimeCapability,
  updateAiRuntimeCapabilityStatus,
} from "../foundation/runtime.registry";

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

export const PRODUCT_AI_RUNTIME_FOUNDATION_SIGNOFF_VERSION =
  "product-ai-runtime-foundation-signoff-1" as const;

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
  clearAiRuntimeCapabilities();
}

export function checkProductAiRuntimeFoundationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiRuntimeFoundationMetadata();

  checks.push(
    check(
      "AIRTF-CONSTANTS",
      "foundation",
      "Product AI runtime foundation version constants",
      PRODUCT_AI_RUNTIME_FOUNDATION_ID ===
        "enterprise-product-ai-runtime-foundation-v1" &&
        PRODUCT_AI_RUNTIME_FOUNDATION_VERSION === "product-ai-runtime-1" &&
        PRODUCT_AI_RUNTIME_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_AI_BASELINE_ID &&
        PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION ===
          "product-ai-runtime-foundation-freeze-1" &&
        PRODUCT_AI_RUNTIME_FREEZE_TAG ===
          "product-ai-runtime-foundation-freeze-1" &&
        AI_RUNTIME_CAPABILITY_KINDS.length === 5 &&
        AI_RUNTIME_CAPABILITY_STATUSES.length === 4 &&
        AI_RUNTIME_DOMAIN_SCOPES.length === 4 &&
        AI_RUNTIME_READINESS_VERDICTS.length === 3 &&
        isAiRuntimeFoundationMetadataIntact(metadata),
      `id=${PRODUCT_AI_RUNTIME_FOUNDATION_ID} base=${PRODUCT_AI_RUNTIME_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AIRTF-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AIRTF-UPSTREAM",
      "compatibility",
      "Depends on AI baseline",
      PRODUCT_AI_RUNTIME_FOUNDATION_BASE ===
        "enterprise-product-ai-baseline-v1" &&
        ENTERPRISE_PRODUCT_AI_BASELINE_ID ===
          "enterprise-product-ai-baseline-v1",
      `aiBaseline=${ENTERPRISE_PRODUCT_AI_BASELINE_ID}`,
    ),
  );

  try {
    cleanup();

    const capability = registerAiRuntimeCapability({
      id: "airtf.gate.cap",
      capabilityKey: "DOMAIN_RUNTIME_PLANE",
      kind: "PLANE",
      scope: "DOMAIN",
      summary: "Declared runtime plane for domain reuse",
      aiBaselineRef: ENTERPRISE_PRODUCT_AI_BASELINE_ID,
    });
    const declared = updateAiRuntimeCapabilityStatus({
      capabilityId: capability.id,
      status: "DECLARED",
    });
    const manifest = buildAiRuntimeFoundationManifest();
    const readiness = evaluateAiRuntimeFoundationReadiness();

    const ok =
      capability.capabilityKey === "DOMAIN_RUNTIME_PLANE" &&
      declared.status === "DECLARED" &&
      declared.aiBaselineRef === ENTERPRISE_PRODUCT_AI_BASELINE_ID &&
      manifest.checksum.length === 64 &&
      manifest.capabilityCount >= 1 &&
      manifest.declaredCount >= 1 &&
      readiness.verdict === "READY";

    try {
      assertAiRuntimeFoundationReadinessReady(readiness);
      checks.push(
        check(
          "AIRTF-STACK",
          "ai-runtime-foundation",
          "Constants / metadata / registry / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AIRTF-STACK",
          "ai-runtime-foundation",
          "Constants / metadata / registry / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai runtime foundation not ready",
        ),
      );
    }

    checks.push(
      check(
        "AIRTF-SCOPE",
        "scope",
        "No job / queue / scheduler / resource / provider / model / workflow / agent / business-logic",
        ok && metadata.declarationOnly === true,
        "ai-runtime-foundation-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai runtime foundation probe failed";
    checks.push(
      check(
        "AIRTF-STACK",
        "ai-runtime-foundation",
        "Constants / metadata / registry / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AIRTF-SCOPE",
        "scope",
        "No job / queue / scheduler / resource / provider / model / workflow / agent / business-logic",
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
      `product-ai-runtime-foundation-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiRuntimeFoundationReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiRuntimeFoundationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI runtime foundation release gate failed: ${gate.summary}`,
    );
  }
}
