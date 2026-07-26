/**
 * Product Notification Template — readiness
 */

import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { listNotificationTemplateReleaseManifests } from "../manifest/manifest.registry";
import { PRODUCT_TEMPLATE_MANAGEMENT_BASE } from "./management.constants";
import type {
  NotificationTemplateReadinessCheck,
  NotificationTemplateReadinessResult,
} from "./management.types";
import { listNotificationTemplatePublications } from "../publication/publication.registry";
import { listNotificationTemplates } from "../registry/template.registry";
import { listNotificationTemplateSchemas } from "../schema/schema.registry";
import { listNotificationTemplateVariants } from "../variant/variant.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): NotificationTemplateReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateNotificationTemplateReadiness(): NotificationTemplateReadinessResult {
  const checks: NotificationTemplateReadinessCheck[] = [];

  checks.push(
    check(
      "NTPL-BASE",
      "management",
      "Notification foundation aligned",
      PRODUCT_TEMPLATE_MANAGEMENT_BASE === PRODUCT_NOTIFICATION_FOUNDATION_ID,
      `base=${PRODUCT_TEMPLATE_MANAGEMENT_BASE}`,
    ),
  );

  const templates = listNotificationTemplates();
  checks.push(
    check(
      "NTPL-REG",
      "registry",
      "Templates registered",
      templates.length >= 1,
      `templates=${templates.length}`,
    ),
  );

  const variants = listNotificationTemplateVariants();
  checks.push(
    check(
      "NTPL-VAR",
      "variant",
      "Variants present",
      variants.length >= 1,
      `variants=${variants.length}`,
    ),
  );

  const schemas = listNotificationTemplateSchemas();
  checks.push(
    check(
      "NTPL-SCH",
      "schema",
      "Variable schemas present",
      schemas.length >= 1,
      `schemas=${schemas.length}`,
    ),
  );

  const publications = listNotificationTemplatePublications();
  checks.push(
    check(
      "NTPL-PUB",
      "publication",
      "Published versions present",
      publications.some((p) => p.state === "PUBLISHED"),
      `publications=${publications.length}`,
    ),
  );

  const releases = listNotificationTemplateReleaseManifests();
  checks.push(
    check(
      "NTPL-REL",
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
    summary: `product-notification-template readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertNotificationTemplateReadinessReady(
  result: NotificationTemplateReadinessResult,
): asserts result is NotificationTemplateReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product notification template not ready: ${result.summary}`,
    );
  }
}
