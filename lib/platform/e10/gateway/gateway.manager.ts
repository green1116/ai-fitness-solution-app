/**
 * E10-P5 — Gateway Manager
 * Orchestrates route registry, middleware chain, normalize, dispatch
 */

import {
  E10_GATEWAY_ID,
  E10_GATEWAY_VERSION,
} from "./gateway.constants";
import {
  clearMiddlewares,
  createAuthStubHandler,
  disableMiddleware,
  enableMiddleware,
  getMiddleware,
  listMiddlewares,
  registerMiddleware,
  removeMiddleware,
  runMiddlewareChain,
} from "./gateway.middleware";
import {
  buildGatewayRegistryManifest,
  clearRoutes,
  getRoute,
  listRoutes,
  registerRoute,
  removeRoute,
  setRouteStatus,
} from "./gateway.route";
import { dispatchRequest, normalizeRequest } from "./gateway.router";
import type {
  DispatchResult,
  GatewayManagerStatus,
  GatewayRequest,
  GatewayResponse,
  MiddlewareDefinition,
  PlatformMetadata,
  RegisterMiddlewareInput,
  RegisterRouteInput,
  RouteDefinition,
  RouteStatus,
} from "./gateway.types";

export type GatewayManagerSnapshot = {
  managerId: string;
  status: GatewayManagerStatus;
  layerId: typeof E10_GATEWAY_ID;
  version: typeof E10_GATEWAY_VERSION;
  routeCount: number;
  middlewareCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type GatewayManager = {
  initialize: () => GatewayManagerSnapshot;
  start: () => GatewayManagerSnapshot;
  stop: () => GatewayManagerSnapshot;
  status: () => GatewayManagerSnapshot;
  registerRoute: (input: RegisterRouteInput) => RouteDefinition;
  getRoute: typeof getRoute;
  listRoutes: typeof listRoutes;
  setRouteStatus: (id: string, status: RouteStatus) => RouteDefinition;
  removeRoute: (id: string) => boolean;
  registerMiddleware: (input: RegisterMiddlewareInput) => MiddlewareDefinition;
  getMiddleware: typeof getMiddleware;
  listMiddlewares: typeof listMiddlewares;
  enableMiddleware: (id: string) => MiddlewareDefinition;
  disableMiddleware: (id: string) => MiddlewareDefinition;
  removeMiddleware: (id: string) => boolean;
  /** Normalize + middleware chain + dispatch (full pipeline). */
  handle: (input: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    query?: Record<string, string>;
    body?: unknown;
    authContext?: GatewayRequest["authContext"];
    metadata?: PlatformMetadata;
  }) => DispatchResult;
  /** Normalize only (no dispatch). */
  normalize: typeof normalizeRequest;
  /** Dispatch a pre-built request. */
  dispatch: (req: GatewayRequest) => DispatchResult;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createGatewayManager(options?: {
  managerId?: string;
}): GatewayManager {
  const managerId =
    options?.managerId?.trim() || createId("e10-gw-mgr");
  let state: GatewayManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): GatewayManagerSnapshot {
    return {
      managerId,
      status: state,
      layerId: E10_GATEWAY_ID,
      version: E10_GATEWAY_VERSION,
      routeCount: listRoutes().length,
      middlewareCount: listMiddlewares().length,
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
    clearRoutes();
    clearMiddlewares();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): GatewayManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(
        `start requires READY or STOPPED (current=${state})`,
      );
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

  function handle(input: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    query?: Record<string, string>;
    body?: unknown;
    authContext?: GatewayRequest["authContext"];
    metadata?: PlatformMetadata;
  }): DispatchResult {
    assertRunning("handle");
    const req = normalizeRequest(input);
    if (input.authContext) {
      req.authContext = input.authContext;
    }
    const chainResult = runMiddlewareChain(req);
    if (!chainResult.passed) {
      return {
        requestId: req.requestId,
        routeId: null,
        status: "FORBIDDEN",
        response: chainResult.response,
        dispatchedAt: nowIso(),
      };
    }
    return dispatchRequest(chainResult.request);
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
    getRoute,
    listRoutes,
    setRouteStatus: (id, status) => {
      assertRunning("setRouteStatus");
      return setRouteStatus(id, status);
    },
    removeRoute: (id) => {
      assertRunning("removeRoute");
      return removeRoute(id);
    },
    registerMiddleware: (input) => {
      assertRunning("registerMiddleware");
      return registerMiddleware(input);
    },
    getMiddleware,
    listMiddlewares,
    enableMiddleware: (id) => {
      assertRunning("enableMiddleware");
      return enableMiddleware(id);
    },
    disableMiddleware: (id) => {
      assertRunning("disableMiddleware");
      return disableMiddleware(id);
    },
    removeMiddleware: (id) => {
      assertRunning("removeMiddleware");
      return removeMiddleware(id);
    },
    handle,
    normalize: normalizeRequest,
    dispatch: (req) => {
      assertRunning("dispatch");
      return dispatchRequest(req);
    },
  };
}

export function getGatewayRegistryManifest() {
  return buildGatewayRegistryManifest(listMiddlewares().length);
}

export { createAuthStubHandler };
