/**
 * Product API Gateway — route types
 */

import type { GATEWAY_HTTP_METHODS } from "../management/management.constants";

export type GatewayHttpMethod = (typeof GATEWAY_HTTP_METHODS)[number];
export type RouteMetadata = Record<string, unknown>;

export type GatewayRoute = {
  id: string;
  gatewayId: string;
  routeKey: string;
  method: GatewayHttpMethod;
  path: string;
  apiKeyRef: string;
  detail: string;
  metadata: RouteMetadata;
  createdAt: string;
};

export type RegisterGatewayRouteInput = {
  id?: string;
  gatewayId: string;
  routeKey: string;
  method: GatewayHttpMethod;
  path: string;
  apiKeyRef: string;
  metadata?: RouteMetadata;
};

export type ResolveGatewayRouteInput = {
  gatewayId: string;
  method: GatewayHttpMethod;
  path: string;
};

export type GatewayRouteResolution = {
  resolved: boolean;
  route?: GatewayRoute;
  detail: string;
};
