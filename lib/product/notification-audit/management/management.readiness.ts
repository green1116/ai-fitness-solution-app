/**
 * Product Notification Audit — readiness
 */

import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../../channel/management/management.constants";
import { PRODUCT_DELIVERY_ENGINE_ID } from "../../delivery/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../../notification-template/management/management.constants";
import { PRODUCT_PREFERENCE_MANAGEMENT_ID } from "../../preference/management/management.constants";
import { PRODUCT_ROUTING_ENGINE_ID } from "../../routing/management/management.constants";
import { listNotificationAuditEvents } from "../event/event.registry";
import { listNotificationAuditIntegrities } from "../integrity/integrity.registry";
import { listNotificationAuditReleaseManifests } from "../manifest/manifest.registry";
import { PRODUCT_NOTIFICATION_AUDIT_BASE } from "./management.constants";
import type {
  NotificationAuditReadinessCheck,
  NotificationAuditReadinessResult,
} from "./management.types";
import { listNotificationAuditQueries } from "../query/query.registry";
import { listNotificationAuditTrails } from "../trail/trail.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): NotificationAuditReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateNotificationAuditReadiness(): NotificationAuditReadinessResult {
  const checks: NotificationAuditReadinessCheck[] = [];

  checks.push(
    check(
      "NAUD-BASE",
      "management",
      "Routing + preference + delivery + channel + template + foundation aligned",
      PRODUCT_NOTIFICATION_AUDIT_BASE === PRODUCT_ROUTING_ENGINE_ID &&
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
      `base=${PRODUCT_NOTIFICATION_AUDIT_BASE}`,
    ),
  );

  const events = listNotificationAuditEvents();
  checks.push(
    check(
      "NAUD-EVT",
      "event",
      "Audit events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const trails = listNotificationAuditTrails();
  checks.push(
    check(
      "NAUD-TRL",
      "trail",
      "Sealed trails present",
      trails.some((t) => t.status === "SEALED"),
      `trails=${trails.length}`,
    ),
  );

  const integrities = listNotificationAuditIntegrities();
  checks.push(
    check(
      "NAUD-INT",
      "integrity",
      "Intact integrity records present",
      integrities.some((i) => i.verdict === "INTACT"),
      `integrities=${integrities.length}`,
    ),
  );

  const queries = listNotificationAuditQueries();
  checks.push(
    check(
      "NAUD-QRY",
      "query",
      "Queries present",
      queries.length >= 1,
      `queries=${queries.length}`,
    ),
  );

  const releases = listNotificationAuditReleaseManifests();
  checks.push(
    check(
      "NAUD-REL",
      "manifest",
      "Release manifests present",
      releases.length >= 1 && releases.every((r) => r.checksum.length === 64),
      `releases=${releases.length}`,
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
    summary: `product-notification-audit readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertNotificationAuditReadinessReady(
  result: NotificationAuditReadinessResult,
): asserts result is NotificationAuditReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product notification audit not ready: ${result.summary}`,
    );
  }
}
