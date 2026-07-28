/**
 * Product M14 — Intelligence Compatibility Release Gate
 * MODULE: Enterprise Intelligence Compatibility (M14-P5)
 * BASE: enterprise-product-intelligence-policy-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { bindIntelligenceCompatibilityPair } from "../compatibility-runtime/binding.registry";
import {
  INTELLIGENCE_COMPATIBILITY_BINDING_STATUSES,
  INTELLIGENCE_COMPATIBILITY_CONSTRAINTS,
  INTELLIGENCE_COMPATIBILITY_MATRIX_KINDS,
  INTELLIGENCE_COMPATIBILITY_MATRIX_STATUSES,
  INTELLIGENCE_COMPATIBILITY_PAIR_STATUSES,
  INTELLIGENCE_COMPATIBILITY_READINESS_VERDICTS,
  INTELLIGENCE_COMPATIBILITY_RELATIONS,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_ID,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION,
} from "../compatibility-runtime/compatibility.constants";
import {
  assertIntelligenceCompatibilityReadinessReady,
  buildIntelligenceCompatibilityManifest,
  clearIntelligenceCompatibilityLayer,
  evaluateIntelligenceCompatibilityReadiness,
} from "../compatibility-runtime/compatibility.manifest";
import {
  getIntelligenceCompatibilityMetadata,
  isIntelligenceCompatibilityMetadataIntact,
} from "../compatibility-runtime/compatibility.metadata";
import {
  registerIntelligenceCompatibilityMatrix,
  updateIntelligenceCompatibilityMatrixStatus,
} from "../compatibility-runtime/matrix.registry";
import {
  registerIntelligenceCompatibilityPair,
  updateIntelligenceCompatibilityPairStatus,
} from "../compatibility-runtime/pair.registry";
import { PRODUCT_INTELLIGENCE_POLICY_ID } from "../policy-runtime/policy.constants";

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

export const PRODUCT_INTELLIGENCE_COMPATIBILITY_SIGNOFF_VERSION =
  "product-intelligence-compatibility-signoff-1" as const;

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
  clearIntelligenceCompatibilityLayer();
}

export function checkProductIntelligenceCompatibilityReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getIntelligenceCompatibilityMetadata();

  checks.push(
    check(
      "INTCMP-CONSTANTS",
      "compatibility-runtime",
      "Product intelligence compatibility version constants",
      PRODUCT_INTELLIGENCE_COMPATIBILITY_ID ===
        "enterprise-product-intelligence-compatibility-v1" &&
        PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION ===
          "product-intelligence-compatibility-1" &&
        PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE === PRODUCT_INTELLIGENCE_POLICY_ID &&
        PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION ===
          "product-intelligence-compatibility-freeze-1" &&
        PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_TAG ===
          "product-intelligence-compatibility-freeze-1" &&
        INTELLIGENCE_COMPATIBILITY_MATRIX_KINDS.length === 4 &&
        INTELLIGENCE_COMPATIBILITY_MATRIX_STATUSES.length === 4 &&
        INTELLIGENCE_COMPATIBILITY_PAIR_STATUSES.length === 4 &&
        INTELLIGENCE_COMPATIBILITY_RELATIONS.length === 4 &&
        INTELLIGENCE_COMPATIBILITY_BINDING_STATUSES.length === 3 &&
        INTELLIGENCE_COMPATIBILITY_CONSTRAINTS.length === 4 &&
        INTELLIGENCE_COMPATIBILITY_READINESS_VERDICTS.length === 3 &&
        isIntelligenceCompatibilityMetadataIntact(metadata),
      `id=${PRODUCT_INTELLIGENCE_COMPATIBILITY_ID} base=${PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "INTCMP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "INTCMP-UPSTREAM",
      "compatibility",
      "Depends on intelligence policy chain",
      PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE ===
        "enterprise-product-intelligence-policy-v1" &&
        PRODUCT_INTELLIGENCE_POLICY_ID ===
          "enterprise-product-intelligence-policy-v1",
      `policy=${PRODUCT_INTELLIGENCE_POLICY_ID}`,
    ),
  );

  try {
    cleanup();

    const matrix = registerIntelligenceCompatibilityMatrix({
      id: "intcmp.gate.mat",
      matrixKey: "EXECUTIVE_LAYER_MATRIX",
      kind: "LAYER",
      title: "Executive intelligence compatibility matrix",
      summary: "Declared matrix for policy-aware version pairing",
    });
    const active = updateIntelligenceCompatibilityMatrixStatus({
      matrixId: matrix.id,
      status: "ACTIVE",
    });
    const pair = registerIntelligenceCompatibilityPair({
      id: "intcmp.gate.pair",
      matrixId: matrix.id,
      pairKey: "DEP_TO_POLICY",
      sequence: 1,
      relation: "COMPATIBLE",
      upstreamVersionRef: "product-intelligence-dependency-1",
      downstreamVersionRef: "product-intelligence-policy-1",
      policyKeyRef: "EXECUTIVE_DECISION_GATE",
      summary: "Soft-ref pair linking dependency to policy layer",
    });
    const declared = updateIntelligenceCompatibilityPairStatus({
      pairId: pair.id,
      status: "DECLARED",
    });
    const binding = bindIntelligenceCompatibilityPair({
      id: "intcmp.gate.bind",
      matrixId: matrix.id,
      pairId: pair.id,
      bindingKey: "PAIR_TO_POLICY_GATE",
      constraint: "POLICY_GATE",
      fallbackVersionRef: "product-intelligence-dependency-1",
    });
    const manifest = buildIntelligenceCompatibilityManifest();
    const readiness = evaluateIntelligenceCompatibilityReadiness();

    const ok =
      matrix.matrixKey === "EXECUTIVE_LAYER_MATRIX" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.relation === "COMPATIBLE" &&
      declared.policyKeyRef === "EXECUTIVE_DECISION_GATE" &&
      binding.status === "BOUND" &&
      binding.constraint === "POLICY_GATE" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertIntelligenceCompatibilityReadinessReady(readiness);
      checks.push(
        check(
          "INTCMP-STACK",
          "intelligence-compatibility",
          "Matrix / pair / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "INTCMP-STACK",
          "intelligence-compatibility",
          "Matrix / pair / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product intelligence compatibility not ready",
        ),
      );
    }

    checks.push(
      check(
        "INTCMP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "intelligence-compatibility-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product intelligence compatibility probe failed";
    checks.push(
      check(
        "INTCMP-STACK",
        "intelligence-compatibility",
        "Matrix / pair / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "INTCMP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / intelligence execution / tool runtime",
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
      `product-intelligence-compatibility-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductIntelligenceCompatibilityReleaseGatePass(
  gate: ReleaseGateResult = checkProductIntelligenceCompatibilityReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product intelligence compatibility release gate failed: ${gate.summary}`,
    );
  }
}
