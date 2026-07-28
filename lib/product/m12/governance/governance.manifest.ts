/**
 * Product M12 — Agent Governance manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AGENT_COMPATIBILITY_ID } from "../compatibility-runtime/compatibility.constants";
import {
  clearAgentGovernanceBindings,
  listAgentGovernanceBindings,
} from "./binding.registry";
import {
  PRODUCT_AGENT_GOVERNANCE_BASE,
  PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AGENT_GOVERNANCE_ID,
  PRODUCT_AGENT_GOVERNANCE_VERSION,
} from "./governance.constants";
import { getAgentGovernanceMetadata } from "./governance.metadata";
import type {
  AgentGovernanceManifest,
  AgentGovernanceReadinessCheck,
  AgentGovernanceReadinessResult,
} from "./governance.types";
import {
  clearAgentGovernanceReviews,
  listAgentGovernanceReviews,
} from "./review.registry";
import {
  clearAgentGovernanceStandards,
  listAgentGovernanceStandards,
} from "./standard.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AgentGovernanceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAgentGovernanceLayer(): void {
  clearAgentGovernanceBindings();
  clearAgentGovernanceReviews();
  clearAgentGovernanceStandards();
}

export function buildAgentGovernanceManifest(): AgentGovernanceManifest {
  const standards = listAgentGovernanceStandards();
  const reviews = listAgentGovernanceReviews();
  const bindings = listAgentGovernanceBindings();
  const metadata = getAgentGovernanceMetadata();

  const payload = {
    governanceRuntimeId: PRODUCT_AGENT_GOVERNANCE_ID,
    version: PRODUCT_AGENT_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_AGENT_GOVERNANCE_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    standards: standards.map((s) => ({
      standardKey: s.standardKey,
      kind: s.kind,
      status: s.status,
    })),
    reviews: reviews.map((r) => ({
      reviewKey: r.reviewKey,
      sequence: r.sequence,
      status: r.status,
      approval: r.approval,
      riskLevel: r.riskLevel,
      matrixKeyRef: r.matrixKeyRef,
      standardId: r.standardId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      freezeGateRef: b.freezeGateRef,
      pairKeyRef: b.pairKeyRef,
      status: b.status,
      standardId: b.standardId,
    })),
  };

  return {
    governanceRuntimeId: PRODUCT_AGENT_GOVERNANCE_ID,
    version: PRODUCT_AGENT_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_AGENT_GOVERNANCE_BASE,
    standardCount: standards.length,
    reviewCount: reviews.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAgentGovernanceReadiness(): AgentGovernanceReadinessResult {
  const checks: AgentGovernanceReadinessCheck[] = [];
  const metadata = getAgentGovernanceMetadata();
  const standards = listAgentGovernanceStandards();
  const reviews = listAgentGovernanceReviews();
  const bindings = listAgentGovernanceBindings();
  const manifest = buildAgentGovernanceManifest();

  checks.push(
    check(
      "AGTGOV-BASE",
      "governance",
      "agent compatibility base aligned",
      PRODUCT_AGENT_GOVERNANCE_BASE === PRODUCT_AGENT_COMPATIBILITY_ID &&
        PRODUCT_AGENT_COMPATIBILITY_ID ===
          "enterprise-product-agent-compatibility-v1",
      `base=${PRODUCT_AGENT_GOVERNANCE_BASE}`,
    ),
  );

  checks.push(
    check(
      "AGTGOV-META",
      "metadata",
      "Agent governance metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AGTGOV-STD",
      "standard",
      "Active governance standards present",
      standards.some((s) => s.status === "ACTIVE"),
      `standards=${standards.length}`,
    ),
  );

  checks.push(
    check(
      "AGTGOV-REV",
      "review",
      "Declared governance reviews with soft matrix refs",
      reviews.some(
        (r) => r.status === "DECLARED" && r.matrixKeyRef.length > 0,
      ),
      `reviews=${reviews.length}`,
    ),
  );

  checks.push(
    check(
      "AGTGOV-BIND",
      "binding",
      "Bound governance reviews present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "AGTGOV-MAN",
      "manifest",
      "Agent governance manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.governanceRuntimeId === PRODUCT_AGENT_GOVERNANCE_ID &&
        manifest.standardCount >= 1 &&
        manifest.reviewCount >= 1 &&
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
    summary: `product-agent-governance readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAgentGovernanceReadinessReady(
  result: AgentGovernanceReadinessResult,
): asserts result is AgentGovernanceReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(`product agent governance not ready: ${result.summary}`);
  }
}
