/**
 * Product API Portal — readiness
 */

import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../../api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../../api-gateway/management/management.constants";
import { PRODUCT_API_SDK_ID } from "../../api-sdk/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { listPortalCatalogEntries } from "../catalog/catalog.registry";
import { listPortalDocuments } from "../documentation/documentation.registry";
import { listApiPortalReleaseManifests } from "../manifest/manifest.registry";
import { listPortals } from "../registry/portal.registry";
import { listPortalSurfaces } from "../surface/surface.registry";
import { PRODUCT_API_PORTAL_BASE } from "./management.constants";
import type {
  PortalReadinessCheck,
  PortalReadinessResult,
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
): PortalReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateApiPortalReadiness(): PortalReadinessResult {
  const checks: PortalReadinessCheck[] = [];

  checks.push(
    check(
      "PORTAL-BASE",
      "management",
      "api-sdk chain aligned (gateway / authn / foundation / auth-baseline)",
      PRODUCT_API_PORTAL_BASE === PRODUCT_API_SDK_ID &&
        PRODUCT_API_SDK_ID === "enterprise-product-api-sdk-v1" &&
        PRODUCT_API_GATEWAY_ID === "enterprise-product-api-gateway-v1" &&
        PRODUCT_API_AUTHENTICATION_ID ===
          "enterprise-product-api-authentication-v1" &&
        PRODUCT_API_FOUNDATION_ID ===
          "enterprise-product-api-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1",
      `base=${PRODUCT_API_PORTAL_BASE}`,
    ),
  );

  const portals = listPortals();
  checks.push(
    check(
      "PORTAL-REG",
      "registry",
      "Active portals present",
      portals.some((p) => p.status === "ACTIVE"),
      `portals=${portals.length}`,
    ),
  );

  const documents = listPortalDocuments();
  checks.push(
    check(
      "PORTAL-DOC",
      "documentation",
      "Portal documents present",
      documents.length >= 1,
      `documents=${documents.length}`,
    ),
  );

  const catalogs = listPortalCatalogEntries();
  checks.push(
    check(
      "PORTAL-CAT",
      "catalog",
      "Published catalog entries present",
      catalogs.some((c) => c.status === "PUBLISHED"),
      `catalogs=${catalogs.length}`,
    ),
  );

  const surfaces = listPortalSurfaces();
  checks.push(
    check(
      "PORTAL-SURF",
      "surface",
      "Portal surfaces present",
      surfaces.length >= 1,
      `surfaces=${surfaces.length}`,
    ),
  );

  const releases = listApiPortalReleaseManifests();
  checks.push(
    check(
      "PORTAL-REL",
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
    summary: `product-api-portal readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertApiPortalReadinessReady(
  result: PortalReadinessResult,
): asserts result is PortalReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product api portal not ready: ${result.summary}`);
  }
}
