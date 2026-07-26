/**
 * Product API SDK — Release Gate
 * MODULE: SDK (M07-P4)
 * BASE: enterprise-product-api-gateway-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../../api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../../api-gateway/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import {
  assertApiSdkReadinessReady,
  clearApiSdkLayer,
  createApiSdkManager,
  getApiSdkRegistryManifest,
} from "../api-sdk.manager";
import {
  PRODUCT_API_SDK_BASE,
  PRODUCT_API_SDK_FREEZE_TAG,
  PRODUCT_API_SDK_FREEZE_VERSION,
  PRODUCT_API_SDK_ID,
  PRODUCT_API_SDK_VERSION,
  SDK_CLIENT_KINDS,
  SDK_CLIENT_STATUSES,
  SDK_MANAGER_STATUSES,
  SDK_OPERATION_METHODS,
  SDK_PACKAGE_STATUSES,
  SDK_READINESS_VERDICTS,
  SDK_SCHEMA_KINDS,
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

export const PRODUCT_API_SDK_SIGNOFF_VERSION =
  "product-api-sdk-signoff-1" as const;

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
  clearApiSdkLayer();
}

export function checkProductApiSdkReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "SDK-CONSTANTS",
      "management",
      "Product API SDK version constants",
      PRODUCT_API_SDK_ID === "enterprise-product-api-sdk-v1" &&
        PRODUCT_API_SDK_VERSION === "product-api-sdk-1" &&
        PRODUCT_API_SDK_BASE === PRODUCT_API_GATEWAY_ID &&
        PRODUCT_API_SDK_FREEZE_VERSION === "product-api-sdk-freeze-1" &&
        PRODUCT_API_SDK_FREEZE_TAG === "product-api-sdk-freeze-1" &&
        SDK_CLIENT_KINDS.length === 3 &&
        SDK_CLIENT_STATUSES.length === 3 &&
        SDK_OPERATION_METHODS.length === 5 &&
        SDK_SCHEMA_KINDS.length === 2 &&
        SDK_PACKAGE_STATUSES.length === 3 &&
        SDK_READINESS_VERDICTS.length === 3 &&
        SDK_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_API_SDK_ID} base=${PRODUCT_API_SDK_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "SDK-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "SDK-UPSTREAM",
      "compatibility",
      "Depends on api-gateway chain (authn / foundation / auth-baseline)",
      PRODUCT_API_SDK_BASE === "enterprise-product-api-gateway-v1" &&
        PRODUCT_API_GATEWAY_ID === "enterprise-product-api-gateway-v1" &&
        PRODUCT_API_AUTHENTICATION_ID ===
          "enterprise-product-api-authentication-v1" &&
        PRODUCT_API_FOUNDATION_ID ===
          "enterprise-product-api-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1",
      `gateway=${PRODUCT_API_GATEWAY_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createApiSdkManager({ managerId: "prod-apisdk-gate" });
    mgr.initialize();
    mgr.start();

    const client = mgr.registerClient({
      id: "apisdk.gate.cli",
      clientKey: "NTF_SDK",
      name: "Notifications SDK",
      kind: "TYPED",
      gatewayKeyRef: "NTF_EDGE",
    });
    const operation = mgr.registerOperation({
      id: "apisdk.gate.op",
      clientId: client.id,
      operationKey: "SEND_NOTIFICATION",
      method: "POST",
      path: "/v1/notifications/send",
      routeKeyRef: "NTF_SEND",
    });
    const schema = mgr.registerSchema({
      id: "apisdk.gate.schema",
      operationId: operation.id,
      schemaKey: "SEND_NOTIFICATION_REQUEST",
      kind: "REQUEST",
      shapeRef: "NOTIFICATION_SEND_INPUT_V1",
    });
    const pkg = mgr.publishPackage({
      id: "apisdk.gate.pkg",
      clientId: client.id,
      packageKey: "NTF_SDK_PKG",
      semver: "1.0.0",
      operationIds: [operation.id],
    });
    const release = mgr.createReleaseManifest({
      id: "apisdk.gate.rel",
      clientId: client.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getApiSdkRegistryManifest();

    const ok =
      client.clientKey === "NTF_SDK" &&
      operation.operationKey === "SEND_NOTIFICATION" &&
      schema.kind === "REQUEST" &&
      pkg.status === "PUBLISHED" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.sdkId === PRODUCT_API_SDK_ID &&
      registry.base === PRODUCT_API_SDK_BASE &&
      registry.clientCount >= 1 &&
      registry.operationCount >= 1 &&
      registry.schemaCount >= 1 &&
      registry.packageCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertApiSdkReadinessReady(readiness);
      checks.push(
        check(
          "SDK-STACK",
          "sdk",
          "Client / operation / schema / package / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "SDK-STACK",
          "sdk",
          "Client / operation / schema / package / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product api sdk not ready",
        ),
      );
    }

    checks.push(
      check(
        "SDK-SCOPE",
        "scope",
        "No portal / business-logic / runtime-execution / provider surface",
        ok,
        "sdk-definition-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "product api sdk probe failed";
    checks.push(
      check(
        "SDK-STACK",
        "sdk",
        "Client / operation / schema / package / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "SDK-SCOPE",
        "scope",
        "No portal / business-logic / runtime-execution / provider surface",
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
      `product-api-sdk-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductApiSdkReleaseGatePass(
  gate: ReleaseGateResult = checkProductApiSdkReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product API SDK release gate failed: ${gate.summary}`);
  }
}
