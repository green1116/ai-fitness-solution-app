/**
 * Product API Audit — Release Gate
 * MODULE: API Audit (M07-P7)
 * BASE: enterprise-product-api-governance-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../../api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../../api-gateway/management/management.constants";
import { PRODUCT_API_GOVERNANCE_ID } from "../../api-governance/management/management.constants";
import { PRODUCT_API_PORTAL_ID } from "../../api-portal/management/management.constants";
import { PRODUCT_API_SDK_ID } from "../../api-sdk/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import {
  assertApiAuditReadinessReady,
  clearApiAuditLayer,
  createApiAuditManager,
  getApiAuditRegistryManifest,
} from "../api-audit.manager";
import {
  API_AUDIT_CATEGORIES,
  API_AUDIT_INTEGRITY_VERDICTS,
  API_AUDIT_MANAGER_STATUSES,
  API_AUDIT_READINESS_VERDICTS,
  API_AUDIT_SEVERITIES,
  API_AUDIT_TRAIL_STATUSES,
  PRODUCT_API_AUDIT_BASE,
  PRODUCT_API_AUDIT_FREEZE_TAG,
  PRODUCT_API_AUDIT_FREEZE_VERSION,
  PRODUCT_API_AUDIT_ID,
  PRODUCT_API_AUDIT_VERSION,
} from "../management/management.constants";

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

export const PRODUCT_API_AUDIT_SIGNOFF_VERSION =
  "product-api-audit-signoff-1" as const;

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
  clearApiAuditLayer();
}

export function checkProductApiAuditReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "AUD-CONSTANTS",
      "management",
      "Product API audit version constants",
      PRODUCT_API_AUDIT_ID === "enterprise-product-api-audit-v1" &&
        PRODUCT_API_AUDIT_VERSION === "product-api-audit-1" &&
        PRODUCT_API_AUDIT_BASE === PRODUCT_API_GOVERNANCE_ID &&
        PRODUCT_API_AUDIT_FREEZE_VERSION === "product-api-audit-freeze-1" &&
        PRODUCT_API_AUDIT_FREEZE_TAG === "product-api-audit-freeze-1" &&
        API_AUDIT_CATEGORIES.length === 6 &&
        API_AUDIT_SEVERITIES.length === 3 &&
        API_AUDIT_TRAIL_STATUSES.length === 2 &&
        API_AUDIT_INTEGRITY_VERDICTS.length === 3 &&
        API_AUDIT_READINESS_VERDICTS.length === 3 &&
        API_AUDIT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_API_AUDIT_ID} base=${PRODUCT_API_AUDIT_BASE}`,
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
      "AUD-UPSTREAM",
      "compatibility",
      "Depends on api-governance chain",
      PRODUCT_API_AUDIT_BASE ===
        "enterprise-product-api-governance-v1" &&
        PRODUCT_API_GOVERNANCE_ID ===
          "enterprise-product-api-governance-v1" &&
        PRODUCT_API_PORTAL_ID === "enterprise-product-api-portal-v1" &&
        PRODUCT_API_SDK_ID === "enterprise-product-api-sdk-v1" &&
        PRODUCT_API_GATEWAY_ID === "enterprise-product-api-gateway-v1" &&
        PRODUCT_API_AUTHENTICATION_ID ===
          "enterprise-product-api-authentication-v1" &&
        PRODUCT_API_FOUNDATION_ID ===
          "enterprise-product-api-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1",
      `governance=${PRODUCT_API_GOVERNANCE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createApiAuditManager({ managerId: "prod-apiaud-gate" });
    mgr.initialize();
    mgr.start();

    const event = mgr.recordEvent({
      id: "apiaud.gate.evt",
      eventKey: "GOV_POLICY_APPROVED",
      category: "GOVERNANCE",
      severity: "INFO",
      subjectKey: "NOTIFICATIONS_V1",
      governanceKeyRef: "NTF_NAMING",
      detail: "governance review approved",
    });
    const trail = mgr.appendTrail({
      id: "apiaud.gate.trl",
      eventId: event.id,
      sequence: 1,
    });
    const sealed = mgr.sealTrail({ trailId: trail.id });
    const query = mgr.runQuery({
      id: "apiaud.gate.qry",
      queryKey: "GOV_EVENTS",
      category: "GOVERNANCE",
      subjectKey: "NOTIFICATIONS_V1",
    });
    const integrity = mgr.sealIntegrity({
      id: "apiaud.gate.int",
      trailId: sealed.id,
    });
    const release = mgr.createReleaseManifest({
      id: "apiaud.gate.rel",
      eventId: event.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getApiAuditRegistryManifest();

    const ok =
      event.eventKey === "GOV_POLICY_APPROVED" &&
      sealed.status === "SEALED" &&
      query.matchedEventIds.includes(event.id) &&
      integrity.verdict === "INTACT" &&
      integrity.checksum.length === 64 &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.auditId === PRODUCT_API_AUDIT_ID &&
      registry.base === PRODUCT_API_AUDIT_BASE &&
      registry.eventCount >= 1 &&
      registry.trailCount >= 1 &&
      registry.queryCount >= 1 &&
      registry.integrityCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertApiAuditReadinessReady(readiness);
      checks.push(
        check(
          "AUD-STACK",
          "audit",
          "Event / trail / query / integrity / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AUD-STACK",
          "audit",
          "Event / trail / query / integrity / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product api audit not ready",
        ),
      );
    }

    checks.push(
      check(
        "AUD-SCOPE",
        "scope",
        "No runtime / provider / business-logic surface",
        ok,
        "audit-definition-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product api audit probe failed";
    checks.push(
      check(
        "AUD-STACK",
        "audit",
        "Event / trail / query / integrity / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AUD-SCOPE",
        "scope",
        "No runtime / provider / business-logic surface",
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
      `product-api-audit-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductApiAuditReleaseGatePass(
  gate: ReleaseGateResult = checkProductApiAuditReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product API audit release gate failed: ${gate.summary}`,
    );
  }
}
