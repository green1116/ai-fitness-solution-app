/**
 * E10-P5 — Platform API Gateway types
 * Gateway layer above E10 Platform Event Bus
 */

import type { PlatformMetadata } from "../core/platform.types";
import {
  DISPATCH_RESULT_STATUSES,
  E10_GATEWAY_BASE,
  E10_GATEWAY_FREEZE_VERSION,
  E10_GATEWAY_ID,
  E10_GATEWAY_VERSION,
  GATEWAY_MANAGER_STATUSES,
  HTTP_METHODS,
  MIDDLEWARE_KINDS,
  ROUTE_STATUSES,
} from "./gateway.constants";

export type HttpMethod = (typeof HTTP_METHODS)[number];
export type RouteStatus = (typeof ROUTE_STATUSES)[number];
export type MiddlewareKind = (typeof MIDDLEWARE_KINDS)[number];
export type GatewayManagerStatus = (typeof GATEWAY_MANAGER_STATUSES)[number];
export type DispatchResultStatus = (typeof DISPATCH_RESULT_STATUSES)[number];

export type { PlatformMetadata };

/** A registered route definition. */
export type RouteDefinition = {
  id: string;
  path: string;
  method: HttpMethod;
  description: string;
  status: RouteStatus;
  /** Optional E10-P2 runtime service id binding */
  serviceId?: string;
  version: string;
  metadata: PlatformMetadata;
  registeredAt: string;
};

export type RegisterRouteInput = {
  id: string;
  path: string;
  method: HttpMethod;
  description: string;
  serviceId?: string;
  version?: string;
  metadata?: PlatformMetadata;
  /** Inline handler for internal dispatch */
  handler?: RouteHandler;
};

/** Normalized gateway request. */
export type GatewayRequest = {
  requestId: string;
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  authContext?: AuthContext;
  metadata: PlatformMetadata;
  receivedAt: string;
};

/** Auth stub context. */
export type AuthContext = {
  authenticated: boolean;
  principalId?: string;
  roles: string[];
  token?: string;
};

/** Gateway response. */
export type GatewayResponse = {
  requestId: string;
  status: number;
  body: unknown;
  headers: Record<string, string>;
  respondedAt: string;
};

/** Middleware definition. */
export type MiddlewareDefinition = {
  id: string;
  name: string;
  kind: MiddlewareKind;
  order: number;
  enabled: boolean;
  handler: MiddlewareHandler;
  registeredAt: string;
};

export type RegisterMiddlewareInput = {
  id: string;
  name: string;
  kind: MiddlewareKind;
  order?: number;
  handler: MiddlewareHandler;
};

/** Middleware handler — can mutate request or short-circuit with a response. */
export type MiddlewareHandler = (
  req: GatewayRequest,
) => MiddlewareResult;

export type MiddlewareResult =
  | { action: "CONTINUE"; request: GatewayRequest }
  | { action: "REJECT"; response: GatewayResponse };

/** Route handler for internal dispatch. */
export type RouteHandler = (req: GatewayRequest) => GatewayResponse;

/** Dispatch result. */
export type DispatchResult = {
  requestId: string;
  routeId: string | null;
  status: DispatchResultStatus;
  response: GatewayResponse;
  dispatchedAt: string;
};

/** Gateway registry manifest. */
export type GatewayRegistryManifest = {
  gatewayId: typeof E10_GATEWAY_ID;
  version: typeof E10_GATEWAY_VERSION;
  freezeVersion: typeof E10_GATEWAY_FREEZE_VERSION;
  base: typeof E10_GATEWAY_BASE;
  routeCount: number;
  middlewareCount: number;
  routes: RouteDefinition[];
};
