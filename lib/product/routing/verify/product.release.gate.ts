/**
 * Product Routing — Routing Engine Release Gate
 * MODULE: Routing (M06-P6)
 * BASE: enterprise-product-preference-management-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../../channel/management/management.constants";
import { PRODUCT_DELIVERY_ENGINE_ID } from "../../delivery/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../../notification-template/management/management.constants";
import { PRODUCT_PREFERENCE_MANAGEMENT_ID } from "../../preference/management/management.constants";
import {
  PRODUCT_ROUTING_ENGINE_BASE,
  PRODUCT_ROUTING_ENGINE_FREEZE_VERSION,
  PRODUCT_ROUTING_ENGINE_ID,
  PRODUCT_ROUTING_ENGINE_VERSION,
  PRODUCT_ROUTING_FREEZE_VERSION,
  ROUTING_FALLBACK_MODES,
  ROUTING_KINDS,
  ROUTING_MANAGER_STATUSES,
  ROUTING_READINESS_VERDICTS,
  ROUTING_RESOLUTION_VERDICTS,
  ROUTING_STRATEGIES,
} from "../management/management.constants";
import {
  assertRoutingEngineReadinessReady,
  clearRoutingEngineLayer,
  createRoutingManager,
  getRoutingRegistryManifest,
} from "../routing.manager";

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

export const PRODUCT_ROUTING_SIGNOFF_VERSION =
  "product-routing-signoff-1" as const;

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
  clearRoutingEngineLayer();
}

export function checkProductRoutingReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "RT-CONSTANTS",
      "management",
      "Product routing engine version constants",
      PRODUCT_ROUTING_ENGINE_ID === "enterprise-product-routing-engine-v1" &&
        PRODUCT_ROUTING_ENGINE_VERSION === "product-routing-1" &&
        PRODUCT_ROUTING_ENGINE_BASE === PRODUCT_PREFERENCE_MANAGEMENT_ID &&
        PRODUCT_ROUTING_ENGINE_FREEZE_VERSION ===
          "product-routing-engine-freeze-1" &&
        PRODUCT_ROUTING_FREEZE_VERSION ===
          "product-routing-engine-freeze-1" &&
        ROUTING_KINDS.length === 4 &&
        ROUTING_STRATEGIES.length === 4 &&
        ROUTING_FALLBACK_MODES.length === 3 &&
        ROUTING_RESOLUTION_VERDICTS.length === 3 &&
        ROUTING_READINESS_VERDICTS.length === 3 &&
        ROUTING_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_ROUTING_ENGINE_ID} base=${PRODUCT_ROUTING_ENGINE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "RT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "RT-UPSTREAM",
      "compatibility",
      "Depends only on foundation + template + channel + delivery + preference",
      PRODUCT_ROUTING_ENGINE_BASE ===
        "enterprise-product-preference-management-v1" &&
        PRODUCT_PREFERENCE_MANAGEMENT_ID ===
          "enterprise-product-preference-management-v1" &&
        PRODUCT_DELIVERY_ENGINE_ID ===
          "enterprise-product-delivery-engine-v1" &&
        PRODUCT_CHANNEL_MANAGEMENT_ID ===
          "enterprise-product-channel-management-v1" &&
        PRODUCT_TEMPLATE_MANAGEMENT_ID ===
          "enterprise-product-template-management-v1" &&
        PRODUCT_NOTIFICATION_FOUNDATION_ID ===
          "enterprise-product-notification-foundation-v1",
      `preference=${PRODUCT_PREFERENCE_MANAGEMENT_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createRoutingManager({ managerId: "prod-rt-gate" });
    mgr.initialize();
    mgr.start();

    const route = mgr.registerRoute({
      id: "rt.gate.reg",
      routingKey: "ALERT_PRIMARY",
      name: "Alert Primary Route",
      kind: "ALERT",
      preferenceKey: "MARKETING_EMAIL",
      templateKey: "WELCOME_NTPL",
    });
    mgr.defineRule({
      id: "rt.gate.rule",
      routeId: route.id,
      channelKey: "OPS_ALERT_EMAIL",
      priority: 1,
      enabled: true,
    });
    mgr.attachStrategy({
      id: "rt.gate.strat",
      routeId: route.id,
      strategy: "FAILOVER",
    });
    mgr.attachFallback({
      id: "rt.gate.fb",
      routeId: route.id,
      mode: "SAFE_DEFAULT",
      fallbackChannelKey: "IN_APP_DEFAULT",
    });
    const resolution = mgr.resolveRoute({
      id: "rt.gate.res",
      routeId: route.id,
    });
    const release = mgr.createReleaseManifest({
      id: "rt.gate.rel",
      routeId: route.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getRoutingRegistryManifest();

    const ok =
      route.routingKey === "ALERT_PRIMARY" &&
      resolution.verdict === "ROUTED" &&
      resolution.selectedChannelKey === "OPS_ALERT_EMAIL" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.engineId === PRODUCT_ROUTING_ENGINE_ID &&
      registry.base === PRODUCT_ROUTING_ENGINE_BASE &&
      registry.routeCount >= 1 &&
      registry.ruleCount >= 1 &&
      registry.strategyCount >= 1 &&
      registry.fallbackCount >= 1 &&
      registry.resolutionCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertRoutingEngineReadinessReady(readiness);
      checks.push(
        check(
          "RT-STACK",
          "engine",
          "Registry / rule / strategy / fallback / resolution / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "RT-STACK",
          "engine",
          "Registry / rule / strategy / fallback / resolution / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product routing not ready",
        ),
      );
    }

    checks.push(
      check(
        "RT-SCOPE",
        "scope",
        "No provider / runtime execution / audit surface",
        ok && resolution.usedFallback === false,
        "declarative routing only",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "product routing probe failed";
    checks.push(
      check(
        "RT-STACK",
        "engine",
        "Registry / rule / strategy / fallback / resolution / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "RT-SCOPE",
        "scope",
        "No provider / runtime execution / audit surface",
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
      `product-routing-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductRoutingReleaseGatePass(
  gate: ReleaseGateResult = checkProductRoutingReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product routing release gate failed: ${gate.summary}`);
  }
}
