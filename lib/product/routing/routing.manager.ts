/**
 * Product Routing — Routing Engine Manager
 */

import {
  attachRoutingFallback,
  clearRoutingFallbacks,
  getRoutingFallback,
  listRoutingFallbacks,
} from "./fallback/fallback.registry";
import type {
  AttachRoutingFallbackInput,
  RoutingFallback,
} from "./fallback/fallback.types";
import {
  clearRoutingReleaseManifests,
  createRoutingReleaseManifest,
  getRoutingReleaseManifest,
  listRoutingReleaseManifests,
  type RoutingReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_ROUTING_ENGINE_BASE,
  PRODUCT_ROUTING_ENGINE_FREEZE_VERSION,
  PRODUCT_ROUTING_ENGINE_ID,
  PRODUCT_ROUTING_ENGINE_VERSION,
} from "./management/management.constants";
import {
  assertRoutingEngineReadinessReady,
  evaluateRoutingEngineReadiness,
} from "./management/management.readiness";
import type {
  RoutingManagerStatus,
  RoutingReadinessResult,
  RoutingRegistryManifest,
} from "./management/management.types";
import {
  clearRoutes,
  getRoute,
  getRouteByKey,
  listRoutes,
  registerRoute,
} from "./registry/route.registry";
import type {
  NotificationRoute,
  RegisterRouteInput,
} from "./registry/route.types";
import {
  clearRoutingResolutions,
  getRoutingResolution,
  listRoutingResolutions,
  resolveRoute,
} from "./resolution/resolution.registry";
import type {
  ResolveRouteInput,
  RoutingResolution,
} from "./resolution/resolution.types";
import {
  clearRoutingRules,
  defineRoutingRule,
  getRoutingRule,
  listRoutingRules,
} from "./rule/rule.registry";
import type {
  DefineRoutingRuleInput,
  RoutingRule,
} from "./rule/rule.types";
import {
  attachRoutingStrategy,
  clearRoutingStrategies,
  getRoutingStrategy,
  listRoutingStrategies,
} from "./strategy/strategy.registry";
import type {
  AttachRoutingStrategyInput,
  RoutingStrategy,
} from "./strategy/strategy.types";

export type RoutingManagerSnapshot = {
  managerId: string;
  status: RoutingManagerStatus;
  layerId: typeof PRODUCT_ROUTING_ENGINE_ID;
  version: typeof PRODUCT_ROUTING_ENGINE_VERSION;
  routeCount: number;
  ruleCount: number;
  strategyCount: number;
  fallbackCount: number;
  resolutionCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type RoutingManager = {
  initialize: () => RoutingManagerSnapshot;
  start: () => RoutingManagerSnapshot;
  stop: () => RoutingManagerSnapshot;
  status: () => RoutingManagerSnapshot;
  registerRoute: (input: RegisterRouteInput) => NotificationRoute;
  defineRule: (input: DefineRoutingRuleInput) => RoutingRule;
  attachStrategy: (input: AttachRoutingStrategyInput) => RoutingStrategy;
  attachFallback: (input: AttachRoutingFallbackInput) => RoutingFallback;
  resolveRoute: (input: ResolveRouteInput) => RoutingResolution;
  createReleaseManifest: (input: {
    id?: string;
    routeId: string;
  }) => RoutingReleaseManifest;
  evaluateReadiness: () => RoutingReadinessResult;
  manifest: () => RoutingRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getRoutingRegistryManifest(): RoutingRegistryManifest {
  return {
    engineId: PRODUCT_ROUTING_ENGINE_ID,
    version: PRODUCT_ROUTING_ENGINE_VERSION,
    freezeVersion: PRODUCT_ROUTING_ENGINE_FREEZE_VERSION,
    base: PRODUCT_ROUTING_ENGINE_BASE,
    routeCount: listRoutes().length,
    ruleCount: listRoutingRules().length,
    strategyCount: listRoutingStrategies().length,
    fallbackCount: listRoutingFallbacks().length,
    resolutionCount: listRoutingResolutions().length,
    releaseCount: listRoutingReleaseManifests().length,
  };
}

export function clearRoutingEngineLayer(): void {
  clearRoutingReleaseManifests();
  clearRoutingResolutions();
  clearRoutingFallbacks();
  clearRoutingStrategies();
  clearRoutingRules();
  clearRoutes();
}

export function createRoutingManager(options?: {
  managerId?: string;
}): RoutingManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-rt-mgr");
  let state: RoutingManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): RoutingManagerSnapshot {
    const reg = getRoutingRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_ROUTING_ENGINE_ID,
      version: PRODUCT_ROUTING_ENGINE_VERSION,
      routeCount: reg.routeCount,
      ruleCount: reg.ruleCount,
      strategyCount: reg.strategyCount,
      fallbackCount: reg.fallbackCount,
      resolutionCount: reg.resolutionCount,
      releaseCount: reg.releaseCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): RoutingManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearRoutingEngineLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): RoutingManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): RoutingManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerRoute: (input) => {
      assertRunning("registerRoute");
      return registerRoute(input);
    },
    defineRule: (input) => {
      assertRunning("defineRule");
      return defineRoutingRule(input);
    },
    attachStrategy: (input) => {
      assertRunning("attachStrategy");
      return attachRoutingStrategy(input);
    },
    attachFallback: (input) => {
      assertRunning("attachFallback");
      return attachRoutingFallback(input);
    },
    resolveRoute: (input) => {
      assertRunning("resolveRoute");
      return resolveRoute(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createRoutingReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateRoutingEngineReadiness();
    },
    manifest: getRoutingRegistryManifest,
  };
}

export {
  assertRoutingEngineReadinessReady,
  getRoute,
  getRouteByKey,
  getRoutingFallback,
  getRoutingReleaseManifest,
  getRoutingResolution,
  getRoutingRule,
  getRoutingStrategy,
  listRoutes,
  listRoutingFallbacks,
  listRoutingReleaseManifests,
  listRoutingResolutions,
  listRoutingRules,
  listRoutingStrategies,
};
