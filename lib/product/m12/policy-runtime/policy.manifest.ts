/**
 * Product M12 — Agent Policy Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AGENT_DEPENDENCY_ID } from "../dependency-runtime/dependency.constants";
import {
  clearAgentPolicyBindings,
  listAgentPolicyBindings,
} from "./binding.registry";
import {
  PRODUCT_AGENT_POLICY_BASE,
  PRODUCT_AGENT_POLICY_FREEZE_VERSION,
  PRODUCT_AGENT_POLICY_ID,
  PRODUCT_AGENT_POLICY_VERSION,
} from "./policy.constants";
import { getAgentPolicyMetadata } from "./policy.metadata";
import {
  clearAgentPolicies,
  listAgentPolicies,
} from "./policy.registry";
import type {
  AgentPolicyManifest,
  AgentPolicyReadinessCheck,
  AgentPolicyReadinessResult,
} from "./policy.types";
import {
  clearAgentPolicyRules,
  listAgentPolicyRules,
} from "./rule.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AgentPolicyReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAgentPolicyLayer(): void {
  clearAgentPolicyBindings();
  clearAgentPolicyRules();
  clearAgentPolicies();
}

export function buildAgentPolicyManifest(): AgentPolicyManifest {
  const policies = listAgentPolicies();
  const rules = listAgentPolicyRules();
  const bindings = listAgentPolicyBindings();
  const metadata = getAgentPolicyMetadata();

  const payload = {
    policyRuntimeId: PRODUCT_AGENT_POLICY_ID,
    version: PRODUCT_AGENT_POLICY_VERSION,
    freezeVersion: PRODUCT_AGENT_POLICY_FREEZE_VERSION,
    base: PRODUCT_AGENT_POLICY_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
    })),
    rules: rules.map((r) => ({
      ruleKey: r.ruleKey,
      sequence: r.sequence,
      status: r.status,
      constraint: r.constraint,
      enforcement: r.enforcement,
      graphKeyRef: r.graphKeyRef,
      policyId: r.policyId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      edgeKeyRef: b.edgeKeyRef,
      status: b.status,
      policyId: b.policyId,
    })),
  };

  return {
    policyRuntimeId: PRODUCT_AGENT_POLICY_ID,
    version: PRODUCT_AGENT_POLICY_VERSION,
    freezeVersion: PRODUCT_AGENT_POLICY_FREEZE_VERSION,
    base: PRODUCT_AGENT_POLICY_BASE,
    policyCount: policies.length,
    ruleCount: rules.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAgentPolicyReadiness(): AgentPolicyReadinessResult {
  const checks: AgentPolicyReadinessCheck[] = [];
  const metadata = getAgentPolicyMetadata();
  const policies = listAgentPolicies();
  const rules = listAgentPolicyRules();
  const bindings = listAgentPolicyBindings();
  const manifest = buildAgentPolicyManifest();

  checks.push(
    check(
      "AGTPOL-BASE",
      "policy",
      "agent dependency base aligned",
      PRODUCT_AGENT_POLICY_BASE === PRODUCT_AGENT_DEPENDENCY_ID &&
        PRODUCT_AGENT_DEPENDENCY_ID ===
          "enterprise-product-agent-dependency-v1",
      `base=${PRODUCT_AGENT_POLICY_BASE}`,
    ),
  );

  checks.push(
    check(
      "AGTPOL-META",
      "metadata",
      "Agent policy metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AGTPOL-POL",
      "policy",
      "Active agent policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "AGTPOL-RULE",
      "rule",
      "Declared policy rules with soft graph refs",
      rules.some(
        (r) => r.status === "DECLARED" && r.graphKeyRef.length > 0,
      ),
      `rules=${rules.length}`,
    ),
  );

  checks.push(
    check(
      "AGTPOL-BIND",
      "binding",
      "Bound policy rules present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "AGTPOL-MAN",
      "manifest",
      "Agent policy manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.policyRuntimeId === PRODUCT_AGENT_POLICY_ID &&
        manifest.policyCount >= 1 &&
        manifest.ruleCount >= 1 &&
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
    summary: `product-agent-policy readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAgentPolicyReadinessReady(
  result: AgentPolicyReadinessResult,
): asserts result is AgentPolicyReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product agent policy not ready: ${result.summary}`);
  }
}
