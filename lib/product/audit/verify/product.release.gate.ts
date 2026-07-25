/**
 * Product Audit — Security Traceability Release Gate
 * MODULE: Audit
 * BASE: enterprise-product-sso-federation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { PRODUCT_AUTHORIZATION_RBAC_ID } from "../../authorization/rbac/rbac.constants";
import { PRODUCT_IDENTITY_FOUNDATION_ID } from "../../identity/authentication/authentication.constants";
import { PRODUCT_ITERATION_FOUNDATION_ID } from "../../iteration/cycle/cycle.constants";
import { PRODUCT_MFA_SECURITY_ID } from "../../mfa/factor/factor.constants";
import { PRODUCT_SESSION_CONTROL_ID } from "../../session/control/control.constants";
import { PRODUCT_SSO_FEDERATION_ID } from "../../sso/federation/federation.constants";
import {
  assertAuditTraceabilityReadinessReady,
  clearAuditTraceabilityLayer,
  createAuditManager,
  getAuditRegistryManifest,
} from "../audit.manager";
import {
  AUDIT_EVENT_CATEGORIES,
  AUDIT_INTEGRITY_RESULTS,
  AUDIT_MANAGER_STATUSES,
  AUDIT_READINESS_VERDICTS,
  AUDIT_SEVERITIES,
  AUDIT_TRAIL_STATUSES,
  PRODUCT_AUDIT_FREEZE_VERSION,
  PRODUCT_AUDIT_TRACEABILITY_BASE,
  PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION,
  PRODUCT_AUDIT_TRACEABILITY_ID,
  PRODUCT_AUDIT_TRACEABILITY_VERSION,
} from "../security/security.constants";

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

export const PRODUCT_AUDIT_SIGNOFF_VERSION =
  "product-audit-signoff-1" as const;

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
  clearAuditTraceabilityLayer();
}

export function checkProductAuditReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "AUD-CONSTANTS",
      "security",
      "Product audit traceability version constants",
      PRODUCT_AUDIT_TRACEABILITY_ID ===
        "enterprise-product-audit-traceability-v1" &&
        PRODUCT_AUDIT_TRACEABILITY_VERSION === "product-audit-1" &&
        PRODUCT_AUDIT_TRACEABILITY_BASE === PRODUCT_SSO_FEDERATION_ID &&
        PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION ===
          "product-audit-traceability-freeze-1" &&
        PRODUCT_AUDIT_FREEZE_VERSION ===
          "product-audit-traceability-freeze-1" &&
        AUDIT_EVENT_CATEGORIES.length === 4 &&
        AUDIT_SEVERITIES.length === 3 &&
        AUDIT_TRAIL_STATUSES.length === 3 &&
        AUDIT_INTEGRITY_RESULTS.length === 2 &&
        AUDIT_READINESS_VERDICTS.length === 3 &&
        AUDIT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_AUDIT_TRACEABILITY_ID} base=${PRODUCT_AUDIT_TRACEABILITY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AUD-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AUD-SSO-BASE",
      "product-sso",
      "SSO federation BASE preserved",
      PRODUCT_AUDIT_TRACEABILITY_BASE ===
        "enterprise-product-sso-federation-v1" &&
        PRODUCT_SSO_FEDERATION_ID ===
          "enterprise-product-sso-federation-v1" &&
        PRODUCT_MFA_SECURITY_ID === "enterprise-product-mfa-security-v1" &&
        PRODUCT_SESSION_CONTROL_ID ===
          "enterprise-product-session-control-v1" &&
        PRODUCT_AUTHORIZATION_RBAC_ID ===
          "enterprise-product-authorization-rbac-v1" &&
        PRODUCT_IDENTITY_FOUNDATION_ID ===
          "enterprise-product-identity-foundation-v1" &&
        PRODUCT_ITERATION_FOUNDATION_ID ===
          "enterprise-product-iteration-foundation-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_AUDIT_TRACEABILITY_BASE}`,
    ),
  );

  checks.push(
    check(
      "AUD-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createAuditManager({ managerId: "prod-aud-gate" });
    mgr.initialize();
    mgr.start();

    const event = mgr.recordAuditEvent({
      id: "aud.gate.evt",
      category: "SECURITY",
      severity: "INFO",
      actorId: "id.gate.prn",
      action: "sso.login",
      resource: "session",
    });
    const trail = mgr.appendTrail({
      id: "aud.gate.trl",
      eventId: event.id,
    });
    const seal = mgr.sealTrail({
      id: "aud.gate.sel",
      trailId: trail.id,
    });
    const verified = mgr.verifySeal({ sealId: seal.id });
    const query = mgr.queryAuditTrail({
      id: "aud.gate.qry",
      category: "SECURITY",
      actorId: "id.gate.prn",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getAuditRegistryManifest();

    const ok =
      verified.result === "INTACT" &&
      query.matchCount >= 1 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_AUDIT_TRACEABILITY_ID &&
      registry.base === PRODUCT_AUDIT_TRACEABILITY_BASE &&
      registry.eventCount >= 1 &&
      registry.trailCount >= 1 &&
      registry.sealCount >= 1 &&
      registry.queryCount >= 1;

    try {
      assertAuditTraceabilityReadinessReady(readiness);
      checks.push(
        check(
          "AUD-STACK",
          "security",
          "Event / trail / integrity / query",
          ok,
          `readiness=${readiness.verdict} seal=${verified.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AUD-STACK",
          "security",
          "Event / trail / integrity / query",
          false,
          error instanceof Error
            ? error.message
            : "product audit not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "AUD-STACK",
        "security",
        "Event / trail / integrity / query",
        false,
        error instanceof Error
          ? error.message
          : "product audit probe failed",
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
      `product-audit-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAuditReleaseGatePass(
  gate: ReleaseGateResult = checkProductAuditReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product audit release gate failed: ${gate.summary}`);
  }
}
