/**
 * Product API — Foundation Release Gate
 * MODULE: API Foundation (M07-P1)
 * BASE: enterprise-product-notification-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID } from "../../notification-baseline/freeze/freeze.lock";
import {
  assertApiFoundationReadinessReady,
  clearApiFoundationLayer,
  createApiManager,
  getApiRegistryManifest,
} from "../api.manager";
import {
  API_KINDS,
  API_LIFECYCLE_STATES,
  API_MANAGER_STATUSES,
  API_POLICY_MODES,
  API_READINESS_VERDICTS,
  PRODUCT_API_FOUNDATION_BASE,
  PRODUCT_API_FOUNDATION_FREEZE_VERSION,
  PRODUCT_API_FOUNDATION_ID,
  PRODUCT_API_FOUNDATION_VERSION,
  PRODUCT_API_FREEZE_VERSION,
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

export const PRODUCT_API_SIGNOFF_VERSION = "product-api-signoff-1" as const;

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
  clearApiFoundationLayer();
}

export function checkProductApiReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "API-CONSTANTS",
      "management",
      "Product API foundation version constants",
      PRODUCT_API_FOUNDATION_ID === "enterprise-product-api-foundation-v1" &&
        PRODUCT_API_FOUNDATION_VERSION === "product-api-1" &&
        PRODUCT_API_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID &&
        PRODUCT_API_FOUNDATION_FREEZE_VERSION ===
          "product-api-foundation-freeze-1" &&
        PRODUCT_API_FREEZE_VERSION === "product-api-foundation-freeze-1" &&
        API_KINDS.length === 4 &&
        API_LIFECYCLE_STATES.length === 4 &&
        API_POLICY_MODES.length === 3 &&
        API_READINESS_VERDICTS.length === 3 &&
        API_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_API_FOUNDATION_ID} base=${PRODUCT_API_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "API-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "API-UPSTREAM",
      "compatibility",
      "Depends only on notification-baseline",
      PRODUCT_API_FOUNDATION_BASE ===
        "enterprise-product-notification-baseline-v1" &&
        ENTERPRISE_PRODUCT_NOTIFICATION_BASELINE_ID ===
          "enterprise-product-notification-baseline-v1",
      `base=${PRODUCT_API_FOUNDATION_BASE}`,
    ),
  );

  try {
    cleanup();
    const mgr = createApiManager({ managerId: "prod-api-gate" });
    mgr.initialize();
    mgr.start();

    const api = mgr.registerApi({
      id: "api.gate.reg",
      apiKey: "NOTIFICATIONS_V1",
      name: "Notifications API",
      kind: "REST",
    });
    const definition = mgr.defineDefinition({
      id: "api.gate.def",
      apiId: api.id,
      path: "/v1/notifications",
      method: "POST",
      summary: "Create notification delivery request",
    });
    const version = mgr.registerVersion({
      id: "api.gate.ver",
      apiId: api.id,
      versionTag: "v1.0.0",
      definitionIds: [definition.id],
    });
    const lifecycle = mgr.openLifecycle({
      id: "api.gate.lc",
      apiId: api.id,
      versionId: version.id,
    });
    mgr.transitionLifecycle({
      lifecycleId: lifecycle.id,
      state: "PUBLISHED",
    });
    mgr.attachPolicy({
      id: "api.gate.pol",
      apiId: api.id,
      mode: "RESTRICTED",
      requireVersion: true,
    });
    const release = mgr.createReleaseManifest({
      id: "api.gate.rel",
      apiId: api.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getApiRegistryManifest();

    const ok =
      api.apiKey === "NOTIFICATIONS_V1" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_API_FOUNDATION_ID &&
      registry.base === PRODUCT_API_FOUNDATION_BASE &&
      registry.apiCount >= 1 &&
      registry.definitionCount >= 1 &&
      registry.versionCount >= 1 &&
      registry.lifecycleCount >= 1 &&
      registry.policyCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertApiFoundationReadinessReady(readiness);
      checks.push(
        check(
          "API-STACK",
          "foundation",
          "Registry / definition / version / lifecycle / policy / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "API-STACK",
          "foundation",
          "Registry / definition / version / lifecycle / policy / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product api foundation not ready",
        ),
      );
    }

    checks.push(
      check(
        "API-SCOPE",
        "scope",
        "No gateway / auth / SDK / rate-limit / portal surface",
        ok,
        "foundation-only API domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "product api probe failed";
    checks.push(
      check(
        "API-STACK",
        "foundation",
        "Registry / definition / version / lifecycle / policy / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "API-SCOPE",
        "scope",
        "No gateway / auth / SDK / rate-limit / portal surface",
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
      `product-api-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductApiReleaseGatePass(
  gate: ReleaseGateResult = checkProductApiReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product API release gate failed: ${gate.summary}`);
  }
}
