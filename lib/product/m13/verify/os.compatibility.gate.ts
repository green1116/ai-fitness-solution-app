/**
 * Product M13 — OS Compatibility Release Gate
 * MODULE: OS Compatibility (M13-P5)
 * BASE: enterprise-product-os-policy-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { bindOsCompatibilityPair } from "../compatibility-runtime/binding.registry";
import {
  OS_COMPATIBILITY_BINDING_STATUSES,
  OS_COMPATIBILITY_CONSTRAINTS,
  OS_COMPATIBILITY_MATRIX_KINDS,
  OS_COMPATIBILITY_MATRIX_STATUSES,
  OS_COMPATIBILITY_PAIR_STATUSES,
  OS_COMPATIBILITY_READINESS_VERDICTS,
  OS_COMPATIBILITY_RELATIONS,
  PRODUCT_OS_COMPATIBILITY_BASE,
  PRODUCT_OS_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_OS_COMPATIBILITY_ID,
  PRODUCT_OS_COMPATIBILITY_VERSION,
} from "../compatibility-runtime/compatibility.constants";
import {
  assertOsCompatibilityReadinessReady,
  buildOsCompatibilityManifest,
  clearOsCompatibilityLayer,
  evaluateOsCompatibilityReadiness,
} from "../compatibility-runtime/compatibility.manifest";
import {
  getOsCompatibilityMetadata,
  isOsCompatibilityMetadataIntact,
} from "../compatibility-runtime/compatibility.metadata";
import {
  registerOsCompatibilityMatrix,
  updateOsCompatibilityMatrixStatus,
} from "../compatibility-runtime/matrix.registry";
import {
  registerOsCompatibilityPair,
  updateOsCompatibilityPairStatus,
} from "../compatibility-runtime/pair.registry";
import { PRODUCT_OS_POLICY_ID } from "../policy-runtime/policy.constants";

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

export const PRODUCT_OS_COMPATIBILITY_SIGNOFF_VERSION =
  "product-os-compatibility-signoff-1" as const;

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
  clearOsCompatibilityLayer();
}

export function checkProductOsCompatibilityReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getOsCompatibilityMetadata();

  checks.push(
    check(
      "OSCMP-CONSTANTS",
      "compatibility-runtime",
      "Product OS compatibility version constants",
      PRODUCT_OS_COMPATIBILITY_ID ===
        "enterprise-product-os-compatibility-v1" &&
        PRODUCT_OS_COMPATIBILITY_VERSION === "product-os-compatibility-1" &&
        PRODUCT_OS_COMPATIBILITY_BASE === PRODUCT_OS_POLICY_ID &&
        PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION ===
          "product-os-compatibility-freeze-1" &&
        PRODUCT_OS_COMPATIBILITY_FREEZE_TAG ===
          "product-os-compatibility-freeze-1" &&
        OS_COMPATIBILITY_MATRIX_KINDS.length === 4 &&
        OS_COMPATIBILITY_MATRIX_STATUSES.length === 4 &&
        OS_COMPATIBILITY_PAIR_STATUSES.length === 4 &&
        OS_COMPATIBILITY_RELATIONS.length === 4 &&
        OS_COMPATIBILITY_BINDING_STATUSES.length === 3 &&
        OS_COMPATIBILITY_CONSTRAINTS.length === 4 &&
        OS_COMPATIBILITY_READINESS_VERDICTS.length === 3 &&
        isOsCompatibilityMetadataIntact(metadata),
      `id=${PRODUCT_OS_COMPATIBILITY_ID} base=${PRODUCT_OS_COMPATIBILITY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OSCMP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OSCMP-UPSTREAM",
      "compatibility",
      "Depends on OS policy chain",
      PRODUCT_OS_COMPATIBILITY_BASE === "enterprise-product-os-policy-v1" &&
        PRODUCT_OS_POLICY_ID === "enterprise-product-os-policy-v1",
      `policy=${PRODUCT_OS_POLICY_ID}`,
    ),
  );

  try {
    cleanup();

    const matrix = registerOsCompatibilityMatrix({
      id: "oscmp.gate.mat",
      matrixKey: "DOMAIN_LAYER_MATRIX",
      kind: "LAYER",
      title: "Domain layer OS compatibility matrix",
      summary: "Declared matrix for policy-aware version pairing",
    });
    const active = updateOsCompatibilityMatrixStatus({
      matrixId: matrix.id,
      status: "ACTIVE",
    });
    const pair = registerOsCompatibilityPair({
      id: "oscmp.gate.pair",
      matrixId: matrix.id,
      pairKey: "DEP_TO_POLICY",
      sequence: 1,
      relation: "COMPATIBLE",
      upstreamVersionRef: "product-os-dependency-1",
      downstreamVersionRef: "product-os-policy-1",
      policyKeyRef: "DOMAIN_CONTROL_GATE",
      summary: "Soft-ref pair linking dependency to policy layer",
    });
    const declared = updateOsCompatibilityPairStatus({
      pairId: pair.id,
      status: "DECLARED",
    });
    const binding = bindOsCompatibilityPair({
      id: "oscmp.gate.bind",
      matrixId: matrix.id,
      pairId: pair.id,
      bindingKey: "PAIR_TO_POLICY_GATE",
      constraint: "POLICY_GATE",
      fallbackVersionRef: "product-os-dependency-1",
    });
    const manifest = buildOsCompatibilityManifest();
    const readiness = evaluateOsCompatibilityReadiness();

    const ok =
      matrix.matrixKey === "DOMAIN_LAYER_MATRIX" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.relation === "COMPATIBLE" &&
      declared.policyKeyRef === "DOMAIN_CONTROL_GATE" &&
      binding.status === "BOUND" &&
      binding.constraint === "POLICY_GATE" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertOsCompatibilityReadinessReady(readiness);
      checks.push(
        check(
          "OSCMP-STACK",
          "os-compatibility",
          "Matrix / pair / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OSCMP-STACK",
          "os-compatibility",
          "Matrix / pair / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product os compatibility not ready",
        ),
      );
    }

    checks.push(
      check(
        "OSCMP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "os-compatibility-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product os compatibility probe failed";
    checks.push(
      check(
        "OSCMP-STACK",
        "os-compatibility",
        "Matrix / pair / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "OSCMP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
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
      `product-os-compatibility-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductOsCompatibilityReleaseGatePass(
  gate: ReleaseGateResult = checkProductOsCompatibilityReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product OS compatibility release gate failed: ${gate.summary}`,
    );
  }
}
