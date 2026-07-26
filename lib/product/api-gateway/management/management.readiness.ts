/**
 * Product API Gateway — readiness
 */

import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../../api-authentication/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { listApiGatewayReleaseManifests } from "../manifest/manifest.registry";
import { listGatewayRequestPolicies } from "../policy/policy.registry";
import { listGateways } from "../registry/gateway.registry";
import { listGatewayRoutes } from "../route/route.registry";
import { listGatewayRequestValidations } from "../validation/validation.registry";
import { PRODUCT_API_GATEWAY_BASE } from "./management.constants";
import type {
  GatewayReadinessCheck,
  GatewayReadinessResult,
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
): GatewayReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateApiGatewayReadiness(): GatewayReadinessResult {
  const checks: GatewayReadinessCheck[] = [];

  checks.push(
    check(
      "GW-BASE",
      "management",
      "api-foundation + api-authentication + auth-baseline aligned",
      PRODUCT_API_GATEWAY_BASE === PRODUCT_API_AUTHENTICATION_ID &&
        PRODUCT_API_AUTHENTICATION_ID ===
          "enterprise-product-api-authentication-v1" &&
        PRODUCT_API_FOUNDATION_ID ===
          "enterprise-product-api-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1",
      `base=${PRODUCT_API_GATEWAY_BASE}`,
    ),
  );

  const gateways = listGateways();
  checks.push(
    check(
      "GW-REG",
      "registry",
      "Active gateways present",
      gateways.some((g) => g.status === "ACTIVE"),
      `gateways=${gateways.length}`,
    ),
  );

  const routes = listGatewayRoutes();
  checks.push(
    check(
      "GW-ROUTE",
      "route",
      "Routes present",
      routes.length >= 1,
      `routes=${routes.length}`,
    ),
  );

  const policies = listGatewayRequestPolicies();
  checks.push(
    check(
      "GW-POL",
      "policy",
      "Request policies present",
      policies.length >= 1,
      `policies=${policies.length}`,
    ),
  );

  const validations = listGatewayRequestValidations();
  checks.push(
    check(
      "GW-VAL",
      "validation",
      "Accepted validations present",
      validations.some((v) => v.verdict === "ACCEPTED"),
      `validations=${validations.length}`,
    ),
  );

  const releases = listApiGatewayReleaseManifests();
  checks.push(
    check(
      "GW-REL",
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
    summary: `product-api-gateway readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertApiGatewayReadinessReady(
  result: GatewayReadinessResult,
): asserts result is GatewayReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product api gateway not ready: ${result.summary}`);
  }
}
