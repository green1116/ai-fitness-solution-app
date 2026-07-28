/**
 * Product M12 — Agent Compatibility Release Gate
 * MODULE: Agent Compatibility (M12-P5)
 * BASE: enterprise-product-agent-policy-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { bindAgentCompatibilityPair } from "../compatibility-runtime/binding.registry";
import {
  AGENT_COMPATIBILITY_BINDING_STATUSES,
  AGENT_COMPATIBILITY_CONSTRAINTS,
  AGENT_COMPATIBILITY_MATRIX_KINDS,
  AGENT_COMPATIBILITY_MATRIX_STATUSES,
  AGENT_COMPATIBILITY_PAIR_STATUSES,
  AGENT_COMPATIBILITY_READINESS_VERDICTS,
  AGENT_COMPATIBILITY_RELATIONS,
  PRODUCT_AGENT_COMPATIBILITY_BASE,
  PRODUCT_AGENT_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_AGENT_COMPATIBILITY_ID,
  PRODUCT_AGENT_COMPATIBILITY_VERSION,
} from "../compatibility-runtime/compatibility.constants";
import {
  assertAgentCompatibilityReadinessReady,
  buildAgentCompatibilityManifest,
  clearAgentCompatibilityLayer,
  evaluateAgentCompatibilityReadiness,
} from "../compatibility-runtime/compatibility.manifest";
import {
  getAgentCompatibilityMetadata,
  isAgentCompatibilityMetadataIntact,
} from "../compatibility-runtime/compatibility.metadata";
import {
  registerAgentCompatibilityMatrix,
  updateAgentCompatibilityMatrixStatus,
} from "../compatibility-runtime/matrix.registry";
import {
  registerAgentCompatibilityPair,
  updateAgentCompatibilityPairStatus,
} from "../compatibility-runtime/pair.registry";
import { PRODUCT_AGENT_POLICY_ID } from "../policy-runtime/policy.constants";

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

export const PRODUCT_AGENT_COMPATIBILITY_SIGNOFF_VERSION =
  "product-agent-compatibility-signoff-1" as const;

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
  clearAgentCompatibilityLayer();
}

export function checkProductAgentCompatibilityReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAgentCompatibilityMetadata();

  checks.push(
    check(
      "AGTCMP-CONSTANTS",
      "compatibility-runtime",
      "Product agent compatibility version constants",
      PRODUCT_AGENT_COMPATIBILITY_ID ===
        "enterprise-product-agent-compatibility-v1" &&
        PRODUCT_AGENT_COMPATIBILITY_VERSION ===
          "product-agent-compatibility-1" &&
        PRODUCT_AGENT_COMPATIBILITY_BASE === PRODUCT_AGENT_POLICY_ID &&
        PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION ===
          "product-agent-compatibility-freeze-1" &&
        PRODUCT_AGENT_COMPATIBILITY_FREEZE_TAG ===
          "product-agent-compatibility-freeze-1" &&
        AGENT_COMPATIBILITY_MATRIX_KINDS.length === 4 &&
        AGENT_COMPATIBILITY_MATRIX_STATUSES.length === 4 &&
        AGENT_COMPATIBILITY_PAIR_STATUSES.length === 4 &&
        AGENT_COMPATIBILITY_RELATIONS.length === 4 &&
        AGENT_COMPATIBILITY_BINDING_STATUSES.length === 3 &&
        AGENT_COMPATIBILITY_CONSTRAINTS.length === 4 &&
        AGENT_COMPATIBILITY_READINESS_VERDICTS.length === 3 &&
        isAgentCompatibilityMetadataIntact(metadata),
      `id=${PRODUCT_AGENT_COMPATIBILITY_ID} base=${PRODUCT_AGENT_COMPATIBILITY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AGTCMP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AGTCMP-UPSTREAM",
      "compatibility",
      "Depends on agent policy chain",
      PRODUCT_AGENT_COMPATIBILITY_BASE ===
        "enterprise-product-agent-policy-v1" &&
        PRODUCT_AGENT_POLICY_ID === "enterprise-product-agent-policy-v1",
      `policy=${PRODUCT_AGENT_POLICY_ID}`,
    ),
  );

  try {
    cleanup();

    const matrix = registerAgentCompatibilityMatrix({
      id: "agtcmp.gate.mat",
      matrixKey: "DOMAIN_LAYER_MATRIX",
      kind: "LAYER",
      title: "Domain layer agent compatibility matrix",
      summary: "Declared matrix for policy-aware version pairing",
    });
    const active = updateAgentCompatibilityMatrixStatus({
      matrixId: matrix.id,
      status: "ACTIVE",
    });
    const pair = registerAgentCompatibilityPair({
      id: "agtcmp.gate.pair",
      matrixId: matrix.id,
      pairKey: "DEP_TO_POLICY",
      sequence: 1,
      relation: "COMPATIBLE",
      upstreamVersionRef: "product-agent-dependency-1",
      downstreamVersionRef: "product-agent-policy-1",
      policyKeyRef: "DOMAIN_FITNESS_GATE",
      summary: "Soft-ref pair linking dependency to policy layer",
    });
    const declared = updateAgentCompatibilityPairStatus({
      pairId: pair.id,
      status: "DECLARED",
    });
    const binding = bindAgentCompatibilityPair({
      id: "agtcmp.gate.bind",
      matrixId: matrix.id,
      pairId: pair.id,
      bindingKey: "PAIR_TO_POLICY_GATE",
      constraint: "POLICY_GATE",
      fallbackVersionRef: "product-agent-dependency-1",
    });
    const manifest = buildAgentCompatibilityManifest();
    const readiness = evaluateAgentCompatibilityReadiness();

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
      assertAgentCompatibilityReadinessReady(readiness);
      checks.push(
        check(
          "AGTCMP-STACK",
          "agent-compatibility",
          "Matrix / pair / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AGTCMP-STACK",
          "agent-compatibility",
          "Matrix / pair / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product agent compatibility not ready",
        ),
      );
    }

    checks.push(
      check(
        "AGTCMP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "agent-compatibility-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product agent compatibility probe failed";
    checks.push(
      check(
        "AGTCMP-STACK",
        "agent-compatibility",
        "Matrix / pair / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AGTCMP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
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
      `product-agent-compatibility-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAgentCompatibilityReleaseGatePass(
  gate: ReleaseGateResult = checkProductAgentCompatibilityReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product agent compatibility release gate failed: ${gate.summary}`,
    );
  }
}
