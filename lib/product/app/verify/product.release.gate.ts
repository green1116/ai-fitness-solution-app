/**
 * Product App — Registry Release Gate
 * MODULE: App Registry (M08-P4)
 * BASE: enterprise-product-partner-management-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_PARTNER_MANAGEMENT_ID } from "../../partner/management/management.constants";
import {
  clearAppRegistryLayer,
  createAppManager,
  getAppRegistryManifest,
  assertAppRegistryReadinessReady,
} from "../app.manager";
import {
  APP_KINDS,
  APP_MANAGER_STATUSES,
  APP_OWNERSHIP_STATUSES,
  APP_READINESS_VERDICTS,
  APP_STATUSES,
  APP_VERSION_STATUSES,
  PRODUCT_APP_FREEZE_TAG,
  PRODUCT_APP_REGISTRY_BASE,
  PRODUCT_APP_REGISTRY_FREEZE_VERSION,
  PRODUCT_APP_REGISTRY_ID,
  PRODUCT_APP_REGISTRY_VERSION,
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

export const PRODUCT_APP_SIGNOFF_VERSION = "product-app-signoff-1" as const;

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
  clearAppRegistryLayer();
}

export function checkProductAppReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "APP-CONSTANTS",
      "management",
      "Product app registry version constants",
      PRODUCT_APP_REGISTRY_ID === "enterprise-product-app-registry-v1" &&
        PRODUCT_APP_REGISTRY_VERSION === "product-app-1" &&
        PRODUCT_APP_REGISTRY_BASE === PRODUCT_PARTNER_MANAGEMENT_ID &&
        PRODUCT_APP_REGISTRY_FREEZE_VERSION ===
          "product-app-registry-freeze-1" &&
        PRODUCT_APP_FREEZE_TAG === "product-app-registry-freeze-1" &&
        APP_KINDS.length === 4 &&
        APP_STATUSES.length === 4 &&
        APP_VERSION_STATUSES.length === 4 &&
        APP_OWNERSHIP_STATUSES.length === 3 &&
        APP_READINESS_VERDICTS.length === 3 &&
        APP_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_APP_REGISTRY_ID} base=${PRODUCT_APP_REGISTRY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "APP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "APP-UPSTREAM",
      "compatibility",
      "Depends on partner management chain",
      PRODUCT_APP_REGISTRY_BASE ===
        "enterprise-product-partner-management-v1" &&
        PRODUCT_PARTNER_MANAGEMENT_ID ===
          "enterprise-product-partner-management-v1",
      `partner=${PRODUCT_PARTNER_MANAGEMENT_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createAppManager({ managerId: "prod-app-gate" });
    mgr.initialize();
    mgr.start();

    const app = mgr.registerApp({
      id: "app.gate.reg",
      appKey: "ACME_COACHING",
      name: "Acme Coaching",
      kind: "PARTNER",
    });
    const active = mgr.updateAppStatus({
      appId: app.id,
      status: "ACTIVE",
    });
    const definition = mgr.registerDefinition({
      id: "app.gate.def",
      appId: app.id,
      definitionKey: "ACME_COACH_DEF",
      summary: "Partner coaching application declaration",
      capabilityRef: "COACHING_SURFACE",
    });
    const version = mgr.registerVersion({
      id: "app.gate.ver",
      appId: app.id,
      definitionId: definition.id,
      versionKey: "ACME_COACH_V1",
      semver: "1.0.0",
    });
    const published = mgr.updateVersionStatus({
      versionId: version.id,
      status: "PUBLISHED",
    });
    const ownership = mgr.assignOwnership({
      id: "app.gate.own",
      appId: app.id,
      ownershipKey: "ACME_COACH_OWN",
      partnerKeyRef: "ACME_WEARABLES",
    });
    const release = mgr.createReleaseManifest({
      id: "app.gate.rel",
      appId: app.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getAppRegistryManifest();

    const ok =
      app.appKey === "ACME_COACHING" &&
      active.status === "ACTIVE" &&
      definition.definitionKey === "ACME_COACH_DEF" &&
      published.status === "PUBLISHED" &&
      ownership.status === "ASSIGNED" &&
      ownership.partnerKeyRef === "ACME_WEARABLES" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.managementId === PRODUCT_APP_REGISTRY_ID &&
      registry.base === PRODUCT_APP_REGISTRY_BASE &&
      registry.appCount >= 1 &&
      registry.definitionCount >= 1 &&
      registry.versionCount >= 1 &&
      registry.ownershipCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertAppRegistryReadinessReady(readiness);
      checks.push(
        check(
          "APP-STACK",
          "app",
          "Registry / definition / version / ownership / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "APP-STACK",
          "app",
          "Registry / definition / version / ownership / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product app registry not ready",
        ),
      );
    }

    checks.push(
      check(
        "APP-SCOPE",
        "scope",
        "No app-runtime / marketplace-surface / provider-SDK / installation",
        ok,
        "app-registry-declaration-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product app registry probe failed";
    checks.push(
      check(
        "APP-STACK",
        "app",
        "Registry / definition / version / ownership / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "APP-SCOPE",
        "scope",
        "No app-runtime / marketplace-surface / provider-SDK / installation",
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
      `product-app-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAppReleaseGatePass(
  gate: ReleaseGateResult = checkProductAppReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product app release gate failed: ${gate.summary}`);
  }
}
