/**
 * Product Routing — readiness
 */

import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../../channel/management/management.constants";
import { PRODUCT_DELIVERY_ENGINE_ID } from "../../delivery/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../../notification-template/management/management.constants";
import { PRODUCT_PREFERENCE_MANAGEMENT_ID } from "../../preference/management/management.constants";
import { listRoutingFallbacks } from "../fallback/fallback.registry";
import { listRoutingReleaseManifests } from "../manifest/manifest.registry";
import { PRODUCT_ROUTING_ENGINE_BASE } from "./management.constants";
import type {
  RoutingReadinessCheck,
  RoutingReadinessResult,
} from "./management.types";
import { listRoutes } from "../registry/route.registry";
import { listRoutingResolutions } from "../resolution/resolution.registry";
import { listRoutingRules } from "../rule/rule.registry";
import { listRoutingStrategies } from "../strategy/strategy.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): RoutingReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateRoutingEngineReadiness(): RoutingReadinessResult {
  const checks: RoutingReadinessCheck[] = [];

  checks.push(
    check(
      "RT-BASE",
      "management",
      "Preference + delivery + channel + template + foundation aligned",
      PRODUCT_ROUTING_ENGINE_BASE === PRODUCT_PREFERENCE_MANAGEMENT_ID &&
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
      `base=${PRODUCT_ROUTING_ENGINE_BASE}`,
    ),
  );

  const routes = listRoutes();
  checks.push(
    check(
      "RT-REG",
      "registry",
      "Routes registered",
      routes.length >= 1,
      `routes=${routes.length}`,
    ),
  );

  const rules = listRoutingRules();
  checks.push(
    check(
      "RT-RULE",
      "rule",
      "Routing rules present",
      rules.length >= 1,
      `rules=${rules.length}`,
    ),
  );

  const strategies = listRoutingStrategies();
  checks.push(
    check(
      "RT-STRAT",
      "strategy",
      "Strategies present",
      strategies.length >= 1,
      `strategies=${strategies.length}`,
    ),
  );

  const fallbacks = listRoutingFallbacks();
  checks.push(
    check(
      "RT-FB",
      "fallback",
      "Fallbacks present",
      fallbacks.length >= 1,
      `fallbacks=${fallbacks.length}`,
    ),
  );

  const resolutions = listRoutingResolutions();
  checks.push(
    check(
      "RT-RES",
      "resolution",
      "Routed resolutions present",
      resolutions.some(
        (r) => r.verdict === "ROUTED" || r.verdict === "FALLBACK",
      ),
      `resolutions=${resolutions.length}`,
    ),
  );

  const releases = listRoutingReleaseManifests();
  checks.push(
    check(
      "RT-REL",
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
    summary: `product-routing readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertRoutingEngineReadinessReady(
  result: RoutingReadinessResult,
): asserts result is RoutingReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product routing engine not ready: ${result.summary}`);
  }
}
