/**
 * Product M11 — Knowledge Compatibility Release Gate
 * MODULE: Knowledge Compatibility (M11-P5)
 * BASE: enterprise-product-knowledge-policy-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { bindKnowledgeCompatibilityPair } from "../compatibility-runtime/binding.registry";
import {
  KNOWLEDGE_COMPATIBILITY_BINDING_STATUSES,
  KNOWLEDGE_COMPATIBILITY_CONSTRAINTS,
  KNOWLEDGE_COMPATIBILITY_MATRIX_KINDS,
  KNOWLEDGE_COMPATIBILITY_MATRIX_STATUSES,
  KNOWLEDGE_COMPATIBILITY_PAIR_STATUSES,
  KNOWLEDGE_COMPATIBILITY_READINESS_VERDICTS,
  KNOWLEDGE_COMPATIBILITY_RELATIONS,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION,
} from "../compatibility-runtime/compatibility.constants";
import {
  assertKnowledgeCompatibilityReadinessReady,
  buildKnowledgeCompatibilityManifest,
  clearKnowledgeCompatibilityLayer,
  evaluateKnowledgeCompatibilityReadiness,
} from "../compatibility-runtime/compatibility.manifest";
import {
  getKnowledgeCompatibilityMetadata,
  isKnowledgeCompatibilityMetadataIntact,
} from "../compatibility-runtime/compatibility.metadata";
import {
  registerKnowledgeCompatibilityMatrix,
  updateKnowledgeCompatibilityMatrixStatus,
} from "../compatibility-runtime/matrix.registry";
import {
  registerKnowledgeCompatibilityPair,
  updateKnowledgeCompatibilityPairStatus,
} from "../compatibility-runtime/pair.registry";
import { PRODUCT_KNOWLEDGE_POLICY_ID } from "../policy-runtime/policy.constants";

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

export const PRODUCT_KNOWLEDGE_COMPATIBILITY_SIGNOFF_VERSION =
  "product-knowledge-compatibility-signoff-1" as const;

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
  clearKnowledgeCompatibilityLayer();
}

export function checkProductKnowledgeCompatibilityReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getKnowledgeCompatibilityMetadata();

  checks.push(
    check(
      "KNWCMP-CONSTANTS",
      "compatibility-runtime",
      "Product knowledge compatibility version constants",
      PRODUCT_KNOWLEDGE_COMPATIBILITY_ID ===
        "enterprise-product-knowledge-compatibility-v1" &&
        PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION ===
          "product-knowledge-compatibility-1" &&
        PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE === PRODUCT_KNOWLEDGE_POLICY_ID &&
        PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION ===
          "product-knowledge-compatibility-freeze-1" &&
        PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_TAG ===
          "product-knowledge-compatibility-freeze-1" &&
        KNOWLEDGE_COMPATIBILITY_MATRIX_KINDS.length === 4 &&
        KNOWLEDGE_COMPATIBILITY_MATRIX_STATUSES.length === 4 &&
        KNOWLEDGE_COMPATIBILITY_PAIR_STATUSES.length === 4 &&
        KNOWLEDGE_COMPATIBILITY_RELATIONS.length === 4 &&
        KNOWLEDGE_COMPATIBILITY_BINDING_STATUSES.length === 3 &&
        KNOWLEDGE_COMPATIBILITY_CONSTRAINTS.length === 4 &&
        KNOWLEDGE_COMPATIBILITY_READINESS_VERDICTS.length === 3 &&
        isKnowledgeCompatibilityMetadataIntact(metadata),
      `id=${PRODUCT_KNOWLEDGE_COMPATIBILITY_ID} base=${PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "KNWCMP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "KNWCMP-UPSTREAM",
      "compatibility",
      "Depends on knowledge policy chain",
      PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE ===
        "enterprise-product-knowledge-policy-v1" &&
        PRODUCT_KNOWLEDGE_POLICY_ID ===
          "enterprise-product-knowledge-policy-v1",
      `policy=${PRODUCT_KNOWLEDGE_POLICY_ID}`,
    ),
  );

  try {
    cleanup();

    const matrix = registerKnowledgeCompatibilityMatrix({
      id: "knwcmp.gate.mat",
      matrixKey: "DOMAIN_LAYER_MATRIX",
      kind: "LAYER",
      title: "Domain layer compatibility matrix",
      summary: "Declared matrix for policy-aware version pairing",
    });
    const active = updateKnowledgeCompatibilityMatrixStatus({
      matrixId: matrix.id,
      status: "ACTIVE",
    });
    const pair = registerKnowledgeCompatibilityPair({
      id: "knwcmp.gate.pair",
      matrixId: matrix.id,
      pairKey: "DEP_TO_POLICY",
      sequence: 1,
      relation: "COMPATIBLE",
      upstreamVersionRef: "product-knowledge-dependency-1",
      downstreamVersionRef: "product-knowledge-policy-1",
      policyKeyRef: "DOMAIN_FITNESS_GATE",
      summary: "Soft-ref pair linking dependency to policy layer",
    });
    const declared = updateKnowledgeCompatibilityPairStatus({
      pairId: pair.id,
      status: "DECLARED",
    });
    const binding = bindKnowledgeCompatibilityPair({
      id: "knwcmp.gate.bind",
      matrixId: matrix.id,
      pairId: pair.id,
      bindingKey: "PAIR_TO_POLICY_GATE",
      constraint: "POLICY_GATE",
      fallbackVersionRef: "product-knowledge-dependency-1",
    });
    const manifest = buildKnowledgeCompatibilityManifest();
    const readiness = evaluateKnowledgeCompatibilityReadiness();

    const ok =
      matrix.matrixKey === "DOMAIN_LAYER_MATRIX" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.relation === "COMPATIBLE" &&
      declared.policyKeyRef === "DOMAIN_FITNESS_GATE" &&
      binding.status === "BOUND" &&
      binding.constraint === "POLICY_GATE" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertKnowledgeCompatibilityReadinessReady(readiness);
      checks.push(
        check(
          "KNWCMP-STACK",
          "knowledge-compatibility",
          "Matrix / pair / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "KNWCMP-STACK",
          "knowledge-compatibility",
          "Matrix / pair / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product knowledge compatibility not ready",
        ),
      );
    }

    checks.push(
      check(
        "KNWCMP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
        ok && metadata.declarationOnly === true,
        "knowledge-compatibility-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product knowledge compatibility probe failed";
    checks.push(
      check(
        "KNWCMP-STACK",
        "knowledge-compatibility",
        "Matrix / pair / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "KNWCMP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
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
      `product-knowledge-compatibility-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductKnowledgeCompatibilityReleaseGatePass(
  gate: ReleaseGateResult = checkProductKnowledgeCompatibilityReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product knowledge compatibility release gate failed: ${gate.summary}`,
    );
  }
}
