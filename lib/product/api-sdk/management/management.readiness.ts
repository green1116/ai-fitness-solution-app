/**
 * Product API SDK — readiness
 */

import { PRODUCT_API_GATEWAY_ID } from "../../api-gateway/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../../api-authentication/management/management.constants";
import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { listSdkClients } from "../client/client.registry";
import { listApiSdkReleaseManifests } from "../manifest/manifest.registry";
import { listSdkOperations } from "../operation/operation.registry";
import { listSdkPackages } from "../package/package.registry";
import { listSdkSchemas } from "../schema/schema.registry";
import { PRODUCT_API_SDK_BASE } from "./management.constants";
import type {
  SdkReadinessCheck,
  SdkReadinessResult,
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
): SdkReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateApiSdkReadiness(): SdkReadinessResult {
  const checks: SdkReadinessCheck[] = [];

  checks.push(
    check(
      "SDK-BASE",
      "management",
      "api-gateway + authentication + foundation + auth-baseline aligned",
      PRODUCT_API_SDK_BASE === PRODUCT_API_GATEWAY_ID &&
        PRODUCT_API_GATEWAY_ID === "enterprise-product-api-gateway-v1" &&
        PRODUCT_API_AUTHENTICATION_ID ===
          "enterprise-product-api-authentication-v1" &&
        PRODUCT_API_FOUNDATION_ID ===
          "enterprise-product-api-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1",
      `base=${PRODUCT_API_SDK_BASE}`,
    ),
  );

  const clients = listSdkClients();
  checks.push(
    check(
      "SDK-CLI",
      "client",
      "Active SDK clients present",
      clients.some((c) => c.status === "ACTIVE"),
      `clients=${clients.length}`,
    ),
  );

  const operations = listSdkOperations();
  checks.push(
    check(
      "SDK-OP",
      "operation",
      "SDK operations present",
      operations.length >= 1,
      `operations=${operations.length}`,
    ),
  );

  const schemas = listSdkSchemas();
  checks.push(
    check(
      "SDK-SCHEMA",
      "schema",
      "SDK schemas present",
      schemas.length >= 1,
      `schemas=${schemas.length}`,
    ),
  );

  const packages = listSdkPackages();
  checks.push(
    check(
      "SDK-PKG",
      "package",
      "Published SDK packages present",
      packages.some((p) => p.status === "PUBLISHED"),
      `packages=${packages.length}`,
    ),
  );

  const releases = listApiSdkReleaseManifests();
  checks.push(
    check(
      "SDK-REL",
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
    summary: `product-api-sdk readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertApiSdkReadinessReady(
  result: SdkReadinessResult,
): asserts result is SdkReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product api sdk not ready: ${result.summary}`);
  }
}
