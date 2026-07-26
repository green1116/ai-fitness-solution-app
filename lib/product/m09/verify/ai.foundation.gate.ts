/**
 * Product M09 — AI Foundation Release Gate
 * MODULE: AI Foundation (M09-P1)
 * BASE: enterprise-product-marketplace-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID } from "../../marketplace-baseline/freeze/freeze.lock";
import {
  AI_CAPABILITY_KINDS,
  AI_CAPABILITY_STATUSES,
  AI_DOMAIN_SCOPES,
  AI_READINESS_VERDICTS,
  PRODUCT_AI_FOUNDATION_BASE,
  PRODUCT_AI_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_FOUNDATION_ID,
  PRODUCT_AI_FOUNDATION_VERSION,
  PRODUCT_AI_FREEZE_TAG,
} from "../foundation/ai.constants";
import {
  assertAiFoundationReadinessReady,
  buildAiFoundationManifest,
  evaluateAiFoundationReadiness,
} from "../foundation/ai.manifest";
import {
  getAiFoundationMetadata,
  isAiFoundationMetadataIntact,
} from "../foundation/ai.metadata";
import {
  clearAiCapabilities,
  registerAiCapability,
  updateAiCapabilityStatus,
} from "../foundation/ai.registry";

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

export const PRODUCT_AI_FOUNDATION_SIGNOFF_VERSION =
  "product-ai-foundation-signoff-1" as const;

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
  clearAiCapabilities();
}

export function checkProductAiFoundationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiFoundationMetadata();

  checks.push(
    check(
      "AI-CONSTANTS",
      "foundation",
      "Product AI foundation version constants",
      PRODUCT_AI_FOUNDATION_ID === "enterprise-product-ai-foundation-v1" &&
        PRODUCT_AI_FOUNDATION_VERSION === "product-ai-1" &&
        PRODUCT_AI_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID &&
        PRODUCT_AI_FOUNDATION_FREEZE_VERSION ===
          "product-ai-foundation-freeze-1" &&
        PRODUCT_AI_FREEZE_TAG === "product-ai-foundation-freeze-1" &&
        AI_CAPABILITY_KINDS.length === 6 &&
        AI_CAPABILITY_STATUSES.length === 4 &&
        AI_DOMAIN_SCOPES.length === 4 &&
        AI_READINESS_VERDICTS.length === 3 &&
        isAiFoundationMetadataIntact(metadata),
      `id=${PRODUCT_AI_FOUNDATION_ID} base=${PRODUCT_AI_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AI-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AI-UPSTREAM",
      "compatibility",
      "Depends on marketplace baseline",
      PRODUCT_AI_FOUNDATION_BASE ===
        "enterprise-product-marketplace-baseline-v1" &&
        ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID ===
          "enterprise-product-marketplace-baseline-v1",
      `marketplace=${ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID}`,
    ),
  );

  try {
    cleanup();

    const capability = registerAiCapability({
      id: "ai.gate.cap",
      capabilityKey: "DOMAIN_COMPLETION",
      kind: "COMPLETION",
      scope: "DOMAIN",
      summary: "Declared completion capability for domain reuse",
      marketplaceBaselineRef: ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID,
    });
    const declared = updateAiCapabilityStatus({
      capabilityId: capability.id,
      status: "DECLARED",
    });
    const manifest = buildAiFoundationManifest();
    const readiness = evaluateAiFoundationReadiness();

    const ok =
      capability.capabilityKey === "DOMAIN_COMPLETION" &&
      declared.status === "DECLARED" &&
      declared.marketplaceBaselineRef ===
        ENTERPRISE_PRODUCT_MARKETPLACE_BASELINE_ID &&
      manifest.checksum.length === 64 &&
      manifest.capabilityCount >= 1 &&
      manifest.declaredCount >= 1 &&
      readiness.verdict === "READY";

    try {
      assertAiFoundationReadinessReady(readiness);
      checks.push(
        check(
          "AI-STACK",
          "ai-foundation",
          "Constants / metadata / registry / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AI-STACK",
          "ai-foundation",
          "Constants / metadata / registry / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai foundation not ready",
        ),
      );
    }

    checks.push(
      check(
        "AI-SCOPE",
        "scope",
        "No providers / prompt-engine / workflow / agent / runtime / network / database / business-logic",
        ok && metadata.declarationOnly === true,
        "ai-foundation-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai foundation probe failed";
    checks.push(
      check(
        "AI-STACK",
        "ai-foundation",
        "Constants / metadata / registry / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AI-SCOPE",
        "scope",
        "No providers / prompt-engine / workflow / agent / runtime / network / database / business-logic",
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
      `product-ai-foundation-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiFoundationReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiFoundationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI foundation release gate failed: ${gate.summary}`,
    );
  }
}
