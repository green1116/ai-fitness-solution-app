/**
 * Product API Audit — readiness
 */

import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../../api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../../api-gateway/management/management.constants";
import { PRODUCT_API_GOVERNANCE_ID } from "../../api-governance/management/management.constants";
import { PRODUCT_API_PORTAL_ID } from "../../api-portal/management/management.constants";
import { PRODUCT_API_SDK_ID } from "../../api-sdk/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { listApiAuditEvents } from "../event/event.registry";
import { listApiAuditIntegrities } from "../integrity/integrity.registry";
import { listApiAuditReleaseManifests } from "../manifest/manifest.registry";
import { listApiAuditQueries } from "../query/query.registry";
import { listApiAuditTrails } from "../trail/trail.registry";
import { PRODUCT_API_AUDIT_BASE } from "./management.constants";
import type {
  ApiAuditReadinessCheck,
  ApiAuditReadinessResult,
} from "./management.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): ApiAuditReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateApiAuditReadiness(): ApiAuditReadinessResult {
  const checks: ApiAuditReadinessCheck[] = [];

  checks.push(
    check(
      "AUD-BASE",
      "management",
      "api-governance chain aligned",
      PRODUCT_API_AUDIT_BASE === PRODUCT_API_GOVERNANCE_ID &&
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
      `base=${PRODUCT_API_AUDIT_BASE}`,
    ),
  );

  const events = listApiAuditEvents();
  checks.push(
    check(
      "AUD-EVT",
      "event",
      "Audit events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const trails = listApiAuditTrails();
  checks.push(
    check(
      "AUD-TRL",
      "trail",
      "Sealed trails present",
      trails.some((t) => t.status === "SEALED"),
      `trails=${trails.length}`,
    ),
  );

  const queries = listApiAuditQueries();
  checks.push(
    check(
      "AUD-QRY",
      "query",
      "Audit queries present",
      queries.length >= 1,
      `queries=${queries.length}`,
    ),
  );

  const integrities = listApiAuditIntegrities();
  checks.push(
    check(
      "AUD-INT",
      "integrity",
      "Intact integrity seals present",
      integrities.some((i) => i.verdict === "INTACT"),
      `integrities=${integrities.length}`,
    ),
  );

  const releases = listApiAuditReleaseManifests();
  checks.push(
    check(
      "AUD-REL",
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
    summary: `product-api-audit readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertApiAuditReadinessReady(
  result: ApiAuditReadinessResult,
): asserts result is ApiAuditReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product api audit not ready: ${result.summary}`);
  }
}
