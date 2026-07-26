/**
 * Product Routing — Routing Engine public exports
 * Isolated namespace: lib/product/routing
 */

export {
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
} from "./management/management.constants";

export type {
  RoutingManagerStatus,
  RoutingReadinessCheck,
  RoutingReadinessResult,
  RoutingReadinessVerdict,
  RoutingRegistryManifest,
} from "./management/management.types";

export type {
  NotificationRoute,
  RegisterRouteInput,
  RouteMetadata,
  RoutingKind,
} from "./registry/route.types";

export {
  clearRoutes,
  getRoute,
  getRouteByKey,
  listRoutes,
  registerRoute,
} from "./registry/route.registry";

export type {
  DefineRoutingRuleInput,
  RoutingRule,
  RuleMetadata,
} from "./rule/rule.types";

export {
  clearRoutingRules,
  defineRoutingRule,
  getRoutingRule,
  listRoutingRules,
} from "./rule/rule.registry";

export type {
  AttachRoutingStrategyInput,
  RoutingStrategy,
  RoutingStrategyKind,
  StrategyMetadata,
} from "./strategy/strategy.types";

export {
  attachRoutingStrategy,
  clearRoutingStrategies,
  getRoutingStrategy,
  listRoutingStrategies,
} from "./strategy/strategy.registry";

export type {
  AttachRoutingFallbackInput,
  FallbackMetadata,
  RoutingFallback,
  RoutingFallbackMode,
} from "./fallback/fallback.types";

export {
  attachRoutingFallback,
  clearRoutingFallbacks,
  getRoutingFallback,
  listRoutingFallbacks,
} from "./fallback/fallback.registry";

export type {
  ResolutionMetadata,
  ResolveRouteInput,
  RoutingResolution,
  RoutingResolutionVerdict,
} from "./resolution/resolution.types";

export {
  clearRoutingResolutions,
  getRoutingResolution,
  listRoutingResolutions,
  resolveRoute,
} from "./resolution/resolution.registry";

export type { RoutingReleaseManifest } from "./manifest/manifest.registry";

export {
  clearRoutingReleaseManifests,
  createRoutingReleaseManifest,
  getRoutingReleaseManifest,
  listRoutingReleaseManifests,
} from "./manifest/manifest.registry";

export {
  assertRoutingEngineReadinessReady,
  evaluateRoutingEngineReadiness,
} from "./management/management.readiness";

export {
  clearRoutingEngineLayer,
  createRoutingManager,
  getRoutingRegistryManifest,
  type RoutingManager,
  type RoutingManagerSnapshot,
} from "./routing.manager";

export {
  assertProductRoutingReleaseGatePass,
  checkProductRoutingReleaseGate,
  PRODUCT_ROUTING_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
