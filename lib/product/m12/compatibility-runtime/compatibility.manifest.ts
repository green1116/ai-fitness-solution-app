/**
 * Product M12 — Agent Compatibility Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AGENT_POLICY_ID } from "../policy-runtime/policy.constants";
import {
  clearAgentCompatibilityBindings,
  listAgentCompatibilityBindings,
} from "./binding.registry";
import {
  PRODUCT_AGENT_COMPATIBILITY_BASE,
  PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_AGENT_COMPATIBILITY_ID,
  PRODUCT_AGENT_COMPATIBILITY_VERSION,
} from "./compatibility.constants";
import { getAgentCompatibilityMetadata } from "./compatibility.metadata";
import type {
  AgentCompatibilityManifest,
  AgentCompatibilityReadinessCheck,
  AgentCompatibilityReadinessResult,
} from "./compatibility.types";
import {
  clearAgentCompatibilityMatrices,
  listAgentCompatibilityMatrices,
} from "./matrix.registry";
import {
  clearAgentCompatibilityPairs,
  listAgentCompatibilityPairs,
} from "./pair.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AgentCompatibilityReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAgentCompatibilityLayer(): void {
  clearAgentCompatibilityBindings();
  clearAgentCompatibilityPairs();
  clearAgentCompatibilityMatrices();
}

export function buildAgentCompatibilityManifest(): AgentCompatibilityManifest {
  const matrices = listAgentCompatibilityMatrices();
  const pairs = listAgentCompatibilityPairs();
  const bindings = listAgentCompatibilityBindings();
  const metadata = getAgentCompatibilityMetadata();

  const payload = {
    compatibilityRuntimeId: PRODUCT_AGENT_COMPATIBILITY_ID,
    version: PRODUCT_AGENT_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION,
    base: PRODUCT_AGENT_COMPATIBILITY_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    matrices: matrices.map((m) => ({
      matrixKey: m.matrixKey,
      kind: m.kind,
      status: m.status,
    })),
    pairs: pairs.map((p) => ({
      pairKey: p.pairKey,
      sequence: p.sequence,
      status: p.status,
      relation: p.relation,
      policyKeyRef: p.policyKeyRef,
      upstreamVersionRef: p.upstreamVersionRef,
      downstreamVersionRef: p.downstreamVersionRef,
      matrixId: p.matrixId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      constraint: b.constraint,
      fallbackVersionRef: b.fallbackVersionRef,
      status: b.status,
      matrixId: b.matrixId,
    })),
  };

  return {
    compatibilityRuntimeId: PRODUCT_AGENT_COMPATIBILITY_ID,
    version: PRODUCT_AGENT_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION,
    base: PRODUCT_AGENT_COMPATIBILITY_BASE,
    matrixCount: matrices.length,
    pairCount: pairs.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAgentCompatibilityReadiness(): AgentCompatibilityReadinessResult {
  const checks: AgentCompatibilityReadinessCheck[] = [];
  const metadata = getAgentCompatibilityMetadata();
  const matrices = listAgentCompatibilityMatrices();
  const pairs = listAgentCompatibilityPairs();
  const bindings = listAgentCompatibilityBindings();
  const manifest = buildAgentCompatibilityManifest();

  checks.push(
    check(
      "AGTCMP-BASE",
      "compatibility",
      "agent policy base aligned",
      PRODUCT_AGENT_COMPATIBILITY_BASE === PRODUCT_AGENT_POLICY_ID &&
        PRODUCT_AGENT_POLICY_ID === "enterprise-product-agent-policy-v1",
      `base=${PRODUCT_AGENT_COMPATIBILITY_BASE}`,
    ),
  );

  checks.push(
    check(
      "AGTCMP-META",
      "metadata",
      "Agent compatibility metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AGTCMP-MAT",
      "matrix",
      "Active compatibility matrices present",
      matrices.some((m) => m.status === "ACTIVE"),
      `matrices=${matrices.length}`,
    ),
  );

  checks.push(
    check(
      "AGTCMP-PAIR",
      "pair",
      "Declared version pairs with soft policy refs",
      pairs.some(
        (p) => p.status === "DECLARED" && p.policyKeyRef.length > 0,
      ),
      `pairs=${pairs.length}`,
    ),
  );

  checks.push(
    check(
      "AGTCMP-BIND",
      "binding",
      "Bound compatibility pairs present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "AGTCMP-MAN",
      "manifest",
      "Agent compatibility manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.compatibilityRuntimeId === PRODUCT_AGENT_COMPATIBILITY_ID &&
        manifest.matrixCount >= 1 &&
        manifest.pairCount >= 1 &&
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
    summary: `product-agent-compatibility readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAgentCompatibilityReadinessReady(
  result: AgentCompatibilityReadinessResult,
): asserts result is AgentCompatibilityReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product agent compatibility not ready: ${result.summary}`,
    );
  }
}
