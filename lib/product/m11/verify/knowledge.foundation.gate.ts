/**
 * Product M11 — Knowledge Platform Foundation Release Gate
 * MODULE: Knowledge Platform Foundation (M11-P1)
 * BASE: enterprise-product-ai-runtime-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID } from "../../m10/baseline/freeze/freeze.lock";
import { registerKnowledgeGovernancePolicy } from "../foundation/governance.policy";
import {
  KNOWLEDGE_ACCESS_LEVELS,
  KNOWLEDGE_DOMAIN_SCOPES,
  KNOWLEDGE_ENTITY_KINDS,
  KNOWLEDGE_ENTITY_STATUSES,
  KNOWLEDGE_GOVERNANCE_POLICY_KINDS,
  KNOWLEDGE_GOVERNANCE_POLICY_STATUSES,
  KNOWLEDGE_READINESS_VERDICTS,
  KNOWLEDGE_RETRIEVAL_MODES,
  PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
  PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_FOUNDATION_ID,
  PRODUCT_KNOWLEDGE_FOUNDATION_VERSION,
  PRODUCT_KNOWLEDGE_FREEZE_TAG,
} from "../foundation/knowledge.constants";
import {
  assertKnowledgeFoundationReadinessReady,
  buildKnowledgeFoundationManifest,
  clearKnowledgeFoundationLayer,
  evaluateKnowledgeFoundationReadiness,
} from "../foundation/knowledge.manifest";
import {
  getKnowledgeFoundationMetadata,
  isKnowledgeFoundationMetadataIntact,
  validateKnowledgeEntity,
} from "../foundation/knowledge.metadata";
import {
  registerKnowledgeEntity,
  updateKnowledgeEntityStatus,
} from "../foundation/knowledge.registry";
import { evaluateKnowledgeRetrievalContract } from "../foundation/retrieval.contract";

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

export const PRODUCT_KNOWLEDGE_FOUNDATION_SIGNOFF_VERSION =
  "product-knowledge-foundation-signoff-1" as const;

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
  clearKnowledgeFoundationLayer();
}

export function checkProductKnowledgeFoundationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getKnowledgeFoundationMetadata();

  checks.push(
    check(
      "KNW-CONSTANTS",
      "foundation",
      "Product knowledge foundation version constants",
      PRODUCT_KNOWLEDGE_FOUNDATION_ID ===
        "enterprise-product-knowledge-foundation-v1" &&
        PRODUCT_KNOWLEDGE_FOUNDATION_VERSION === "product-knowledge-1" &&
        PRODUCT_KNOWLEDGE_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID &&
        PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION ===
          "product-knowledge-foundation-freeze-1" &&
        PRODUCT_KNOWLEDGE_FREEZE_TAG ===
          "product-knowledge-foundation-freeze-1" &&
        KNOWLEDGE_ENTITY_KINDS.length === 6 &&
        KNOWLEDGE_ENTITY_STATUSES.length === 4 &&
        KNOWLEDGE_ACCESS_LEVELS.length === 4 &&
        KNOWLEDGE_DOMAIN_SCOPES.length === 4 &&
        KNOWLEDGE_RETRIEVAL_MODES.length === 3 &&
        KNOWLEDGE_GOVERNANCE_POLICY_KINDS.length === 4 &&
        KNOWLEDGE_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        KNOWLEDGE_READINESS_VERDICTS.length === 3 &&
        isKnowledgeFoundationMetadataIntact(metadata),
      `id=${PRODUCT_KNOWLEDGE_FOUNDATION_ID} base=${PRODUCT_KNOWLEDGE_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "KNW-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "KNW-UPSTREAM",
      "compatibility",
      "Depends on AI runtime baseline",
      PRODUCT_KNOWLEDGE_FOUNDATION_BASE ===
        "enterprise-product-ai-runtime-baseline-v1" &&
        ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID ===
          "enterprise-product-ai-runtime-baseline-v1",
      `runtimeBaseline=${ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID}`,
    ),
  );

  try {
    cleanup();

    const entity = registerKnowledgeEntity({
      id: "knw.gate.ent",
      entityKey: "DOMAIN_FITNESS_POLICY",
      kind: "POLICY",
      access: "INTERNAL",
      scope: "DOMAIN",
      title: "Domain fitness policy knowledge",
      summary: "Declared policy knowledge for domain reuse",
      tags: ["fitness", "policy"],
      runtimeBaselineRef: ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
    });
    const active = updateKnowledgeEntityStatus({
      entityId: entity.id,
      status: "ACTIVE",
    });
    const validation = validateKnowledgeEntity(active);
    const policy = registerKnowledgeGovernancePolicy({
      id: "knw.gate.gov",
      policyKey: "DOMAIN_POLICY_ACCESS",
      kind: "ACCESS_CONTROL",
      title: "Domain policy access control",
      entityKeyRef: entity.entityKey,
      ruleRef: "KNW_RULE_INTERNAL_ONLY",
    });
    const contract = evaluateKnowledgeRetrievalContract({
      id: "knw.gate.ret",
      contractKey: "DOMAIN_POLICY_LOOKUP",
      query: {
        queryKey: "FITNESS_POLICY_Q",
        mode: "TAG",
        terms: ["fitness"],
        tags: ["policy"],
        kind: "POLICY",
      },
    });
    const manifest = buildKnowledgeFoundationManifest();
    const readiness = evaluateKnowledgeFoundationReadiness();

    const ok =
      entity.entityKey === "DOMAIN_FITNESS_POLICY" &&
      active.status === "ACTIVE" &&
      validation.ok === true &&
      policy.status === "ACTIVE" &&
      policy.entityKeyRef === "DOMAIN_FITNESS_POLICY" &&
      contract.hitCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertKnowledgeFoundationReadinessReady(readiness);
      checks.push(
        check(
          "KNW-STACK",
          "knowledge-foundation",
          "Entity / validator / governance / retrieval / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "KNW-STACK",
          "knowledge-foundation",
          "Entity / validator / governance / retrieval / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product knowledge foundation not ready",
        ),
      );
    }

    checks.push(
      check(
        "KNW-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / external provider / model execution",
        ok && metadata.declarationOnly === true,
        "knowledge-foundation-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product knowledge foundation probe failed";
    checks.push(
      check(
        "KNW-STACK",
        "knowledge-foundation",
        "Entity / validator / governance / retrieval / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "KNW-SCOPE",
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
      `product-knowledge-foundation-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductKnowledgeFoundationReleaseGatePass(
  gate: ReleaseGateResult = checkProductKnowledgeFoundationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product knowledge foundation release gate failed: ${gate.summary}`,
    );
  }
}
