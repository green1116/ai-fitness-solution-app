/**
 * Product API Portal — Release Gate
 * MODULE: Developer Portal (M07-P5)
 * BASE: enterprise-product-api-sdk-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../../api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../../api-gateway/management/management.constants";
import { PRODUCT_API_SDK_ID } from "../../api-sdk/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import {
  assertApiPortalReadinessReady,
  clearApiPortalLayer,
  createApiPortalManager,
  getApiPortalRegistryManifest,
} from "../api-portal.manager";
import {
  PORTAL_CATALOG_STATUSES,
  PORTAL_DOC_KINDS,
  PORTAL_MANAGER_STATUSES,
  PORTAL_READINESS_VERDICTS,
  PORTAL_STATUSES,
  PORTAL_SURFACE_KINDS,
  PRODUCT_API_PORTAL_BASE,
  PRODUCT_API_PORTAL_FREEZE_TAG,
  PRODUCT_API_PORTAL_FREEZE_VERSION,
  PRODUCT_API_PORTAL_ID,
  PRODUCT_API_PORTAL_VERSION,
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

export const PRODUCT_API_PORTAL_SIGNOFF_VERSION =
  "product-api-portal-signoff-1" as const;

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
  clearApiPortalLayer();
}

export function checkProductApiPortalReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PORTAL-CONSTANTS",
      "management",
      "Product API portal version constants",
      PRODUCT_API_PORTAL_ID === "enterprise-product-api-portal-v1" &&
        PRODUCT_API_PORTAL_VERSION === "product-api-portal-1" &&
        PRODUCT_API_PORTAL_BASE === PRODUCT_API_SDK_ID &&
        PRODUCT_API_PORTAL_FREEZE_VERSION ===
          "product-api-portal-freeze-1" &&
        PRODUCT_API_PORTAL_FREEZE_TAG === "product-api-portal-freeze-1" &&
        PORTAL_STATUSES.length === 3 &&
        PORTAL_DOC_KINDS.length === 4 &&
        PORTAL_CATALOG_STATUSES.length === 3 &&
        PORTAL_SURFACE_KINDS.length === 4 &&
        PORTAL_READINESS_VERDICTS.length === 3 &&
        PORTAL_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_API_PORTAL_ID} base=${PRODUCT_API_PORTAL_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PORTAL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "PORTAL-UPSTREAM",
      "compatibility",
      "Depends on api-sdk chain (gateway / authn / foundation / auth-baseline)",
      PRODUCT_API_PORTAL_BASE === "enterprise-product-api-sdk-v1" &&
        PRODUCT_API_SDK_ID === "enterprise-product-api-sdk-v1" &&
        PRODUCT_API_GATEWAY_ID === "enterprise-product-api-gateway-v1" &&
        PRODUCT_API_AUTHENTICATION_ID ===
          "enterprise-product-api-authentication-v1" &&
        PRODUCT_API_FOUNDATION_ID ===
          "enterprise-product-api-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1",
      `sdk=${PRODUCT_API_SDK_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createApiPortalManager({ managerId: "prod-apiportal-gate" });
    mgr.initialize();
    mgr.start();

    const portal = mgr.registerPortal({
      id: "apiportal.gate.portal",
      portalKey: "NTF_DEV_PORTAL",
      name: "Notifications Developer Portal",
      sdkClientKeyRef: "NTF_SDK",
    });
    const document = mgr.registerDocument({
      id: "apiportal.gate.doc",
      portalId: portal.id,
      docKey: "NTF_OVERVIEW",
      kind: "OVERVIEW",
      title: "Notifications Overview",
      slug: "notifications/overview",
    });
    const catalog = mgr.registerCatalogEntry({
      id: "apiportal.gate.cat",
      portalId: portal.id,
      catalogKey: "NTF_SEND_API",
      sdkPackageKeyRef: "NTF_SDK_PKG",
      sdkSemverRef: "1.0.0",
      title: "Send Notification API",
    });
    const surface = mgr.registerSurface({
      id: "apiportal.gate.surf",
      portalId: portal.id,
      surfaceKey: "HOME",
      kind: "HOME",
      path: "/",
      title: "Developer Home",
    });
    const release = mgr.createReleaseManifest({
      id: "apiportal.gate.rel",
      portalId: portal.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getApiPortalRegistryManifest();

    const ok =
      portal.portalKey === "NTF_DEV_PORTAL" &&
      document.kind === "OVERVIEW" &&
      catalog.status === "PUBLISHED" &&
      surface.kind === "HOME" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.portalLayerId === PRODUCT_API_PORTAL_ID &&
      registry.base === PRODUCT_API_PORTAL_BASE &&
      registry.portalCount >= 1 &&
      registry.docCount >= 1 &&
      registry.catalogCount >= 1 &&
      registry.surfaceCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertApiPortalReadinessReady(readiness);
      checks.push(
        check(
          "PORTAL-STACK",
          "portal",
          "Registry / documentation / catalog / surface / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "PORTAL-STACK",
          "portal",
          "Registry / documentation / catalog / surface / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product api portal not ready",
        ),
      );
    }

    checks.push(
      check(
        "PORTAL-SCOPE",
        "scope",
        "No business-logic / runtime-execution / provider surface",
        ok,
        "portal-definition-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product api portal probe failed";
    checks.push(
      check(
        "PORTAL-STACK",
        "portal",
        "Registry / documentation / catalog / surface / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "PORTAL-SCOPE",
        "scope",
        "No business-logic / runtime-execution / provider surface",
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
      `product-api-portal-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductApiPortalReleaseGatePass(
  gate: ReleaseGateResult = checkProductApiPortalReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product API portal release gate failed: ${gate.summary}`,
    );
  }
}
