/**
 * Product API Gateway — Release Gate
 * MODULE: Gateway (M07-P3)
 * BASE: enterprise-product-api-authentication-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../../api-authentication/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import {
  assertApiGatewayReadinessReady,
  clearApiGatewayLayer,
  createApiGatewayManager,
  getApiGatewayRegistryManifest,
} from "../api-gateway.manager";
import {
  GATEWAY_HTTP_METHODS,
  GATEWAY_MANAGER_STATUSES,
  GATEWAY_POLICY_MODES,
  GATEWAY_READINESS_VERDICTS,
  GATEWAY_STATUSES,
  GATEWAY_VALIDATION_VERDICTS,
  PRODUCT_API_GATEWAY_BASE,
  PRODUCT_API_GATEWAY_FREEZE_TAG,
  PRODUCT_API_GATEWAY_FREEZE_VERSION,
  PRODUCT_API_GATEWAY_ID,
  PRODUCT_API_GATEWAY_VERSION,
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

export const PRODUCT_API_GATEWAY_SIGNOFF_VERSION =
  "product-api-gateway-signoff-1" as const;

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
  clearApiGatewayLayer();
}

export function checkProductApiGatewayReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "GW-CONSTANTS",
      "management",
      "Product API gateway version constants",
      PRODUCT_API_GATEWAY_ID === "enterprise-product-api-gateway-v1" &&
        PRODUCT_API_GATEWAY_VERSION === "product-api-gateway-1" &&
        PRODUCT_API_GATEWAY_BASE === PRODUCT_API_AUTHENTICATION_ID &&
        PRODUCT_API_GATEWAY_FREEZE_VERSION ===
          "product-api-gateway-freeze-1" &&
        PRODUCT_API_GATEWAY_FREEZE_TAG === "product-api-gateway-freeze-1" &&
        GATEWAY_STATUSES.length === 2 &&
        GATEWAY_HTTP_METHODS.length === 5 &&
        GATEWAY_POLICY_MODES.length === 3 &&
        GATEWAY_VALIDATION_VERDICTS.length === 3 &&
        GATEWAY_READINESS_VERDICTS.length === 3 &&
        GATEWAY_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_API_GATEWAY_ID} base=${PRODUCT_API_GATEWAY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "GW-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "GW-UPSTREAM",
      "compatibility",
      "Depends only on api-foundation + api-authentication + auth-baseline",
      PRODUCT_API_GATEWAY_BASE ===
        "enterprise-product-api-authentication-v1" &&
        PRODUCT_API_AUTHENTICATION_ID ===
          "enterprise-product-api-authentication-v1" &&
        PRODUCT_API_FOUNDATION_ID ===
          "enterprise-product-api-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1",
      `authn=${PRODUCT_API_AUTHENTICATION_ID} api=${PRODUCT_API_FOUNDATION_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createApiGatewayManager({ managerId: "prod-apigw-gate" });
    mgr.initialize();
    mgr.start();

    const gateway = mgr.registerGateway({
      id: "apigw.gate.gw",
      gatewayKey: "NTF_EDGE",
      name: "Notifications Edge Gateway",
    });
    const route = mgr.registerRoute({
      id: "apigw.gate.route",
      gatewayId: gateway.id,
      routeKey: "NTF_SEND",
      method: "POST",
      path: "/v1/notifications/send",
      apiKeyRef: "NOTIFICATIONS_V1",
    });
    const resolution = mgr.resolveRoute({
      gatewayId: gateway.id,
      method: "POST",
      path: "/v1/notifications/send",
    });
    const policy = mgr.attachPolicy({
      id: "apigw.gate.pol",
      gatewayId: gateway.id,
      routeId: route.id,
      mode: "AUTH_REQUIRED",
      requireCredential: true,
    });
    const validation = mgr.validateRequest({
      id: "apigw.gate.val",
      gatewayId: gateway.id,
      method: "POST",
      path: "/v1/notifications/send",
      credentialRef: "NTF_CLIENT_A",
    });
    const release = mgr.createReleaseManifest({
      id: "apigw.gate.rel",
      gatewayId: gateway.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getApiGatewayRegistryManifest();

    const ok =
      gateway.gatewayKey === "NTF_EDGE" &&
      resolution.resolved === true &&
      policy.mode === "AUTH_REQUIRED" &&
      validation.verdict === "ACCEPTED" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.gatewayLayerId === PRODUCT_API_GATEWAY_ID &&
      registry.base === PRODUCT_API_GATEWAY_BASE &&
      registry.gatewayCount >= 1 &&
      registry.routeCount >= 1 &&
      registry.policyCount >= 1 &&
      registry.validationCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertApiGatewayReadinessReady(readiness);
      checks.push(
        check(
          "GW-STACK",
          "gateway",
          "Registry / route / policy / validation / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "GW-STACK",
          "gateway",
          "Registry / route / policy / validation / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product api gateway not ready",
        ),
      );
    }

    checks.push(
      check(
        "GW-SCOPE",
        "scope",
        "No authorization / SDK / portal / business-logic surface",
        ok,
        "gateway-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product api gateway probe failed";
    checks.push(
      check(
        "GW-STACK",
        "gateway",
        "Registry / route / policy / validation / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "GW-SCOPE",
        "scope",
        "No authorization / SDK / portal / business-logic surface",
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
      `product-api-gateway-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductApiGatewayReleaseGatePass(
  gate: ReleaseGateResult = checkProductApiGatewayReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product API gateway release gate failed: ${gate.summary}`,
    );
  }
}
