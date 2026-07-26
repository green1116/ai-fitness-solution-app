/**
 * Product M10 — AI Runtime Audit Release Gate
 * MODULE: Runtime Audit (M10-P7)
 * BASE: enterprise-product-ai-runtime-governance-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  AI_RUNTIME_AUDIT_EVENT_KINDS,
  AI_RUNTIME_AUDIT_INTEGRITY_RESULTS,
  AI_RUNTIME_AUDIT_READINESS_VERDICTS,
  AI_RUNTIME_AUDIT_SEVERITIES,
  AI_RUNTIME_AUDIT_TRAIL_STATUSES,
  PRODUCT_AI_RUNTIME_AUDIT_BASE,
  PRODUCT_AI_RUNTIME_AUDIT_FREEZE_TAG,
  PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_AUDIT_ID,
  PRODUCT_AI_RUNTIME_AUDIT_VERSION,
} from "../runtime-audit/audit.constants";
import {
  assertAiRuntimeAuditReadinessReady,
  buildAiRuntimeAuditManifest,
  clearAiRuntimeAuditLayer,
  evaluateAiRuntimeAuditReadiness,
} from "../runtime-audit/audit.manifest";
import {
  getAiRuntimeAuditMetadata,
  isAiRuntimeAuditMetadataIntact,
} from "../runtime-audit/audit.metadata";
import { recordAiRuntimeAuditEvent } from "../runtime-audit/event.registry";
import {
  sealAiRuntimeAuditTrail,
  verifyAiRuntimeAuditSeal,
} from "../runtime-audit/integrity.registry";
import { queryAiRuntimeAuditTrail } from "../runtime-audit/query.registry";
import {
  appendAiRuntimeAuditTrail,
  getAiRuntimeAuditTrail,
} from "../runtime-audit/trail.registry";
import { PRODUCT_AI_RUNTIME_GOVERNANCE_ID } from "../runtime-governance/governance.constants";

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

export const PRODUCT_AI_RUNTIME_AUDIT_SIGNOFF_VERSION =
  "product-ai-runtime-audit-signoff-1" as const;

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
  clearAiRuntimeAuditLayer();
}

export function checkProductAiRuntimeAuditReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiRuntimeAuditMetadata();

  checks.push(
    check(
      "AIRTA-CONSTANTS",
      "runtime-audit",
      "Product AI runtime audit version constants",
      PRODUCT_AI_RUNTIME_AUDIT_ID ===
        "enterprise-product-ai-runtime-audit-v1" &&
        PRODUCT_AI_RUNTIME_AUDIT_VERSION === "product-ai-runtime-audit-1" &&
        PRODUCT_AI_RUNTIME_AUDIT_BASE === PRODUCT_AI_RUNTIME_GOVERNANCE_ID &&
        PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION ===
          "product-ai-runtime-audit-freeze-1" &&
        PRODUCT_AI_RUNTIME_AUDIT_FREEZE_TAG ===
          "product-ai-runtime-audit-freeze-1" &&
        AI_RUNTIME_AUDIT_EVENT_KINDS.length === 4 &&
        AI_RUNTIME_AUDIT_SEVERITIES.length === 3 &&
        AI_RUNTIME_AUDIT_TRAIL_STATUSES.length === 3 &&
        AI_RUNTIME_AUDIT_INTEGRITY_RESULTS.length === 2 &&
        AI_RUNTIME_AUDIT_READINESS_VERDICTS.length === 3 &&
        isAiRuntimeAuditMetadataIntact(metadata),
      `id=${PRODUCT_AI_RUNTIME_AUDIT_ID} base=${PRODUCT_AI_RUNTIME_AUDIT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AIRTA-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AIRTA-UPSTREAM",
      "compatibility",
      "Depends on AI runtime governance chain",
      PRODUCT_AI_RUNTIME_AUDIT_BASE ===
        "enterprise-product-ai-runtime-governance-v1" &&
        PRODUCT_AI_RUNTIME_GOVERNANCE_ID ===
          "enterprise-product-ai-runtime-governance-v1",
      `governance=${PRODUCT_AI_RUNTIME_GOVERNANCE_ID}`,
    ),
  );

  try {
    cleanup();

    const event = recordAiRuntimeAuditEvent({
      id: "airta.gate.evt",
      eventKey: "RESOURCE_LIMIT_AUDIT",
      kind: "RESOURCE_LIMIT",
      severity: "INFO",
      policyKeyRef: "RESOURCE_LIMIT_GOV",
      subjectRef: "DOMAIN_CONCURRENCY",
    });
    const trail = appendAiRuntimeAuditTrail({
      id: "airta.gate.trl",
      eventId: event.id,
    });
    const seal = sealAiRuntimeAuditTrail({
      id: "airta.gate.sel",
      trailId: trail.id,
    });
    const sealedTrail = getAiRuntimeAuditTrail(trail.id);
    const verified = verifyAiRuntimeAuditSeal({ sealId: seal.id });
    const query = queryAiRuntimeAuditTrail({
      id: "airta.gate.qry",
      queryKey: "RESOURCE_LIMIT_AUDIT_Q",
      kind: "RESOURCE_LIMIT",
      policyKeyRef: "RESOURCE_LIMIT_GOV",
    });
    const manifest = buildAiRuntimeAuditManifest();
    const readiness = evaluateAiRuntimeAuditReadiness();

    const ok =
      event.eventKey === "RESOURCE_LIMIT_AUDIT" &&
      event.kind === "RESOURCE_LIMIT" &&
      event.policyKeyRef === "RESOURCE_LIMIT_GOV" &&
      sealedTrail?.status === "SEALED" &&
      seal.result === "INTACT" &&
      verified.result === "INTACT" &&
      query.matchCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiRuntimeAuditReadinessReady(readiness);
      checks.push(
        check(
          "AIRTA-STACK",
          "runtime-audit",
          "Event / trail / seal / query / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AIRTA-STACK",
          "runtime-audit",
          "Event / trail / seal / query / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai runtime audit not ready",
        ),
      );
    }

    checks.push(
      check(
        "AIRTA-SCOPE",
        "scope",
        "No allocation / token / autoscaling / provider / model / queue / scheduler / monitoring",
        ok && metadata.declarationOnly === true,
        "ai-runtime-audit-definition-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai runtime audit probe failed";
    checks.push(
      check(
        "AIRTA-STACK",
        "runtime-audit",
        "Event / trail / seal / query / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AIRTA-SCOPE",
        "scope",
        "No allocation / token / autoscaling / provider / model / queue / scheduler / monitoring",
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
      `product-ai-runtime-audit-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiRuntimeAuditReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiRuntimeAuditReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI runtime audit release gate failed: ${gate.summary}`,
    );
  }
}
