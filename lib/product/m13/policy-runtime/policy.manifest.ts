/**
 * Product M13 — OS Policy Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_OS_DEPENDENCY_ID } from "../dependency-runtime/dependency.constants";
import {
  clearOsPolicyBindings,
  listOsPolicyBindings,
} from "./binding.registry";
import {
  PRODUCT_OS_POLICY_BASE,
  PRODUCT_OS_POLICY_FREEZE_VERSION,
  PRODUCT_OS_POLICY_ID,
  PRODUCT_OS_POLICY_VERSION,
} from "./policy.constants";
import { getOsPolicyMetadata } from "./policy.metadata";
import { clearOsPolicies, listOsPolicies } from "./policy.registry";
import type {
  OsPolicyManifest,
  OsPolicyReadinessCheck,
  OsPolicyReadinessResult,
} from "./policy.types";
import { clearOsPolicyRules, listOsPolicyRules } from "./rule.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): OsPolicyReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearOsPolicyLayer(): void {
  clearOsPolicyBindings();
  clearOsPolicyRules();
  clearOsPolicies();
}

export function buildOsPolicyManifest(): OsPolicyManifest {
  const policies = listOsPolicies();
  const rules = listOsPolicyRules();
  const bindings = listOsPolicyBindings();
  const metadata = getOsPolicyMetadata();

  const payload = {
    policyRuntimeId: PRODUCT_OS_POLICY_ID,
    version: PRODUCT_OS_POLICY_VERSION,
    freezeVersion: PRODUCT_OS_POLICY_FREEZE_VERSION,
    base: PRODUCT_OS_POLICY_BASE,
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
    policyRuntimeId: PRODUCT_OS_POLICY_ID,
    version: PRODUCT_OS_POLICY_VERSION,
    freezeVersion: PRODUCT_OS_POLICY_FREEZE_VERSION,
    base: PRODUCT_OS_POLICY_BASE,
    policyCount: policies.length,
    ruleCount: rules.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateOsPolicyReadiness(): OsPolicyReadinessResult {
  const checks: OsPolicyReadinessCheck[] = [];
  const metadata = getOsPolicyMetadata();
  const policies = listOsPolicies();
  const rules = listOsPolicyRules();
  const bindings = listOsPolicyBindings();
  const manifest = buildOsPolicyManifest();

  checks.push(
    check(
      "OSPOL-BASE",
      "policy",
      "os dependency base aligned",
      PRODUCT_OS_POLICY_BASE === PRODUCT_OS_DEPENDENCY_ID &&
        PRODUCT_OS_DEPENDENCY_ID === "enterprise-product-os-dependency-v1",
      `base=${PRODUCT_OS_POLICY_BASE}`,
    ),
  );

  checks.push(
    check(
      "OSPOL-META",
      "metadata",
      "OS policy metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "OSPOL-POL",
      "policy",
      "Active OS policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "OSPOL-RULE",
      "rule",
      "Declared policy rules with soft graph refs",
      rules.some((r) => r.status === "DECLARED" && r.graphKeyRef.length > 0),
      `rules=${rules.length}`,
    ),
  );

  checks.push(
    check(
      "OSPOL-BIND",
      "binding",
      "Bound policy rules present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "OSPOL-MAN",
      "manifest",
      "OS policy manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.policyRuntimeId === PRODUCT_OS_POLICY_ID &&
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
    summary: `product-os-policy readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertOsPolicyReadinessReady(
  result: OsPolicyReadinessResult,
): asserts result is OsPolicyReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product os policy not ready: ${result.summary}`);
  }
}
