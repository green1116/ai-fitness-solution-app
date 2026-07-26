/**
 * Product M09 — AI Audit manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_GOVERNANCE_ID } from "../governance/governance.constants";
import {
  PRODUCT_AI_AUDIT_BASE,
  PRODUCT_AI_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_AUDIT_ID,
  PRODUCT_AI_AUDIT_VERSION,
} from "./audit.constants";
import { getAiAuditMetadata } from "./audit.metadata";
import type {
  AiAuditManifest,
  AiAuditReadinessCheck,
  AiAuditReadinessResult,
} from "./audit.types";
import { clearAiAuditEvents, listAiAuditEvents } from "./event.registry";
import { clearAiAuditSeals, listAiAuditSeals } from "./integrity.registry";
import { clearAiAuditQueries, listAiAuditQueries } from "./query.registry";
import { clearAiAuditTrails, listAiAuditTrails } from "./trail.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiAuditReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiAuditLayer(): void {
  clearAiAuditQueries();
  clearAiAuditSeals();
  clearAiAuditTrails();
  clearAiAuditEvents();
}

export function buildAiAuditManifest(): AiAuditManifest {
  const events = listAiAuditEvents();
  const trails = listAiAuditTrails();
  const seals = listAiAuditSeals();
  const queries = listAiAuditQueries();
  const metadata = getAiAuditMetadata();

  const payload = {
    auditId: PRODUCT_AI_AUDIT_ID,
    version: PRODUCT_AI_AUDIT_VERSION,
    freezeVersion: PRODUCT_AI_AUDIT_FREEZE_VERSION,
    base: PRODUCT_AI_AUDIT_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    events: events.map((e) => ({
      eventKey: e.eventKey,
      kind: e.kind,
      severity: e.severity,
      policyKeyRef: e.policyKeyRef,
      subjectRef: e.subjectRef,
    })),
    trails: trails.map((t) => ({
      eventId: t.eventId,
      sequence: t.sequence,
      status: t.status,
    })),
    seals: seals.map((s) => ({
      trailId: s.trailId,
      digest: s.digest,
      result: s.result,
    })),
    queries: queries.map((q) => ({
      queryKey: q.queryKey,
      matchCount: q.matchCount,
      kind: q.kind,
      policyKeyRef: q.policyKeyRef,
    })),
  };

  return {
    auditId: PRODUCT_AI_AUDIT_ID,
    version: PRODUCT_AI_AUDIT_VERSION,
    freezeVersion: PRODUCT_AI_AUDIT_FREEZE_VERSION,
    base: PRODUCT_AI_AUDIT_BASE,
    eventCount: events.length,
    trailCount: trails.length,
    sealCount: seals.length,
    queryCount: queries.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiAuditReadiness(): AiAuditReadinessResult {
  const checks: AiAuditReadinessCheck[] = [];
  const metadata = getAiAuditMetadata();
  const events = listAiAuditEvents();
  const trails = listAiAuditTrails();
  const seals = listAiAuditSeals();
  const queries = listAiAuditQueries();
  const manifest = buildAiAuditManifest();

  checks.push(
    check(
      "AIAUD-BASE",
      "audit",
      "ai governance base aligned",
      PRODUCT_AI_AUDIT_BASE === PRODUCT_AI_GOVERNANCE_ID &&
        PRODUCT_AI_GOVERNANCE_ID === "enterprise-product-ai-governance-v1",
      `base=${PRODUCT_AI_AUDIT_BASE}`,
    ),
  );

  checks.push(
    check(
      "AIAUD-META",
      "metadata",
      "AI audit metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AIAUD-EVT",
      "event",
      "AI audit events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  checks.push(
    check(
      "AIAUD-TRL",
      "trail",
      "Sealed audit trails present",
      trails.some((t) => t.status === "SEALED"),
      `trails=${trails.length}`,
    ),
  );

  checks.push(
    check(
      "AIAUD-SEL",
      "integrity",
      "Intact seals present",
      seals.some((s) => s.result === "INTACT"),
      `seals=${seals.length}`,
    ),
  );

  checks.push(
    check(
      "AIAUD-QRY",
      "query",
      "Audit queries with matches present",
      queries.some((q) => q.matchCount >= 1),
      `queries=${queries.length}`,
    ),
  );

  checks.push(
    check(
      "AIAUD-MAN",
      "manifest",
      "AI audit manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.auditId === PRODUCT_AI_AUDIT_ID &&
        manifest.eventCount >= 1 &&
        manifest.trailCount >= 1 &&
        manifest.sealCount >= 1 &&
        manifest.queryCount >= 1,
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
    summary: `product-ai-audit readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiAuditReadinessReady(
  result: AiAuditReadinessResult,
): asserts result is AiAuditReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product ai audit not ready: ${result.summary}`);
  }
}
