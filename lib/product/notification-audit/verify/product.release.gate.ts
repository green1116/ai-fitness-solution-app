/**
 * Product Notification Audit — Release Gate
 * MODULE: Notification Audit (M06-P7)
 * BASE: enterprise-product-routing-engine-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../../channel/management/management.constants";
import { PRODUCT_DELIVERY_ENGINE_ID } from "../../delivery/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../../notification-template/management/management.constants";
import { PRODUCT_PREFERENCE_MANAGEMENT_ID } from "../../preference/management/management.constants";
import { PRODUCT_ROUTING_ENGINE_ID } from "../../routing/management/management.constants";
import {
  NOTIFICATION_AUDIT_CATEGORIES,
  NOTIFICATION_AUDIT_INTEGRITY_VERDICTS,
  NOTIFICATION_AUDIT_MANAGER_STATUSES,
  NOTIFICATION_AUDIT_READINESS_VERDICTS,
  NOTIFICATION_AUDIT_SEVERITIES,
  NOTIFICATION_AUDIT_TRAIL_STATUSES,
  PRODUCT_NOTIFICATION_AUDIT_BASE,
  PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION_TAG,
  PRODUCT_NOTIFICATION_AUDIT_ID,
  PRODUCT_NOTIFICATION_AUDIT_VERSION,
} from "../management/management.constants";
import {
  assertNotificationAuditReadinessReady,
  clearNotificationAuditLayer,
  createNotificationAuditManager,
  getNotificationAuditRegistryManifest,
} from "../notification-audit.manager";

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

export const PRODUCT_NOTIFICATION_AUDIT_SIGNOFF_VERSION =
  "product-notification-audit-signoff-1" as const;

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
  clearNotificationAuditLayer();
}

export function checkProductNotificationAuditReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "NAUD-CONSTANTS",
      "management",
      "Product notification audit version constants",
      PRODUCT_NOTIFICATION_AUDIT_ID ===
        "enterprise-product-notification-audit-v1" &&
        PRODUCT_NOTIFICATION_AUDIT_VERSION ===
          "product-notification-audit-1" &&
        PRODUCT_NOTIFICATION_AUDIT_BASE === PRODUCT_ROUTING_ENGINE_ID &&
        PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION ===
          "product-notification-audit-freeze-1" &&
        PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION_TAG ===
          "product-notification-audit-freeze-1" &&
        NOTIFICATION_AUDIT_CATEGORIES.length === 6 &&
        NOTIFICATION_AUDIT_SEVERITIES.length === 3 &&
        NOTIFICATION_AUDIT_TRAIL_STATUSES.length === 2 &&
        NOTIFICATION_AUDIT_INTEGRITY_VERDICTS.length === 3 &&
        NOTIFICATION_AUDIT_READINESS_VERDICTS.length === 3 &&
        NOTIFICATION_AUDIT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_NOTIFICATION_AUDIT_ID} base=${PRODUCT_NOTIFICATION_AUDIT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "NAUD-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "NAUD-UPSTREAM",
      "compatibility",
      "Depends only on foundation + template + channel + delivery + preference + routing",
      PRODUCT_NOTIFICATION_AUDIT_BASE ===
        "enterprise-product-routing-engine-v1" &&
        PRODUCT_ROUTING_ENGINE_ID ===
          "enterprise-product-routing-engine-v1" &&
        PRODUCT_PREFERENCE_MANAGEMENT_ID ===
          "enterprise-product-preference-management-v1" &&
        PRODUCT_DELIVERY_ENGINE_ID ===
          "enterprise-product-delivery-engine-v1" &&
        PRODUCT_CHANNEL_MANAGEMENT_ID ===
          "enterprise-product-channel-management-v1" &&
        PRODUCT_TEMPLATE_MANAGEMENT_ID ===
          "enterprise-product-template-management-v1" &&
        PRODUCT_NOTIFICATION_FOUNDATION_ID ===
          "enterprise-product-notification-foundation-v1",
      `routing=${PRODUCT_ROUTING_ENGINE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createNotificationAuditManager({
      managerId: "prod-naud-gate",
    });
    mgr.initialize();
    mgr.start();

    const event = mgr.recordEvent({
      id: "naud.gate.evt",
      eventKey: "DELIVERY_SUCCEEDED",
      category: "DELIVERY",
      severity: "INFO",
      subjectKey: "REQ_WELCOME_SEND",
      detail: "Delivery marked succeeded",
    });
    const trail = mgr.appendTrail({
      id: "naud.gate.trl",
      eventId: event.id,
      sequence: 1,
    });
    mgr.sealTrail({ trailId: trail.id });
    const integrity = mgr.sealIntegrity({
      id: "naud.gate.int",
      trailId: trail.id,
    });
    const query = mgr.runQuery({
      id: "naud.gate.qry",
      queryKey: "BY_DELIVERY",
      category: "DELIVERY",
      subjectKey: "REQ_WELCOME_SEND",
    });
    const release = mgr.createReleaseManifest({
      id: "naud.gate.rel",
      eventId: event.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getNotificationAuditRegistryManifest();

    const ok =
      event.eventKey === "DELIVERY_SUCCEEDED" &&
      integrity.verdict === "INTACT" &&
      integrity.checksum.length === 64 &&
      query.matchedEventIds.includes(event.id) &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.auditId === PRODUCT_NOTIFICATION_AUDIT_ID &&
      registry.base === PRODUCT_NOTIFICATION_AUDIT_BASE &&
      registry.eventCount >= 1 &&
      registry.trailCount >= 1 &&
      registry.integrityCount >= 1 &&
      registry.queryCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertNotificationAuditReadinessReady(readiness);
      checks.push(
        check(
          "NAUD-STACK",
          "audit",
          "Event / trail / integrity / query / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "NAUD-STACK",
          "audit",
          "Event / trail / integrity / query / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product notification audit not ready",
        ),
      );
    }

    checks.push(
      check(
        "NAUD-SCOPE",
        "scope",
        "No provider / runtime execution / baseline surface",
        ok,
        "audit-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product notification audit probe failed";
    checks.push(
      check(
        "NAUD-STACK",
        "audit",
        "Event / trail / integrity / query / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "NAUD-SCOPE",
        "scope",
        "No provider / runtime execution / baseline surface",
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
      `product-notification-audit-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductNotificationAuditReleaseGatePass(
  gate: ReleaseGateResult = checkProductNotificationAuditReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product notification audit release gate failed: ${gate.summary}`,
    );
  }
}
