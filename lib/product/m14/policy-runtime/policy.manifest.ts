/**
 * Product M14 — Intelligence Policy Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_INTELLIGENCE_DEPENDENCY_ID } from "../dependency-runtime/dependency.constants";
import {
  clearIntelligencePolicyBindings,
  listIntelligencePolicyBindings,
} from "./binding.registry";
import {
  PRODUCT_INTELLIGENCE_POLICY_BASE,
  PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_POLICY_ID,
  PRODUCT_INTELLIGENCE_POLICY_VERSION,
} from "./policy.constants";
import { getIntelligencePolicyMetadata } from "./policy.metadata";
import {
  clearIntelligencePolicies,
  listIntelligencePolicies,
} from "./policy.registry";
import type {
  IntelligencePolicyManifest,
  IntelligencePolicyReadinessCheck,
  IntelligencePolicyReadinessResult,
} from "./policy.types";
import {
  clearIntelligencePolicyRules,
  listIntelligencePolicyRules,
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
): IntelligencePolicyReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearIntelligencePolicyLayer(): void {
  clearIntelligencePolicyBindings();
  clearIntelligencePolicyRules();
  clearIntelligencePolicies();
}

export function buildIntelligencePolicyManifest(): IntelligencePolicyManifest {
  const policies = listIntelligencePolicies();
  const rules = listIntelligencePolicyRules();
  const bindings = listIntelligencePolicyBindings();
  const metadata = getIntelligencePolicyMetadata();

  const payload = {
    policyRuntimeId: PRODUCT_INTELLIGENCE_POLICY_ID,
    version: PRODUCT_INTELLIGENCE_POLICY_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_POLICY_BASE,
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
    policyRuntimeId: PRODUCT_INTELLIGENCE_POLICY_ID,
    version: PRODUCT_INTELLIGENCE_POLICY_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_POLICY_BASE,
    policyCount: policies.length,
    ruleCount: rules.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateIntelligencePolicyReadiness(): IntelligencePolicyReadinessResult {
  const checks: IntelligencePolicyReadinessCheck[] = [];
  const metadata = getIntelligencePolicyMetadata();
  const policies = listIntelligencePolicies();
  const rules = listIntelligencePolicyRules();
  const bindings = listIntelligencePolicyBindings();
  const manifest = buildIntelligencePolicyManifest();

  checks.push(
    check(
      "INTPOL-BASE",
      "policy-runtime",
      "intelligence dependency base aligned",
      PRODUCT_INTELLIGENCE_POLICY_BASE === PRODUCT_INTELLIGENCE_DEPENDENCY_ID &&
        PRODUCT_INTELLIGENCE_DEPENDENCY_ID ===
          "enterprise-product-intelligence-dependency-v1",
      `base=${PRODUCT_INTELLIGENCE_POLICY_BASE}`,
    ),
  );

  checks.push(
    check(
      "INTPOL-META",
      "metadata",
      "Intelligence policy metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "INTPOL-POL",
      "policy",
      "Active intelligence policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "INTPOL-RULE",
      "rule",
      "Declared policy rules with soft graph refs",
      rules.some((r) => r.status === "DECLARED" && r.graphKeyRef.length > 0),
      `rules=${rules.length}`,
    ),
  );

  checks.push(
    check(
      "INTPOL-BIND",
      "binding",
      "Bound policy rules present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "INTPOL-MAN",
      "manifest",
      "Intelligence policy manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.policyRuntimeId === PRODUCT_INTELLIGENCE_POLICY_ID &&
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
    summary: `product-intelligence-policy readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertIntelligencePolicyReadinessReady(
  result: IntelligencePolicyReadinessResult,
): asserts result is IntelligencePolicyReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product intelligence policy not ready: ${result.summary}`);
  }
}
