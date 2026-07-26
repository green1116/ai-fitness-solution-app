/**
 * Product M09 — AI Audit Release Gate
 * MODULE: AI Audit (M09-P7)
 * BASE: enterprise-product-ai-governance-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  AI_AUDIT_EVENT_KINDS,
  AI_AUDIT_INTEGRITY_RESULTS,
  AI_AUDIT_READINESS_VERDICTS,
  AI_AUDIT_SEVERITIES,
  AI_AUDIT_TRAIL_STATUSES,
  PRODUCT_AI_AUDIT_BASE,
  PRODUCT_AI_AUDIT_FREEZE_TAG,
  PRODUCT_AI_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_AUDIT_ID,
  PRODUCT_AI_AUDIT_VERSION,
} from "../audit/audit.constants";
import {
  assertAiAuditReadinessReady,
  buildAiAuditManifest,
  clearAiAuditLayer,
  evaluateAiAuditReadiness,
} from "../audit/audit.manifest";
import {
  getAiAuditMetadata,
  isAiAuditMetadataIntact,
} from "../audit/audit.metadata";
import { recordAiAuditEvent } from "../audit/event.registry";
import {
  sealAiAuditTrail,
  verifyAiAuditSeal,
} from "../audit/integrity.registry";
import { queryAiAuditTrail } from "../audit/query.registry";
import {
  appendAiAuditTrail,
  getAiAuditTrail,
} from "../audit/trail.registry";
import { PRODUCT_AI_GOVERNANCE_ID } from "../governance/governance.constants";

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

export const PRODUCT_AI_AUDIT_SIGNOFF_VERSION =
  "product-ai-audit-signoff-1" as const;

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
  clearAiAuditLayer();
}

export function checkProductAiAuditReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiAuditMetadata();

  checks.push(
    check(
      "AIAUD-CONSTANTS",
      "audit",
      "Product AI audit version constants",
      PRODUCT_AI_AUDIT_ID === "enterprise-product-ai-audit-v1" &&
        PRODUCT_AI_AUDIT_VERSION === "product-ai-audit-1" &&
        PRODUCT_AI_AUDIT_BASE === PRODUCT_AI_GOVERNANCE_ID &&
        PRODUCT_AI_AUDIT_FREEZE_VERSION === "product-ai-audit-freeze-1" &&
        PRODUCT_AI_AUDIT_FREEZE_TAG === "product-ai-audit-freeze-1" &&
        AI_AUDIT_EVENT_KINDS.length === 4 &&
        AI_AUDIT_SEVERITIES.length === 3 &&
        AI_AUDIT_TRAIL_STATUSES.length === 3 &&
        AI_AUDIT_INTEGRITY_RESULTS.length === 2 &&
        AI_AUDIT_READINESS_VERDICTS.length === 3 &&
        isAiAuditMetadataIntact(metadata),
      `id=${PRODUCT_AI_AUDIT_ID} base=${PRODUCT_AI_AUDIT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AIAUD-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AIAUD-UPSTREAM",
      "compatibility",
      "Depends on AI governance chain",
      PRODUCT_AI_AUDIT_BASE === "enterprise-product-ai-governance-v1" &&
        PRODUCT_AI_GOVERNANCE_ID === "enterprise-product-ai-governance-v1",
      `governance=${PRODUCT_AI_GOVERNANCE_ID}`,
    ),
  );

  try {
    cleanup();

    const event = recordAiAuditEvent({
      id: "aiaud.gate.evt",
      eventKey: "ORCH_SCOPE_AUDIT",
      kind: "ORCHESTRATION_SCOPE",
      severity: "INFO",
      policyKeyRef: "ORCH_SCOPE_GOV",
      subjectRef: "DOMAIN_COACH_ORCH",
    });
    const trail = appendAiAuditTrail({
      id: "aiaud.gate.trl",
      eventId: event.id,
    });
    const seal = sealAiAuditTrail({
      id: "aiaud.gate.sel",
      trailId: trail.id,
    });
    const sealedTrail = getAiAuditTrail(trail.id);
    const verified = verifyAiAuditSeal({ sealId: seal.id });
    const query = queryAiAuditTrail({
      id: "aiaud.gate.qry",
      queryKey: "ORCH_SCOPE_AUDIT_Q",
      kind: "ORCHESTRATION_SCOPE",
      policyKeyRef: "ORCH_SCOPE_GOV",
    });
    const manifest = buildAiAuditManifest();
    const readiness = evaluateAiAuditReadiness();

    const ok =
      event.eventKey === "ORCH_SCOPE_AUDIT" &&
      event.kind === "ORCHESTRATION_SCOPE" &&
      event.policyKeyRef === "ORCH_SCOPE_GOV" &&
      sealedTrail?.status === "SEALED" &&
      seal.result === "INTACT" &&
      verified.result === "INTACT" &&
      query.matchCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiAuditReadinessReady(readiness);
      checks.push(
        check(
          "AIAUD-STACK",
          "audit",
          "Event / trail / seal / query / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AIAUD-STACK",
          "audit",
          "Event / trail / seal / query / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai audit not ready",
        ),
      );
    }

    checks.push(
      check(
        "AIAUD-SCOPE",
        "scope",
        "No provider / model / workflow / orchestration / agent / tool / monitoring runtime",
        ok && metadata.declarationOnly === true,
        "ai-audit-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "product ai audit probe failed";
    checks.push(
      check(
        "AIAUD-STACK",
        "audit",
        "Event / trail / seal / query / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AIAUD-SCOPE",
        "scope",
        "No provider / model / workflow / orchestration / agent / tool / monitoring runtime",
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
      `product-ai-audit-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiAuditReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiAuditReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product AI audit release gate failed: ${gate.summary}`);
  }
}
