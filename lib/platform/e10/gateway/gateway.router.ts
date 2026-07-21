/**
 * E10-P5 — Gateway Router (request normalize + internal dispatch)
 */

import { HTTP_METHODS } from "./gateway.constants";
import { resolveRoute } from "./gateway.route";
import type {
  DispatchResult,
  GatewayRequest,
  GatewayResponse,
  HttpMethod,
  PlatformMetadata,
} from "./gateway.types";

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

/** Normalize a raw incoming request into a GatewayRequest. */
export function normalizeRequest(input: {
  method: string;
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  metadata?: PlatformMetadata;
}): GatewayRequest {
  const method = input.method.toUpperCase().trim();
  if (!(HTTP_METHODS as readonly string[]).includes(method)) {
    throw new Error(`unsupported HTTP method: ${method}`);
  }
  const path = input.path.trim();
  if (!path) throw new Error("request path is required");

  return {
    requestId: createId("req"),
    method: method as HttpMethod,
    path,
    headers: { ...(input.headers ?? {}) },
    query: { ...(input.query ?? {}) },
    body: input.body ?? null,
    metadata: { ...(input.metadata ?? {}) },
    receivedAt: nowIso(),
  };
}

function notFoundResponse(requestId: string): GatewayResponse {
  return {
    requestId,
    status: 404,
    body: { error: "NOT_FOUND", message: "No matching route" },
    headers: {},
    respondedAt: nowIso(),
  };
}

function errorResponse(requestId: string, message: string): GatewayResponse {
  return {
    requestId,
    status: 500,
    body: { error: "INTERNAL_ERROR", message },
    headers: {},
    respondedAt: nowIso(),
  };
}

/** Dispatch a normalized request to the matching route handler. */
export function dispatchRequest(req: GatewayRequest): DispatchResult {
  const route = resolveRoute(req.path, req.method);

  if (!route) {
    return {
      requestId: req.requestId,
      routeId: null,
      status: "NOT_FOUND",
      response: notFoundResponse(req.requestId),
      dispatchedAt: nowIso(),
    };
  }

  if (!route.handler) {
    return {
      requestId: req.requestId,
      routeId: route.id,
      status: "ERROR",
      response: errorResponse(req.requestId, "route has no handler"),
      dispatchedAt: nowIso(),
    };
  }

  try {
    const response = route.handler(req);
    return {
      requestId: req.requestId,
      routeId: route.id,
      status: "OK",
      response,
      dispatchedAt: nowIso(),
    };
  } catch (error) {
    return {
      requestId: req.requestId,
      routeId: route.id,
      status: "ERROR",
      response: errorResponse(
        req.requestId,
        error instanceof Error ? error.message : "handler failed",
      ),
      dispatchedAt: nowIso(),
    };
  }
}
