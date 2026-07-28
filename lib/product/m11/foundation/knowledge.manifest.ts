/**
 * Product M11 — Knowledge Platform Foundation manifest builder
 */

import { createHash } from "node:crypto";

import { ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID } from "../../m10/baseline/freeze/freeze.lock";
import {
  clearKnowledgeGovernancePolicies,
  listKnowledgeGovernancePolicies,
} from "./governance.policy";
import {
  PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
  PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_FOUNDATION_ID,
  PRODUCT_KNOWLEDGE_FOUNDATION_VERSION,
} from "./knowledge.constants";
import {
  getKnowledgeFoundationMetadata,
  validateKnowledgeEntity,
} from "./knowledge.metadata";
import {
  clearKnowledgeEntities,
  listKnowledgeEntities,
} from "./knowledge.registry";
import type {
  KnowledgeFoundationManifest,
  KnowledgeReadinessCheck,
  KnowledgeReadinessResult,
} from "./knowledge.types";
import {
  clearKnowledgeRetrievalContracts,
  listKnowledgeRetrievalContracts,
} from "./retrieval.contract";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): KnowledgeReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearKnowledgeFoundationLayer(): void {
  clearKnowledgeRetrievalContracts();
  clearKnowledgeGovernancePolicies();
  clearKnowledgeEntities();
}

export function buildKnowledgeFoundationManifest(): KnowledgeFoundationManifest {
  const entities = listKnowledgeEntities();
  const policies = listKnowledgeGovernancePolicies();
  const contracts = listKnowledgeRetrievalContracts();
  const metadata = getKnowledgeFoundationMetadata();
  const active = entities.filter((e) => e.status === "ACTIVE");

  const payload = {
    foundationId: PRODUCT_KNOWLEDGE_FOUNDATION_ID,
    version: PRODUCT_KNOWLEDGE_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    entities: entities.map((e) => ({
      entityKey: e.entityKey,
      kind: e.kind,
      status: e.status,
      access: e.access,
      scope: e.scope,
      runtimeBaselineRef: e.runtimeBaselineRef,
    })),
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      entityKeyRef: p.entityKeyRef,
    })),
    contracts: contracts.map((c) => ({
      contractKey: c.contractKey,
      mode: c.query.mode,
      hitCount: c.hitCount,
    })),
  };

  return {
    foundationId: PRODUCT_KNOWLEDGE_FOUNDATION_ID,
    version: PRODUCT_KNOWLEDGE_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
    entityCount: entities.length,
    activeCount: active.length,
    policyCount: policies.length,
    contractCount: contracts.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateKnowledgeFoundationReadiness(): KnowledgeReadinessResult {
  const checks: KnowledgeReadinessCheck[] = [];
  const metadata = getKnowledgeFoundationMetadata();
  const entities = listKnowledgeEntities();
  const policies = listKnowledgeGovernancePolicies();
  const contracts = listKnowledgeRetrievalContracts();
  const manifest = buildKnowledgeFoundationManifest();
  const entitiesValid = entities.every((e) => validateKnowledgeEntity(e).ok);

  checks.push(
    check(
      "KNW-BASE",
      "foundation",
      "ai runtime baseline aligned",
      PRODUCT_KNOWLEDGE_FOUNDATION_BASE ===
        ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID &&
        ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID ===
          "enterprise-product-ai-runtime-baseline-v1",
      `base=${PRODUCT_KNOWLEDGE_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "KNW-META",
      "metadata",
      "Knowledge foundation metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "KNW-ENT",
      "entity",
      "Active knowledge entities present and valid",
      entities.some((e) => e.status === "ACTIVE") && entitiesValid,
      `entities=${entities.length}`,
    ),
  );

  checks.push(
    check(
      "KNW-GOV",
      "governance",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "KNW-RET",
      "retrieval",
      "Retrieval contracts with hits present",
      contracts.some((c) => c.hitCount >= 1),
      `contracts=${contracts.length}`,
    ),
  );

  checks.push(
    check(
      "KNW-MAN",
      "manifest",
      "Knowledge foundation manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.foundationId === PRODUCT_KNOWLEDGE_FOUNDATION_ID &&
        manifest.activeCount >= 1 &&
        manifest.policyCount >= 1 &&
        manifest.contractCount >= 1,
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
    summary: `product-knowledge-foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertKnowledgeFoundationReadinessReady(
  result: KnowledgeReadinessResult,
): asserts result is KnowledgeReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product knowledge foundation not ready: ${result.summary}`,
    );
  }
}
