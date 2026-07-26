/**
 * Product API Gateway — Manager
 */

import {
  clearApiGatewayReleaseManifests,
  createApiGatewayReleaseManifest,
  getApiGatewayReleaseManifest,
  listApiGatewayReleaseManifests,
  type ApiGatewayReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_API_GATEWAY_BASE,
  PRODUCT_API_GATEWAY_FREEZE_VERSION,
  PRODUCT_API_GATEWAY_ID,
  PRODUCT_API_GATEWAY_VERSION,
} from "./management/management.constants";
import {
  assertApiGatewayReadinessReady,
  evaluateApiGatewayReadiness,
} from "./management/management.readiness";
import type {
  GatewayManagerStatus,
  GatewayReadinessResult,
  GatewayRegistryManifest,
} from "./management/management.types";
import {
  attachGatewayRequestPolicy,
  clearGatewayRequestPolicies,
  getGatewayRequestPolicy,
  listGatewayRequestPolicies,
} from "./policy/policy.registry";
import type {
  AttachGatewayRequestPolicyInput,
  GatewayRequestPolicy,
} from "./policy/policy.types";
import {
  clearGateways,
  getGateway,
  listGateways,
  registerGateway,
  updateGatewayStatus,
} from "./registry/gateway.registry";
import type {
  ProductGateway,
  RegisterGatewayInput,
  UpdateGatewayStatusInput,
} from "./registry/gateway.types";
import {
  clearGatewayRoutes,
  getGatewayRoute,
  listGatewayRoutes,
  registerGatewayRoute,
  resolveGatewayRoute,
} from "./route/route.registry";
import type {
  GatewayRoute,
  GatewayRouteResolution,
  RegisterGatewayRouteInput,
  ResolveGatewayRouteInput,
} from "./route/route.types";
import {
  clearGatewayRequestValidations,
  getGatewayRequestValidation,
  listGatewayRequestValidations,
  validateGatewayRequest,
} from "./validation/validation.registry";
import type {
  GatewayRequestValidation,
  ValidateGatewayRequestInput,
} from "./validation/validation.types";

export type GatewayManagerSnapshot = {
  managerId: string;
  status: GatewayManagerStatus;
  layerId: typeof PRODUCT_API_GATEWAY_ID;
  version: typeof PRODUCT_API_GATEWAY_VERSION;
  gatewayCount: number;
  routeCount: number;
  policyCount: number;
  validationCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type ApiGatewayManager = {
  initialize: () => GatewayManagerSnapshot;
  start: () => GatewayManagerSnapshot;
  stop: () => GatewayManagerSnapshot;
  status: () => GatewayManagerSnapshot;
  registerGateway: (input: RegisterGatewayInput) => ProductGateway;
  updateGatewayStatus: (input: UpdateGatewayStatusInput) => ProductGateway;
  registerRoute: (input: RegisterGatewayRouteInput) => GatewayRoute;
  resolveRoute: (input: ResolveGatewayRouteInput) => GatewayRouteResolution;
  attachPolicy: (
    input: AttachGatewayRequestPolicyInput,
  ) => GatewayRequestPolicy;
  validateRequest: (
    input: ValidateGatewayRequestInput,
  ) => GatewayRequestValidation;
  createReleaseManifest: (input: {
    id?: string;
    gatewayId: string;
  }) => ApiGatewayReleaseManifest;
  evaluateReadiness: () => GatewayReadinessResult;
  manifest: () => GatewayRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getApiGatewayRegistryManifest(): GatewayRegistryManifest {
  return {
    gatewayLayerId: PRODUCT_API_GATEWAY_ID,
    version: PRODUCT_API_GATEWAY_VERSION,
    freezeVersion: PRODUCT_API_GATEWAY_FREEZE_VERSION,
    base: PRODUCT_API_GATEWAY_BASE,
    gatewayCount: listGateways().length,
    routeCount: listGatewayRoutes().length,
    policyCount: listGatewayRequestPolicies().length,
    validationCount: listGatewayRequestValidations().length,
    releaseCount: listApiGatewayReleaseManifests().length,
  };
}

export function clearApiGatewayLayer(): void {
  clearApiGatewayReleaseManifests();
  clearGatewayRequestValidations();
  clearGatewayRequestPolicies();
  clearGatewayRoutes();
  clearGateways();
}

export function createApiGatewayManager(options?: {
  managerId?: string;
}): ApiGatewayManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-apigw-mgr");
  let state: GatewayManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): GatewayManagerSnapshot {
    const reg = getApiGatewayRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_API_GATEWAY_ID,
      version: PRODUCT_API_GATEWAY_VERSION,
      gatewayCount: reg.gatewayCount,
      routeCount: reg.routeCount,
      policyCount: reg.policyCount,
      validationCount: reg.validationCount,
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

  function initialize(): GatewayManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearApiGatewayLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): GatewayManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): GatewayManagerSnapshot {
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
    registerGateway: (input) => {
      assertRunning("registerGateway");
      return registerGateway(input);
    },
    updateGatewayStatus: (input) => {
      assertRunning("updateGatewayStatus");
      return updateGatewayStatus(input);
    },
    registerRoute: (input) => {
      assertRunning("registerRoute");
      return registerGatewayRoute(input);
    },
    resolveRoute: (input) => {
      assertRunning("resolveRoute");
      return resolveGatewayRoute(input);
    },
    attachPolicy: (input) => {
      assertRunning("attachPolicy");
      return attachGatewayRequestPolicy(input);
    },
    validateRequest: (input) => {
      assertRunning("validateRequest");
      return validateGatewayRequest(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createApiGatewayReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateApiGatewayReadiness();
    },
    manifest: getApiGatewayRegistryManifest,
  };
}

export {
  assertApiGatewayReadinessReady,
  getApiGatewayReleaseManifest,
  getGateway,
  getGatewayRequestPolicy,
  getGatewayRequestValidation,
  getGatewayRoute,
  listApiGatewayReleaseManifests,
  listGatewayRequestPolicies,
  listGatewayRequestValidations,
  listGatewayRoutes,
  listGateways,
};
