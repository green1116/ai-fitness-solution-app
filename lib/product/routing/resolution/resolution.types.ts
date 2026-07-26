/**
 * Product Routing — Resolution types (declarative plan, no runtime execution)
 */

import type { ROUTING_RESOLUTION_VERDICTS } from "../management/management.constants";

export type RoutingResolutionVerdict =
  (typeof ROUTING_RESOLUTION_VERDICTS)[number];
export type ResolutionMetadata = Record<string, unknown>;

export type RoutingResolution = {
  id: string;
  routeId: string;
  selectedChannelKey: string;
  verdict: RoutingResolutionVerdict;
  usedFallback: boolean;
  detail: string;
  metadata: ResolutionMetadata;
  createdAt: string;
};

export type ResolveRouteInput = {
  id?: string;
  routeId: string;
  metadata?: ResolutionMetadata;
};
