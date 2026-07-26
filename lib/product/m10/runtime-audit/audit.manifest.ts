/**
 * Product M10 — AI Runtime Audit manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_RUNTIME_GOVERNANCE_ID } from "../runtime-governance/governance.constants";
import {
  PRODUCT_AI_RUNTIME_AUDIT_BASE,
  PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_AUDIT_ID,
  PRODUCT_AI_RUNTIME_AUDIT_VERSION,
} from "./audit.constants";
import { getAiRuntimeAuditMetadata } from "./audit.metadata";
import type {
  AiRuntimeAuditManifest,
  AiRuntimeAuditReadinessCheck,
  AiRuntimeAuditReadinessResult,
} from "./audit.types";
import {
  clearAiRuntimeAuditEvents,
  listAiRuntimeAuditEvents,
} from "./event.registry";
import {
  clearAiRuntimeAuditSeals,
  listAiRuntimeAuditSeals,
} from "./integrity.registry";
import {
  clearAiRuntimeAuditQueries,
  listAiRuntimeAuditQueries,
} from "./query.registry";
import {
  clearAiRuntimeAuditTrails,
  listAiRuntimeAuditTrails,
} from "./trail.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiRuntimeAuditReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiRuntimeAuditLayer(): void {
  clearAiRuntimeAuditQueries();
  clearAiRuntimeAuditSeals();
  clearAiRuntimeAuditTrails();
  clearAiRuntimeAuditEvents();
}

export function buildAiRuntimeAuditManifest(): AiRuntimeAuditManifest {
  const events = listAiRuntimeAuditEvents();
  const trails = listAiRuntimeAuditTrails();
  const seals = listAiRuntimeAuditSeals();
  const queries = listAiRuntimeAuditQueries();
  const metadata = getAiRuntimeAuditMetadata();

  const payload = {
    auditId: PRODUCT_AI_RUNTIME_AUDIT_ID,
    version: PRODUCT_AI_RUNTIME_AUDIT_VERSION,
    freezeVersion: PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION,
    base: PRODUCT_AI_RUNTIME_AUDIT_BASE,
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
    auditId: PRODUCT_AI_RUNTIME_AUDIT_ID,
    version: PRODUCT_AI_RUNTIME_AUDIT_VERSION,
    freezeVersion: PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION,
    base: PRODUCT_AI_RUNTIME_AUDIT_BASE,
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

export function evaluateAiRuntimeAuditReadiness(): AiRuntimeAuditReadinessResult {
  const checks: AiRuntimeAuditReadinessCheck[] = [];
  const metadata = getAiRuntimeAuditMetadata();
  const events = listAiRuntimeAuditEvents();
  const trails = listAiRuntimeAuditTrails();
  const seals = listAiRuntimeAuditSeals();
  const queries = listAiRuntimeAuditQueries();
  const manifest = buildAiRuntimeAuditManifest();

  checks.push(
    check(
      "AIRTA-BASE",
      "runtime-audit",
      "ai runtime governance base aligned",
      PRODUCT_AI_RUNTIME_AUDIT_BASE === PRODUCT_AI_RUNTIME_GOVERNANCE_ID &&
        PRODUCT_AI_RUNTIME_GOVERNANCE_ID ===
          "enterprise-product-ai-runtime-governance-v1",
      `base=${PRODUCT_AI_RUNTIME_AUDIT_BASE}`,
    ),
  );

  checks.push(
    check(
      "AIRTA-META",
      "metadata",
      "Runtime audit metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AIRTA-EVT",
      "event",
      "Runtime audit events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  checks.push(
    check(
      "AIRTA-TRL",
      "trail",
      "Sealed audit trails present",
      trails.some((t) => t.status === "SEALED"),
      `trails=${trails.length}`,
    ),
  );

  checks.push(
    check(
      "AIRTA-SEL",
      "integrity",
      "Intact seals present",
      seals.some((s) => s.result === "INTACT"),
      `seals=${seals.length}`,
    ),
  );

  checks.push(
    check(
      "AIRTA-QRY",
      "query",
      "Audit queries with matches present",
      queries.some((q) => q.matchCount >= 1),
      `queries=${queries.length}`,
    ),
  );

  checks.push(
    check(
      "AIRTA-MAN",
      "manifest",
      "Runtime audit manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.auditId === PRODUCT_AI_RUNTIME_AUDIT_ID &&
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
    summary: `product-ai-runtime-audit readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiRuntimeAuditReadinessReady(
  result: AiRuntimeAuditReadinessResult,
): asserts result is AiRuntimeAuditReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product ai runtime audit not ready: ${result.summary}`);
  }
}
