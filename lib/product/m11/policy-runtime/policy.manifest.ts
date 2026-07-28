/**
 * Product M11 — Knowledge Policy Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_KNOWLEDGE_DEPENDENCY_ID } from "../dependency-runtime/dependency.constants";
import {
  clearKnowledgePolicyBindings,
  listKnowledgePolicyBindings,
} from "./binding.registry";
import {
  PRODUCT_KNOWLEDGE_POLICY_BASE,
  PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_POLICY_ID,
  PRODUCT_KNOWLEDGE_POLICY_VERSION,
} from "./policy.constants";
import { getKnowledgePolicyMetadata } from "./policy.metadata";
import {
  clearKnowledgePolicies,
  listKnowledgePolicies,
} from "./policy.registry";
import type {
  KnowledgePolicyManifest,
  KnowledgePolicyReadinessCheck,
  KnowledgePolicyReadinessResult,
} from "./policy.types";
import {
  clearKnowledgePolicyRules,
  listKnowledgePolicyRules,
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
): KnowledgePolicyReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearKnowledgePolicyLayer(): void {
  clearKnowledgePolicyBindings();
  clearKnowledgePolicyRules();
  clearKnowledgePolicies();
}

export function buildKnowledgePolicyManifest(): KnowledgePolicyManifest {
  const policies = listKnowledgePolicies();
  const rules = listKnowledgePolicyRules();
  const bindings = listKnowledgePolicyBindings();
  const metadata = getKnowledgePolicyMetadata();

  const payload = {
    policyRuntimeId: PRODUCT_KNOWLEDGE_POLICY_ID,
    version: PRODUCT_KNOWLEDGE_POLICY_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_POLICY_BASE,
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
    policyRuntimeId: PRODUCT_KNOWLEDGE_POLICY_ID,
    version: PRODUCT_KNOWLEDGE_POLICY_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_POLICY_BASE,
    policyCount: policies.length,
    ruleCount: rules.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateKnowledgePolicyReadiness(): KnowledgePolicyReadinessResult {
  const checks: KnowledgePolicyReadinessCheck[] = [];
  const metadata = getKnowledgePolicyMetadata();
  const policies = listKnowledgePolicies();
  const rules = listKnowledgePolicyRules();
  const bindings = listKnowledgePolicyBindings();
  const manifest = buildKnowledgePolicyManifest();

  checks.push(
    check(
      "KNWPOL-BASE",
      "policy",
      "knowledge dependency base aligned",
      PRODUCT_KNOWLEDGE_POLICY_BASE === PRODUCT_KNOWLEDGE_DEPENDENCY_ID &&
        PRODUCT_KNOWLEDGE_DEPENDENCY_ID ===
          "enterprise-product-knowledge-dependency-v1",
      `base=${PRODUCT_KNOWLEDGE_POLICY_BASE}`,
    ),
  );

  checks.push(
    check(
      "KNWPOL-META",
      "metadata",
      "Knowledge policy metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "KNWPOL-POL",
      "policy",
      "Active knowledge policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "KNWPOL-RULE",
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
      "KNWPOL-BIND",
      "binding",
      "Bound policy rules present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "KNWPOL-MAN",
      "manifest",
      "Knowledge policy manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.policyRuntimeId === PRODUCT_KNOWLEDGE_POLICY_ID &&
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
    summary: `product-knowledge-policy readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertKnowledgePolicyReadinessReady(
  result: KnowledgePolicyReadinessResult,
): asserts result is KnowledgePolicyReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product knowledge policy not ready: ${result.summary}`);
  }
}
